"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(11,28,48,0.05)" }}>
        <div className="h-1 bg-slate-200 rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5"
            style={{ boxShadow: "0 4px 24px rgba(11,28,48,0.05)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 4px 24px rgba(11,28,48,0.05)" }}>
          <Skeleton className="h-5 w-28 mb-6" />
          <div className="flex items-center justify-center min-h-[200px]">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
          <div className="space-y-3 mt-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2.5 w-2.5 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: "0 4px 24px rgba(11,28,48,0.05)" }}>
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-3 w-28 shrink-0" />
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-3 w-8 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top problems */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(11,28,48,0.05)" }}>
        <div className="h-1 bg-slate-200" />
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-3 w-full ml-8" />
                <Skeleton className="h-3 w-3/4 ml-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
