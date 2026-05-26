import { CardSkeleton, LeaderboardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="page max-w-2xl mx-auto space-y-4">
      <div className="skeleton h-8 w-48 rounded" />
      <LeaderboardSkeleton rows={6} />
    </div>
  );
}
