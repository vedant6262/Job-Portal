export function JobCardSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl skeleton" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 skeleton" />
          <div className="h-4 w-1/2 skeleton" />
          <div className="flex gap-2">
            <div className="h-6 w-20 skeleton" />
            <div className="h-6 w-20 skeleton" />
            <div className="h-6 w-20 skeleton" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-16 skeleton" />
            <div className="h-6 w-16 skeleton" />
          </div>
          <div className="flex gap-3 mt-4">
            <div className="h-9 w-28 skeleton" />
            <div className="h-9 w-28 skeleton" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="glass-card p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 w-24 skeleton" />
              <div className="h-8 w-16 skeleton" />
            </div>
            <div className="w-12 h-12 rounded-xl skeleton" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 glass-card">
          <div className="h-10 w-10 rounded-full skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 skeleton" />
            <div className="h-3 w-1/4 skeleton" />
          </div>
          <div className="h-8 w-20 skeleton" />
        </div>
      ))}
    </div>
  )
}
