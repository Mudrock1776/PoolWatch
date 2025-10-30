'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar({ open }: { open: boolean }) {
  const [openReports, setOpenReports] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    async function loadDevices() {
      const tokenString = localStorage.getItem('PoolWatchtoken');
      const res = await fetch('/device/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tokenString }),
      });

      if (!res.ok) {
        console.error('Sidebar /device/list failed:', res.status);
        setDevices([]);
        return;
      }

      const data = await res.json();
      if (data) {
        setDevices(data);
      } else {
        setDevices([]);
      }
    }
    const tokenString = localStorage.getItem("PoolWatchtoken");
    if (tokenString == null) {
      redirect("/");
    }
    loadDevices();
  }, []);

  useEffect(() => {
    const refresh = async () => {
      const tokenString = localStorage.getItem('PoolWatchtoken');
      const res = await fetch('/device/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tokenString }),
      });
      if (!res.ok) {
        console.error('Sidebar refresh /device/list failed:', res.status);
        setDevices([]);
        return;
      }
      const data = await res.json();
      setDevices(Array.isArray(data) ? data : []);
    };

    document.addEventListener('DevicesUpdated', refresh);
    return () => document.removeEventListener('DevicesUpdated', refresh);
  }, []);

  function openReportsPage(serial: number, reportIndex: number) {
    sessionStorage.setItem('serial', String(serial));
    localStorage.setItem('lastSerial', String(serial));
    const params = new URLSearchParams({
      serial: String(serial),
      reportIndex: String(reportIndex),
    });
    router.push(`/main/report?${params.toString()}`);
  }

  return (
    <aside
      aria-label="Sidebar"
      className={`fixed top-0 left-0 z-40 h-screen w-64 transform bg-gray-800 text-white 
        transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-16 items-center gap-3 border-b border-gray-700 px-4">
        <span className="h-7 w-7 rounded-lg bg-white" aria-hidden="true" />
        <span className="text-xl font-bold">Group 4</span>
      </div>
      <nav className="mt-6 px-2">
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => setOpenReports((prev) => !prev)}
              aria-expanded={openReports}
              aria-controls="section-reports"
              className="flex w-full items-center justify-between rounded px-3 py-2 
                hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-gray-500 focus:ring-offset-gray-800">
              <span>Reports</span>
              <svg
                className={`h-4 w-4 transition-transform ${openReports ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true">
                <path
                  d="M6 9l6 6 6-6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"/>
              </svg>
            </button>
            {openReports && (
              <ul id="section-reports" className="mt-1 space-y-1 pl-4">
                {devices.map((device) => (
                  <li key={device.serialNumber} className="rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((previousExpanded) =>
                          Object.assign({}, previousExpanded, {
                            [device.serialNumber]: !previousExpanded[device.serialNumber],
                          })
                        )
                      }
                      className="flex w-full items-center justify-between rounded px-3 py-2 text-sm 
                        hover:bg-gray-700">
                      <span className="truncate">Serial #{device.serialNumber}</span>
                      <span className="opacity-70">
                        {expanded[device.serialNumber] && '▴'}
                        {!expanded[device.serialNumber] && '▾'}
                      </span>
                    </button>
                    {expanded[device.serialNumber] && (
                      <div className="ml-3 mr-2 py-1">
                        <select
                          className="w-full bg-transparent text-sm text-white px-2 py-1 
                            border-0 border-b border-gray-600 focus:outline-none focus:ring-0"
                          defaultValue=""
                          onChange={(e) => {if (e.target.value !== '') openReportsPage(device.serialNumber, Number(e.target.value));}}>
                          <option value="" disabled hidden>
                            — Choose report —
                          </option>
                          {Array.isArray(device.reports) && device.reports.length > 0 && 
                            device.reports.map((report: any, reportIndex: number) => (
                              <option key={reportIndex} value={reportIndex} className="text-white bg-gray-800">
                                Report #{reportIndex + 1}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    )}
                  </li>
                ))}
                {!devices.length && (
                  <li className="px-3 py-1 text-sm text-gray-400">No devices yet</li>)}
              </ul>
            )}
          </li>
          <li>
            <Link
              href="/main/AboutUs"
              className="block rounded px-3 py-2 hover:bg-gray-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-gray-500 focus:ring-offset-gray-800">
              About Us
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
