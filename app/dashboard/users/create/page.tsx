"use client";
import { useState, useEffect } from "react";
import { getDepartments } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function CreateUserPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState<number | "">("");

  useEffect(() => {
    async function loadDepartments() {
      setDepartments(await getDepartments());
    }
    loadDepartments();
  }, []);

  const handleSubmit = async () => {
    await fetch("http://127.0.0.1:8000/users/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email,
        role: "student",
        password: "123456",
        department_id: Number(departmentId)
      }),
    });
    alert("User created!");
    window.location.href = "/dashboard/users";
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Create User</h1>

      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <select
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : "")}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Department</option>
        {departments.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>

      <Button onClick={handleSubmit}>Save User</Button>
    </div>
  );
}