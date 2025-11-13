'use client';
import { useEffect, useState, MouseEvent } from "react";
import { redirect } from 'next/navigation';
import Sidebar from "../ui/Sidebar";

export default function Page(){
    const [device, setDevice] = useState({
        serialNumber: 0,
        battery: 0,
        connected: false,
        pumpStatus: false,
        fiveRegulator: false,
        twelveRegulator: false,
        sampleRate: 0,
        updateServers: [],
        reports: []
    });
    const [search, setSearch] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useEffect(() => {
        async function getDevice() {
            const res = await fetch("/device/fetch", {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    serialNumber: sessionStorage.getItem("serial")
                })
            });
            setDevice(await res.json());
        }
        const tokenString = localStorage.getItem("PoolWatchtoken");
        if (tokenString == null){
            redirect("/");
        }
        getDevice();
        const updateInterval = setInterval(() => {
            getDevice();
        }, 5000);
        return () => {
            clearInterval(updateInterval);
        }
    }, [])

    function reportRedirect(index:Number){
        sessionStorage.setItem("reportIndex", index.toString());
        redirect("/main/report");
    }

    function mainMenu(){
        sessionStorage.removeItem("serial");
        sessionStorage.removeItem("reportIndex");
        redirect("/main");
    }
    function deviceMenu(){
        sessionStorage.removeItem("reportIndex");
        redirect("/main/device");
    }
    function logOut(){
        sessionStorage.removeItem("serial");
        sessionStorage.removeItem("reportIndex");
        localStorage.removeItem("PoolWatchtoken");
        redirect("/");
    }

    async function requestTest(e:MouseEvent<HTMLButtonElement>, test:String) {
        e.preventDefault();
        var Chlorine = false;
        var Phosphate = false;
        var Tempature = false;
        var Particulate = false;
        switch (test) {
            case "Chlorine":
                Chlorine = true;
                break;
            case "Phoshate":
                Phosphate = true;
                break;
            case "Tempature":
                Tempature = true;
                break;
            case "Particulate":
                Particulate = true;
                break;
        }
        const res = await fetch("/test/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                serialNumber: sessionStorage.getItem("serial"),
                testChlorine: Chlorine,
                testPhosphate: Phosphate,
                testTempature: Tempature,
                testParticulate: Particulate
            })
        });
    }

    async function deleteReport(index:number) {
        const res = await fetch("/report/delete", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
                index: index,
                serialNumber: sessionStorage.getItem("serial")
            })
        });
        setDevice(await res.json());
    }

    function listReports(){
        var index = -1;
        const searchLower = search.toLowerCase();
        
        return(device.reports.map((item:any) => {
            index += 1;
            const curIndex = index;
            const searchField = item && item.testTaken ? String(item.testTaken) : "";
            if (searchField.toLowerCase().includes(searchLower)){
                return(
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                        <th onClick={(e)=>{reportRedirect(curIndex)}} className="px-6 py-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">{item.testTaken}</th>
                        <td onClick={(e)=>{reportRedirect(curIndex)}} className="px-6 py-4">{item.tempature}</td>
                        <td onClick={(e)=>{reportRedirect(curIndex)}} className="px-6 py-4">{item.ClCon}</td>
                        <td onClick={(e) =>{deleteReport(curIndex)}} className="px-6 py-4">Delete</td>
                    </tr>
                );
            }
        }));
    }
    return(
        <div className="min-h-screen flex">
            <Sidebar open={sidebarOpen} />
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
                <header className="bg-[#424C5E] h-16">
                <nav aria-label="Global" className="flex h-full w-full items-center justify-start px-6 lg:px-8">
                     <button type="button"onClick={() => setSidebarOpen(prev => !prev)}
                         className="flex items-center justify-center h-8 w-8 mr-4 rounded-md bg-gray-100 text-gray-800 shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900">
                         <span className="sr-only">Toggle sidebar</span>
                         <svg className="h-5 w-5"fill="none"xmlns="http://www.w3.org/2000/svg"viewBox="0 0 24 24"stroke="currentColor">
                             <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M4 6h16M4 12h16M4 18h16"/></svg>
                     </button>
                    <div className="flex lg:flex-1 lg:gap-x-12">
                        <p onClick={(e)=>mainMenu()} className="-m-1.5 p-1.5 h-8 w-auto font-semibold text-white ">Home</p>
                        <p onClick={(e)=>deviceMenu()} className="-m-1.5 p-1.5 h-8 w-auto font-semibold text-white ">Device #{device.serialNumber}</p>
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
                                <input value={search} onChange={(e)=> setSearch(e.target.value)} type="search" id="default-search" className="block w-64 p-2 ps-8 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search reports" required />
                            </div>
                        </form>
                    </div>
                    <div className="lg:flex lg:flex-1 lg:gap-x-12 lg:justify-end">
                        <p onClick={(e)=>redirect("/main/device/settings")} className="text-sm/6 font-semibold text-white">Settings</p>
                        <p onClick={(e)=>logOut()} className="text-sm/6 font-semibold text-white">Log Out</p>
                    </div>
                </nav>
            </header>
            <div className="grid grid-cols-2 mx-6 my-2">
                <div className="">
                    <h1 className="text-white underline text-xl mx-auto mb-2">Status</h1>
                    {device.connected ? <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Connected</p>:<p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Disconnected</p>}
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Battery: {device.battery}</p>
                    {device.pumpStatus ? <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">pumpStatus: working</p>:<p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">pumpStatus: failed</p>}
                    {device.fiveRegulator ? <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">fiveRegulator: working</p>:<p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">fiveRegulator: failed</p>}
                    {device.twelveRegulator ? <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">twelveRegulator: working</p>:<p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">twelveRegulator: failed</p>}
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">sampleRate: {device.sampleRate}</p>
                </div>
                <div>
                    <h1 className="text-white underline text-xl mx-auto mb-2">Tests</h1>
                    <button onClick={(e)=>{requestTest(e, "Chlorine")}} className="mb-2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Test Chlorine</button>
                    <button onClick={(e)=>{requestTest(e, "Phoshate")}} className="mb-2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Test Phosphate</button>
                    <button onClick={(e)=>{requestTest(e, "Tempature")}} className="mb-2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Test Tempature</button>
                    <button onClick={(e)=>{requestTest(e, "Particulate")}} className="mb-2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Test Particulate</button>
                </div>
            </div>
            {(() => {
                if (device.reports.length > 0){
                    return(
                        <div className="relative overflow-x-auto mx-6">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Test</th>
                                        <th scope="col" className="px-6 py-3">Temperature</th>
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
            </main>
        </div>
    )
}
