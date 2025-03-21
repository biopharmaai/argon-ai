"use client";

import * as React from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronUp, ChevronDown, X } from "lucide-react";

/** Represents a single sort instruction, e.g. { field: "nctId", direction: "asc" } */
export interface SortToken {
  field: string;
  direction: "asc" | "desc";
}

/** Props for the guided sort bar. */
interface GuidedSortBarProps {
  /** The current list of sort tokens, in priority order (top = highest priority). */
  sortTokens: SortToken[];

  /** Callback when the user changes the sort tokens (by adding, removing, or reordering). */
  onSortTokensChange: (newTokens: SortToken[]) => void;

  /** List of possible fields the user can sort by. */
  sortableFields: string[];
}

/**
 * A single draggable item in the sort list.
 * Displays the field and direction, with a drag handle and remove button.
 */
function SortableSortItem({
  token,
  index,
  onRemove,
  onToggleDirection,
}: {
  token: SortToken;
  index: number;
  onRemove: () => void;
  onToggleDirection: () => void;
}) {
  // Use the field name as the unique ID for dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: token.field });

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
      className="flex items-center border border-gray-300 rounded px-2 py-1 bg-white"
    >
      {/* Drag handle */}
      <div {...listeners} className="mr-2 cursor-grab select-none">
        ☰
      </div>

      {/* Field & Direction (click to toggle asc/desc) */}
      <div
        className="flex-1 flex items-center select-none"
        onClick={onToggleDirection}
      >
        <span className="mr-1">{token.field}</span>
        {token.direction === "asc" ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>

      {/* Remove button */}
      <button onClick={onRemove} className="ml-2" title="Remove sort">
        <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
      </button>
    </div>
  );
}

/**
 * A guided approach to building a multi-field sort order:
 *  - user picks a field from a dropdown
 *  - user picks asc/desc
 *  - user adds the sort token to the list
 *  - the list is draggable (top = highest priority)
 *  - user can remove tokens individually or clear all
 */
export default function GuidedSortBar({
  sortTokens,
  onSortTokensChange,
  sortableFields,
}: GuidedSortBarProps) {
  const [selectedField, setSelectedField] = React.useState("");
  const [selectedDirection, setSelectedDirection] = React.useState<
    "asc" | "desc"
  >("asc");

  /** Add the new sort token (if valid) */
  const addSort = () => {
    if (!selectedField) return;
    const newToken: SortToken = {
      field: selectedField,
      direction: selectedDirection,
    };
    // Avoid duplicates (by field name)
    if (!sortTokens.some((t) => t.field === selectedField)) {
      onSortTokensChange([...sortTokens, newToken]);
    }
    setSelectedField("");
    setSelectedDirection("asc");
  };

  /** Remove a token by index */
  const removeSort = (index: number) => {
    const updated = sortTokens.filter((_, i) => i !== index);
    onSortTokensChange(updated);
  };

  /** Clear all tokens */
  const clearAll = () => {
    onSortTokensChange([]);
  };

  /** Reorder tokens after a drag event */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortTokens.findIndex((t) => t.field === active.id);
    const newIndex = sortTokens.findIndex((t) => t.field === over.id);
    const newTokens = arrayMove(sortTokens, oldIndex, newIndex);
    onSortTokensChange(newTokens);
  };

  /** Toggle direction when user clicks on a token */
  const toggleDirection = (field: string) => {
    const newTokens = sortTokens.map((token) =>
      token.field === field
        ? { ...token, direction: token.direction === "asc" ? "desc" : "asc" }
        : token,
    );
    onSortTokensChange(newTokens);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Section to pick a new field & direction */}
      <div className="flex items-center space-x-2">
        <select
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Select field...</option>
          {sortableFields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
        <select
          value={selectedDirection}
          onChange={(e) =>
            setSelectedDirection(e.target.value as "asc" | "desc")
          }
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="asc">asc</option>
          <option value="desc">desc</option>
        </select>
        <button
          onClick={addSort}
          disabled={!selectedField}
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Add Sort
        </button>
      </div>

      {/* Current list of sort tokens (draggable) */}
      {sortTokens.length > 0 && (
        <>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortTokens.map((token) => token.field)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col space-y-2">
                {sortTokens.map((token, index) => (
                  <SortableSortItem
                    key={token.field}
                    token={token}
                    index={index}
                    onRemove={() => removeSort(index)}
                    onToggleDirection={() => toggleDirection(token.field)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            onClick={clearAll}
            className="text-sm text-blue-600 underline self-start"
          >
            Clear All Sorts
          </button>
        </>
      )}
    </div>
  );
}
