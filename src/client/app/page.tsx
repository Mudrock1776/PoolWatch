'use client';
import { MouseEvent, useState, useEffect } from "react";
import { redirect } from 'next/navigation';

export default function Home() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    checkPassword: ""
  })
  const [registering, setRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function updateForm(value: { username?: string; password?: string; checkPassword?: string; }){
    return setForm((prev) => {
      return{...prev, ...value};
    });
  }

  useEffect(() => {
    const tokenString = localStorage.getItem("PoolWatchtoken");
    if (tokenString != null){
      redirect("/main");
    }
  });

  async function onsubmit(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) {
    e.preventDefault();
    const formRequest = {...form};
    if (registering) {
      if(form.password != form.checkPassword){
        setErrorMsg("Passwords do not match");
        return;
      }
      const res = await fetch("/account/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formRequest)
      });
      if (res.status == 403) {
        setErrorMsg("Username Taken");
        return;
      } else if (res.status == 400){
        setErrorMsg("Something went wrong with the server");
        return;
      } else {
        let token = await res.json();
        localStorage.setItem('PoolWatchtoken', token.token);
        redirect("/main");
      }
    } else {
      const res = await fetch("/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formRequest)
      });
      if (res.status == 401) {
        setErrorMsg("Invalid Credentials");
        return;
      } else if (res.status == 400){
        setErrorMsg("Something went wrong with the server");
        return;
      } else {
        let token = await res.json();
        localStorage.setItem('PoolWatchtoken', token.token);
        redirect("/main");
      }
    }
  }

  function promptType() {
    if (registering){
      return(
        <div>
          <h1>Register</h1>
          <form>
            <label>Username:</label><input type="text" value={form.username} onChange={(e) => updateForm({username: e.target.value})}/><br/>
            <label>Password:</label><input type="text" value={form.password} onChange={(e) => updateForm({password: e.target.value})}/><br/>
            <label>Reenter Password:</label><input type="text" value={form.checkPassword} onChange={(e) => updateForm({checkPassword: e.target.value})}/><br/>
            <button onClick={(e)=>{onsubmit(e)}}>Register</button><button onClick={(e)=>{setRegistering(false)}}>Cancel</button>
          </form>
        </div>
      )
    } else {
      return(
        <div>
          <h1>Login</h1>
          <form>
            <label>Username:</label><input type="text" value={form.username} onChange={(e) => updateForm({username: e.target.value})}/><br/>
            <label>Password:</label><input type="text" value={form.password} onChange={(e) => updateForm({password: e.target.value})}/><br/>
            <button onClick={(e)=>{onsubmit(e)}}>Login</button><button onClick={(e)=>{setRegistering(true)}}>Register</button>
          </form>
        </div>
      )
    }
  }

  return (
    <div>
      {promptType()}
      <p>{errorMsg}</p>
    </div>
  );
}
