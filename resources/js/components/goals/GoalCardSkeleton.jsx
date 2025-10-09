export default function GoalCardSkeleton() {
  return (
    <div className="fin-card card-hover p-4 md:p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
        </div>
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>

      <div className="mb-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 w-full"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 w-16"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 w-20"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1 w-24"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
      </div>

      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1"></div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
