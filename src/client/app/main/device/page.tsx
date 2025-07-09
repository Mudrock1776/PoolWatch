'use client';
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';

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
        getDevice();
        const tokenString = localStorage.getItem("PoolWatchtoken");
        if (tokenString == null){
            redirect("/");
        }
        console.log(device.reports)
    }, [device.reports.length])

    function reportRedirect(index:Number){
        sessionStorage.setItem("reportIndex", index.toString());
        redirect("/main/report");
    }

    function listReports(){
        var index = -1;
        return(device.reports.map((item:any) => {
            index += 1;
            return(
                <li onClick={(e)=>{reportRedirect(index)}}>Report at {item.createdAt}</li>
            );
        }));
    }
    return(
        <div>
            <h1>Device #{device.serialNumber}</h1>
            {device.connected ? <p>connected</p>:<p>disconnected</p>}
            <p>Battery: {device.battery}</p>
            {device.pumpStatus ? <p>pumpStatus: working</p>:<p>pumpStatus: failed</p>}
            {device.fiveRegulator ? <p>fiveRegulator: working</p>:<p>fiveRegulator: failed</p>}
            <p>sampleRate: {device.sampleRate}</p>
            <ul>
                {listReports()}
            </ul>
        </div>
    )
}