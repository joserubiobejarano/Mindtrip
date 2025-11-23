"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { RouteLeg } from "@/lib/mapboxDirections";

interface Activity {
  id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  place?: {
    name: string;
    address: string | null;
  } | null;
}

interface ActivityListProps {
  activities: Activity[];
  routeLegs?: RouteLeg[];
  onEdit: (activityId: string) => void;
  onDelete: (activityId: string) => void;
  onSelect: (activityId: string) => void;
}

export function ActivityList({
  activities,
  routeLegs = [],
  onEdit,
  onDelete,
  onSelect,
}: ActivityListProps) {
  const formatTime = (time: string | null) => {
    if (!time) return "";
    try {
      return format(new Date(`2000-01-01T${time}`), "h:mm a");
    } catch {
      return time;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No activities yet. Click "Add Activity" to get started!
      </div>
    );
  }

  // Helper to find travel time for an activity
  const getTravelTime = (activityId: string): number | null => {
    const leg = routeLegs.find((leg) => leg.fromActivityId === activityId);
    return leg ? leg.durationMinutes : null;
  };

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const travelTime = getTravelTime(activity.id);
        return (
          <div key={activity.id}>
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelect(activity.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <h3 className="font-semibold">{activity.title}</h3>
                    </div>
                    {(activity.start_time || activity.end_time) && (
                      <div className="text-sm text-muted-foreground mb-2">
                        {activity.start_time && formatTime(activity.start_time)}
                        {activity.start_time && activity.end_time && " - "}
                        {activity.end_time && formatTime(activity.end_time)}
                      </div>
                    )}
                    {activity.place && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{activity.place.name}</span>
                        {activity.place.address && (
                          <span className="opacity-70">• {activity.place.address}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {onEdit && onDelete && (
                    <div className="flex gap-2 ml-2 no-print" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(activity.id)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(activity.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {travelTime !== null && (
              <div className="text-xs text-muted-foreground mt-1 ml-4">
                Walk · {travelTime} min to next stop
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

