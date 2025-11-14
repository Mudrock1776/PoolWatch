"use client"; 
import { MouseEvent, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import TopMenu from "./ui/TopMenu";
import Sidebar from "./ui/Sidebar";
import Calendar from "./ui/Calendar";

type deviceType = {
  serialNumber: number;
  battery: number;
  connected: boolean;
  pumpStatus: boolean;
  fiveRegulator: boolean;
  twelveRegulator: boolean;
  sampleRate: number;
  updateServers: any[];
  reports: any[];
};

export default function Page() {
  const [devices, setDevices] = useState<deviceType[]>([]);
  const [serialNumberForm, setSerialNumberForm] = useState(0);
  const [err, setErr] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    async function loadDevices() {
      const tokenString = localStorage.getItem("PoolWatchtoken");
      const res = await fetch("/device/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: tokenString
            })
        });
      setDevices(await res.json());
    }

    const tokenString = localStorage.getItem("PoolWatchtoken");
    if (tokenString == null){
        redirect("/");
    }

    loadDevices();
    const updateInterval = setInterval(() => {
        loadDevices();
    }, 5000);
    return () => {
        clearInterval(updateInterval);
    }
  }, [])

  async function onsubmit(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) {
    e.preventDefault();
    const tokenString = localStorage.getItem("PoolWatchtoken");
    const res = await fetch("/device/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
          id: tokenString,
          serialNumber: serialNumberForm 
      }),
    });
    if (res.status == 403) {
      setErr("Device already added");
      return;
    }
    if (res.status == 404) {
      setErr("Device does not exist");
      return;
    }
    const res2 = await fetch("/device/list", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        id: tokenString }),
    });
    setDevices(await res2.json());
    setErr("");
    setSerialNumberForm(0);
  }

  function deviceRedirect(serialNumber: Number) {
    sessionStorage.setItem("serial", serialNumber.toString());
    redirect("/main/device");
  }

  function settingRedirect(serialNumber: Number) {
    sessionStorage.setItem("serial", serialNumber.toString());
    redirect("/main/device/settings");
  }

  function listDevices() {
    return devices.map((device: deviceType) => (
      <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
        <th className="px-6 py-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">{device.serialNumber}</th>
        <td className="px-6 py-4">
          <button type="button"onClick={(e) => settingRedirect(device.serialNumber)}className="text-xs px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-600 hover:scale-105 active:scale-95 transition-all duration-150 shadow-sm">Configure</button>
        </td>
        <td className="px-6 py-4">
          <button type="button"onClick={(e) => deviceRedirect(device.serialNumber)}className="text-xs px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-gray-600 hover:scale-105 active:scale-95 transition-all duration-150 shadow-sm">Dashboard
          </button>
        </td>
      </tr>
    ));
  }

  return (
    <>
      <div className="min-h-screen flex">
        <Sidebar open={sidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
          <TopMenu onToggleSidebar={() => setSidebarOpen((prevOpen) => !prevOpen)}/>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            <div className="bg-white rounded-lg shadow p-4 h-full relative">
              <h2 className="text-xl font-semibold">Chlorine</h2>
              <img src="/TestProcedureC.png"alt="Chlorine Test Procedure"className="mt-4 rounded-lg object-contain w-full h-[20rem] hover:scale-[1.02] transition-transform duration-200"/>
            </div>
            <div className="bg-white rounded-lg shadow p-4 h-full relative">
              <h2 className="text-xl font-semibold">Phosphate</h2>
              <img src="/TestProcedureP.png"alt="Phosphate Test Procedure"className="mt-4 rounded-lg object-contain w-full h-[20rem] hover:scale-[1.02] transition-transform duration-200"/>
              <div className="mt-4">
                <p className="text-gray-700 mb-2">Watch the guide on how to perform the phosphate test.</p>
                <button type="button"onClick={() => setShowVideo(true)}className="inline-block px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-200">View Test Procedure</button>
              </div>
              {showVideo && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"onClick={() => setShowVideo(false)}>
                  <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full relative"onClick={(e) => e.stopPropagation()}>
                    <button type="button"onClick={() => setShowVideo(false)}className="absolute -top-3 -right-3 bg-white text-black font-bold text-2xl rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:bg-gray-200 hover:scale-110 transition-all duration-150">✕</button>
                    <div className="w-full h-0 pb-[56.25%] relative">
                      <iframe src="https://www.youtube.com/embed/gVq0LEjczDc"title="Phosphate Test Procedure"allowFullScreen className="absolute top-0 left-0 w-full h-full rounded-lg"></iframe>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:row-span-2 grid gap-4 h-full grid-rows-[auto_auto_1fr]">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold">Add Device</h2>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    min={1}
                    value={serialNumberForm || ""}onChange={(e) => setSerialNumberForm(Number(e.target.value))}className="max-w-sm border rounded p-2"placeholder="Serial #"/>
                  <button type="button"onClick={onsubmit}className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">Submit</button>
                  <button type="button"onClick={(e) => {setSerialNumberForm(0);setErr("");}}className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">Cancel</button>
                </div>
                {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
              </div>
              <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
                {devices.length > 0 && (
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-800 uppercase bg-gray-200 dark:bg-gray-600 dark:text-gray-100">
                      <tr>
                        <th className="px-6 py-3">Device</th>
                        <th className="px-6 py-3"></th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>{listDevices()}</tbody>
                  </table>
                )}
                {devices.length == 0 && (<p className="text-sm text-gray-500">No devices yet.</p>)}
              </div>
              <div className="bg-white rounded-lg shadow p-4 min-h-0 h-full">
                <h2 className="text-lg font-semibold mb-2">Calendar</h2>
                <Calendar height={260} startOnMonday />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-2">Particulate Table</h2>
              <table className="min-w-full border-collapse table-auto text-sm mt-2 border border-gray-200 text-center">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold border border-gray-200 text-center">Size</th>
                    <th className="px-6 py-3 font-semibold border border-gray-200 text-center">Classification</th>
                    <th className="px-6 py-3 font-semibold border border-gray-200 text-center">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-6 py-3 border border-gray-200 text-center"> &gt; 250 µm</td>
                    <td className="px-6 py-3 border border-gray-200 text-center">
                      <span className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full transition-all duration-200 hover:bg-green-200 hover:scale-105">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Coarse Sands</span>
                    </td>
                    <td className="px-6 py-3 border border-gray-200">7</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 border border-gray-200 text-center">63µm - 250µm</td>
                      <td className="px-6 py-3 border border-gray-200 text-center">
                      <span className="inline-flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full transition-all duration-200 hover:bg-orange-200 hover:scale-105">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>Fine Sands</span>
                    </td>
                    <td className="px-6 py-3 border border-gray-200 text-center">62</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 border border-gray-200 text-center">10µm - 63µm</td>
                    <td className="px-6 py-3 border border-gray-200 text-center">
                      <span className="inline-flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full transition-all duration-200 hover:bg-orange-200 hover:scale-105">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Pollen/Algae</span>
                    </td>
                    <td className="px-6 py-3 border border-gray-200 text-center">15</td>
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
