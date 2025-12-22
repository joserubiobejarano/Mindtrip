import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '@/src/providers/language-provider';
import { apiJson, apiFetch } from '@/src/lib/api';
import { useUser } from '@clerk/clerk-expo';

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string | null;
  paid_by_member_id: string;
  created_at: string;
  paid_by_member: {
    id: string;
    email: string | null;
    display_name: string | null;
  };
  shares: Array<{
    id: string;
    member_id: string;
    amount: number;
    member: {
      id: string;
      email: string | null;
      display_name: string | null;
    };
  }>;
}

interface TripMember {
  id: string;
  email: string | null;
  display_name: string | null;
  user_id: string | null;
  role: string | null;
}

interface Trip {
  id: string;
  title: string;
  default_currency: string;
  owner_id: string;
  [key: string]: any;
}

const EXPENSE_CATEGORIES = [
  "Food",
  "Accommodation",
  "Transport",
  "Activities",
  "Other",
];

export default function ExpensesScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useUser();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [totalSpent, setTotalSpent] = useState<Record<string, number>>({});

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [category, setCategory] = useState("");
  const [paidBy, setPaidBy] = useState<string>("");
  const [sharingMembers, setSharingMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Send summary state
  const [sendingSummary, setSendingSummary] = useState(false);

  useEffect(() => {
    if (tripId) {
      fetchData();
    }
  }, [tripId]);

  // Calculate balances when expenses/members/trip change
  useEffect(() => {
    if (expenses.length > 0 && members.length > 0 && trip) {
      calculateBalances();
      calculateTotalSpent();
    }
  }, [expenses, members, trip]);

  // Auto-fill form defaults when modal opens
  useEffect(() => {
    if (modalVisible && members.length > 0 && trip) {
      if (!currency) {
        setCurrency(trip.default_currency || "USD");
      }
      if (!paidBy && user?.id) {
        const currentUserMember = members.find((m) => m.user_id === user.id);
        if (currentUserMember) {
          setPaidBy(currentUserMember.id);
        } else if (members.length > 0) {
          setPaidBy(members[0].id);
        }
      }
      if (sharingMembers.length === 0 && members.length > 0) {
        setSharingMembers(members.map((m) => m.id));
      }
    }
  }, [modalVisible, members, trip, user]);

  const fetchData = async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch trip, expenses, and members in parallel
      const [tripData, expensesData, membersData] = await Promise.all([
        apiJson<{ trip: Trip }>(`/api/trips/${tripId}`),
        apiJson<{ expenses: Expense[] }>(`/api/trips/${tripId}/expenses`),
        apiJson<{ members: TripMember[] }>(`/api/trips/${tripId}/expenses/members`),
      ]);

      setTrip(tripData.trip);
      setExpenses(expensesData.expenses || []);
      setMembers(membersData.members || []);
    } catch (err: any) {
      console.error('Error fetching expenses data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = () => {
    if (!trip) return;

    const defaultCurrency = trip.default_currency || "USD";
    const balanceMap: Record<string, number> = {};

    // Initialize balances for all members
    members.forEach((member) => {
      balanceMap[member.id] = 0;
    });

    // Only calculate for expenses in default currency
    expenses
      .filter((expense) => expense.currency === defaultCurrency)
      .forEach((expense) => {
        // Add amount paid by member (they are owed this)
        balanceMap[expense.paid_by_member_id] =
          (balanceMap[expense.paid_by_member_id] || 0) + expense.amount;

        // Subtract shares (each member owes their share)
        expense.shares.forEach((share) => {
          balanceMap[share.member_id] =
            (balanceMap[share.member_id] || 0) - share.amount;
        });
      });

    setBalances(balanceMap);
  };

  const calculateTotalSpent = () => {
    const totals: Record<string, number> = {};
    expenses.forEach((expense) => {
      totals[expense.currency] = (totals[expense.currency] || 0) + expense.amount;
    });
    setTotalSpent(totals);
  };

  const getMemberName = (member: TripMember | { email: string | null; display_name?: string | null }) => {
    return member.display_name || member.email || t('mobile_expenses_unknown' as any);
  };

  const handleAddExpense = async () => {
    if (!tripId) return;

    // Validation
    if (!description.trim()) {
      Alert.alert(
        t('mobile_expenses_saved_error' as any),
        t('mobile_expenses_description' as any) + ' is required',
        [{ text: 'OK' }]
      );
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert(
        t('mobile_expenses_saved_error' as any),
        t('mobile_expenses_amount' as any) + ' must be greater than 0',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!paidBy) {
      Alert.alert(
        t('mobile_expenses_saved_error' as any),
        t('mobile_expenses_paid_by' as any) + ' is required',
        [{ text: 'OK' }]
      );
      return;
    }

    if (sharingMembers.length === 0) {
      Alert.alert(
        t('mobile_expenses_saved_error' as any),
        'At least one member must share the expense',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiFetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          description: description.trim(),
          amount: amountNum,
          currency: currency || trip?.default_currency || "USD",
          category: category || null,
          paid_by_member_id: paidBy,
          shared_by_member_ids: sharingMembers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to create expense');
      }

      // Reset form and close modal
      setDescription("");
      setAmount("");
      setCategory("");
      setPaidBy("");
      setSharingMembers([]);
      setModalVisible(false);

      // Refresh data
      await fetchData();

      Alert.alert(
        t('mobile_expenses_saved_success' as any),
        '',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('Error creating expense:', err);
      Alert.alert(
        t('mobile_expenses_saved_error' as any),
        err instanceof Error ? err.message : 'Unknown error',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendSummary = async () => {
    if (!tripId) return;

    try {
      setSendingSummary(true);

      const response = await apiFetch(`/api/trips/${tripId}/expenses/send-summary`, {
        method: 'POST',
        body: JSON.stringify({
          language: language || "en",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to send summary');
      }

      const result = await response.json();
      Alert.alert(
        t('mobile_expenses_email_success' as any),
        '',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('Error sending summary:', err);
      Alert.alert(
        t('mobile_expenses_email_error' as any),
        err instanceof Error ? err.message : 'Unknown error',
        [{ text: 'OK' }]
      );
    } finally {
      setSendingSummary(false);
    }
  };

  // Check if user can send summary (owner or editor)
  // Note: Backend will verify actual permissions, this is just for UI
  const canSendSummary = user?.id && members.some(
    (m) => m.user_id === user.id && (m.role === "owner" || m.role === "editor")
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('mobile_expenses_title' as any)}</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1a1a1a" />
          <Text style={styles.loadingText}>{t('mobile_expenses_loading' as any)}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('mobile_expenses_title' as any)}</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{t('mobile_expenses_error' as any)}</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const defaultCurrency = trip?.default_currency || "USD";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('mobile_expenses_title' as any)}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Total Spent Summary */}
        {Object.keys(totalSpent).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('mobile_expenses_total_spent' as any)}</Text>
            {Object.entries(totalSpent).map(([curr, total]) => (
              <View key={curr} style={styles.totalRow}>
                <Text style={styles.totalCurrency}>{curr}</Text>
                <Text style={styles.totalAmount}>
                  {curr} {total.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Send Summary Button */}
        {canSendSummary && (
          <TouchableOpacity
            style={[styles.sendButton, sendingSummary && styles.sendButtonDisabled]}
            onPress={handleSendSummary}
            disabled={sendingSummary}
          >
            <Text style={styles.sendButtonText}>
              {sendingSummary ? t('mobile_expenses_sending' as any) : t('mobile_expenses_send_summary' as any)}
            </Text>
          </TouchableOpacity>
        )}

        {/* Balance Summary */}
        {Object.keys(balances).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('mobile_expenses_balance_summary' as any)}</Text>
            {members.map((member) => {
              const balance = balances[member.id] || 0;
              const roundedBalance = Math.abs(balance) < 0.01 ? 0 : balance;
              
              return (
                <View key={member.id} style={styles.balanceRow}>
                  <Text style={styles.balanceName}>{getMemberName(member)}</Text>
                  <View style={styles.balanceRight}>
                    <Text
                      style={[
                        styles.balanceAmount,
                        roundedBalance > 0 && styles.balancePositive,
                        roundedBalance < 0 && styles.balanceNegative,
                      ]}
                    >
                      {roundedBalance > 0 ? "+" : ""}
                      {defaultCurrency} {Math.abs(roundedBalance).toFixed(2)}
                    </Text>
                    <Text style={styles.balanceLabel}>
                      {roundedBalance > 0
                        ? t('mobile_expenses_is_owed' as any)
                        : roundedBalance < 0
                        ? t('mobile_expenses_owes' as any)
                        : t('mobile_expenses_settled' as any)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>{t('mobile_expenses_empty_title' as any)}</Text>
            <Text style={styles.emptyDescription}>{t('mobile_expenses_empty_description' as any)}</Text>
          </View>
        ) : (
          expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseCard}>
              <View style={styles.expenseHeader}>
                <View style={styles.expenseLeft}>
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                  <Text style={styles.expenseMeta}>
                    {expense.category && `${expense.category} • `}
                    Paid by {getMemberName(expense.paid_by_member)}
                  </Text>
                  <Text style={styles.expenseDate}>
                    {new Date(expense.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.expenseAmount}>
                  {expense.currency} {expense.amount.toFixed(2)}
                </Text>
              </View>
              {expense.shares.length > 0 && (
                <View style={styles.sharesContainer}>
                  <Text style={styles.sharesLabel}>Shared by:</Text>
                  <View style={styles.sharesList}>
                    {expense.shares.map((share) => (
                      <View key={share.id} style={styles.shareTag}>
                        <Text style={styles.shareText}>
                          {getMemberName(share.member)}: {expense.currency}{" "}
                          {share.amount.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('mobile_expenses_add_expense' as any)}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('mobile_expenses_description' as any)}</Text>
                <TextInput
                  style={styles.formInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter description"
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>{t('mobile_expenses_amount' as any)}</Text>
                  <TextInput
                    style={styles.formInput}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>{t('mobile_expenses_currency' as any)}</Text>
                  <TextInput
                    style={styles.formInput}
                    value={currency}
                    onChangeText={(text) => setCurrency(text.toUpperCase())}
                    placeholder="USD"
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('mobile_expenses_category' as any)}</Text>
                <View style={styles.categoryContainer}>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryTag,
                        category === cat && styles.categoryTagActive,
                      ]}
                      onPress={() => setCategory(category === cat ? "" : cat)}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          category === cat && styles.categoryTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('mobile_expenses_paid_by' as any)}</Text>
                {members.length === 0 ? (
                  <Text style={styles.formHint}>No members found</Text>
                ) : (
                  <View style={styles.membersList}>
                    {members.map((member) => (
                      <TouchableOpacity
                        key={member.id}
                        style={[
                          styles.memberOption,
                          paidBy === member.id && styles.memberOptionActive,
                        ]}
                        onPress={() => setPaidBy(member.id)}
                      >
                        <Text
                          style={[
                            styles.memberOptionText,
                            paidBy === member.id && styles.memberOptionTextActive,
                          ]}
                        >
                          {getMemberName(member)}
                        </Text>
                        {paidBy === member.id && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('mobile_expenses_shared_by' as any)}</Text>
                {members.length === 0 ? (
                  <Text style={styles.formHint}>No members found</Text>
                ) : (
                  <View style={styles.membersList}>
                    {members.map((member) => (
                      <TouchableOpacity
                        key={member.id}
                        style={styles.memberCheckbox}
                        onPress={() => {
                          if (sharingMembers.includes(member.id)) {
                            setSharingMembers(sharingMembers.filter((id) => id !== member.id));
                          } else {
                            setSharingMembers([...sharingMembers, member.id]);
                          }
                        }}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            sharingMembers.includes(member.id) && styles.checkboxChecked,
                          ]}
                        >
                          {sharingMembers.includes(member.id) && (
                            <Text style={styles.checkboxCheckmark}>✓</Text>
                          )}
                        </View>
                        <Text style={styles.memberCheckboxText}>{getMemberName(member)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.modalButtonCancelText}>{t('mobile_expenses_cancel' as any)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave, submitting && styles.modalButtonDisabled]}
                onPress={handleAddExpense}
                disabled={submitting}
              >
                <Text style={styles.modalButtonSaveText}>
                  {submitting ? "Saving…" : t('mobile_expenses_save' as any)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginBottom: 8,
  },
  totalCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sendButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginBottom: 8,
  },
  balanceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  balanceRight: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  balancePositive: {
    color: '#4CAF50',
  },
  balanceNegative: {
    color: '#d32f2f',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666666',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  expenseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseLeft: {
    flex: 1,
    marginRight: 16,
  },
  expenseDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  expenseMeta: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#999999',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sharesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  sharesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  sharesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shareTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  shareText: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#666666',
  },
  modalScroll: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  formGroupHalf: {
    flex: 1,
    marginRight: 12,
  },
  formRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  formHint: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  categoryTagActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  categoryText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  membersList: {
    gap: 8,
  },
  memberOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  memberOptionActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  memberOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  memberOptionTextActive: {
    color: '#ffffff',
  },
  checkmark: {
    fontSize: 18,
    color: '#ffffff',
  },
  memberCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1a1a1a',
  },
  checkboxCheckmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberCheckboxText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
  },
  modalButtonSave: {
    backgroundColor: '#1a1a1a',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalButtonSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

