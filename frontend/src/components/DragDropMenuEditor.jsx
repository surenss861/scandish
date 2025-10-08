import React, { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDropzone } from "react-dropzone";
import { Upload, GripVertical, X, Plus, Image, Loader2 } from "lucide-react";

import { PhotoUpgradePrompt, ItemLimitUpgradePrompt } from "./PlanUpgradePrompt";
import { StorageService } from "../services/storageService";
import { useAuth } from "../context/AuthContext";
import { usePlan } from "../context/PlanContext";

/* -------------------- Sortable Item -------------------- */
function SortableItem({ id, item, onRemove, showImages = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-3 p-4 rounded-lg border border-[#40434E]/40 bg-[#171613] ${isDragging ? "shadow-lg" : ""
        }`}
    >
      {/* Drag Handle */}
      <button
        className="mt-1 text-[#a7a7a7] hover:text-[#F3C77E] cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>

      {/* Item Image */}
      {showImages && (
        <div className="w-16 h-16 rounded-lg bg-[#0f0e0c] border border-[#40434E]/40 flex items-center justify-center shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Image size={24} className="text-[#a7a7a7]" />
          )}
        </div>
      )}

      {/* Item Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {item.emoji && <span className="text-lg">{item.emoji}</span>}
              <h3 className="font-medium text-white truncate">{item.name}</h3>
              {item.category && (
                <span className="text-[11px] px-2 py-1 rounded-full border border-[#40434E]/50 text-[#d6d6d6] shrink-0">
                  {item.category}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-[#a7a7a7] line-clamp-2 mb-1">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-medium">
              {item.price === "" || item.price === null || isNaN(item.price)
                ? "Market Price"
                : `$${Number(item.price).toFixed(2)}`}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="opacity-0 group-hover:opacity-100 text-[#ffb3b3] hover:text-white transition-opacity"
              title="Remove item"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Add Item Form -------------------- */
function AddItemForm({ onAdd, showImages = false, userId = "", menuId = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    emoji: "",
    image: null,
    imageUrl: null,
    imagePath: null,
  });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file && showImages) {
        try {
          setUploading(true);
          setError("");

          // Preview
          const previewUrl = StorageService.createPreviewUrl(file);
          setDraft((prev) => ({ ...prev, image: previewUrl }));

          // Upload
          const { url, path } = await StorageService.uploadPhoto(
            file,
            userId,
            menuId
          );
          setDraft((prev) => ({ ...prev, imageUrl: url, imagePath: path }));
        } catch (err) {
          setError(err.message || "Failed to upload image");
          setDraft((prev) => ({ ...prev, image: null }));
        } finally {
          setUploading(false);
        }
      }
    },
    [showImages, userId, menuId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    disabled: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return setError("Item name is required");
    if (draft.price !== "" && isNaN(Number(draft.price)))
      return setError("Price must be a number");

    const newItem = {
      id: Date.now().toString(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: draft.price === "" ? "" : Number(draft.price),
      category: draft.category.trim(),
      emoji: draft.emoji.trim(),
      image: draft.imageUrl,
      imagePath: draft.imagePath,
      sort_order: Date.now(),
    };

    onAdd(newItem);

    if (draft.image && draft.image.startsWith("blob:")) {
      StorageService.revokePreviewUrl(draft.image);
    }

    setDraft({
      name: "",
      description: "",
      price: "",
      category: "",
      emoji: "",
      image: null,
      imageUrl: null,
      imagePath: null,
    });
    setError("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 border-2 border-dashed border-[#40434E]/40 rounded-lg text-[#a7a7a7] hover:border-[#F3C77E] hover:text-[#F3C77E] flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Menu Item
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-lg border border-[#40434E]/40 bg-[#171613] space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-[#F3C77E]">Add New Item</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-[#a7a7a7] hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Image upload */}
      <PhotoUpgradePrompt>
        <div
          {...getRootProps()}
          className={`w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors relative ${isDragActive
            ? "border-[#F3C77E] bg-[#F3C77E]/10"
            : uploading
              ? "border-[#F3C77E]/50 bg-[#F3C77E]/5 cursor-not-allowed"
              : "border-[#40434E]/40 hover:border-[#F3C77E]"
            }`}
        >
          <input {...getInputProps()} disabled={uploading} />
          {uploading ? (
            <div className="text-center text-[#F3C77E]">
              <Loader2 size={24} className="mx-auto mb-2 animate-spin" />
              <p className="text-sm">Uploading...</p>
            </div>
          ) : draft.image ? (
            <div className="relative w-full h-full">
              <img
                src={draft.image}
                alt="Preview"
                className="h-full w-full object-cover rounded"
              />
            </div>
          ) : (
            <div className="text-center text-[#a7a7a7]">
              <Upload size={24} className="mx-auto mb-2" />
              <p className="text-sm">Drop or click to upload</p>
            </div>
          )}
        </div>
      </PhotoUpgradePrompt>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
          placeholder="Item name *"
          required
          className="w-full px-3 py-2 bg-[#0f0e0c] border border-[#40434E]/40 rounded-lg text-white"
        />
        <input
          type="text"
          value={draft.price}
          onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))}
          placeholder="Price (e.g. 12.99)"
          className="w-full px-3 py-2 bg-[#0f0e0c] border border-[#40434E]/40 rounded-lg text-white"
        />
      </div>

      <textarea
        value={draft.description}
        onChange={(e) =>
          setDraft((p) => ({ ...p, description: e.target.value }))
        }
        placeholder="Description"
        className="w-full px-3 py-2 bg-[#0f0e0c] border border-[#40434E]/40 rounded-lg text-white"
      />

      {error && <p className="text-sm text-[#ffb3b3]">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-[#23a34b] text-white rounded-lg"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 border border-[#40434E]/40 rounded-lg text-[#a7a7a7]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* -------------------- Main Editor -------------------- */
export default function DragDropMenuEditor({
  menuItems,
  setMenuItems,
  onAdded,
  showImages = true,
  userId = "",
  menuId = "",
}) {
  const { user } = useAuth();
  const { canAddItem, getItemLimit, isFree } = usePlan();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setMenuItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (item?.imagePath) {
      try {
        await StorageService.deletePhoto(item.imagePath);
      } catch (err) {
        console.error("Failed to delete photo", err);
      }
    }
    setMenuItems((items) => items.filter((i) => i.id !== itemId));
  };

  const handleAddItem = (item) => {
    if (!canAddItem(menuItems.length)) {
      // Show upgrade prompt instead of adding item
      return;
    }
    setMenuItems((items) => [...items, item]);
    onAdded?.();
  };

  const itemsWithIds = menuItems.map((item, idx) => ({
    ...item,
    id: item.id || `item-${idx}`,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[#F3C77E]">
        Menu Items ({itemsWithIds.length})
      </h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={itemsWithIds.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {itemsWithIds.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                item={item}
                onRemove={handleRemoveItem}
                showImages={showImages}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ItemLimitUpgradePrompt currentCount={menuItems.length} maxAllowed={getItemLimit()}>
        <AddItemForm
          onAdd={handleAddItem}
          showImages={showImages}
          userId={userId}
          menuId={menuId}
        />
      </ItemLimitUpgradePrompt>

      {itemsWithIds.length === 0 && (
        <div className="text-center py-12 text-[#a7a7a7]">
          <div className="text-4xl mb-4">🍽️</div>
          <p className="text-lg font-medium mb-2">No items yet</p>
          <p className="text-sm">Add your first item to get started</p>
        </div>
      )}
    </div>
  );
}
