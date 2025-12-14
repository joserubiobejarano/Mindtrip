"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Plus as PlusIcon, ChevronDown } from "lucide-react";
import { useRealtimeChecklists } from "@/hooks/use-realtime-checklists";

interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  title: string;
  checked: boolean;
  order_number: number;
}

interface ChecklistsTabProps {
  tripId: string;
}

interface ChecklistTemplate {
  title: string;
  items: string[];
}

type TemplateType = "city-weekend" | "beach-holiday" | "backpacking-trip";

const CHECKLIST_TEMPLATES: Record<TemplateType, ChecklistTemplate[]> = {
  "city-weekend": [
    {
      title: "Packing",
      items: [
        "Comfortable walking shoes",
        "Light jacket",
        "Power bank",
        "Camera",
      ],
    },
    {
      title: "To-do",
      items: [
        "Download offline maps",
        "Check museum opening hours",
        "Buy public transport card",
      ],
    },
  ],
  "beach-holiday": [
    {
      title: "Packing",
      items: [
        "Swimsuit",
        "Sunscreen (SPF 50)",
        "Beach towel",
        "Flip flops",
      ],
    },
    {
      title: "To-do",
      items: [
        "Check weather forecast",
        "Book sunbeds / umbrella",
      ],
    },
  ],
  "backpacking-trip": [
    {
      title: "Packing",
      items: [
        "Backpack",
        "Reusable water bottle",
        "First aid kit",
        "Laundry bag",
      ],
    },
    {
      title: "To-do",
      items: [
        "Confirm hostel bookings",
        "Scan passport & documents",
      ],
    },
  ],
};

export function ChecklistsTab({ tripId }: ChecklistsTabProps) {
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [checklistTitle, setChecklistTitle] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const templateMenuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Enable realtime sync
  useRealtimeChecklists(tripId);

  // Close template menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(event.target as Node)) {
        setTemplateMenuOpen(false);
      }
    };

    if (templateMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [templateMenuOpen]);

  // Fetch checklists
  const { data: checklists = [] } = useQuery<Checklist[]>({
    queryKey: ["checklists", tripId],
    queryFn: async () => {
      const { data: checklistData, error } = await supabase
        .from("checklists")
        .select(`
          *,
          items:checklist_items(*)
        `)
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (checklistData || []).map((checklist: any) => ({
        id: checklist.id,
        title: checklist.title,
        items: (checklist.items || []).sort(
          (a: ChecklistItem, b: ChecklistItem) => a.order_number - b.order_number
        ),
      })) as Checklist[];
    },
  });

  const createChecklist = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await (supabase
        .from("checklists") as any)
        .insert({
          trip_id: tripId,
          title,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", tripId] });
      setChecklistDialogOpen(false);
      setChecklistTitle("");
    },
  });

  const deleteChecklist = useMutation({
    mutationFn: async (checklistId: string) => {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", tripId] });
    },
  });

  const createItem = useMutation({
    mutationFn: async ({ checklistId, title }: { checklistId: string; title: string }) => {
      // Get max order_number
      const checklist = checklists.find((c) => c.id === checklistId);
      const maxOrder = Math.max(
        0,
        ...(checklist?.items.map((i) => i.order_number) || [])
      );

      const { data, error } = await (supabase
        .from("checklist_items") as any)
        .insert({
          checklist_id: checklistId,
          title,
          checked: false,
          order_number: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", tripId] });
      setItemDialogOpen(false);
      setItemTitle("");
      setSelectedChecklistId(null);
    },
  });

  const toggleItem = useMutation({
    mutationFn: async ({ itemId, checked }: { itemId: string; checked: boolean }) => {
      const { error } = await (supabase
        .from("checklist_items") as any)
        .update({ checked: !checked })
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", tripId] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("checklist_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", tripId] });
    },
  });

  const handleAddItem = (checklistId: string) => {
    setSelectedChecklistId(checklistId);
    setItemDialogOpen(true);
  };

  const applyTemplate = useMutation({
    mutationFn: async (templateType: TemplateType) => {
      if (!tripId) {
        throw new Error("Trip ID is required");
      }

      const templates = CHECKLIST_TEMPLATES[templateType];
      
      if (!templates || templates.length === 0) {
        throw new Error("Template not found");
      }
      
      // Insert all checklists first
      const checklistInserts = templates.map((template) => ({
        trip_id: tripId,
        title: template.title,
      }));

      const { data: insertedChecklists, error: checklistError } = await (supabase
        .from("checklists") as any)
        .insert(checklistInserts)
        .select();

      if (checklistError) {
        console.error("Error creating checklists:", checklistError);
        throw checklistError;
      }

      if (!insertedChecklists || insertedChecklists.length === 0) {
        throw new Error("Failed to create checklists");
      }

      // Insert all items for each checklist
      const itemInserts: Array<{
        checklist_id: string;
        title: string;
        checked: boolean;
        order_number: number;
      }> = [];

      type ChecklistResult = {
        id: string
        [key: string]: any
      }

      (insertedChecklists || []).forEach((checklist: ChecklistResult, checklistIndex: number) => {
        if (!checklist || !checklist.id) {
          console.error("Invalid checklist at index", checklistIndex);
          return;
        }
        const template = templates[checklistIndex];
        if (!template || !Array.isArray(template.items)) {
          console.error("Invalid template at index", checklistIndex);
          return;
        }
        template.items.forEach((itemTitle, itemIndex) => {
          if (itemTitle) {
            itemInserts.push({
              checklist_id: checklist.id,
              title: itemTitle,
              checked: false,
              order_number: itemIndex + 1,
            });
          }
        });
      });

      if (itemInserts.length > 0) {
        const { error: itemError } = await (supabase
          .from("checklist_items") as any)
          .insert(itemInserts);

        if (itemError) {
          console.error("Error creating checklist items:", itemError);
          throw itemError;
        }
      }

      return { checklists: insertedChecklists, items: itemInserts };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", tripId] });
      setTemplateMenuOpen(false);
    },
    onError: (error: Error) => {
      console.error("Error applying template:", error);
      // Error is already logged, user will see it via the mutation state
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Checklists</h2>
        <div className="flex gap-2">
          <div className="relative" ref={templateMenuRef}>
            <Button
              variant="outline"
              onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
              disabled={applyTemplate.isPending}
            >
              Use a template
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            {templateMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-md z-50">
                <div className="p-1">
                  <button
                    className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      try {
                        applyTemplate.mutate("city-weekend");
                      } catch (error) {
                        console.error("Error applying template:", error);
                      }
                    }}
                    disabled={applyTemplate.isPending}
                  >
                    City weekend
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      try {
                        applyTemplate.mutate("beach-holiday");
                      } catch (error) {
                        console.error("Error applying template:", error);
                      }
                    }}
                    disabled={applyTemplate.isPending}
                  >
                    Beach holiday
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      try {
                        applyTemplate.mutate("backpacking-trip");
                      } catch (error) {
                        console.error("Error applying template:", error);
                      }
                    }}
                    disabled={applyTemplate.isPending}
                  >
                    Backpacking trip
                  </button>
                </div>
              </div>
            )}
          </div>
          <Button onClick={() => setChecklistDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Checklist
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {checklists.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No checklists yet. Create one to get started!
            </CardContent>
          </Card>
        ) : (
          checklists.map((checklist) => (
            <Card key={checklist.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{checklist.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this checklist?")) {
                        deleteChecklist.mutate(checklist.id);
                      }
                    }}
                    className="h-6 w-6 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {checklist.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items yet</p>
                ) : (
                  checklist.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {
                          toggleItem.mutate({
                            itemId: item.id,
                            checked: item.checked,
                          });
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          item.checked
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {item.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this item?")) {
                            deleteItem.mutate(item.id);
                          }
                        }}
                        className="h-6 w-6 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleAddItem(checklist.id)}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Checklist Dialog */}
      <Dialog open={checklistDialogOpen} onOpenChange={setChecklistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Checklist</DialogTitle>
            <DialogDescription>
              Create a new checklist (e.g., &quot;Packing&quot;, &quot;To-do&quot;, &quot;Restaurants&quot;).
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (checklistTitle) {
                createChecklist.mutate(checklistTitle);
              }
            }}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="checklist-title">Title *</Label>
              <Input
                id="checklist-title"
                placeholder="e.g., Packing List"
                value={checklistTitle}
                onChange={(e) => setChecklistTitle(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setChecklistDialogOpen(false);
                  setChecklistTitle("");
                }}
                disabled={createChecklist.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createChecklist.isPending}>
                {createChecklist.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
            <DialogDescription>Add an item to this checklist.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (itemTitle && selectedChecklistId) {
                createItem.mutate({
                  checklistId: selectedChecklistId,
                  title: itemTitle,
                });
              }
            }}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="item-title">Item Title *</Label>
              <Input
                id="item-title"
                placeholder="e.g., Passport"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setItemDialogOpen(false);
                  setItemTitle("");
                  setSelectedChecklistId(null);
                }}
                disabled={createItem.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createItem.isPending}>
                {createItem.isPending ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

