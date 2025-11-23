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
import { Plus, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string | null;
  paid_by_member_id: string;
  created_at: string;
  paid_by_member: {
    email: string | null;
    profile?: {
      full_name: string | null;
    } | null;
  };
  shares: Array<{
    id: string;
    member_id: string;
    amount: number;
    member: {
      email: string | null;
      profile?: {
        full_name: string | null;
      } | null;
    };
  }>;
}

interface TripMember {
  id: string;
  email: string | null;
  user_id: string | null;
  profile?: {
    full_name: string | null;
  } | null;
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

  // Fetch expenses
  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["expenses", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          paid_by_member:trip_members!expenses_paid_by_member_id_fkey(
            email,
            profile:profiles(full_name)
          ),
          shares:expense_shares(
            id,
            member_id,
            amount,
            member:trip_members!expense_shares_member_id_fkey(
              email,
              profile:profiles(full_name)
            )
          )
        `)
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Expense[];
    },
  });

  // Fetch trip members
  const { data: members = [] } = useQuery<TripMember[]>({
    queryKey: ["trip-members", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_members")
        .select(`
          *,
          profile:profiles(full_name)
        `)
        .eq("trip_id", tripId);

      if (error) throw error;
      // Sort by display_name if available, otherwise by email
      const sorted = (data || []).sort((a, b) => {
        const aName = (a as any).display_name || a.email || "";
        const bName = (b as any).display_name || b.email || "";
        return aName.localeCompare(bName);
      });
      return sorted as TripMember[];
    },
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
        throw new Error("Please fill in all required fields");
      }

      // Create expense
      const { data: expense, error: expenseError } = await supabase
        .from("expenses")
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
        throw new Error(expenseError.message || "Failed to create expense");
      }
      if (!expense) throw new Error("Failed to create expense");

      // Create shares (equal split)
      const shareAmount = amountNum / sharingMembers.length;
      const shares = sharingMembers.map((memberId) => ({
        expense_id: expense.id,
        member_id: memberId,
        amount: shareAmount,
      }));

      const { error: sharesError } = await supabase
        .from("expense_shares")
        .insert(shares);

      if (sharesError) {
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
      const errorMessage = error.message || "Failed to create expense. Please try again.";
      setError(errorMessage);
      addToast({
        variant: "destructive",
        title: "Error creating expense",
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

  const getMemberName = (member: TripMember | { email: string | null; profile?: { full_name: string | null } | null }) => {
    return (member as any).display_name || member.profile?.full_name || member.email || "Unknown";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Balance Summary */}
      {balances.data && Object.keys(balances.data).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Balance Summary</CardTitle>
            <CardDescription>
              Positive = is owed, Negative = owes
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
                    className="flex justify-between items-center p-3 rounded-md bg-muted"
                  >
                    <span className="font-medium">{getMemberName(member)}</span>
                    <div className="text-right">
                      <span
                        className={
                          roundedBalance > 0
                            ? "text-green-600 dark:text-green-400 font-semibold"
                            : roundedBalance < 0
                            ? "text-red-600 dark:text-red-400 font-semibold"
                            : "text-muted-foreground"
                        }
                      >
                        {roundedBalance > 0 ? "+" : ""}
                        {defaultCurrency} {Math.abs(roundedBalance).toFixed(2)}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {roundedBalance > 0 ? "(is owed)" : roundedBalance < 0 ? "(owes)" : "(settled)"}
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
              No expenses yet. Add your first expense to get started!
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{expense.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      {expense.category} • Paid by {getMemberName(expense.paid_by_member)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(expense.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {expense.currency} {expense.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                {expense.shares.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Shared by:</p>
                    <div className="flex flex-wrap gap-2">
                      {expense.shares.map((share) => (
                        <span
                          key={share.id}
                          className="text-xs px-2 py-1 bg-muted rounded-md"
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
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Record an expense and split it among trip members.
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
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="e.g., Hotel booking"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Input
                  id="currency"
                  placeholder="USD"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
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
              <Label htmlFor="paid_by">Paid By *</Label>
              {members.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  Add at least one tripmate to start tracking expenses.
                </div>
              ) : (
                <Select 
                  value={paidBy} 
                  onValueChange={setPaidBy} 
                  required
                  disabled={members.length === 1}
                >
                  <SelectTrigger id="paid_by">
                    <SelectValue placeholder="Select member" />
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
              <Label>Share With *</Label>
              {members.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  Add at least one tripmate to start tracking expenses.
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
                Cancel
              </Button>
              <Button type="submit" disabled={createExpense.isPending}>
                {createExpense.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

