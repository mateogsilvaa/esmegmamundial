import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />;
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-6 w-8 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card divide-y divide-zinc-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  );
}

export function GroupCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <Skeleton className="h-5 w-20" />
      {[0,1,2,3].map(i => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-5 w-7 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
