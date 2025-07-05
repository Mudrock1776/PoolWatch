'use client';
import { useEffect } from "react";
import { redirect } from 'next/navigation';
export default function Page(){
    useEffect(() => {
        const tokenString = sessionStorage.getItem("PoolWatchtoken");
        if (tokenString == null){
            redirect("/");
        }
    })
    return(
        <div>
            <h1>Main</h1>
        </div>
    )
}