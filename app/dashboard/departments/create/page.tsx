// app/dashboard/departments/create/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CreateDepartmentPage() {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:8000/departments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to create department");

      alert("Department created!");
      setName("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Department Name"
        className="w-full p-2 border rounded"
        required
      />
      <Button type="submit">Create Department</Button>
    </form>
  );
}