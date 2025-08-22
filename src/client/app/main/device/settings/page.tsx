'use client';
import { MouseEvent, useEffect, useState } from "react";
import { redirect } from "next/navigation";

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
    const [form, setForm] = useState({
        type: "email",
        server: "",
        when: ""
    });
    const [errMsg, setErrMsg] = useState("");

    useEffect(()=>{
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
    }, [device.reports.length]);

    function updateForm(value: { type?: string; server?: string; when?: string; }){
        return setForm((prev) => {
            return{...prev, ...value};
        });
    }

    async function addUpdateServer(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) {
        e.preventDefault();
        if (form.server.length <= 0){
            setErrMsg("Target must be present");
            return;
        }
        if (form.when.length <= 0){
            setErrMsg("There must be some kind of logical check");
            return;
        }
        let n = 0;
        var logic = form.when.replace(/ /g, "").toUpperCase();
        let variable = "";
        while (n < logic.length){
            if (logic[n] == '<' || logic[n] == '>' || logic[n] == '=') {
                break;
            }
            variable += logic[n];
            n++
        }
        if (n == logic.length){
            setErrMsg("Unrecognizable logic statement");
            return;
        }
        if(!(variable == "TEMP" || variable == "CLCON" || variable == "PCON" || variable == "PARTA" || variable == "PARTS")){
            setErrMsg("Unrecognized Variable: "+variable);
            return;
        }
        if(logic[n] == "="){
            if (logic[n+1] == ">") {
                logic = logic.replace("=>", ">=");
            }
            if (logic[n+1] == "<") {
                logic = logic.replace("=<", "<=");
            }
            if (logic[n+1] == "="){
                logic = logic.replace("==", "=");
            }
        }
        const res = await fetch("/notify/add", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
                serialNumber: sessionStorage.getItem("serial"),
                updateServer:{
                    type: form.type,
                    server: form.server,
                    when: logic
                }
            })
        })
        if (res.status == 200){
            setErrMsg("");
            setForm({
                type: "email",
                server: "",
                when: ""
            });
            const res2 = await fetch("/device/fetch", {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    serialNumber: sessionStorage.getItem("serial")
                })
            });
            setDevice(await res2.json());
        } else {
            setErrMsg("There was A problem with the server");
        }
    }

    function listReportingServers(){
        return(device.updateServers.map((item:any)=>{
            return(<li>Type: {item.type} Location: {item.server} When: {item.when}</li>)
        }))
    }

    return(
        <div>
            <h1>Device #{device.serialNumber} Settings</h1>
            <form>
                <label>Server:</label><input type="text" value={form.server} onChange={(e) => updateForm({server: e.target.value})} />
                <label>Type:</label><select value={form.type} onChange={(e) => updateForm({type: e.target.value})}>
                    <option value="email">Email</option>
                    <option value="webserver">Web Server</option>
                </select>
                <label>Logic:</label><input type="text" value={form.when} onChange={(e) => updateForm({when: e.target.value})} />
                <button onClick={(e)=> addUpdateServer(e)}>Add</button>
            </form>
            <p>{errMsg}</p>
            <ul>
                {listReportingServers()}
            </ul>
        </div>
    )
}