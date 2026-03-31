"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { PlusIcon, Edit2Icon, Trash2Icon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Department {
  id: number;
  name: string;
  manager: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: "", manager: "" });
  const { addToast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      addToast({ title: "خطأ", description: "فشل تحميل الأقسام", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDept ? `/api/departments/${editingDept.id}` : "/api/departments";
      const method = editingDept ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        addToast({ 
          title: "نجاح", 
          description: `تم ${editingDept ? "تحديث" : "إنشاء"} القسم بنجاح`, 
          type: "success" 
        });
        setDialogOpen(false);
        setEditingDept(null);
        setFormData({ name: "", manager: "" });
        fetchDepartments();
      } else {
        throw new Error("فشل الحفظ");
      }
    } catch (error) {
      addToast({ title: "خطأ", description: "فشل حفظ القسم", type: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({ title: "نجاح", description: "تم حذف القسم بنجاح", type: "success" });
        fetchDepartments();
      } else {
        throw new Error("فشل الحذف");
      }
    } catch (error) {
      addToast({ title: "خطأ", description: "فشل حذف القسم", type: "error" });
    }
  };

  const openEditDialog = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, manager: dept.manager });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الأقسام</h1>
          <p className="text-gray-600 mt-1">إدارة أقسام الشركة والموظفين</p>
        </div>
        <Button 
          onClick={() => setDialogOpen(true)} 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">إضافة قسم جديد</span>
        </Button>
      </div>

      {/* Professional Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-right font-semibold text-gray-900 py-4 px-6">اسم القسم</TableHead>
              <TableHead className="text-right font-semibold text-gray-900 py-4 px-6">المدير المسؤول</TableHead>
              <TableHead className="text-center font-semibold text-gray-900 py-4 px-6">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept) => (
              <TableRow key={dept.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell className="py-4 px-6">
                  <div className="font-medium text-gray-900">{dept.name}</div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="text-gray-700">{dept.manager}</div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(dept)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                      <Edit2Icon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">تعديل</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(dept.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border-red-300 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                    >
                      <Trash2Icon className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">حذف</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Professional Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-xl border-gray-200 shadow-xl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editingDept ? "تعديل قسم" : "إضافة قسم جديد"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              أدخل معلومات القسم أدناه
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                اسم القسم
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="مثال: قسم التطوير"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                المدير المسؤول
              </label>
              <input
                type="text"
                required
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="مثال: أحمد محمد"
              />
            </div>
            <DialogFooter className="flex justify-end gap-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="px-6 py-3 rounded-xl border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                إلغاء
              </Button>
              <Button 
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                {editingDept ? "تحديث القسم" : "إنشاء القسم"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
