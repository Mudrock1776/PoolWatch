'use client';
import { usePathname } from 'next/navigation';
import { redirect } from 'next/navigation';
import { useEffect, useState, } from 'react';

export default function TopMenu(props:any){
    const pathname = usePathname();
    const {serialNumber, testTaken} = props;
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
        const res = await fetch("/device/remove", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: sessionStorage.getItem("PoolWatchtoken"),
                serialNumber: sessionStorage.getItem("serial")
            })
        });
        mainMenu();
    }
    async function removeDevice() {
        const res = await fetch("/report/delete", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
                serialNumber: sessionStorage.getItem("serial"),
                index: sessionStorage.getItem("reportIndex")
            })
        });
        deviceMenu();
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
    return(
        <header className="bg-gray-900">
            <nav aria-label="Global" className="flex max-w-8xl items-center justify-start p-6 lg:px-8">
                {leftMenu()}
                {middleMenu()}
                {rightMenu()}
            </nav>
        </header>
    );
}