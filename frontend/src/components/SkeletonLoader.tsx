/**
 * SkeletonLoader Component.
 * Plays a pulsing animation while the AI is busy processing the video.
 * It mimics the shape of the actual content to provide better UX.
 */
"use client";

export function SkeletonLoader() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Video Info Skeleton */}
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                <div className="h-64 bg-muted/20 relative">
                    <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-8 left-8 space-y-3 w-2/3">
                        <div className="flex gap-2">
                            <div className="h-6 w-12 bg-muted rounded-full" />
                            <div className="h-6 w-16 bg-muted rounded-full" />
                        </div>
                        <div className="h-10 bg-muted rounded-xl w-full" />
                        <div className="h-6 bg-muted rounded-lg w-1/3" />
                    </div>
                </div>
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="space-y-4">
                            <div className="h-6 w-1/4 bg-muted rounded" />
                            <div className="h-32 bg-muted/30 rounded-2xl" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-6 w-1/4 bg-muted rounded" />
                            <div className="flex gap-2">
                                <div className="h-8 w-20 bg-muted rounded-xl" />
                                <div className="h-8 w-24 bg-muted rounded-xl" />
                                <div className="h-8 w-16 bg-muted rounded-xl" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="aspect-video bg-muted rounded-2xl" />
                        <div className="h-40 bg-muted/10 rounded-2xl" />
                    </div>
                </div>
            </div>

            {/* Transcript Skeleton */}
            <div className="bg-card rounded-2xl border border-border/50 h-150 overflow-hidden flex flex-col">
                <div className="h-16 bg-muted/30 border-b border-border/50 flex justify-between items-center px-8">
                    <div className="h-6 w-32 bg-muted rounded" />
                    <div className="h-10 w-48 bg-muted rounded-lg" />
                </div>
                <div className="p-6 space-y-4 grow">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="h-4 w-12 bg-muted rounded shrink-0" />
                            <div className="h-4 bg-muted rounded w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
