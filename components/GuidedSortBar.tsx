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
  onSortTokensChange: (newTokens: SortToken[]) => void;
  sortableFields: string[];
  queryString: string;
  setQueryString: (qs: string) => void;
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
  queryString,
  setQueryString,
}: GuidedSortBarProps) {
  const [selectedField, setSelectedField] = React.useState("");
  const [selectedDirection, setSelectedDirection] = React.useState<
    "asc" | "desc"
  >("asc");
  const hasMountedRef = React.useRef(false);

  const updateTokensAndQueryString = (newTokens: SortToken[]) => {
    const parsed = qs.parse(queryString);
    if (newTokens.length > 0) {
      parsed.sort = newTokens.map((t) => `${t.field}:${t.direction}`).join(",");
    } else {
      delete parsed.sort;
    }
    console.log("GuidedSortBar - Updating sort tokens:", parsed);
    setQueryString(qs.stringify(parsed));
    onSortTokensChange(newTokens);
  };

  const addSort = () => {
    if (!selectedField) return;
    if (!sortTokens.some((t) => t.field === selectedField)) {
      updateTokensAndQueryString([
        ...sortTokens,
        { field: selectedField, direction: selectedDirection },
      ]);
    }
    setSelectedField("");
    setSelectedDirection("asc");
  };

  const removeSort = (field: string) => {
    const updated = sortTokens.filter((t) => t.field !== field);
    console.log("updated", updated);
    updateTokensAndQueryString(updated);
  };

  const toggleDirection = (field: string) => {
    const token = sortTokens.find((t) => t.field === field);
    if (!token) return;
    if (token.direction === "asc") {
      updateTokensAndQueryString(
        sortTokens.map((t) =>
          t.field === field ? { ...t, direction: "desc" } : t,
        ),
      );
    } else {
      removeSort(field);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortTokens.findIndex((t) => t.field === active.id);
    const newIndex = sortTokens.findIndex((t) => t.field === over.id);
    const newTokens = arrayMove(sortTokens, oldIndex, newIndex);
    updateTokensAndQueryString(newTokens);
  };

  React.useEffect(() => {
    const parsed = qs.parse(queryString);
    const sortParam = (parsed.sort as string) || "";
    const parsedTokens: SortToken[] = sortParam
      .split(",")
      .filter((token) => token.trim() !== "")
      .map((tokenStr) => {
        const [field, direction] = tokenStr.split(":");
        return { field, direction: (direction as "asc" | "desc") || "asc" };
      });

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      onSortTokensChange(parsedTokens); // Only apply once on first load
      return;
    }

    if (JSON.stringify(parsedTokens) !== JSON.stringify(sortTokens)) {
      onSortTokensChange(parsedTokens);
    }
  }, [queryString]);

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

      {sortTokens.length > 0 && (
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
            onClick={() => updateTokensAndQueryString([])}
            className="text-sm text-blue-600 underline self-start"
          >
            Clear All Sorts
          </button>
        </>
      )}
    </div>
  );
}
