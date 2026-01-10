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

    // Determine if we need to fetch a presigned URL
    const isR2Key = avatarKey && !avatarKey.startsWith('http');

    // Fetch presigned URL for R2 keys
    const { data: downloadData, isLoading } = api.files.getDownloadUrl.useQuery(
        { key: avatarKey! },
        {
            enabled: !!isR2Key && !imageError,
            staleTime: 500 * 60 * 1000,
            gcTime: 55 * 60 * 1000,
            retry: 1,
        }
    );

    // Determine the final image URL
    const imageUrl = isR2Key ? downloadData?.downloadUrl : avatarKey;

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
