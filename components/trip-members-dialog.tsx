"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Trash2 } from "lucide-react";
import { useTrip } from "@/hooks/use-trip";
import { cn } from "@/lib/utils";
import { ensureOwnerMember } from "@/lib/supabase/trip-members";

interface TripMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  userId: string;
}

interface TripMember {
  id: string;
  user_id: string | null;
  email: string | null;
  display_name: string | null;
  role: "owner" | "editor" | "viewer";
}

// Helper to get initials from name or email
function getInitials(member: TripMember): string {
  const name = member.display_name || member.email || "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Helper to get display name
function getDisplayName(member: TripMember): string {
  return member.display_name || member.email || "Unknown";
}

// Helper to get role badge color
function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "owner":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "editor":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "viewer":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
}

export function TripMembersDialog({
  open,
  onOpenChange,
  tripId,
  userId,
}: TripMembersDialogProps) {
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: trip } = useTrip(tripId);

  // Ensure current user is a trip member
  useEffect(() => {
    if (tripId && user?.id) {
      ensureOwnerMember(tripId, user).catch((err) => {
        console.error("Error ensuring owner member:", err);
      });
    }
  }, [tripId, user]);

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
      return (data || []) as TripMember[];
    },
    enabled: open,
  });

  // Determine if current user is owner
  const isOwner = trip?.owner_id === userId || 
    members.some(m => m.user_id === userId && m.role === "owner");

  const inviteMember = useMutation({
    mutationFn: async (data: { email: string; role: "editor" | "viewer" }) => {
      const { data: member, error } = await (supabase
        .from("trip_members") as any)
        .insert({
          trip_id: tripId,
          user_id: null, // Will be set when user signs up
          email: data.email,
          role: data.role,
          display_name: null, // Will be set when user signs up
        })
        .select()
        .single();

      if (error) {
        console.error("Error inviting member:", error.message);
        throw error;
      }
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-members", tripId] });
      setEmail("");
      setRole("editor");
      setError(null);
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("trip_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-members", tripId] });
    },
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      // Check if member already exists
      const existingMember = members.find(
        (m) => m.email?.toLowerCase() === email.toLowerCase()
      );

      if (existingMember) {
        throw new Error("This member is already invited");
      }

      await inviteMember.mutateAsync({
        email,
        role,
      });
    } catch (err: any) {
      setError(err.message || "Failed to invite member");
    }
  };

  const handleRemove = async (memberId: string, memberRole: string) => {
    if (memberRole === "owner") {
      setError("Cannot remove the owner");
      return;
    }
    if (confirm("Are you sure you want to remove this member?")) {
      await removeMember.mutateAsync(memberId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tripmates</DialogTitle>
          <DialogDescription>
            Manage trip members and invite collaborators.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Members List */}
          <div className="space-y-2">
            <Label>Current Members ({members.length})</Label>
            {members.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  No members yet. Invite someone to get started!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {members.map((member) => {
                  const isCurrentUser = member.user_id === userId;
                  const displayNameText = getDisplayName(member);
                  const initials = getInitials(member);
                  
                  return (
                    <Card key={member.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Avatar placeholder with initials */}
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {initials}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {displayNameText}
                              </span>
                              {isCurrentUser && (
                                <span className="text-xs text-muted-foreground">(You)</span>
                              )}
                            </div>
                            {member.display_name && member.email && (
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                            )}
                            <div className="mt-1">
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full font-medium",
                                  getRoleBadgeClass(member.role)
                                )}
                              >
                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isOwner && member.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(member.id, member.role)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Invite Form - Only visible to owner */}
          {isOwner && (
            <div className="border-t pt-4 space-y-4">
              <Label className="text-base font-semibold">Invite by Email</Label>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={role} onValueChange={(value: "editor" | "viewer") => setRole(value)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={inviteMember.isPending} className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  {inviteMember.isPending ? "Inviting..." : "Invite"}
                </Button>
              </form>
            </div>
          )}

          {!isOwner && (
            <div className="border-t pt-4 text-sm text-muted-foreground text-center">
              Only the trip owner can invite members.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
