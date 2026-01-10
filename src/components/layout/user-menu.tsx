"use client";

import { useState, useRef } from "react";
import { useClerk } from "@clerk/nextjs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthSync } from "@/providers/auth-sync-provider";
import { api } from "@/trpc/react";
import { LogOut, User, Upload, Loader2, Camera } from "lucide-react";

export function UserMenu() {
    const { signOut } = useClerk();
    const { user, isLoading: isUserLoading } = useAuthSync();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const utils = api.useUtils();

    const { mutateAsync: getUploadUrl } = api.files.getUploadUrl.useMutation();
    const { mutateAsync: confirmAvatarUpload } = api.files.confirmAvatarUpload.useMutation();
    const { data: storageConfig } = api.files.getConfig.useQuery();

    // Get avatar URL - either from R2 or Clerk
    const { data: avatarData } = api.files.getDownloadUrl.useQuery(
        { key: user?.avatarUrl ?? "" },
        {
            enabled: !!user?.avatarUrl && user.avatarUrl.includes("/avatars/"),
            staleTime: 55 * 60 * 1000, // 55 minutes (URL valid for 1 hour)
        }
    );

    const getAvatarUrl = () => {
        if (!user?.avatarUrl) return undefined;
        // If it's an R2 key (contains /avatars/), use the signed URL
        if (user.avatarUrl.includes("/avatars/") && avatarData?.downloadUrl) {
            return avatarData.downloadUrl;
        }
        // Otherwise it might be a Clerk URL or external URL
        if (user.avatarUrl.startsWith("http")) {
            return user.avatarUrl;
        }
        return undefined;
    };

    const getInitials = () => {
        if (!user) return "?";
        const first = user.firstName?.charAt(0) ?? "";
        const last = user.lastName?.charAt(0) ?? "";
        return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase();
    };

    const handleSignOut = async () => {
        // CRITICAL: Clear all cached data before signing out
        // This prevents the next user from seeing stale data
        await utils.invalidate();

        // Use Clerk's built-in redirect to avoid flash of landing page
        await signOut({ redirectUrl: "/sign-in" });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadError(null);
        setIsUploading(true);

        try {
            // Validate file on client side
            const limits = storageConfig?.limits.avatars;
            if (limits) {
                if (!limits.allowedTypes.includes(file.type)) {
                    throw new Error(`Invalid file type. Allowed: ${limits.allowedTypes.join(", ")}`);
                }
                if (file.size > limits.maxSize) {
                    throw new Error(`File too large. Maximum size: ${limits.maxSize / 1024 / 1024} MB`);
                }
            }

            // Get presigned upload URL
            const { uploadUrl, key } = await getUploadUrl({
                category: "avatars",
                entityId: user.id,
                filename: file.name,
                contentType: file.type,
                size: file.size,
            });

            // Upload directly to R2
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload file");
            }

            // Confirm upload and update database
            await confirmAvatarUpload({ key });

            // Refresh user data
            await utils.auth.me.invalidate();

            setIsProfileOpen(false);
        } catch (error) {
            console.error("Upload error:", error);
            setUploadError(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (isUserLoading || !user) {
        return (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        );
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full cursor-pointer">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={getAvatarUrl()} alt={user.firstName ?? "User"} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground capitalize">
                                {user.role.toLowerCase().replace("_", " ")}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Profile</DialogTitle>
                        <DialogDescription>
                            Manage your profile settings
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="relative group">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={getAvatarUrl()} alt={user.firstName ?? "User"} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>
                            {storageConfig?.configured && (
                                <button
                                    onClick={handleAvatarClick}
                                    disabled={isUploading}
                                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                    ) : (
                                        <Camera className="h-6 w-6 text-white" />
                                    )}
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {storageConfig?.configured && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAvatarClick}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Change photo
                                    </>
                                )}
                            </Button>
                        )}

                        {!storageConfig?.configured && (
                            <p className="text-xs text-muted-foreground">
                                File storage not configured
                            </p>
                        )}

                        {uploadError && (
                            <p className="text-sm text-destructive">{uploadError}</p>
                        )}

                        <div className="w-full space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name</span>
                                <span>{user.firstName} {user.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email</span>
                                <span>{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Role</span>
                                <span className="capitalize">{user.role.toLowerCase().replace("_", " ")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Organization</span>
                                <span>{user.organization.name}</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
