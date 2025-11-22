"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Day {
  id: string;
  date: string;
  day_number: number;
}

interface DaySelectorProps {
  days: Day[];
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
}

export function DaySelector({ days, selectedDayId, onSelectDay }: DaySelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
      {days.map((day) => (
        <Button
          key={day.id}
          variant={selectedDayId === day.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectDay(day.id)}
          className="whitespace-nowrap"
        >
          Day {day.day_number}
          <br />
          <span className="text-xs opacity-70">
            {format(new Date(day.date), "MMM d")}
          </span>
        </Button>
      ))}
    </div>
  );
}

