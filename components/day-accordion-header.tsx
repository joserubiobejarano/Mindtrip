import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ItineraryDay } from "@/types/itinerary";

interface DayAccordionHeaderProps {
  day: ItineraryDay;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectDay?: (dayId: string) => void;
}

export function DayAccordionHeader({
  day,
  isExpanded,
  onToggle,
  onSelectDay,
}: DayAccordionHeaderProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
    onSelectDay?.(day.id);
  };

  return (
    <CardHeader
      className="bg-gray-50 border-b pb-4 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            Day {day.index} – {day.title}
          </CardTitle>
          <CardDescription className="text-base font-medium text-slate-600 mt-1">
            {day.theme} • {format(new Date(day.date), "EEEE, MMMM d")}
          </CardDescription>
        </div>
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-600" />
          )}
        </div>
      </div>
    </CardHeader>
  );
}

