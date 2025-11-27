"use client";

import { useState, useRef, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, isAfter, startOfDay } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
  placeholder = "Select dates",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const popoverRef = useRef<HTMLDivElement>(null);

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  // Format display text
  const displayText = () => {
    if (start && end) {
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    if (start) {
      return `${format(start, "MMM d")} - ...`;
    }
    return placeholder;
  };

  // Set current month to start date when it's selected
  useEffect(() => {
    if (start) {
      const startMonth = start.getMonth();
      const startYear = start.getFullYear();
      
      setCurrentMonth((prevMonth) => {
        const prevMonthValue = prevMonth.getMonth();
        const prevYear = prevMonth.getFullYear();
        
        // Only update if the month/year is different to avoid unnecessary updates
        if (startMonth !== prevMonthValue || startYear !== prevYear) {
          return new Date(startYear, startMonth, 1);
        }
        return prevMonth;
      });
    }
  }, [start]);

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    if (selecting === "start") {
      onStartDateChange(dateStr);
      // If end date is before new start date, clear it
      if (end && isBefore(end, date)) {
        onEndDateChange("");
      }
      setSelecting("end");
    } else {
      // If selected date is before start date, make it the new start
      if (start && isBefore(date, start)) {
        onStartDateChange(dateStr);
        onEndDateChange("");
        setSelecting("end");
      } else {
        onEndDateChange(dateStr);
        setOpen(false);
        setSelecting("start");
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (!start || !end) return false;
    const day = startOfDay(date);
    const startDay = startOfDay(start);
    const endDay = startOfDay(end);
    return (isAfter(day, startDay) || isSameDay(day, startDay)) && 
           (isBefore(day, endDay) || isSameDay(day, endDay));
  };

  const isDateStart = (date: Date) => {
    return start ? isSameDay(date, start) : false;
  };

  const isDateEnd = (date: Date) => {
    return end ? isSameDay(date, end) : false;
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const today = new Date();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal pl-12",
            !start && !end && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4 absolute left-4" />
          {displayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={8} ref={popoverRef}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground w-10">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="w-10 h-10" />
            ))}
            {daysInMonth.map((date) => {
              const isInRange = isDateInRange(date);
              const isStart = isDateStart(date);
              const isEnd = isDateEnd(date);
              const isToday = isSameDay(date, today);
              const isPast = isBefore(date, today) && !isSameDay(date, today);
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "w-10 h-10 rounded-md text-sm transition-colors",
                    isPast && "text-muted-foreground opacity-50",
                    isToday && "font-bold border-2 border-primary",
                    isInRange && !isStart && !isEnd && "bg-primary/10",
                    isStart && "bg-primary text-primary-foreground rounded-l-md rounded-r-none",
                    isEnd && "bg-primary text-primary-foreground rounded-r-md rounded-l-none",
                    isStart && isEnd && "rounded-md",
                    !isStart && !isEnd && !isInRange && "hover:bg-accent"
                  )}
                >
                  {format(date, "d")}
                </button>
              );
            })}
          </div>
          
          {start && !end && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Select check-out date
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

