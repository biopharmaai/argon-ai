"use client";

import React from "react";
import { useEffect } from "react";
import qs from "qs";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { columnsDefinitions } from "@/lib/constants";
import { ColumnSelectorConfig } from "@/types/columns";
import { defaultFields } from "@/lib/constants";

interface ColumnSelectorProps {
  columns: ColumnSelectorConfig[]; // enabled & ordered
  onColumnsChange: (columns: ColumnSelectorConfig[]) => void;
  queryString: string;
}

function SortableColumnItem({
  column,
  onToggle,
}: {
  column: ColumnSelectorConfig;
  onToggle: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center rounded border border-gray-300 bg-white px-2 py-1"
    >
      <div {...listeners} className="mr-2 cursor-grab select-none">
        ☰
      </div>
      <input
        type="checkbox"
        checked={column.enabled}
        onChange={onToggle}
        className="mr-2"
      />
      <span className="flex-1">{column.label}</span>
      <button className="ml-2" onClick={onToggle} title="Toggle column">
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
}

export default function ColumnSelector({
  queryString,
  columns,
  onColumnsChange,
}: ColumnSelectorProps) {
  const [selectedField, setSelectedField] = React.useState("");
  const [hasNoFields, setHasNoFields] = React.useState(false);
  const initializedRef = React.useRef(false); // ✅ moved here

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const query = qs.parse(queryString);
    let fieldIds: string[] = [];

    if (typeof query.fields === "string") {
      fieldIds = query.fields.split(",").filter(Boolean);
      setHasNoFields(fieldIds.length === 0);
    } else {
      setHasNoFields(true);
    }

    const updatedColumns = fieldIds
      .map((id) => {
        const match = columns.find((col) => col.id === id);
        return match ? { ...match, enabled: true } : null;
      })
      .filter(Boolean) as ColumnSelectorConfig[];

    const disabledColumns = columns
      .filter((col) => !fieldIds.includes(col.id))
      .map((col) => ({ ...col, enabled: false }));

    const next = [...updatedColumns, ...disabledColumns];

    const isEqual = next.every((col, i) => {
      return col.id === columns[i]?.id && col.enabled === columns[i]?.enabled;
    });

    if (!isEqual) {
      onColumnsChange(next);
    }
  }, [queryString, columns, onColumnsChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);
      const newColumns = arrayMove(columns, oldIndex, newIndex);
      onColumnsChange(newColumns);
    }
  };

  const toggleColumn = (id: string) => {
    const newColumns = columns.map((col) =>
      col.id === id ? { ...col, enabled: !col.enabled } : col,
    );
    onColumnsChange(newColumns);
  };

  return (
    <div className="w-full space-y-4 rounded-md border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Selected Fields</h2>

      {hasNoFields && (
        <Button
          variant="outline"
          onClick={() => {
            const updated = columnsDefinitions.map((col) =>
              defaultFields.includes(col.id)
                ? { ...col, enabled: true }
                : { ...col, enabled: false },
            );
            onColumnsChange(updated);
            setHasNoFields(false);
          }}
        >
          Use Default Fields
        </Button>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={selectedField}
          onValueChange={(id) => {
            const col = columnsDefinitions.find((c) => c.id === id);
            if (col) {
              onColumnsChange([...columns, { ...col, enabled: true }]);
            }
            setSelectedField("");
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="+ Add Field" />
          </SelectTrigger>
          <SelectContent>
            {columnsDefinitions
              .filter(
                (col) => !columns.some((c) => c.id === col.id && c.enabled),
              )
              .map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {col.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={columns.filter((c) => c.enabled).map((col) => col.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col space-y-2">
            {columns
              .filter((col) => col.enabled)
              .map((col) => (
                <SortableColumnItem
                  key={col.id}
                  column={col}
                  onToggle={() => toggleColumn(col.id)}
                />
              ))}
          </div>
        </SortableContext>
      </DndContext>

      {columns.some((c) => c.enabled) && (
        <Button
          variant="link"
          onClick={() => {
            const reset = columns.map((c) => ({ ...c, enabled: false }));
            onColumnsChange(reset);
            setHasNoFields(true);
          }}
          className="text-sm text-blue-600"
        >
          Clear All Fields
        </Button>
      )}
    </div>
  );
}
