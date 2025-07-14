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
        reports: [{
            createdAt: 0,
            testTaken: 0,
            ClCon: 0,
            PCon: 0,
            tempature: 0,
            particulateAmount: 0,
            particulateSize: "small"
        }]
    });
    const [deviceReport, setDeviceReport] = useState(0)
    useEffect(() => {
        const tokenString = localStorage.getItem("PoolWatchtoken");
        if (tokenString == null){
            redirect("/");
        }
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
        if (device.reports.length > 1) {
            setDeviceReport(Number(sessionStorage.getItem("reportIndex")));
        } else {
            setDeviceReport(0);
        }
        
        console.log(device.reports[deviceReport]);
    }, [device.reports.length, deviceReport]);
    return(
        <div>
            <h1>Report at {device.reports[deviceReport].testTaken}</h1>
            <p>Chlorine Concentration: {device.reports[deviceReport].ClCon}</p>
            <p>Phospahe Concentration: {device.reports[deviceReport].PCon}</p>
            <p>tempature: {device.reports[deviceReport].tempature}</p>
            <p>Particulate Amount: {device.reports[deviceReport].particulateAmount}</p>
            <p>Particulate Size: {device.reports[deviceReport].particulateSize}</p>
        </div>
    )
}