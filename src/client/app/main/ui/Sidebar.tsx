'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar({ open }: { open: boolean }) {
  
  const [openReports, setOpenReports] = useState(false);
  const [openAnalytics, setOpenAnalytics] = useState(false);

  return (
    <aside
      aria-label="Sidebar"
      className={`fixed top-0 left-0 z-40 h-screen w-64 transform bg-gray-800 text-white transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-gray-700 px-4">
        <span className="h-7 w-7 rounded-lg bg-white" aria-hidden="true" />
        <span className="text-xl font-bold">Group 4</span>
      </div>
      <nav className="mt-6 px-2">
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => setOpenReports(prevOpen => !prevOpen)}
              aria-expanded={openReports}
              aria-controls="section-reports"
              className="flex w-full items-center justify-between rounded px-3 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800"
            >
              <span>Reports</span>
              <svg className={`h-4 w-4 transition-transform ${openReports ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {openReports && (
              <ul id="section-reports" className="mt-1 space-y-1 pl-6">
                <li>
                  <Link href="/main/reports" className="block rounded px-3 py-2 text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800">
                    All Reports
                  </Link>
                </li>
                <li>
                  <Link href="/main/reports/devices" className="block rounded px-3 py-2 text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800">
                    Device Reports
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button
              type="button"
              onClick={() => setOpenAnalytics(prevOpen => !prevOpen)}
              aria-expanded={openAnalytics}
              aria-controls="section-analytics"
              className="flex w-full items-center justify-between rounded px-3 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800"
            >
              <span>Analytics</span>
              <svg className={`h-4 w-4 transition-transform ${openAnalytics ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {openAnalytics && (
              <ul id="section-analytics" className="mt-1 space-y-1 pl-6">
                <li>
                  <Link href="/main/analytics" className="block rounded px-3 py-2 text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="/main/analytics/trends" className="block rounded px-3 py-2 text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800">
                    Trends
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <Link href="/main/AboutUs" className="block rounded px-3 py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800">
              About Us
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
