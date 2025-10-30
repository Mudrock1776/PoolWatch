'use client';
import { MouseEvent, useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import TopMenu from "./ui/TopMenu";
import Sidebar from "./ui/Sidebar"; 
import BatteryPercentage from "./ui/BatteryPercentage"; 
import Calendar from "./ui/Calendar"; 

export default function Page() {
  const [devices, setDevices] = useState<any[]>([]);
  const [serialNumberForm, setSerialNumberForm] = useState<string>(''); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [selectedSerial, setSelectedSerial] = useState<number>(0);

  useEffect(() => {
    async function loadDevices() {
      const tokenString = localStorage.getItem("PoolWatchtoken");
      const res = await fetch("/device/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: tokenString 
        })
      });
      const data = await res.json(); 
      if (data){ 
        setDevices(data);  
      }else {
        setDevices([]); 
      }
    }

    const tokenString = localStorage.getItem("PoolWatchtoken");
    if (tokenString == null) {
      redirect("/");
    }
    loadDevices();
  }, [devices.length]);

  async function onsubmit(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>){
    e.preventDefault();
    if (Number(serialNumberForm) <= 0) return;
    const tokenString = localStorage.getItem("PoolWatchtoken");
    if (!tokenString) return; 
    const res = await fetch("/device/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: tokenString,
        serialNumber: serialNumberForm
      })
    });

    if (!res.ok) {
      console.error("Device add failed:", res.status);
      return;
    }

    const res2 = await fetch("/device/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: tokenString
      })
    });
    
    if (!res2.ok) { 
      console.error("Failed to load device list:", res2.status);
      return;
    }

    let loadedDevices = await res2.json();
    if (Array.isArray(loadedDevices)) { 
      loadedDevices = loadedDevices.filter((device) => device && device.serialNumber != null);
      setDevices(loadedDevices);
      document.dispatchEvent(new Event('DevicesUpdated'));
    } else {
      console.warn("Device list not an array:", loadedDevices);
      setDevices([]);
      document.dispatchEvent(new Event('DevicesUpdated'));
    }
    setSerialNumberForm(''); 
  }

  function deviceRedirect(serialNumber: Number) {
    if (Number(serialNumber) <= 0) return;
    sessionStorage.setItem("serial", serialNumber.toString());
    redirect("/main/device");
  }

  async function removeDevice(serial: number, e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    const tokenString = localStorage.getItem("PoolWatchtoken");
    if (!tokenString) return;  

    const res = await fetch("/device/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: tokenString, serialNumber: serial }),
    });

    if (!res.ok) {
      console.error("Device removal failed:", res.status);
      return;                                  
    }

    const res2 = await fetch("/device/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: tokenString }),
    });
  
    if (!res2.ok) {
      console.error("Failed to reload device list:", res2.status);
      setDevices([]);                         
      document.dispatchEvent(new Event('DevicesUpdated'));                        
      return;
    }

    let loadedDevices = await res2.json();
    if (Array.isArray(loadedDevices)) {
      const validDevices = loadedDevices.filter(
        (device) => device && device.serialNumber != null
      );
      setDevices(validDevices);
      document.dispatchEvent(new Event('DevicesUpdated'));
    } else {
      console.warn("Device list not an array:", loadedDevices);
      setDevices([]);
      document.dispatchEvent(new Event('DevicesUpdated'));
    }
    setSerialNumberForm('');
  }
  let selectedDevice = null;
  if (devices && Array.isArray(devices)) {
    const found = devices.find((device) => device && device.serialNumber == selectedSerial);
    if (found) {
      selectedDevice = found;
    }
  }

  return (
    <>
      <div className="min-h-screen flex">
        <Sidebar open={sidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <TopMenu onToggleSidebar={() => setSidebarOpen(prevOpen => !prevOpen)} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            <div className="bg-white rounded-lg shadow p-4 h-full">
              <h2 className="text-xl font-semibold">Chlorine</h2>
            </div>
            <div className="bg-white rounded-lg shadow p-4 h-full">
              <h2 className="text-xl font-semibold">Phosphate</h2>
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
                      await onsubmit(e);
                      if (Number(serialNumberForm)> 0) {
                        setSelectedSerial(Number(serialNumberForm));
                      }
                    }}
                    className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
                    Add Device
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-2 flex-1 bg-white text-gray-900"
                    value={selectedSerial }
                    onChange={(e) => setSelectedSerial(Number(e.target.value))}>
                    <option value={0} disabled>Select a device...</option>
                    {!devices.length && <option value="">No devices yet</option>}
                    {devices.filter(device => device && device.serialNumber != null)
                    .map((device) => (
                      <option key={device.serialNumber} value={device.serialNumber}>
                        Serial #{device.serialNumber} {(device.connected && '(Online)') || '(Offline)'}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    disabled={selectedSerial == null}
                    onClick={() => selectedSerial != null && deviceRedirect(selectedSerial)}
                    className="text-xs px-3 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50">
                    Open
                  </button>
                  <button
                    type="button"
                    disabled={selectedSerial == null}
                    onClick={(e) => selectedSerial != null && removeDevice(selectedSerial, e)}
                    className="text-xs px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                    Delete
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold">Pool Temperature </h2>
              </div>
            <div className="grid gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                {
                   <BatteryPercentage selectedDevice={selectedDevice} />
                }
              </div>
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
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
