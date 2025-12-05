import GoalCardSkeleton from "./GoalCardSkeleton";

export default function GoalGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[...Array(4)].map((_, index) => (
        <GoalCardSkeleton key={index} />
      ))}
    </div>
  );
}
