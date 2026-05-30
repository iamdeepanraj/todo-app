"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const { data: session } = authClient.useSession()

  useEffect(() => {
    if (session?.user?.id) {
      fetchTodo();
    }
  }, [session?.user?.id]);

  async function fetchTodo() {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/todos/${session?.user?.id}`);
    setTodos(response.data);
  }
  
  async function addTodo() {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/todos`, {
      title: input,
      completed: false,
    });
    setInput('');
    fetchTodo();
  }

  async function handleToggle(id: number) {
    const todo = todos.find(todo => todo.id === id);
    if (!todo) return;
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/todos/${id}`, {
      completed: !todo.completed,
    });
    fetchTodo();
    setTodos(prevTodos => prevTodos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    }));
  }

  function handleDelete(id: number) {
    const response = axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/todos/${id}`);
    fetchTodo();
  }

  return (
    <>
    
      <div className="flex flex-col items-center h-screen pt-10 gap-10 w-full max-w-md mx-auto">
        
        <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-md">
        <div className="flex items-center gap-4 w-full max-w-md">
          <Input placeholder="Add a new todo" className="h-12 rounded-full" value={input} onChange={(e) => setInput(e.target.value)} />
          <Button className="h-12 rounded-full" onClick={addTodo}>
            <PlusIcon />
            Add Todo
          </Button>
        </div>
        <Separator className="my-8"/>
        <h3 className="text-2xl font-bold my-8 ">List of Todos</h3>
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
          {
            todos.map((todo, index) => (
              <div key={index} className="flex items-center gap-4">
            <Checkbox checked={todo.completed} onCheckedChange={() => handleToggle(todo.id)}/>
            <p className={`flex-1 border-2 border-gray-200 p-2 rounded-md ${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.title}
            </p>
            <Button variant="destructive" size="icon" disabled={todo.completed} onClick={() => handleDelete(todo.id)}>
              <TrashIcon />
            </Button>
          </div>
            ))
          }
        </div>
        </form>
      </div>
    </>
  );
}
