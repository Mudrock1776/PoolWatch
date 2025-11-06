'use client';
import { MouseEvent, useEffect, useState } from "react";
import { redirect } from 'next/navigation';

export default function Page(){
    const [devices, setDevices] = useState<any[]>([]);
    const [serialNumberForm, setSerialNumberForm] = useState(0);
    const [search, setSearch] = useState("");
    
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

    async function onsubmit(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>){
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
            })
          });
        const res2 = await fetch("/device/list", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: tokenString
            })
        });
        let loadedDevices = await res2.json();
        setDevices(loadedDevices);
    }

    function deviceRedirect(serialNumber:Number){
        sessionStorage.setItem("serial", serialNumber.toString());
        redirect("/main/device");
    }
    function mainMenu(){
        sessionStorage.removeItem("serial");
        sessionStorage.removeItem("reportIndex");
        redirect("/main");
    }
    function logOut(){
        sessionStorage.removeItem("serial");
        sessionStorage.removeItem("reportIndex");
        localStorage.removeItem("PoolWatchtoken");
        redirect("/");
    }

    function list(){
        return devices.map((device) => {
            return(
                <li onClick={(e) => deviceRedirect(device.serialNumber)}>{device.serialNumber}</li>
            )
        })
    }

    return(
        <div>
            <header className="bg-gray-900">
                <nav aria-label="Global" className="flex max-w-8xl items-center justify-start p-6 lg:px-8">
                    <div className="flex lg:flex-1 lg:gap-x-12">
                        <p onClick={(e)=>mainMenu()} className="-m-1.5 p-1.5 h-8 w-auto font-semibold text-white ">Home</p>
                    </div>
                    <div className="lg:flex lg:gap-x-12">
                        <form className="max-w-2xl mx-auto">   
                            <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                    </svg>
                                </div>
                                <input value={search} onChange={(e)=> setSearch(e.target.value)} type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search reports" required />
                            </div>
                        </form>
                    </div>
                    <div className="lg:flex lg:flex-1 lg:gap-x-12 lg:justify-end">
                        <p onClick={(e)=>redirect("/main/device/settings")} className="text-sm/6 font-semibold text-white">Settings</p>
                        <p onClick={(e)=>logOut()} className="text-sm/6 font-semibold text-white">Log Out</p>
                    </div>
                </nav>
            </header>
            {(() => {
                if (device.reports.length > 0){
                    return(
                        <div className="relative overflow-x-auto mx-6">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Device</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">temperature</th>
                                        <th scope="col" className="px-6 py-3">Chlorine Concentration</th>
                                        <th scope="col" className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listReports()}
                                </tbody>
                            </table>
                        </div>
                    );
                }
            })()}
        </div>
    )
}