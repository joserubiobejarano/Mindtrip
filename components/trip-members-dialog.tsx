"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, UserPlus, Trash2 } from "lucide-react";

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
  role: string;
  profile?: {
    full_name: string | null;
    email: string;
  } | null;
}

export function TripMembersDialog({
  open,
  onOpenChange,
  tripId,
  userId,
}: TripMembersDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: members = [] } = useQuery<TripMember[]>({
    queryKey: ["trip-members", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_members")
        .select(`
          *,
          profile:profiles(id, full_name, email)
        `)
        .eq("trip_id", tripId);

      if (error) throw error;
      return (data || []) as TripMember[];
    },
    enabled: open,
  });

  const inviteMember = useMutation({
    mutationFn: async (emailAddress: string) => {
      // Check if user exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", emailAddress)
        .single();

      const { data, error } = await supabase
        .from("trip_members")
        .insert({
          trip_id: tripId,
          user_id: profile?.id || null,
          email: profile?.email || emailAddress,
          role: "editor",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-members", tripId] });
      setEmail("");
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
    setLoading(true);
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

      await inviteMember.mutateAsync(email);
    } catch (err: any) {
      setError(err.message || "Failed to invite member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      await removeMember.mutateAsync(memberId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Trip Members</DialogTitle>
          <DialogDescription>
            Invite collaborators to view and edit this trip.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Invite Form */}
          <form onSubmit={handleInvite} className="space-y-2">
            <Label htmlFor="email">Invite by Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                {error}
              </div>
            )}
          </form>

          {/* Members List */}
          <div className="space-y-2">
            <Label>Members ({members.length})</Label>
            {members.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  No members yet. Invite someone to get started!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {member.profile?.full_name || member.email}
                          </div>
                          {member.profile?.full_name && (
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {member.role}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(member.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
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

