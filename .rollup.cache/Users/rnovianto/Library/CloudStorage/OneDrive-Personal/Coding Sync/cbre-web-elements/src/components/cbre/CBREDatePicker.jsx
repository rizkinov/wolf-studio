"use client";
import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
// Helper function to format dates since we can't use format from date-fns directly
const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};
/**
 * CBREDatePicker component that wraps the shadcn/ui Calendar and Popover components.
 * Provides a date picker with CBRE styling and supports label, description, and error handling.
 */
export function CBREDatePicker({ date, setDate, label, description, placeholder = "Select a date", error, disabled = false, className, disabledDates, }) {
    // Generate a unique ID for accessibility
    const id = React.useId();
    const datepickerId = `cbre-datepicker-${id}`;
    const descriptionId = `${datepickerId}-description`;
    const errorId = `${datepickerId}-error`;
    return (<div className={cn("space-y-2", className)}>
      {label && (<Label htmlFor={datepickerId} className="text-dark-grey font-calibre">
          {label}
        </Label>)}
      {description && !error && (<p id={descriptionId} className="text-sm text-muted-foreground font-calibre">
          {description}
        </p>)}

      <Popover>
        <PopoverTrigger asChild>
          <Button id={datepickerId} variant="outline" className={cn("w-full justify-start text-left font-normal border-light-grey", "hover:border-cbre-green focus-visible:border-cbre-green focus-visible:ring-accent-light/30", !date && "text-muted-foreground", error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20", disabled && "opacity-50 cursor-not-allowed")} disabled={disabled} aria-describedby={description || error
            ? `${description ? descriptionId : ""} ${error ? errorId : ""}`
            : undefined} aria-invalid={error ? "true" : undefined}>
            <CalendarIcon className="mr-2 h-4 w-4"/>
            {date ? formatDate(date) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 border-light-grey" align="start">
          <Calendar mode="single" selected={date} onSelect={setDate} disabled={disabledDates} initialFocus/>
        </PopoverContent>
      </Popover>

      {error && (<p id={errorId} className="text-sm text-destructive font-calibre">
          {error}
        </p>)}
    </div>);
}
/**
 * CBREDateRangePicker component that wraps the shadcn/ui Calendar and Popover components.
 * Provides a date range picker with CBRE styling and supports label, description, and error handling.
 */
export function CBREDateRangePicker({ dateRange, setDateRange, label, description, placeholder = "Select a date range", error, disabled = false, className, numberOfMonths = 2, disabledDates, }) {
    // Generate a unique ID for accessibility
    const id = React.useId();
    const datepickerId = `cbre-daterangepicker-${id}`;
    const descriptionId = `${datepickerId}-description`;
    const errorId = `${datepickerId}-error`;
    // Use a single month on small screens, two months on larger screens
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        // Initial check
        checkScreenSize();
        // Add event listener for resize
        window.addEventListener('resize', checkScreenSize);
        // Clean up
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    return (<div className={cn("space-y-2", className)}>
      {label && (<Label htmlFor={datepickerId} className="text-dark-grey font-calibre">
          {label}
        </Label>)}
      {description && !error && (<p id={descriptionId} className="text-sm text-muted-foreground font-calibre">
          {description}
        </p>)}

      <Popover>
        <PopoverTrigger asChild>
          <Button id={datepickerId} variant="outline" className={cn("w-full justify-start text-left font-normal border-light-grey", "hover:border-cbre-green focus-visible:border-cbre-green focus-visible:ring-accent-light/30", !(dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) && "text-muted-foreground", error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20", disabled && "opacity-50 cursor-not-allowed")} disabled={disabled} aria-describedby={description || error
            ? `${description ? descriptionId : ""} ${error ? errorId : ""}`
            : undefined} aria-invalid={error ? "true" : undefined}>
            <CalendarIcon className="mr-2 h-4 w-4"/>
            {(dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) ? (dateRange.to ? (<>
                  {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                </>) : (formatDate(dateRange.from))) : (placeholder)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 border-light-grey sm:w-auto md:w-[680px] lg:w-[760px]" align="start">
          <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={isMobile ? 1 : 2} disabled={disabledDates} initialFocus className="p-3"/>
        </PopoverContent>
      </Popover>

      {error && (<p id={errorId} className="text-sm text-destructive font-calibre">
          {error}
        </p>)}
    </div>);
}
//# sourceMappingURL=CBREDatePicker.jsx.map