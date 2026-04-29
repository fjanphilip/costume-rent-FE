import * as React from "react"
import { format } from "date-fns"
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
  return (
    <Field className={cn("grid gap-2", className)}>
      <FieldLabel>{label}</FieldLabel>
      <Popover onOpenChange={onOpenChange}>
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
                format(date.from, "LLL dd, y")
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
            onSelect={setDate}
            numberOfMonths={2}
            disabled={[
              { before: new Date() },
              ...bookedDates
            ]}
            modifiers={{
              booked: bookedDates
            }}
            modifiersClassNames={{
              booked: "!bg-rose-50 !text-rose-500 font-bold line-through !opacity-100"
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
