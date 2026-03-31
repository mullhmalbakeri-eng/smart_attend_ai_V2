"use client";
import { useEffect, useState } from "react";
import { Building2, UserCog, Users, Plus, Loader2, X, Edit3, Trash2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
  manager: string;
  createdAt: string;
  _count?: {
    users: number;
  };
}

export default function DepartmentsTable() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: '', manager: '' });
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        setDepartments(data);
        setLoading(false);
      });
  }, []);

  const handleAddDepartment = async () => {
    if (!newDepartment.name || !newDepartment.manager) {
      return;
    }

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDepartment),
      });

      if (response.ok) {
        const newDept = await response.json();
        setDepartments([...departments, newDept]);
        setNewDepartment({ name: '', manager: '' });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
    setNewDepartment({ name: dept.name, manager: dept.manager });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment || !newDepartment.name || !newDepartment.manager) {
      return;
    }

    try {
      const response = await fetch(`/api/departments/${editingDepartment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDepartment),
      });

      if (response.ok) {
        const updatedDept = await response.json();
        setDepartments(departments.map(dept => 
          dept.id === editingDepartment.id ? { ...dept, ...updatedDept } : dept
        ));
        setNewDepartment({ name: '', manager: '' });
        setEditingDepartment(null);
        setIsEditMode(false);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  const handleDeleteDepartment = async (dept: Department) => {
    if (!confirm(`هل أنت متأكد من حذف قسم "${dept.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/departments/${dept.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDepartments(departments.filter(d => d.id !== dept.id));
      } else {
        const error = await response.json();
        alert(error.message || "فشل حذف القسم. قد يكون هناك موظفين مرتبطين به.");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("حدث خطأ أثناء حذف القسم");
    }
  };

  const openAddModal = () => {
    setNewDepartment({ name: '', manager: '' });
    setEditingDepartment(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setNewDepartment({ name: '', manager: '' });
    setEditingDepartment(null);
    setIsEditMode(false);
    setIsModalOpen(false);
  };

  const handleSubmit = () => {
    if (isEditMode) {
      handleUpdateDepartment();
    } else {
      handleAddDepartment();
    }
  };

  if (loading) return (
    <div className="p-8 text-center flex flex-col items-center gap-3">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
      <p className="text-gray-500 dark:text-gray-400">جاري تحميل الأقسام...</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-800 transition-all">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Building2 className="text-emerald-600 dark:text-emerald-400" /> إدارة الأقسام
        </h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} /> قسم جديد
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold text-right">اسم القسم</th>
              <th className="px-6 py-4 font-semibold text-right">مدير القسم</th>
              <th className="px-6 py-4 font-semibold text-right">عدد الموظفين</th>
              <th className="px-6 py-4 font-semibold text-right">تاريخ التأسيس</th>
              <th className="px-6 py-4 font-semibold text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {departments.map((dept: Department) => (
              <tr key={dept.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Building2 size={20} />
                    </div>
                    <div className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {dept.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <UserCog size={16} className="text-gray-400" />
                    {dept.manager}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 max-w-[100px]">
                      <div 
                        className="bg-emerald-500 h-1.5 rounded-full" 
                        style={{ width:` ${(dept._count?.users || 0) * 10}% `}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1"> <Users size={14} /> {dept._count?.users || 0}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {dept.createdAt ? new Date(dept.createdAt).toLocaleDateString('ar-EG') : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEditDepartment(dept)}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteDepartment(dept)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Building2 className="text-emerald-600 dark:text-emerald-400" />
                {isEditMode ? "تعديل القسم" : "إضافة قسم جديد"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم القسم
                </label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white transition-all"
                  placeholder="أدخل اسم القسم"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مدير القسم
                </label>
                <input
                  type="text"
                  value={newDepartment.manager}
                  onChange={(e) => setNewDepartment({ ...newDepartment, manager: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white transition-all"
                  placeholder="أدخل اسم مدير القسم"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20"
              >
                {isEditMode ? "تحديث القسم" : "إضافة القسم"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}