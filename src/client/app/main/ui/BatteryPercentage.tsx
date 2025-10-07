'use client';

export default function BatteryPercentage() {
  const batteryLevel = 72;
  const fillWidth = Math.max(0, Math.min(46, Math.round((batteryLevel / 100) * 46)));
  const tone =
    batteryLevel <= 15 ? 'text-red-600 fill-red-500'
    : batteryLevel <= 40 ? 'text-amber-600 fill-amber-500'
    : 'text-emerald-600 fill-emerald-500';
    
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Battery Percentage
      </div>
      <div className="flex items-center gap-3">
        <svg
          viewBox="0 0 52 24"
          className={`w-10 h-10 ${tone}`}
          aria-label={`Battery ${batteryLevel}%`}
          role="img"
        >
          <rect x="1" y="4" width="46" height="16" rx="3" ry="3" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="49" y="8" width="3" height="8" rx="1.5" ry="1.5" fill="currentColor" />
          <rect x="2" y="5" width={fillWidth} height="14" rx="2" ry="2" className="transition-all duration-300" />
        </svg>
        <div className="text-3xl font-bold leading-none text-gray-900 dark:text-gray-100">
          {batteryLevel}%
        </div>
      </div>
    </div>
  );
}
