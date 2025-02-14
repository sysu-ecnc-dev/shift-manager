import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { startOfDay, endOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  label: string;
  startDate?: Date;
  endDate?: Date;
  onRangeChange: (range: { start?: Date; end?: Date }) => void;
  error?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  label,
  startDate,
  endDate,
  onRangeChange,
  error,
  disabled = false,
}: DateRangePickerProps) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Popover modal={true}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn(
              "justify-start",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {startDate ? (
              endDate ? (
                <>
                  {format(startDate, "yyyy-MM-dd HH:mm:ss EEEE", {
                    locale: zhCN,
                  })}{" "}
                  ~{" "}
                  {format(endDate, "yyyy-MM-dd HH:mm:ss EEEE", {
                    locale: zhCN,
                  })}
                </>
              ) : (
                format(startDate, "yyyy-MM-dd HH:mm:ss EEEE", {
                  locale: zhCN,
                })
              )
            ) : (
              <span>请选择日期范围</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="range"
            selected={{ from: startDate, to: endDate }}
            onSelect={(date) => {
              onRangeChange({
                start: date?.from ? startOfDay(date.from) : undefined,
                end: date?.to
                  ? endOfDay(date.to)
                  : date?.from
                    ? endOfDay(date.from)
                    : undefined,
              });
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
