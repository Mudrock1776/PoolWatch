'use client';
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import TopMenu from "../ui/TopMenu";
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
            <TopMenu serialNumber={device.serialNumber} testTaken={device.reports[deviceReport].testTaken}/>
            <div className="ml-6 mt-2">
                <h1 className="text-white underline text-xl">Results</h1>
                <p className="text-white">Chlorine Concentration: {device.reports[deviceReport].ClCon}</p>
                <p className="text-white">Phosphate Concentration: {device.reports[deviceReport].PCon}</p>
                <p className="text-white">Temperature: {device.reports[deviceReport].tempature}</p>
                <p className="text-white">Particulate Amount: {device.reports[deviceReport].particulateAmount}</p>
                <p className="text-white">Particulate Size: {device.reports[deviceReport].particulateSize}</p>
            </div>
        </div>
    )
}