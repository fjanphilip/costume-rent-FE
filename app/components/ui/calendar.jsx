import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "~/lib/utils"
import { buttonVariants } from "~/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6 antialiased", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-y-6 sm:gap-x-10 sm:gap-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 relative items-center mb-4 px-10",
        caption_label: "text-sm font-black italic uppercase tracking-[0.2em] text-slate-800",
        nav: "flex items-center absolute w-full left-0 px-2 justify-between z-10",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-slate-50 hover:bg-primary/10 hover:text-primary p-0 rounded-xl transition-all border-none"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex justify-between mb-4",
        weekday: "text-slate-400 w-9 font-black text-[10px] uppercase text-center",
        week: "flex justify-between w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          "h-9 w-9 p-0 font-bold rounded-xl transition-all aria-selected:opacity-100 flex items-center justify-center text-sm disabled:opacity-30 disabled:line-through disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-900"
        ),
        range_start: "bg-blue-600 text-white rounded-l-xl rounded-r-none",
        range_end: "bg-blue-600 text-white rounded-r-xl rounded-l-none",
        range_middle: "bg-blue-50 text-blue-600 rounded-none",
        selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white shadow-xl shadow-blue-600/20",
        today: "text-blue-600 font-black scale-110 relative after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-blue-600 after:rounded-full",
        disabled: "text-slate-400 opacity-100 bg-slate-100/80 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
