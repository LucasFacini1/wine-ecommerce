import * as React from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "w-full bg-ink-soft border border-line px-3.5 h-11 font-sans text-sm text-bone " +
  "placeholder:text-bone-faint transition-colors focus:border-brass focus:outline-none";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, hint, error, id, className, containerClassName, ...props }, ref) => {
    const autoId = React.useId();
    const fieldId = id ?? autoId;
    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        <label htmlFor={fieldId} className="label">
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          className={cn(inputClass, error && "border-danger", className)}
          aria-invalid={!!error}
          {...props}
        />
        {error ? (
          <span className="font-sans text-xs text-danger">{error}</span>
        ) : hint ? (
          <span className="font-sans text-xs text-bone-faint">{hint}</span>
        ) : null}
      </div>
    );
  },
);
Field.displayName = "Field";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  containerClassName?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, hint, id, className, containerClassName, ...props }, ref) => {
    const autoId = React.useId();
    const fieldId = id ?? autoId;
    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        <label htmlFor={fieldId} className="label">
          {label}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          className={cn(
            inputClass,
            "h-auto min-h-[7rem] py-3 leading-relaxed",
            className,
          )}
          {...props}
        />
        {hint && (
          <span className="font-sans text-xs text-bone-faint">{hint}</span>
        )}
      </div>
    );
  },
);
TextArea.displayName = "TextArea";
