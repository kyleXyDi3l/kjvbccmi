import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import TaskManager from "./components/taskManager";
import AuthForm from "./components/AuthForm";
import { supabase } from "./supabase-client";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [session, setSession] = useState(null);

  const fetchSession = async () => {
    const curerntSession = await supabase.auth.getSession();
    //console.log("Current Session:", curerntSession);
    setSession(curerntSession.data.session);
  };

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        //console.log("Auth Event:", event, "Session:", session);
        setSession(session);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <>
      {session ? (
        <>
          <button onClick={logOut}>Sign Out</button>
          <TaskManager session={session} />{" "}
        </>
      ) : (
        <AuthForm />
      )}
    </>
  );
}

export default App;
