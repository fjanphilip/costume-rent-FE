import * as React from "react"
import { format, addDays, differenceInDays } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Field, FieldLabel } from "~/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

export function DatePickerWithRange({
  className,
  date,
  setDate,
  label = "Pilih Tanggal Sewa",
  bookedDates = [],
  onOpenChange
}) {
  const handleSelect = (range) => {
    if (!range) {
      setDate(undefined);
      return;
    }

    if (range.from && range.to) {
      const diffDays = differenceInDays(range.to, range.from) + 1;
      if (diffDays < 3) {
        // Enforce minimum 3 days if they try to select less
        setDate({
          from: range.from,
          to: addDays(range.from, 2)
        });
      } else {
        setDate(range);
      }
    } else {
      // It's a new start date, leave 'to' undefined so they can extend it
      setDate(range);
    }
  };

  const handleOpenChangeInternal = (open) => {
    // Solidify the 3-day block when popup closes if they didn't click an end date
    if (!open) {
      setDate(prev => {
        if (prev?.from && !prev?.to) {
          return {
            from: prev.from,
            to: addDays(prev.from, 2)
          };
        }
        return prev;
      });
    }
    if (onOpenChange) onOpenChange(open);
  };

  return (
    <Field className={cn("grid gap-2", className)}>
      <FieldLabel>{label}</FieldLabel>
      <Popover onOpenChange={handleOpenChangeInternal}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full h-14 rounded-2xl border-2 border-slate-100 text-black justify-start text-left font-bold transition-all px-6 hover:border-primary hover:bg-white",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-5 w-5 text-black" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(addDays(date.from, 2), "LLL dd, y")}
                </>
              )
            ) : (
              <span className="text-black">Pilih tanggal sewa</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-[2.5rem] overflow-hidden" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={[
              { before: new Date() },
              ...bookedDates
            ]}
            modifiers={{
              booked: bookedDates,
              autoMiddle: date?.from && !date?.to ? [addDays(date.from, 1)] : [],
              autoEnd: date?.from && !date?.to ? [addDays(date.from, 2)] : [],
            }}
            modifiersClassNames={{
              booked: "!bg-rose-50 !text-rose-500 font-bold line-through !opacity-100",
              autoMiddle: "bg-blue-50 text-blue-600 rounded-none",
              autoEnd: "bg-blue-600 text-white rounded-r-xl rounded-l-none"
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
