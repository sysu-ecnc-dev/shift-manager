import { format, Locale } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { enUS } from "date-fns/locale";

interface Props {
  value: DateRange | undefined;
  onValueChange: (value: DateRange | undefined) => void;
  locale?: Locale;
  disabled?: boolean;
}

export function DateRangePicker({
  value,
  onValueChange,
  locale,
  className,
  disabled,
}: Props & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "yyyy-MM-dd EEEE", {
                    locale: locale ?? enUS,
                  })}{" "}
                  ~{" "}
                  {format(value.to, "yyyy-MM-dd EEEE", {
                    locale: locale ?? enUS,
                  })}
                </>
              ) : (
                format(value.from, "yyyy-MM-dd EEEE", {
                  locale: locale ?? enUS,
                })
              )
            ) : (
              <span className="text-muted-foreground">请选择一个日期</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onValueChange}
            numberOfMonths={2}
            locale={locale ?? enUS}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
