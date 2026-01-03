"use client";
import * as React from "react";
import { PiPlus } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface MultiSelectComboboxProps {
  items: LabelItem[];
  value?: LabelItem[];
  onValueChange?: (value: LabelItem[]) => void;
  onCreateTag?: (value: string) => void;
}

export default function ComboboxCreatable({
  items,
  value: controlledValue,
  onValueChange,
  onCreateTag,
}: MultiSelectComboboxProps) {
  const id = React.useId();
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const comboboxInputRef = React.useRef<HTMLInputElement | null>(null);

  const selected = controlledValue ?? [];
  const setSelected = (
    updater: LabelItem[] | ((prev: LabelItem[]) => LabelItem[]),
  ) => {
    const newValue =
      typeof updater === "function" ? updater(selected) : updater;
    onValueChange?.(newValue);
  };

  function handleCreate(value: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }
    const normalized = trimmedValue.toLocaleLowerCase();
    const existing = items.find(
      (l) => l.value.trim().toLocaleLowerCase() === normalized,
    );
    if (existing) {
      setSelected((prev) =>
        prev.some((i) => i.id === existing.id) ? prev : [...prev, existing],
      );
      setQuery("");
      return;
    }

    onCreateTag?.(trimmedValue);
    setQuery("");
  }
  const trimmed = query.trim();
  const lowered = trimmed.toLocaleLowerCase();
  const exactExists = items.some(
    (l) => l.value.trim().toLocaleLowerCase() === lowered,
  );
  const itemsForView: Array<LabelItem> =
    trimmed !== "" && !exactExists
      ? [
          ...items,
          {
            creatable: trimmed,
            id: `create:${lowered}`,
            value: `Create "${trimmed}"`,
          },
        ]
      : items;
  return (
    <Combobox
      items={itemsForView}
      multiple
      onValueChange={(items) => {
        const selectedItems = items as LabelItem[];
        const last = selectedItems[selectedItems.length - 1];
        if (last?.creatable) {
          handleCreate(last.creatable);
          return;
        }
        const clean = selectedItems.filter((i) => !i.creatable);
        setSelected(clean);
        setQuery("");
      }}
      value={selected}
      inputValue={query}
      onInputValueChange={setQuery}
      onOpenChange={(_open, details) => {
        if ("key" in details.event && details.event.key === "Enter") {
          details.event.preventDefault();
          if (trimmed === "") {
            return;
          }
          const existing = items.find(
            (l) => l.value.trim().toLocaleLowerCase() === lowered,
          );
          if (existing) {
            setSelected((prev) =>
              prev.some((i) => i.id === existing.id)
                ? prev
                : [...prev, existing],
            );
            setQuery("");
            return;
          }
          handleCreate(trimmed);
        }
      }}
    >
      <div className=" w-full flex flex-col gap-1">
        <ComboboxChips className="w-full" ref={containerRef}>
          <ComboboxValue>
            {(value: LabelItem[]) => (
              <React.Fragment>
                {value.map((label) => (
                  <ComboboxChip key={label.id} aria-label={label.value}>
                    {label.value}
                    <ComboboxChipRemove />
                  </ComboboxChip>
                ))}
                <ComboboxInput
                  ref={comboboxInputRef}
                  id={id}
                  placeholder={value.length > 0 ? "" : "e.g. cat, moon, animal"}
                />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
      </div>
      <ComboboxContent anchor={containerRef}>
        <ComboboxEmpty>
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No labels found.
            </p>

            <Button
              size="sm"
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();

                handleCreate(query);
              }}
              className="gap-2"
            >
              <PiPlus />
              {query.length > 0
                ? `Create &quot;${query.trim()}&quot;`
                : "type to create a tag"}
            </Button>
          </div>
        </ComboboxEmpty>
        <ComboboxList>
          {(item: LabelItem) =>
            item.creatable ? (
              <ComboboxItem key={item.id} value={item}>
                <span className="col-start-1">
                  <PiPlus />
                </span>
                <div className="col-start-2">
                  Create &quot;{item.creatable}&quot;
                </div>
              </ComboboxItem>
            ) : (
              <ComboboxItem key={item.id} value={item}>
                <ComboboxItemIndicator />
                <div className="col-start-2">{item.value}</div>
              </ComboboxItem>
            )
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
export interface LabelItem {
  creatable?: string;
  id: string;
  value: string;
}

export { ComboboxCreatable as MultiSelectCombobox };
export type { MultiSelectComboboxProps };
