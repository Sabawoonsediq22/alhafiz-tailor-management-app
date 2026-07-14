"use client"

import * as React from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface CalendarProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (date: Date) => void
  disabled?: (date: Date) => boolean
  className?: string
}

const WEEKDAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]

export function Calendar({
  className,
  selected,
  onSelect,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  disabled,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState(
    defaultMonth ?? selected ?? new Date()
  )
  const month = monthProp ?? internalMonth
  const setMonth = (date: Date) => {
    setInternalMonth(date)
    onMonthChange?.(date)
  }

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 6 })
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 6 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setMonth(subMonths(month, 1))}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium capitalize">
          {format(month, "MMMM yyyy")}
        </div>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setMonth(addMonths(month, 1))}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-7 w-7"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const outside = !isSameMonth(day, month)
          const isSelected = selected ? isSameDay(day, selected) : false
          const isDisabled = disabled?.(day) ?? false
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect?.(day)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                outside && "text-muted-foreground/40",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                !isSelected &&
                  !isDisabled &&
                  "hover:bg-accent hover:text-accent-foreground",
                isToday(day) &&
                  !isSelected &&
                  "border border-primary/50 font-semibold text-primary",
                isDisabled && "pointer-events-none opacity-40"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}
