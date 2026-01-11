"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type PremiumImageUploadProps = {
  value: string | null | undefined;
  onChange: (imageKey: string | null) => void;
  /** Vehicle ID for the upload - uses a temp ID if not provided (for new vehicles) */
  vehicleId?: string;
  disabled?: boolean;
  className?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PremiumImageUpload({
  value,
  onChange,
  vehicleId,
  disabled,
  className,
}: PremiumImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get presigned URL for existing image
  const { data: downloadData } = api.files.getDownloadUrl.useQuery(
    { key: value! },
    {
      enabled: !!value && !value.startsWith("http"),
      staleTime: 50 * 60 * 1000,
    }
  );

  const getUploadUrl = api.files.getUploadUrl.useMutation();

  const currentImageUrl = value
    ? value.startsWith("http")
      ? value
      : downloadData?.downloadUrl
    : previewUrl;

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Please upload a JPEG, PNG, or WebP image";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setUploadProgress(10);

      // Get presigned URL - use vehicleId or generate a temp ID for new vehicles
      const entityId = vehicleId ?? `temp-${Date.now()}`;
      const { uploadUrl, key } = await getUploadUrl.mutateAsync({
        filename: file.name,
        contentType: file.type,
        category: "vehicles",
        entityId,
        size: file.size,
      });
      setUploadProgress(30);

      // Upload to R2
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setUploadProgress(90);

      // Set the key in form
      onChange(key);
      setUploadProgress(100);

      toast.success("Image uploaded successfully");

      // Clean up preview after a moment
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(null);
      }, 1000);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [disabled, isUploading]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
    // Reset input
    e.target.value = "";
  };

  const handleRemove = () => {
    onChange(null);
    setPreviewUrl(null);
  };

  const hasImage = !!currentImageUrl || !!value;

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <AnimatePresence mode="wait">
        {hasImage ? (
          // Image preview state
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group rounded-xl overflow-hidden border border-border/50"
          >
            <div className="aspect-video relative bg-muted">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt="Vehicle preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                </div>
              )}

              {/* Upload progress overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                  <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-white text-sm mt-2">
                    Uploading... {uploadProgress}%
                  </span>
                </div>
              )}

              {/* Success indicator */}
              {!isUploading && value && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-3 left-3"
                >
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/90 text-white text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    Uploaded
                  </div>
                </motion.div>
              )}

              {/* Hover overlay with actions */}
              {!isUploading && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-medium"
                  >
                    <Upload className="h-4 w-4" />
                    Replace
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRemove}
                    disabled={disabled}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // Drop zone state
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className={cn(
              "relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200",
              "aspect-video flex flex-col items-center justify-center gap-3",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
              disabled && "opacity-50 cursor-not-allowed",
              isUploading && "pointer-events-none"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            ) : (
              <>
                <motion.div
                  animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                  className={cn(
                    "flex items-center justify-center h-14 w-14 rounded-2xl",
                    "bg-gradient-to-br from-primary/10 to-secondary/10",
                    "border border-border/50"
                  )}
                >
                  <ImageIcon className="h-7 w-7 text-primary" />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG or WebP (max. 5MB)
                  </p>
                </div>
              </>
            )}

            {/* Drag highlight */}
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-xl bg-primary/5 border-2 border-primary pointer-events-none"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        Upload a photo of the vehicle. This will be displayed on the vehicle card.
      </p>
    </div>
  );
}
