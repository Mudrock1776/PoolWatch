'use client';
import { MouseEvent, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import TopMenu from "../../ui/TopMenu";

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
        when: "",
        sampleRate: 24
    });
    const [errMsg, setErrMsg] = useState("");
    const [settingErrMsg, setSettingErrMsg] = useState("");

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
            updateForm({sampleRate: device.sampleRate});
        }
        getDevice();
        const tokenString = localStorage.getItem("PoolWatchtoken");
        if (tokenString == null){
            redirect("/");
        }
    }, [device.reports.length]);

    function updateForm(value: { type?: string; server?: string; when?: string; sampleRate?: number;}){
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
                when: "",
                sampleRate: form.sampleRate
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

    async function changeSampleRate(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) {
        e.preventDefault();
        const res = await fetch("/device/sample", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
                serialNumber: sessionStorage.getItem("serial"),
                sampleRate: form.sampleRate
            })
        })
        if (res.status == 200){
            setSettingErrMsg("Successfully Updated Device");
        } else {
            setSettingErrMsg("Failed to Updated Device");
        }
    }

    async function deleteNotifier(index:number) {
        const res = await fetch("/notify/remove", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
                serialNumber: sessionStorage.getItem("serial"),
                index: index
            })
        })
        setDevice(await res.json());
    }

    function listReportingServers(){
        var index = 0
        return(device.updateServers.map((item:any)=>{
            var currIndex = index;
            index = index +1;
            return(
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                    <th className="px-6 py-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">{item.server}</th>
                    <td className="px-6 py-4">{item.type}</td>
                    <td className="px-6 py-4">{item.when}</td>
                    <td onClick={(e) =>{deleteNotifier(currIndex)}} className="px-6 py-4">Delete</td>
                </tr>
            )
        }))
    }

    return(
        <div>
            <TopMenu serialNumber={device.serialNumber}/>
            <h1 className="text-white underline text-xl mx-6">Settings</h1>
            <form className="max-w-md mx-6 my-4">
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sample Rate(hours)</label>
                    <input type="number" value={form.sampleRate} onChange={(e) => updateForm({sampleRate: Number(e.target.value)})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="24" required />
                </div>
                <button type="submit" onClick={(e) => changeSampleRate(e)} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Update</button>
                <p className="text-white">{settingErrMsg}</p>
            </form>
            <h1 className="text-white underline text-xl mx-6">Notifications</h1>
            <form className="max-w-sm mx-6 my-4">
                <div className="grid md:grid-cols-2 md:gap-6">
                    <div className="relative z-0 w-full mb-5 group">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Server</label>
                        <input type="text" value={form.server} onChange={(e) => updateForm({server: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Server Type</label>
                        <select value={form.type} onChange={(e) => updateForm({type: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <option value="email">Email</option>
                            <option value="webserver">Web Server</option>
                        </select>
                    </div>
                </div>
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Logic</label>
                    <input type="text" value={form.when} onChange={(e) => updateForm({when: e.target.value})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                </div>
                <button type="submit" onClick={(e) => addUpdateServer(e)} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add</button>
                <p className="text-white">{errMsg}</p>
            </form>
            {(()=>{
                if (device.updateServers.length>0) {
                    return(
                        <div className="relative overflow-x-auto mx-6">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Server</th>
                                        <th scope="col" className="px-6 py-3">Type</th>
                                        <th scope="col" className="px-6 py-3">Logic</th>
                                        <th scope="col" className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listReportingServers()}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            })()}
            
        </div>
    )
}