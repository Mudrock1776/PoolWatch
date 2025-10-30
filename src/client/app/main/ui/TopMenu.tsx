'use client';
import { usePathname } from 'next/navigation';
import { redirect } from 'next/navigation';

export default function TopMenu(props:any){
    const pathname = usePathname();
    const { serialNumber, testTaken, onToggleSidebar } = props;
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
    async function deleteReport() {
        const res = await fetch("/report/delete", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
                index: sessionStorage.getItem("reportIndex"),
                serialNumber: sessionStorage.getItem("serial")
            })
        });
        deviceMenu();
    }
    async function removeDevice() {
        const res = await fetch("/device/remove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: localStorage.getItem("PoolWatchtoken"),
                serialNumber: sessionStorage.getItem("serial")
            })
        });
        mainMenu();
    }
    function leftMenu(){
        if (pathname == "/main/report"){
            return(
                <div className="flex lg:flex-1 lg:gap-x-12">
                    <p onClick={(e)=>mainMenu()} className="-m-1.5 p-1.5 h-8 w-auto font-semibold text-white ">Home</p>
                    <p onClick={(e)=>deviceMenu()} className="-m-1.5 p-1.5 h-8 w-auto font-semibold text-white ">Device #{serialNumber}</p>
                </div>
            )
        } else if (pathname == "/main/device/settings") {
            return(
                <div className="flex lg:flex-1 lg:gap-x-12">
                    <p onClick={(e)=>mainMenu()} className="-m-1.5 p-1.5 h-8 w-auto font-semibold text-white ">Home</p>
                    <p onClick={(e)=>deviceMenu()} className="-m-1.5 p-1.5 h-8 w-auto font-semibold text-white ">Device #{serialNumber}</p>
                </div>
            )
        } else {
            return(
                <div className="flex lg:flex-1 lg:gap-x-12">
                    <p onClick={(e)=>mainMenu()} className="-m-1.5 p-1.5 h-8 w-auto font-semibold text-white ">Home</p>
                </div>
            )
        }
    }
    function middleMenu(){
        if (pathname == "/main/report"){
            return(
                <div className="lg:flex lg:gap-x-12">
                    <p className="text-sm/6 font-semibold text-white">Report: {testTaken}</p>
                </div>
            )
        } else {
            return(
                <div className="lg:flex lg:gap-x-12">
                    <p className="text-sm/6 font-semibold text-white">PoolWatch</p>
                </div>
            )
        }
    }
    function rightMenu(){
        if (pathname == "/main/report"){
            return(
                <div className="lg:flex lg:flex-1 lg:gap-x-12 lg:justify-end">
                    <p onClick={(e)=>deleteReport()} className="text-sm/6 font-semibold text-white">Delete</p>
                    <p onClick={(e)=>logOut()} className="text-sm/6 font-semibold text-white">Log Out</p>
                </div>
            )
        } else if (pathname == "/main/device/settings"){
            return(
                <div className="lg:flex lg:flex-1 lg:gap-x-12 lg:justify-end">
                    <p onClick={(e)=>removeDevice()} className="text-sm/6 font-semibold text-white">Remove Device</p>
                    <p onClick={(e)=>logOut()} className="text-sm/6 font-semibold text-white">Log Out</p>
                </div>
            )
        } else {
            return(
                <div className="lg:flex lg:flex-1 lg:gap-x-12 lg:justify-end">
                    <p onClick={(e)=>logOut()} className="text-sm/6 font-semibold text-white">Log Out</p>
                </div>
            )
        }
    }
    return (
    <header className="bg-gray-600 sticky top-0 h-16 z-40">
      <nav aria-label="Global" className="flex max-w-8xl items-center justify-start px-6 lg:px-8 h-16">
        {onToggleSidebar && <button onClick={onToggleSidebar} className="p-2 mr-4 rounded-md bg-gray-100 hover:bg-gray-200 shadow" aria-label="Toggle sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>}
        {leftMenu()}
        {middleMenu()}
        {rightMenu()}
      </nav>
    </header>
  );
}
