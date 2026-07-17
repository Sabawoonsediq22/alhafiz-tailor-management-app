import * as React from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface EditableComboboxOption {
  label: string;
}

interface EditableComboboxProps extends Omit<
  React.ComponentProps<"input">,
  "size"
> {
  options: EditableComboboxOption[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg";
}

function EditableCombobox({
  options,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  placeholder = "Type or select...",
  disabled = false,
  className,
  size = "default",
  name,
  id,
  "aria-invalid": ariaInvalid,
  onBlur,
  ...rest
}: EditableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange],
  );

  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      handleChange(selectedValue);
      setOpen(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [handleChange],
  );

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }, []);

  const inputId = id || name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div
          className={cn(
            "group relative flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none",
            "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            ariaInvalid &&
              "border-destructive ring-3 ring-destructive/20 focus-within:border-destructive focus-within:ring-destructive/20",
            size === "sm" && "h-8 text-sm",
            size === "lg" && "h-10",
            className,
          )}
          aria-invalid={ariaInvalid}
        >
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? `${inputId}-listbox` : undefined}
            aria-autocomplete="list"
            aria-invalid={ariaInvalid}
            name={name}
            id={inputId}
            className={cn(
              "h-full w-full min-w-0 flex-1 bg-transparent pe-9 ps-2.5 text-base outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              size === "sm" && "ps-2 text-sm",
              size === "lg" && "ps-3 text-base",
            )}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            {...rest}
          />
          <span className="absolute inset-y-0 flex items-center justify-center inset-e-0 text-muted-foreground border-l px-2 hover:bg-blue-100 cursor-pointer">
            <ChevronDownIcon
              className={cn(
                "size-4 shrink-0 opacity-50 transition-transform duration-200",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--anchor-width) p-0"
        align="start"
        sideOffset={4}
      >
        <Command
          value={currentValue as string}
          filter={(value, search) => {
            const option = options.find((o) => o.label === String(value));
            if (!option) return 0;
            return option.label.toLowerCase().includes(search.toLowerCase())
              ? 1
              : 0;
          }}
        >
          <CommandList id={`${inputId}-listbox`} role="listbox">
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.label}
                  value={option.label}
                  onSelect={() => handleSelect(option.label)}
                >
                  <CheckIcon
                    className={cn(
                      "size-4 shrink-0",
                      currentValue === option.label
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export {
  EditableCombobox,
  type EditableComboboxOption,
  type EditableComboboxProps,
};
