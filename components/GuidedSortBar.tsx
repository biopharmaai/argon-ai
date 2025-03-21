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
import qs from "qs";

export interface SortToken {
  field: string;
  direction: "asc" | "desc";
}

interface GuidedSortBarProps {
  sortTokens: SortToken[];
  onSortTokensChange: (newTokens: SortToken[]) => void; // Fixed: changed to SortToken[]
  sortableFields: string[];
}

function SortableSortItem({
  token,
  onRemove,
  onToggleDirection,
}: {
  token: SortToken;
  onRemove: () => void;
  onToggleDirection: () => void;
}) {
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
      <div {...listeners} className="mr-2 cursor-grab select-none">
        ☰
      </div>
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
      <button onClick={onRemove} className="ml-2" title="Remove sort">
        <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
      </button>
    </div>
  );
}

export default function GuidedSortBar({
  sortTokens,
  onSortTokensChange,
  sortableFields,
}: GuidedSortBarProps) {
  const [selectedField, setSelectedField] = React.useState("");
  const [selectedDirection, setSelectedDirection] = React.useState<
    "asc" | "desc"
  >("asc");

  const addSort = () => {
    if (!selectedField) return;
    if (!sortTokens.some((token) => token.field === selectedField)) {
      onSortTokensChange([
        ...sortTokens,
        { field: selectedField, direction: selectedDirection },
      ]);
    }
    setSelectedField("");
    setSelectedDirection("asc"); // Reset direction after adding
  };

  const removeSort = (field: string) => {
    const updated = sortTokens.filter((t) => t.field !== field);
    onSortTokensChange(updated);
  };

  const toggleDirection = (field: string) => {
    const updatedTokens = sortTokens.map((token) => {
      if (token.field === field) {
        return {
          ...token,
          direction: token.direction === "asc" ? "desc" : "asc",
        };
      }
      return token;
    });
    onSortTokensChange(updatedTokens);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortTokens.findIndex((t) => t.field === active.id);
    const newIndex = sortTokens.findIndex((t) => t.field === over.id);
    const newTokens = arrayMove(sortTokens, oldIndex, newIndex);
    onSortTokensChange(newTokens);
  };

  const clearAllSorts = () => {
    onSortTokensChange([]); // Fixed: passing empty array instead of undefined
  };

  return (
    <div className="flex flex-col space-y-4">
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

        {selectedField && (
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
        )}

        <button
          onClick={addSort}
          disabled={!selectedField}
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Add Sort
        </button>
      </div>

      {Array.isArray(sortTokens) && sortTokens.length > 0 && (
        <>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortTokens.map((t) => t.field)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col space-y-2">
                {sortTokens.map((token) => (
                  <SortableSortItem
                    key={token.field}
                    token={token}
                    onRemove={() => removeSort(token.field)}
                    onToggleDirection={() => toggleDirection(token.field)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <button
            onClick={clearAllSorts}
            className="text-sm text-blue-600 underline self-start"
          >
            Clear All Sorts
          </button>
        </>
      )}
    </div>
  );
}
