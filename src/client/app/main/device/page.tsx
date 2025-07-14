'use client';
import { useEffect, useState, MouseEvent } from "react";
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

    function listReports(){
        var index = -1;
        return(device.reports.map((item:any) => {
            index += 1;
            const curIndex = index;
            return(
                <li onClick={(e)=>{reportRedirect(curIndex)}}>Report at {item.testTaken}</li>
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
            {device.twelveRegulator ? <p>twelveRegulator: working</p>:<p>twelveRegulator: failed</p>}
            <p>sampleRate: {device.sampleRate}</p>
            <button onClick={(e)=>{requestTest(e, "Chlorine")}}>Test Chlorine</button>
            <button onClick={(e)=>{requestTest(e, "Phoshate")}}>Test Phosphate</button>
            <button onClick={(e)=>{requestTest(e, "Tempature")}}>Test Tempature</button>
            <button onClick={(e)=>{requestTest(e, "Particulate")}}>Test Particulate</button>
            <ul>
                {listReports()}
            </ul>
        </div>
    )
}