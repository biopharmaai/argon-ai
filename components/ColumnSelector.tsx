"use client";

import React from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

export interface ColumnConfig {
  id: string;
  label: string;
  enabled: boolean;
}

interface ColumnSelectorProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

function SortableColumnItem({
  column,
  onToggle,
}: {
  column: ColumnConfig;
  onToggle: () => void;
}) {
  // Use the column id as the unique ID.
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
      {/* Optional: A remove icon could be placed here if needed */}
      <button className="ml-2" onClick={onToggle} title="Toggle column">
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
}

export default function ColumnSelector({
  columns,
  onColumnsChange,
}: ColumnSelectorProps) {
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
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={columns.map((col) => col.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col space-y-2">
          {columns.map((col) => (
            <SortableColumnItem
              key={col.id}
              column={col}
              onToggle={() => toggleColumn(col.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
