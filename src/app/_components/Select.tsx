import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

type Options = {
  label: string;
  value: string;
}[];

const Select = memo(
  (props: {
    options?: Options;
    onChange?: (value?: string) => void;
    value?: string;
    loading?: boolean;
  }) => {
    const [open, setOpen] = useState(false);
    const [currentValue, setCurrentValue] = useState("");

    const value = props.value || currentValue;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? props.options?.find((framework) => framework.value === value)
                  ?.label
              : "Select option..."}
            {props.loading && (
              <LoaderCircle className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
            )}
            {!props.loading && (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search option..." />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {props.options?.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    onSelect={(currentValue) => {
                      if (props.onChange) {
                        props.onChange?.(currentValue);
                      } else {
                        setCurrentValue(
                          currentValue === value ? "" : currentValue,
                        );
                      }
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
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
  },
);

export default Select;
