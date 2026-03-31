"use client";
import { useEffect, useState } from "react";
import { 
  User, Building2, Mail, ShieldCheck, 
  Loader2, Edit3, Trash2, UserPlus, 
  X, Save, AlertCircle, Circle,
  Users, CheckCircle, XCircle, TrendingUp, CreditCard
} from "lucide-react";
import IDCardGenerator from "./IDCardGenerator";
import EmployeeCard from "./EmployeeCard";
import SearchUsers from "@/components/SearchUsers";

export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [displayUsers, setDisplayUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "EMPLOYEE", departmentId: "" });
  const [selectedUserForCard, setSelectedUserForCard] = useState<any>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  
  // Ensure attendanceRecords is always an array to prevent crashes
  const safeAttendanceRecords = attendanceRecords || [];
  
  // Handle search results from SearchUsers component
  const handleSearchResult = (searchResults: any[]) => {
    setDisplayUsers(searchResults);
  };

  // Function to get user status based on actual attendance data
  const getUserStatus = (userId: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance records for this user - ensure array is used
    const userRecords = (Array.isArray(attendanceRecords) ? attendanceRecords : []).filter(record => {
      const recordDate = new Date(record.timestamp);
      return record.userId === userId && recordDate >= today;
    });
    
    if (userRecords.length === 0) return 'OUT';
    
    // Get the latest record for today
    const latestRecord = userRecords.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    return latestRecord.type;
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!Array.isArray(users) || users.length === 0) {
      return {
        totalUsers: 0,
        presentCount: 0,
        absentCount: 0,
        attendanceRate: 0
      };
    }

    const presentCount = users.filter(user => getUserStatus(user.id) === 'IN').length;
    const absentCount = users.filter(user => getUserStatus(user.id) === 'OUT').length;
    const attendanceRate = users.length > 0 ? Math.round((presentCount / users.length) * 100) : 0;

    return {
      totalUsers: users.length,
      presentCount,
      absentCount,
      attendanceRate
    };
  };

  const stats = calculateStats();

  // جلب البيانات عند التحميل
  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, dRes, aRes] = await Promise.all([
        fetch(`${window.location.origin}/api/users`),
        fetch(`${window.location.origin}/api/departments`),
        fetch(`${window.location.origin}/api/attendance`)
      ]);
      const uData = await uRes.json();
      const dData = await dRes.json();
      const aData = await aRes.json();
      setUsers(uData);
      setDisplayUsers(uData); // Initialize display users
      setDepartments(dData);
      setAttendanceRecords(aData);
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // دالة الحذف
  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
      try {
        const res = await fetch(`${window.location.origin}/api/users/${id}`, { method: "DELETE" });
        if (res.ok) {
          setUsers(users.filter((u: any) => u.id !== id));
          setDisplayUsers(displayUsers.filter((u: any) => u.id !== id));
        } else {
          alert("فشل الحذف. قد يكون للموظف سجلات حضور مرتبطة.");
        }
      } catch (error) {
        alert("حدث خطأ أثناء الاتصال بالسيرفر");
      }
    }
  };

  // دالة الحفظ (إضافة أو تعديل)
  const handleSave = async () => {
    const method = userToEdit ? "PUT" : "POST";
    const url = userToEdit ? `${window.location.origin}/api/users/${userToEdit.id}` : `${window.location.origin}/api/users`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData(); // تحديث القائمة
      } else {
        const err = await res.json();
        alert(err.error || "حدث خطأ ما");
      }
    } catch (error) {
      alert("خطأ في الشبكة");
    }
  };

  if (loading) return (
    <div className="p-12 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="text-muted-foreground font-medium">جاري مزامنة بيانات الموظفين...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* بطاقة إجمالي الموظفين */}
        <div className="card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">إجمالي الموظفين</p>
            <h4 className="text-xl font-bold text-foreground">{stats.totalUsers}</h4>
          </div>
        </div>

        {/* بطاقة الحاضرين الآن */}
        <div className="card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">حاضر الآن</p>
            <h4 className="text-xl font-bold text-foreground">{stats.presentCount}</h4>
          </div>
        </div>

        {/* بطاقة الغائبين */}
        <div className="card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">خارج المكتب</p>
            <h4 className="text-xl font-bold text-foreground">{stats.absentCount}</h4>
          </div>
        </div>

        {/* بطاقة نسبة الانضباط */}
        <div className="card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">نسبة الحضور اليوم</p>
            <h4 className="text-xl font-bold text-foreground">{stats.attendanceRate}%</h4>
          </div>
        </div>
      </div>

      {/* Search Bar and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <SearchUsers 
            initialUsers={users} 
            onSearchResult={handleSearchResult} 
          />
        </div>
        <button 
          onClick={() => { setUserToEdit(null); setFormData({ name: "", email: "", role: "EMPLOYEE", departmentId: "" }); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
        >
          <UserPlus size={20} /> إضافة موظف
        </button>
      </div>

      {/* Professional Cards Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!Array.isArray(displayUsers) || displayUsers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <User className="w-16 h-16 text-muted-foreground mb-4" />
            <span className="text-muted-foreground text-lg">لا توجد بيانات حالياً</span>
          </div>
        ) : (
          displayUsers.map((user: any) => {
            const status = getUserStatus(user.id);
            return (
              <div key={user.id} className="group card p-5 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {/* مؤشر الحالة العلوي */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${status === 'IN' ? 'bg-green-500 animate-pulse-fast' : 'bg-red-500'}`}></span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {status === 'IN' ? 'داخل المكتب' : 'خارج المكتب'}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center">
                  {/* Avatar بتصميم عصري */}
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg transform group-hover:rotate-6 transition-transform">
                    {user.name.charAt(0)}
                  </div>

                  {/* معلومات الموظف */}
                  <button
                    onClick={() => { setSelectedUserForCard(user); setIsCardModalOpen(true); }}
                    className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors hover:underline"
                  >
                    {user.name}
                  </button>
                  <p className="text-sm text-muted-foreground font-medium px-3 py-1 bg-muted rounded-full">
                    قسم {user.department?.name || "عام"}
                  </p>
                </div>

                {/* Role Badge */}
                <div className="flex justify-center mt-3 mb-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {user.role === 'ADMIN' && <ShieldCheck size={10} />}
                    {user.role}
                  </span>
                </div>

                {/* Email */}
                <div className="text-center mb-4">
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Mail size={12} />
                    {user.email}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => { setSelectedUser(user); setUserToEdit(user); setFormData({ name: user.name, email: user.email, role: user.role, departmentId: user.departmentId || "" }); setIsModalOpen(true); }}
                    className="p-2 hover:bg-blue-50 hover:scale-110 text-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    title="تعديل"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => { setSelectedUserForCard(user); setIsCardModalOpen(true); }}
                    className="p-2 hover:bg-purple-50 hover:scale-110 text-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                    title="عرض البطاقة"
                  >
                    <CreditCard size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 hover:bg-red-50 hover:scale-110 text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* النافذة المنبثقة (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md rounded-3xl shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-black text-foreground">
                {userToEdit ? "تعديل الموظف" : "إضافة موظف"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">  
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">الاسم الكامل</label>
                <input 
                  className="w-full p-3.5 bg-muted border border-input rounded-2xl text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="مثال: أدهم الباقري"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">البريد الإلكتروني</label>
                <input 
                  className="w-full p-3.5 bg-muted border border-input rounded-2xl text-foreground disabled:opacity-50"
                  value={formData.email}
                  disabled={!!userToEdit}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@company.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">الدور</label>
                  <select 
                    className="w-full p-3.5 bg-muted border border-input rounded-2xl text-foreground outline-none"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="EMPLOYEE">موظف</option>
                    <option value="HR">إداري HR</option>
                    <option value="ADMIN">مدير نظام</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">القسم</label>
                  <select 
                    className="w-full p-3.5 bg-muted border border-input rounded-2xl text-foreground outline-none"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                  >
                    <option value="">بدون قسم</option>
                    {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button 
                onClick={handleSave}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                {userToEdit ? "تحديث البيانات" : "إنشاء الحساب"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Card Modal */}
      <EmployeeCard
        user={selectedUserForCard}
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
      />
    </div>
  );
}
