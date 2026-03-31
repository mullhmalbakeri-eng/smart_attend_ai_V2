"use client";

import { useState, useEffect } from "react";
import UsersTable from "@/app/dashboard/components/UsersTable";
import { useToast } from "@/components/ui/toast";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    // Fetch real data from API
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          throw new Error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        addToast({ title: "خطأ", description: "فشل جلب بيانات الموظفين", type: "error" });
        // Fallback to mock data
        setUsers([
          { id: 1, name: "أحمد محمد", email: "ahmed@example.com", department: "IT", phone: "0501234567" },
          { id: 2, name: "فاطمة علي", email: "fatima@example.com", department: "HR", phone: "0507654321" },
          { id: 3, name: "محمد سالم", email: "mohammed@example.com", department: "Finance", phone: "0509876543" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [addToast]);

  if (loading) {
    return (
      <div className="p-10 space-y-8">
        <div className="text-right">
          <h1 className="text-5xl font-black text-gradient">الموظفين</h1>
          <p className="text-xl text-gray-600 mt-3">إدارة بيانات الموظفين</p>
        </div>
        <div className="card p-8">
          <div className="text-center py-16">
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-8 fade-in">
      <div className="text-right">
        <h1 className="text-5xl font-black text-gradient">الموظفين</h1>
        <p className="text-xl text-gray-600 mt-3">إدارة بيانات الموظفين</p>
      </div>

      <div className="card p-8">
        <UsersTable />
      </div>
    </div>
  );
}
