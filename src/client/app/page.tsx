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
  const [subTile, setSubTitle] = useState("Sign in to your account");

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

  // Approach: Once server restarts, verify the token is valid with the server. If not, remove the token.
  async function initializetoken() {
    const pwtoken = localStorage.getItem("PoolWatchtoken");

    if (pwtoken) {
      try {
      const res = await fetch("/account/login", {
        headers: { Authorization: `Bearer ${pwtoken}`}
      });

      if (!res.ok) {
        // invalid token will be removed
        localStorage.removeItem("PoolWatchtoken");
      }
    } catch (err) {
        // provide a message on the backend indicating an error has occured 
      console.error("Error validating token:", err);
      localStorage.removeItem("PoolWatchtoken")
    }
  } 
}  

  async function onsubmit(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) {
    e.preventDefault();
    const formRequest = {...form};
    if (registering) {
      if(form.password != form.checkPassword){
        setErrorMsg("Passwords do not match");
        return;
      }
      if(form.password.length < 8){
        setErrorMsg("Passwords must be 8 or more characters");
        return;
      }
      if(!(/[A-Z]/.test(form.password))){
        setErrorMsg("Passwords must contain at least one Capital letter");
        return;
      }
      if(!(/\d/.test(form.password))){
        setErrorMsg("Passwords must contain at least one number");
        return;
      }
      if(form.username.length < 3){
        setErrorMsg("username must be at least 3 characters");
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

  function changeFunction(state:Boolean){
    setErrorMsg("");
    if (state){
      setRegistering(true);
      setSubTitle("Register an account");
    } else {
      setRegistering(false);
      setSubTitle("Sign in to your account");
    }
  }

  function promptType() {
    if (registering){
      return(
        <div>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form action="#" method="POST" className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">Username</label>
                <div className="mt-2">
                  <input id="username" value={form.username} onChange={(e) => updateForm({username: e.target.value})} type="username" name="username" required autoComplete="usename" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">Password</label>
                </div>
                <div className="mt-2">
                  <input id="password" value={form.password} onChange={(e) => updateForm({password: e.target.value})} type="password" name="password" required autoComplete="current-password" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="repassword" className="block text-sm/6 font-medium text-gray-100">Reenter Password</label>
                </div>
                <div className="mt-2">
                  <input id="password" value={form.checkPassword} onChange={(e) => updateForm({checkPassword: e.target.value})} type="password" name="repassword" required className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                </div>
              </div>

              <div>
                <button onClick={(e)=>{onsubmit(e)}} type="submit" className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Register</button>
              </div>
            </form>
            <p className="mt-10 text-center text-sm/6 text-gray-400">{errorMsg}</p>
            <p className="mt-10 text-center text-sm/6 text-gray-400">
              Already a member? 
              <p onClick={(e)=>changeFunction(false)} className="font-semibold text-indigo-400 hover:text-indigo-300">Sign In Here</p>
            </p>
          </div>
        </div>
      )
    } else {
      return(
        <div>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" method="POST" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">Username</label>
              <div className="mt-2">
                <input id="username" value={form.username} onChange={(e) => updateForm({username: e.target.value})} type="username" name="username" required autoComplete="usename" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">Password</label>
              </div>
              <div className="mt-2">
                <input id="password" value={form.password} onChange={(e) => updateForm({password: e.target.value})} type="password" name="password" required autoComplete="current-password" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
              </div>
            </div>

            <div>
              <button onClick={(e)=>{onsubmit(e)}} type="submit" className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Sign in</button>
            </div>
          </form>
          <p className="mt-10 text-center text-sm/6 text-gray-400">{errorMsg}</p>
          <p className="mt-10 text-center text-sm/6 text-gray-400">
            Not a member? 
            <p onClick={(e)=>changeFunction(true)} className="font-semibold text-indigo-400 hover:text-indigo-300">Register Here</p>
          </p>
        </div>
      </div>
      )
    }
  }

  return (
    <div>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h1 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">PoolsWatch</h1>
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">{subTile}</h2>
        </div>

        {promptType()}
      
      </div>
      <p>{}</p>
    </div>
  );
}
