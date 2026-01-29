/**
 * Reusable skeleton loading components
 */

// Base skeleton with shimmer animation
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded ${className}`}
      {...props}
    />
  );
}

// Text line skeleton
export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

// Avatar/circle skeleton
export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return <Skeleton className={`rounded-full ${sizes[size]} ${className}`} />;
}

// Card skeleton
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass rounded-2xl p-5 shadow-lg ${className}`}>
      <div className="flex items-start gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-1/3 mb-2" />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  );
}

// Todo item skeleton
export function SkeletonTodo() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
      <Skeleton className="w-5 h-5 rounded-md flex-shrink-0" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
    </div>
  );
}

// Todo list skeleton
export function SkeletonTodoList({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTodo key={i} />
      ))}
    </div>
  );
}

// Dashboard widget skeleton
export function SkeletonWidget({ className = '' }) {
  return (
    <div className={`glass rounded-2xl p-5 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <Skeleton className="h-12 w-full mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// Dashboard grid skeleton
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="glass rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="xl" />
          <div className="flex-1">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonWidget key={i} />
        ))}
      </div>
    </div>
  );
}

// Calendar skeleton
export function SkeletonCalendar() {
  return (
    <div className="glass rounded-2xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded" />
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Notes grid skeleton
export function SkeletonNotes({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-5 shadow-lg">
          <Skeleton className="h-5 w-3/4 mb-3" />
          <SkeletonText lines={3} className="mb-3" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

// Attendance skeleton
export function SkeletonAttendance() {
  return (
    <div className="space-y-6">
      {/* Status card */}
      <div className="glass rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="w-32 h-12 rounded-xl" />
        </div>
      </div>

      {/* Calendar */}
      <SkeletonCalendar />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-4 shadow-lg text-center">
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Expense list skeleton
export function SkeletonExpenseList({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
          <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
