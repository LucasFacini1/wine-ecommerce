import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, id, className, containerClassName, ...props }, ref) => {
    const autoId = React.useId();
    const fieldId = id ?? autoId;
    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label htmlFor={fieldId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            className={cn(
              "w-full appearance-none bg-ink-soft border border-line pl-3.5 pr-10 h-11",
              "font-sans text-sm text-bone transition-colors focus:border-brass focus:outline-none",
              className,
            )}
            {...props}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value} className="bg-ink-soft">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            strokeWidth={1.5}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-bone-faint"
          />
        </div>
      </div>
    );
  },
);
Select.displayName = "Select";
