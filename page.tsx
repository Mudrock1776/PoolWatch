'use client';

import { MouseEvent, useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import TopMenu from "./ui/TopMenu";
import Sidebar from "./ui/Sidebar";
import BatteryPercentage from "./ui/BatteryPercentage";
import Calendar from "./ui/Calendar"; 


export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [serialNumberForm, setSerialNumberForm] = useState("");
  const [selectedSerial, setSelectedSerial] = useState<number | null>(null);

  useEffect(() => {
    if (Array.isArray(devices) && devices.length > 0 && !selectedSerial) {
      setSelectedSerial(Number(devices[0].serialNumber));}}, [devices, selectedSerial]);

  useEffect(() => {
    async function loadDevices() {
      const tokenString = localStorage.getItem("PoolWatchtoken");
      const res = await fetch("/device/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tokenString })
      });
      const data = await res.json();
      setDevices(Array.isArray(data) ? data : []);
    }

    const tokenString = localStorage.getItem("PoolWatchtoken");
    if (tokenString == null) {
      redirect("/");
    }
    loadDevices();
  }, [devices.length]);

  async function refreshDevices() {
    const tokenString = localStorage.getItem("PoolWatchtoken");
    const res = await fetch("/device/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: tokenString })
    });
    const data = await res.json();
    setDevices(Array.isArray(data) ? data : []);
  }

  async function onsubmit(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) {
    e.preventDefault();
    if (!serialNumberForm.trim() || Number(serialNumberForm) < 1) return;
    const tokenString = localStorage.getItem("PoolWatchtoken");
    await fetch("/device/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: tokenString,
        serialNumber: serialNumberForm
      })
    });
    await refreshDevices();  
    setSerialNumberForm("");
  }

  async function removeDevice(serial: number, e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const tokenString = localStorage.getItem("PoolWatchtoken");
    await fetch("/device/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: tokenString, serialNumber: serial })
    });
    await refreshDevices(); 
    setSerialNumberForm("");
  }

  function deviceRedirect(serialNumber: Number) {
    sessionStorage.setItem("serial", serialNumber.toString());
    redirect("/main/device");
  }

 const selectedDevice =
  selectedSerial == null
    ? null
    : devices?.find(device => device.serialNumber == selectedSerial) ?? null;

  const latestReport =
    selectedDevice && Array.isArray(selectedDevice.reports) && selectedDevice.reports.length > 0
      ? selectedDevice.reports[0]
      : null;

  const temperatureC=latestReport && (latestReport.temperature ?? latestReport.tempature ?? null);
  const lastUpdated=latestReport && (latestReport.createdAt ?? latestReport.testTaken ?? null);

  return (
    <>
      <div className="min-h-screen flex">
        <Sidebar open={sidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <TopMenu onToggleSidebar={() => setSidebarOpen(prevOpen => !prevOpen)} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            <div className="bg-white rounded-lg shadow p-4 h-full">
              <h2 className="text-xl font-semibold">Chlorine</h2>
              <p>Chlorine.</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 h-full">
              <h2 className="text-xl font-semibold">Phosphate</h2>
              <p>Phosphate</p>
            </div>
            <div className="lg:row-span-2 grid gap-4 h-full grid-rows-[auto_auto_1fr]">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold">Device Serial</h2>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={serialNumberForm}
                    onChange={(e) => setSerialNumberForm(e.target.value)}
                    className="max-w-sm border rounded p-2"
                    placeholder="Serial #"
                  />
                  <button
                    type="button"
                    onClick={async (e) => {
                      const value = serialNumberForm;
                      await onsubmit(e);
                      if (value.trim() !== '' && Number(value) > 0) {
                        setSelectedSerial(Number(value));
                      }
                    }}
                    className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Add Device
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-2 flex-1 bg-white text-gray-900"
                    value={selectedSerial ?? ''}
                    onChange={(e) => setSelectedSerial(Number(e.target.value))}
                  >
                    {!devices.length && <option value="">No devices yet</option>}
                    {devices.map((device) => (
                      <option key={device.serialNumber} value={device.serialNumber}>
                        Serial #{device.serialNumber} {device.connected ? '(Online)' : '(Offline)'}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={selectedSerial == null}
                    onClick={() => selectedSerial != null && deviceRedirect(selectedSerial)}
                    className="text-xs px-3 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    disabled={selectedSerial == null}
                    onClick={(e) => selectedSerial != null && removeDevice(selectedSerial, e)}
                    className="text-xs px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold">Pool Temperature </h2>
                <p className="text-2xl font-bold mt-2">
                  {temperatureC != null ? `${Number(temperatureC).toFixed(2)}°C` : "--"}
                </p>
                {lastUpdated && (
                  <p className="text-xs text-gray-500 mt-1">Updated: {String(lastUpdated)}</p>
                )}
              </div>

              <div className="grid gap-4">
                <BatteryPercentage/>
                <div className="bg-white rounded-lg shadow p-4 min-h-0">
                  <h2 className="text-lg font-semibold mb-2">Calendar</h2>
                  <Calendar height={260} startOnMonday />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
              <h2 className="text-xl font-semibold">Particulate Table</h2>
              <table className="min-w-full border-collapse table-auto">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-100 text-left">Size</th>
                    <th className="px-6 py-3 bg-gray-100 text-left">Day</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-6 py-4 border-b border-gray-200">21</td>
                    <td className="px-6 py-4 border-b border-gray-200">Monday</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 border-b border-gray-200">12</td>
                    <td className="px-6 py-4 border-b border-gray-200">Friday</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
