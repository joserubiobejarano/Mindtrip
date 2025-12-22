import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLanguage } from '@/src/providers/language-provider';
import { apiJson, apiFetch } from '@/src/lib/api';
import { useUser } from '@clerk/clerk-expo';

interface TripMember {
  id: string;
  user_id: string | null;
  email: string | null;
  display_name: string | null;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
}

interface Trip {
  id: string;
  title: string;
  owner_id: string;
  [key: string]: any;
}

export default function TripmatesScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useUser();

  const [members, setMembers] = useState<TripMember[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (tripId) {
      fetchData();
    }
  }, [tripId]);

  const fetchData = async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch trip and members in parallel
      const [tripData, membersData] = await Promise.all([
        apiJson<{ trip: Trip }>(`/api/trips/${tripId}`),
        apiJson<{ members: TripMember[] }>(`/api/trips/${tripId}/members`),
      ]);

      setTrip(tripData.trip);
      setMembers(membersData.members || []);
    } catch (err: any) {
      console.error('Error fetching tripmates data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Determine if current user can invite (owner or editor)
  const canInvite = () => {
    if (!trip || !user?.id) return false;
    
    // Check if user is trip owner
    if (trip.owner_id === user.id) return true;
    
    // Check if user is an editor in the member list
    const currentUserMember = members.find((m) => m.user_id === user.id);
    return currentUserMember?.role === 'owner' || currentUserMember?.role === 'editor';
  };

  const getDisplayName = (member: TripMember): string => {
    return member.display_name || member.email || t('mobile_tripmates_unknown' as any);
  };

  const getStatus = (member: TripMember): string => {
    return member.user_id ? t('mobile_tripmates_status_accepted' as any) : t('mobile_tripmates_status_pending' as any);
  };

  const getRoleLabel = (memberRole: string): string => {
    if (memberRole === 'owner') return t('mobile_tripmates_role_owner' as any);
    if (memberRole === 'editor') return t('mobile_tripmates_role_editor' as any);
    if (memberRole === 'viewer') return t('mobile_tripmates_role_viewer' as any);
    return memberRole;
  };

  const handleInvite = async () => {
    if (!tripId) return;

    // Validation
    if (!email.trim() || !email.includes('@')) {
      Alert.alert(
        t('mobile_tripmates_invite_error' as any),
        t('mobile_tripmates_email_label' as any) + ' is required',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if member already exists
    const existingMember = members.find(
      (m) => m.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingMember) {
      Alert.alert(
        t('mobile_tripmates_invite_error' as any),
        'This member is already invited',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setSending(true);

      const response = await apiFetch(`/api/trips/${tripId}/members`, {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          role,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || t('mobile_tripmates_invite_error' as any));
      }

      // Success - refresh member list and close modal
      setEmail('');
      setRole('editor');
      setModalVisible(false);
      await fetchData();

      Alert.alert(
        t('mobile_tripmates_invite_success' as any).replace('{email}', email.trim()),
        '',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      Alert.alert(
        t('mobile_tripmates_invite_error' as any),
        err instanceof Error ? err.message : 'Unknown error',
        [{ text: 'OK' }]
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('mobile_tripmates_title' as any)}</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1a1a1a" />
          <Text style={styles.loadingText}>{t('mobile_tripmates_loading' as any)}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('mobile_tripmates_title' as any)}</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{t('mobile_tripmates_error' as any)}</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('mobile_tripmates_title' as any)}</Text>
        {canInvite() && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {members.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>{t('mobile_tripmates_empty_title' as any)}</Text>
            <Text style={styles.emptyDescription}>{t('mobile_tripmates_empty_description' as any)}</Text>
          </View>
        ) : (
          members.map((member) => {
            const displayName = getDisplayName(member);
            const status = getStatus(member);
            const roleLabel = getRoleLabel(member.role);
            const isCurrentUser = member.user_id === user?.id;

            return (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {displayName.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{displayName}</Text>
                      {isCurrentUser && (
                        <Text style={styles.youLabel}>(You)</Text>
                      )}
                    </View>
                    {member.display_name && member.email && (
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    )}
                    <View style={styles.memberBadges}>
                      <View style={[styles.badge, styles.roleBadge]}>
                        <Text style={styles.badgeText}>{roleLabel}</Text>
                      </View>
                      <View style={[styles.badge, styles.statusBadge]}>
                        <Text style={styles.badgeText}>{status}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Invite Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('mobile_tripmates_invite_title' as any)}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
                disabled={sending}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('mobile_tripmates_email_label' as any)}</Text>
                <TextInput
                  style={styles.formInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('mobile_tripmates_email_placeholder' as any)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!sending}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('mobile_tripmates_role_label' as any)}</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      role === 'editor' && styles.roleOptionActive,
                    ]}
                    onPress={() => setRole('editor')}
                    disabled={sending}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        role === 'editor' && styles.roleOptionTextActive,
                      ]}
                    >
                      {t('mobile_tripmates_role_editor' as any)}
                    </Text>
                    {role === 'editor' && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      role === 'viewer' && styles.roleOptionActive,
                    ]}
                    onPress={() => setRole('viewer')}
                    disabled={sending}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        role === 'viewer' && styles.roleOptionTextActive,
                      ]}
                    >
                      {t('mobile_tripmates_role_viewer' as any)}
                    </Text>
                    {role === 'viewer' && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
                disabled={sending}
              >
                <Text style={styles.modalButtonCancelText}>{t('mobile_expenses_cancel' as any)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonSave,
                  sending && styles.modalButtonDisabled,
                ]}
                onPress={handleInvite}
                disabled={sending}
              >
                <Text style={styles.modalButtonSaveText}>
                  {sending ? t('mobile_tripmates_sending' as any) : t('mobile_tripmates_send_invite' as any)}
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
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  youLabel: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  memberBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  roleBadge: {
    backgroundColor: '#e3f2fd',
  },
  statusBadge: {
    backgroundColor: '#f3e5f5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
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
    padding: 20,
    paddingBottom: 0,
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
  roleContainer: {
    gap: 8,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  roleOptionActive: {
    borderColor: '#1a1a1a',
    backgroundColor: '#f5f5f5',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  roleOptionTextActive: {
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: 'bold',
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
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalButtonSave: {
    backgroundColor: '#1a1a1a',
  },
  modalButtonSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
});

