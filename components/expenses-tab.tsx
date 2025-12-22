"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, DollarSign, Mail } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ensureOwnerMember } from "@/lib/supabase/trip-members";
import { useTrip } from "@/hooks/use-trip";
import { useLanguage } from "@/components/providers/language-provider";

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

const EXPENSE_CATEGORIES = [
  "Food",
  "Accommodation",
  "Transport",
  "Activities",
  "Other",
];

interface ExpensesTabProps {
  tripId: string;
  defaultCurrency: string;
}

export function ExpensesTab({ tripId, defaultCurrency }: ExpensesTabProps) {
  const { user } = useUser();
  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [category, setCategory] = useState("");
  const [paidBy, setPaidBy] = useState<string>("");
  const [sharingMembers, setSharingMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: trip } = useTrip(tripId);

  // Ensure current user is a trip member before loading data
  const [ownerMemberEnsured, setOwnerMemberEnsured] = useState(false);
  
  useEffect(() => {
    if (tripId && user?.id && !ownerMemberEnsured) {
      ensureOwnerMember(tripId, user)
        .then(() => {
          setOwnerMemberEnsured(true);
        })
        .catch((err) => {
          console.error("Error ensuring owner member:", err);
          setOwnerMemberEnsured(true); // Set to true even on error to prevent infinite loop
        });
    }
  }, [tripId, user, ownerMemberEnsured]);

  // Fetch expenses
  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["expenses", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          paid_by_member:trip_members!expenses_paid_by_member_id_fkey(
            id,
            email,
            display_name
          ),
          shares:expense_shares(
            id,
            member_id,
            amount,
            member:trip_members!expense_shares_member_id_fkey(
              id,
              email,
              display_name
            )
          )
        `)
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching expenses:", error.message);
        throw error;
      }
      return (data || []) as Expense[];
    },
    enabled: ownerMemberEnsured,
  });

  // Fetch trip members
  const { data: members = [] } = useQuery<TripMember[]>({
    queryKey: ["trip-members", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_members")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching trip members:", error.message);
        throw error;
      }
      type TripMemberQueryResult = {
        display_name: string | null
        email: string | null
        [key: string]: any
      }

      const dataTyped = (data || []) as TripMemberQueryResult[];

      // Sort by display_name if available, otherwise by email
      const sorted = dataTyped.sort((a, b) => {
        const aName = a.display_name || a.email || "";
        const bName = b.display_name || b.email || "";
        return aName.localeCompare(bName);
      });
      return sorted as TripMember[];
    },
    enabled: ownerMemberEnsured,
  });

  // Auto-select all members when dialog opens and default paidBy to current user
  useEffect(() => {
    if (dialogOpen && members.length > 0) {
      // If only one member, prefill and default share with that member
      if (members.length === 1) {
        const singleMember = members[0];
        if (!paidBy) {
          setPaidBy(singleMember.id);
        }
        if (sharingMembers.length === 0) {
          setSharingMembers([singleMember.id]);
        }
      } else {
        // Multiple members: auto-select all
        if (sharingMembers.length === 0) {
          setSharingMembers(members.map((m) => m.id));
        }
        // Default paidBy to current user's member entry if present
        if (!paidBy && user?.id) {
          const currentUserMember = members.find((m) => m.user_id === user.id);
          if (currentUserMember) {
            setPaidBy(currentUserMember.id);
          }
        }
      }
    }
  }, [dialogOpen, members, sharingMembers.length, paidBy, user?.id]);

  // Calculate balances (only for default currency for now)
  const balances = useQuery<Record<string, number>>({
    queryKey: ["expense-balances", tripId, expenses, members, defaultCurrency],
    queryFn: async () => {
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

      return balanceMap;
    },
    enabled: expenses.length > 0 && members.length > 0,
  });

  const createExpense = useMutation({
    mutationFn: async () => {
      const amountNum = parseFloat(amount);
      if (!description || !amountNum || !paidBy || sharingMembers.length === 0) {
        throw new Error(t("expenses_error_required_fields"));
      }

      // Create expense
      const { data: expense, error: expenseError } = await (supabase
        .from("expenses") as any)
        .insert({
          trip_id: tripId,
          description,
          amount: amountNum,
          currency,
          category: category || null,
          paid_by_member_id: paidBy,
        })
        .select()
        .single();

      if (expenseError) {
        console.error("Error creating expense:", expenseError.message);
        throw new Error(expenseError.message || t("expenses_error_creating_desc"));
      }
      if (!expense) {
        console.error("Error creating expense: No expense returned");
        throw new Error(t("expenses_error_creating_desc"));
      }

      // Create shares (equal split)
      const shareAmount = amountNum / sharingMembers.length;
      const shares = sharingMembers.map((memberId) => ({
        expense_id: expense.id,
        member_id: memberId,
        amount: shareAmount,
      }));

      const { error: sharesError } = await (supabase
        .from("expense_shares") as any)
        .insert(shares);

      if (sharesError) {
        console.error("Error creating expense shares:", sharesError.message);
        throw new Error(sharesError.message || "Failed to create expense shares");
      }

      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      queryClient.invalidateQueries({ queryKey: ["expense-balances", tripId] });
      resetForm();
      setDialogOpen(false);
      setError(null);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || t("expenses_error_creating_desc");
      setError(errorMessage);
      addToast({
        variant: "destructive",
        title: t("expenses_error_creating"),
        description: errorMessage,
      });
    },
  });

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCurrency(defaultCurrency);
    setCategory("");
    setPaidBy("");
    setSharingMembers([]);
  };

  const getMemberName = (member: TripMember | { email: string | null; display_name?: string | null }) => {
    return member.display_name || member.email || t("expenses_unknown");
  };

  // Check if user can send balance summary (owner or editor role)
  // Note: Trip owners should be members with role "owner" via ensureOwnerMember
  const canSendSummary = user?.id && members.some(
    (m) => m.user_id === user.id && (m.role === "owner" || m.role === "editor")
  );

  // Send balance summary mutation
  const sendSummary = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/trips/${tripId}/expenses/send-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: language || "en",
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: t("expenses_summary_error_desc") }));
        throw new Error(error.error || t("expenses_summary_error_desc"));
      }

      return response.json();
    },
    onSuccess: (data) => {
      addToast({
        variant: "success",
        title: t("expenses_summary_sent"),
        description: t("expenses_summary_sent_desc").replace("{count}", data.sentCount.toString()),
      });
    },
    onError: (error: Error) => {
      addToast({
        variant: "destructive",
        title: t("expenses_summary_error"),
        description: t("expenses_summary_error_desc"),
      });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "'Patrick Hand', cursive" }}>{t("expenses_title")}</h2>
        <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("expenses_add_expense")}
        </Button>
      </div>

      {/* Total Spent Summary */}
      {expenses.length > 0 && (() => {
        // Calculate totals by currency
        const totalsByCurrency: Record<string, number> = {};
        expenses.forEach((expense) => {
          totalsByCurrency[expense.currency] = (totalsByCurrency[expense.currency] || 0) + expense.amount;
        });

        return (
          <Card>
            <CardHeader>
              <CardTitle>{t("expenses_total_spent")}</CardTitle>
              <CardDescription>
                {t("expenses_total_spent_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(totalsByCurrency).map(([currency, total]) => (
                  <div
                    key={currency}
                    className="flex justify-between items-center p-4 rounded-md bg-muted"
                  >
                    <span className="font-medium text-base text-foreground">{currency}</span>
                    <span className="text-xl font-semibold text-foreground">
                      {currency} {total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Send Balance Summary Button */}
      {canSendSummary && (
        <div className="flex justify-end">
          <Button
            onClick={() => sendSummary.mutate()}
            disabled={sendSummary.isPending}
            className="w-full sm:w-auto"
          >
            <Mail className="mr-2 h-4 w-4" />
            {sendSummary.isPending ? t("expenses_sending") : t("expenses_send_summary")}
          </Button>
        </div>
      )}

      {/* Balance Summary */}
      {balances.data && Object.keys(balances.data).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("expenses_balance_summary")}</CardTitle>
            <CardDescription>
              {t("expenses_balance_hint")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => {
                const balance = balances.data![member.id] || 0;
                // Round values close to zero
                const roundedBalance = Math.abs(balance) < 0.01 ? 0 : balance;
                
                return (
                  <div
                    key={member.id}
                    className="flex justify-between items-center p-4 rounded-md bg-muted"
                  >
                    <span className="font-medium text-foreground">{getMemberName(member)}</span>
                    <div className="text-right">
                      <span
                        className={
                          roundedBalance > 0
                            ? "text-green-600 dark:text-green-400 font-semibold text-base"
                            : roundedBalance < 0
                            ? "text-red-600 dark:text-red-400 font-semibold text-base"
                            : "text-muted-foreground font-medium"
                        }
                      >
                        {roundedBalance > 0 ? "+" : ""}
                        {defaultCurrency} {Math.abs(roundedBalance).toFixed(2)}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {roundedBalance > 0 ? t("expenses_is_owed") : roundedBalance < 0 ? t("expenses_owes") : t("expenses_settled")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <div className="space-y-4">
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <div className="space-y-1">
                <p className="font-medium">{t("expenses_empty_title")}</p>
                <p className="text-sm">{t("expenses_empty_description")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground mb-1">{expense.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      {expense.category && <span>{expense.category} • </span>}
                      {t("expenses_paid_by").replace("{name}", getMemberName(expense.paid_by_member))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(expense.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-semibold text-lg text-foreground">
                      {expense.currency} {expense.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                {expense.shares.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">{t("expenses_shared_by")}</p>
                    <div className="flex flex-wrap gap-2">
                      {expense.shares.map((share) => (
                        <span
                          key={share.id}
                          className="text-xs px-2.5 py-1 bg-muted rounded-md text-foreground"
                        >
                          {getMemberName(share.member)}: {expense.currency}{" "}
                          {share.amount.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Expense Dialog */}
      <Dialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("expenses_dialog_title")}</DialogTitle>
            <DialogDescription>
              {t("expenses_dialog_description")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              createExpense.mutate();
            }}
            className="space-y-4 py-4"
          >
            {error && (
              <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="description">{t("expenses_form_description")}</Label>
              <Input
                id="description"
                placeholder={t("expenses_form_description_placeholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">{t("expenses_form_amount")}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder={t("expenses_form_amount_placeholder")}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">{t("expenses_form_currency")}</Label>
                <Input
                  id="currency"
                  placeholder={t("expenses_form_currency_placeholder")}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t("expenses_form_category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder={t("expenses_form_category_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paid_by">{t("expenses_form_paid_by")}</Label>
              {members.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  {t("expenses_form_no_members_hint")}
                </div>
              ) : (
                <Select 
                  value={paidBy} 
                  onValueChange={setPaidBy} 
                  required
                  disabled={members.length === 1}
                >
                  <SelectTrigger id="paid_by">
                    <SelectValue placeholder={t("expenses_form_paid_by_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {getMemberName(member)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("expenses_form_share_with")}</Label>
              {members.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  {t("expenses_form_no_members_hint")}
                </div>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {members.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-2 cursor-pointer p-1 hover:bg-muted rounded"
                    >
                      <input
                        type="checkbox"
                        checked={sharingMembers.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSharingMembers([...sharingMembers, member.id]);
                          } else {
                            setSharingMembers(
                              sharingMembers.filter((id) => id !== member.id)
                            );
                          }
                        }}
                      />
                      <span>{getMemberName(member)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                disabled={createExpense.isPending}
              >
                {t("expenses_form_cancel")}
              </Button>
              <Button type="submit" disabled={createExpense.isPending}>
                {createExpense.isPending ? t("expenses_adding") : t("expenses_add_expense")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

