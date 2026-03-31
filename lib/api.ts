// lib/api.ts
import type { User, Department, AttendanceEntry } from "@/types";

// Users
export async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/users", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch users");
  
  // Error handling for non-JSON responses
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Received non-JSON response from /api/users:", text);
    throw new Error("السيرفر أرسل استجابة غير صالحة (HTML بدلاً من JSON) من /api/users");
  }
  
  return res.json();
}

export async function createUser(data: {
  name: string;
  email: string;
  role?: string;
  departmentId?: number | null;
}) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to create user");
  }
  return res.json();
}

export async function updateUser(
  id: number,
  data: { name?: string; email?: string; role?: string; departmentId?: number | null }
) {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to update user");
  }
  return res.json();
}

export async function deleteUser(id: number) {
  const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to delete user");
  }
  return res.json();
}

// Departments
export async function getDepartments(): Promise<Department[]> {
  const res = await fetch("/api/departments", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch departments");
  
  // Error handling for non-JSON responses
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Received non-JSON response from /api/departments:", text);
    throw new Error("السيرفر أرسل استجابة غير صالحة (HTML بدلاً من JSON) من /api/departments");
  }
  
  const data = await res.json();
  return data.map((d: Department & { _count?: { users: number } }) => ({
    id: d.id,
    name: d.name,
    manager: d.manager,
  }));
}

export async function createDepartment(data: { name: string; manager: string }) {
  const res = await fetch("/api/departments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? "Failed to create department"
    );
  }
  return res.json();
}

export async function updateDepartment(
  id: number,
  data: { name?: string; manager?: string }
) {
  const res = await fetch(`/api/departments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? "Failed to update department"
    );
  }
  return res.json();
}

export async function deleteDepartment(id: number) {
  const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? "Failed to delete department"
    );
  }
  return res.json();
}

// Attendance
export async function getAttendance(): Promise<AttendanceEntry[]> {
  const res = await fetch("/api/attendance", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch attendance");
  
  // Error handling for non-JSON responses
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Received non-JSON response from /api/attendance:", text);
    throw new Error("السيرفر أرسل استجابة غير صالحة (HTML بدلاً من JSON) من /api/attendance");
  }
  
  return res.json();
}

export async function createAttendance(data: { userId: number; requestedType?: "In" | "Out" }) {
  try {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId: data.userId, 
        date: new Date().toISOString() // Send current date/time
      }),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // For 400 errors, show server message instead of generic error
      if (res.status === 400 && (err as { message?: string }).message) {
        throw new Error((err as { message?: string }).message);
      }
      // Handle rate limiting specifically
      if (res.status === 400 && (err as { error?: string }).error && (err as { error?: string }).error?.includes('الرجاء الانتظار')) {
        throw new Error((err as { error?: string }).error);
      }
      throw new Error((err as { error?: string }).error ?? "Failed to create attendance");
    }
    return res.json();
  } catch (error) {
    // Re-throw known errors, wrap unknown ones
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error occurred while creating attendance");
  }
}
