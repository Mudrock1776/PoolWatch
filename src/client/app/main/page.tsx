'use client';
import { MouseEvent, useEffect, useState } from "react";
import { redirect } from 'next/navigation';

export default function Page(){
    const [devices, setDevices] = useState<any[]>([]);
    const [serialNumberForm, setSerialNumberForm] = useState(0);
    
    useEffect(() => {
        async function loadDevices() {
            const tokenString = sessionStorage.getItem("PoolWatchtoken");
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
        const tokenString = sessionStorage.getItem("PoolWatchtoken");
        if (tokenString == null){
            redirect("/");
        }
        loadDevices();
    }, [devices.length])

    async function onsubmit(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>){
        e.preventDefault();
        const tokenString = sessionStorage.getItem("PoolWatchtoken");
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
        // const res2 = await fetch("/device/list", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //         id: tokenString
        //     })
        // });
        // let loadedDevices = await res2.json();
        // setDevices(loadedDevices);
    }

    function list(){
        return devices.map((device) => {
            return(
                <li>{device.serialNumber}</li>
            )
        })
    }

    return(
        <div>
            <h1>Main</h1>
            <form>
                <label>Serial Number:</label><input type="number" value={serialNumberForm} onChange={(e) => setSerialNumberForm(parseInt(e.target.value))}/><button onClick={(e)=>{onsubmit(e)}}>Add Device</button>
            </form>
            <ul>
                {list()}
            </ul>
        </div>
    )
}