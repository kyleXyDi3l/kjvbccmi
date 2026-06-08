import { useState, useEffect } from "react";
import { supabase } from "../supabase-client";
//import { Session } from '@supabase/supabase-js';

export default function TaskManager({ session }) {
  const [newTasks, setNewTasks] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState([]);
  const [newDescription, setNewDescription] = useState("");
  const [userRole, setUserRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("New Task:", newTasks);
    console.log("User Session:", session);

    // Here you would typically send the new task to your backend or database
    const { error } = await supabase
      .from("tasks")
      .insert({ ...newTasks, email: session.user.email });

    if (error) {
      console.error("Error adding task:", error.message);
      return;
    }

    setNewTasks({ title: "", description: "" }); // Clear the form after submission
  };

  const handleDelete = async (taskId) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error.message);
      return;
    }
    // Refresh from DB
    fetchTasks();
  };

  const handleUpdate = async (taskId) => {
    const { error } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", taskId);

    if (error) {
      console.error("Error editing task:", error.message);
      return;
    }
    // Refresh from DB
    fetchTasks();
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching tasks:", error.message);
      return;
    }
    setTasks(data);
    //console.log('Fetched Tasks:', data);
  };

  const getUserRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("Fetched User:", user.id);

    if (!user) {
      console.error("No user found");
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (error) {
      console.error("Error fetching user role:", error.message);
      return;
    }
    console.log("User Role:", data.role);
    return data.role;
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      const userRole = await getUserRole();
      setUserRole(userRole);
    };
    fetchRole();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("tasks-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          const newTask = payload.new;
          setTasks((prevTasks) => [newTask, ...prevTasks]);
        },
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      <h1>Task Manager</h1>
      <p>
        Hi! {userRole} {session.user.email}
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          value={newTasks.title}
          onChange={(e) => setNewTasks({ ...newTasks, title: e.target.value })}
          placeholder="Enter a new task Title..."
        />
        <textarea
          value={newTasks.description}
          onChange={(e) =>
            setNewTasks({ ...newTasks, description: e.target.value })
          }
          placeholder="Enter Task Description..."
        />
        <button type="submit">Add Task</button>
      </form>

      <div style={{ marginTop: "2rem" }}>
        <h2>Existing Tasks</h2>
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {tasks.map((task) => (
            <li
              style={{ border: "1px solid #ccc", padding: "0.5rem" }}
              key={task.id}
            >
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <textarea
                style={{ width: "100%", height: "100px" }}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <button onClick={() => handleDelete(task.id)}>Delete Task</button>
              <button onClick={() => handleUpdate(task.id)}>Update Task</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
