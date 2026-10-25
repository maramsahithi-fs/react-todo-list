import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDiscription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const totalTasks = todos.length;
  const completedTasks = todos.filter(
    (todo) => Boolean(todo.isDone ?? todo.isComplete)
  ).length;
  const pendingTasks = totalTasks - completedTasks;
   
  //GET
  async function fetchTodos() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          "https://api.freeapi.app/api/v1/todos/"
        );
        if(!response.ok) {
          throw new Error("Could not load tasks");
        }
        const result = await response.json();
        setTodos(result.data || []);
       } catch(err) {
        setError(err.message);
       } finally {
        setLoading(false);
       }
    }

    //POST
    async function addTodo(e) {
      e.preventDefault();
      if(!title.trim()) {
        setError("Please enter a task title.");
        return;
      }
      try {
        setError("");
        const response = await fetch(
          "https://api.freeapi.app/api/v1/todos/",
          {
            method: "POST",
            headers: {
              'Content-Type': "application/json",
            },
            body: JSON.stringify({
              title: title.trim(),
              description: description.trim(),
            }),
          }
        );

        const result = await response.json();
        if(!response.ok) {
          throw new Error(result.message || "Could not add task.");
        }

        setTitle("");
        setDiscription("");

        await fetchTodos();
      } catch(err) {
        setError(err.message);
      }
    }

    //PATCH
    async function toggleTodo(todo) {
      try {
        setError("");
        const response = await fetch(
          `https://api.freeapi.app/api/v1/todos/toggle/status/${todo._id}`,
          {
            method: "PATCH",
          }
        );

        const result = await response.json();
        if(!response.ok) {
          throw new Error(result.message || "Could not update task.");
        }

        await fetchTodos();
      } catch (err) {
        setError(err.message);
      }
    }

    //DELETE
    async function deleteTodo(todoId) {
      try {
        setError("");
        const response = await fetch(
          `https://api.freeapi.app/api/v1/todos/${todoId}`,
          {
            method: "DELETE",
          }
        );

        if(!response.ok) {
          const result = await response.json();
          throw new Error(result.message || "Could not delete task.");
        }
        await fetchTodos();
      } catch(err) {
        setError(err.message);
      }
    }

    async function getTodoById(todoId) {
      try {
        setError("");
        const response = await fetch(
          `https://api.freeapi.app/api/v1/todos/${todoId}`
        );

        const result = await response.json();
        if(!response.ok) {
          throw new Error(result.message || "Could not fetch task.");
        }

        console.log("Single todo: " , result.data);
        return result.data;
      }catch (err) {
        setError(err.message);
        return null;
      }
    }

    async function updateTodo(todoId, updatedTitle, updatedDescription) {
      try {
        setError("") ;
        const response = await fetch(
          `https://api.freeapi.app/api/v1/todos/${todoId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: updatedTitle,
              description: updatedDescription,
            }),
          }
        );

        const result = await response.json();
        if(!response.ok) {
          throw new Error(result.message || "Could not update task.");
        }

        await fetchTodos();
        return result.data;
      } catch(err){
        setError(err.message);
        return null;
      }
    }
  
    useEffect(() => {
     fetchTodos();
    }, []);

  return (
   <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
       <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div> 

    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
      TaskFlow
    </h1>

    <p className="mt-2 text-slate-400">
      Organize your day, one task at a time.
    </p>
  </div>

  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
    <p className="text-sm text-slate-400">Stay focused</p>
    <p className="mt-1 font-semibold text-white">
      One task at a time ✨
    </p>
  </div>
</div>

        <form onSubmit={addTodo} className='mb-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-lg sm:p-6'>
          <input
          type='text'
          placeholder='Enter task title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className='w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'
          />

          <textarea
          placeholder='Enter task description (optional)'
          value={description}
          onChange={(e) => setDiscription(e.target.value)}
          className='w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'
          rows= "3"
          />

          <button
          type='submit'
          className='rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700'
          >
            Add Task
          </button>
        </form>

        <button
        onClick={fetchTodos}
        className='mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10'
        >
          Refresh Tasks
        </button>
        {
          loading && (
            <p className="text-slate-500">Loading tasks...</p>
          )
        }
        {
          error && (
            <p className="text-red-600">Error : {error}</p>
          )
        }
        {
          !loading && !error && todos.length === 0 && (
            <p className="rounded-lg bg-slate-50 p-4 text-slate-500">No tasks Found.</p>
          )
        }

        <div className='mb-6'> 
          <h2 className='mb-3 text-lg font-semibold text-white'>
            Your Overview
          </h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <div className='rounded-xl border border-indigo-400/20 bg-indigo-400/10 p-4'>
                <p className='text-sm text-indigo-200'>Total Tasks</p>
                <p className='mt-2 text-3xl font-bold text-white'>{totalTasks}</p>
            </div>
            <div className='rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4'>
                <p className='text-sm text-emerald-200'>Completed Tasks</p>
                <p className='mt-2 text-3xl font-bold text-white'>{completedTasks}</p>
            </div>
            <div className='rounded-xl border border-amber-400/20 bg-amber-400/10 p-4'>
                <p className='text-sm text-amber-200'>Pending Tasks</p>
                <p className='mt-2 text-3xl font-bold text-white'>{pendingTasks}</p>
            </div>
          </div>
        </div>

        <ul className='space-y-3'>
          {
            todos.map((todo) => (
              <li
              key = {todo._id}
              className='flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md'
              >
              <input 
               type='checkbox'
               checked = {Boolean(todo.isDone ?? todo.isComplete)}
               onChange={() => toggleTodo(todo)}
               className='mt-1 h-5 w-5 accent-indigo-600'
             />

             <div className='min-w-0 flex-1'>
                <p
                className={`break-words font-semibold
                  ${(todo.isDone ?? todo.isComplete)
                   ? "text-slate-400 line-through"
                   : "text-slate-800"
                   }` }
                >
                  {todo.title}
                </p>

                {todo.description && (
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {todo.description}
                  </p>
                )}
                <span
                className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium 
                  ${(todo.isDone ?? todo.isComplete)
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
                }`}
                >
                  {(todo.isDone ?? todo.isComplete) ? "Completed" : "Pending"}
                </span>

                <div className='mt-3 flex flex-wrap gap-2'>
                <button
                type='button'
                onClick={async () => {
                  try{
                  const fetchedTodo = await getTodoById(todo._id);
                  if(fetchedTodo) {
                    setEditingId(fetchedTodo._id);
                    setEditTitle(fetchedTodo.title || "");
                    setEditDescription(fetchedTodo.description || "")
                  }
                }catch (err){
                  setError(err.message || "Could not load task.");
                }
                }}
                className='inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100'>
                  <span>✏️</span> Edit
                </button>

                  <button
                onClick={() => deleteTodo(todo._id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  <span>🗑️</span> Delete
                </button>
                 </div>

                {
                  editingId === todo._id && (
                    <form
                    className='mt-4 space-y-3 rounded-xl bg-slate-50 p-3'
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const updated = await updateTodo(
                        todo._id,
                        editTitle.trim(),
                        editDescription.trim()
                      );
                      if(updated) {
                        setEditingId(null);
                      }
                    }}
                    >
                      <input
                      type='text'
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder='Edit task title'
                      required
                      className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                      />

                      <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder='Edit task description'
                      rows={3}
                      className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                      />

                      <div className="flex flex-wrap gap-2">

                      <button type = "submit"
                      className='rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700'>
                        Save Changes
                      </button>

                      <button
                      type='button'
                      onClick={() => setEditingId(null)}
                      className='rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300'
                      >
                        Cancel
                      </button>
                      </div>
                    </form>
                  )
                }
                </div> 
              </li>
            ))
          }
        </ul>
      </div>
    </div> 
  );
}

export default App;
