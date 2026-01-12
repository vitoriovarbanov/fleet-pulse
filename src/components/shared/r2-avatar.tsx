'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';

type R2AvatarProps = {
    /** R2 storage key or full URL */
    avatarKey: string | null | undefined;
    /** Fallback content (usually initials) */
    fallback: string;
    /** Alt text for the image */
    alt: string;
    /** Size class (e.g., "h-12 w-12") */
    className?: string;
    /** Additional classes for the fallback div */
    fallbackClassName?: string;
};

/**
 * Avatar component that handles R2 storage keys
 * - If avatarKey looks like a URL (starts with http), uses it directly
 * - If avatarKey is an R2 key, fetches a presigned download URL
 * - Shows fallback initials while loading or on error
 */
export function R2Avatar({
    avatarKey,
    fallback,
    alt,
    className = 'h-12 w-12',
    fallbackClassName,
}: R2AvatarProps) {
    const [imageError, setImageError] = useState(false);

    // Reset error state when avatarKey changes
    useEffect(() => {
        setImageError(false);
    }, [avatarKey]);

    // Check if avatarKey is a direct URL (starts with http)
    const isDirectUrl = avatarKey?.startsWith('http');

    // Check if avatarKey is a valid R2 key
    // Valid R2 keys look like: "orgId/category/entityId/filename.ext"
    // Must have at least one "/" and be longer than a typical org ID
    const isR2Key = avatarKey &&
        !isDirectUrl &&
        avatarKey.includes('/') &&
        avatarKey.length > 20;

    // Fetch presigned URL for R2 keys
    // Cache for 50 minutes (presigned URLs expire in 1 hour, Redis caches for 55 min)
    const { data: downloadData, isLoading } = api.files.getDownloadUrl.useQuery(
        { key: avatarKey! },
        {
            enabled: !!isR2Key && !imageError,
            staleTime: 50 * 60 * 1000, // 50 minutes
            gcTime: 55 * 60 * 1000, // 55 minutes
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
        }
    );

    // Determine the final image URL
    // Only use avatarKey directly if it's a valid URL, otherwise use presigned URL from R2
    const imageUrl = isDirectUrl ? avatarKey : (isR2Key ? downloadData?.downloadUrl : null);

    // Show fallback if no avatar, loading, or error
    if (!imageUrl || imageError || (isR2Key && isLoading && !downloadData)) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold',
                    className,
                    fallbackClassName
                )}
            >
                {fallback}
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={cn('rounded-xl object-cover', className)}
            onError={() => setImageError(true)}
        />
    );
}
