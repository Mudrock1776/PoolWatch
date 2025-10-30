'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  className: string;
  startOnMonday: boolean;
  onSelectDate: (isoDate: string) => void;
  height: number;
};

function ymd(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addMonths(baseDate: Date, monthOffset: number) {
  const dateCopy = new Date(baseDate);
  dateCopy.setMonth(dateCopy.getMonth() + monthOffset);
  return dateCopy;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date, mondayFirst: boolean) {
  const dateCopy = new Date(date);
  let dayOfWeekIndex = dateCopy.getDay();
  if (mondayFirst) dayOfWeekIndex = (dayOfWeekIndex + 6) % 7;
  dateCopy.setDate(dateCopy.getDate() - dayOfWeekIndex);
  dateCopy.setHours(0, 0, 0, 0);
  return dateCopy;
}

function addDays(baseDate: Date, dayOffset: number) {
  const dateCopy = new Date(baseDate);
  dateCopy.setDate(dateCopy.getDate() + dayOffset);
  return dateCopy;
}

export default function Calnder({
  className = '',
  startOnMonday = true,
  onSelectDate = () => {},
  height = 260,
}: Partial<Props>) {
  const [isReady, setisReady] = useState(false);
  const todayRef = useRef(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(todayRef.current));
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(() => ymd(todayRef.current));

  useEffect(() => {
    setisReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className={`w-full max-w-sm mx-auto rounded-lg border-2 border-gray-400 dark:border-gray-500 shadow-lg bg-white dark:bg-gray-800 ${className}`}>
        <div className="p-5 md:p-8">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
          <div className="h-[200px] bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const monthStartDate = startOfMonth(currentMonth);
  const gridStartDate = startOfWeek(monthStartDate, startOnMonday);
  const calendarDays: Date[] = Array.from({ length: 42 }, (_, index) => addDays(gridStartDate, index));
  const weekdayLabels = startOnMonday
    ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthLabel = currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const isToday = (date: Date) => ymd(date) === ymd(todayRef.current);
  const isInCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth();

  return (
    <div className={`w-full max-w-sm mx-auto rounded-lg border-2 border-gray-400 dark:border-gray-500 shadow-lg bg-white dark:bg-gray-800 ${className}`}>
      <div className="p-5 md:p-8 rounded-t flex flex-col" style={{ height }}>
        <div className="px-1 flex items-center justify-between h-6">
          <span className="whitespace-nowrap text-base font-bold text-gray-800 dark:text-gray-100">
            {monthLabel}
          </span>
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
              className="rounded-md px-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 6 9 12 15 18" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="ml-1 rounded-md px-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1 text-xs text-gray-500 h-5 select-none">
          {weekdayLabels.map((weekday) => (
            <div key={weekday} className="text-center">
              {weekday}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 grid-rows-6 gap-1 flex-1 overflow-hidden">
          {calendarDays.map((date, index) => {
            const isoDate = ymd(date);
            const selected = selectedIsoDate === isoDate;

            let cellClass =
              'w-full h-full flex items-center justify-center rounded-md text-xs transition-colors ';
            if (isInCurrentMonth(date)) {
              cellClass += 'text-gray-900 dark:text-gray-100 ';
            } else {
              cellClass += 'text-gray-400 ';
            }
            if (selected) {
              cellClass += 'bg-indigo-600 text-white ';
            } else if (isToday(date)) {
              cellClass += 'ring-1 ring-indigo-600 ';
            } else {
              cellClass += 'hover:bg-gray-100 dark:hover:bg-gray-700 ';
            }

            return (
              <button
                type="button"
                key={isoDate + index}
                onClick={() => {
                  setSelectedIsoDate(isoDate);
                  if (onSelectDate) onSelectDate(isoDate);
                }}
                className={cellClass}
                title={isoDate}>
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
