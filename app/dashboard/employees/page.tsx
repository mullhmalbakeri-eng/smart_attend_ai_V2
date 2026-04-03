'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  Building2, 
  QrCode, 
  Plus, 
  X, 
  UserPlus,
  Activity,
  CheckCircle,
  TrendingUp,
  Settings,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Employee {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: string;
  department: {
    id: number;
    name: string;
    manager: string;
  };
  createdAt: string;
}

interface Department {
  id: number;
  name: string;
  manager: string;
}

interface FormData {
  name: string;
  email: string;
  departmentId: string;
}

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeNow, setActiveNow] = useState(0);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    departmentId: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    simulateActiveUsers();
    checkSystemHealth();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const simulateActiveUsers = () => {
    const interval = setInterval(() => {
      setActiveNow(Math.floor(Math.random() * 5) + 3);
    }, 5000);
    return () => clearInterval(interval);
  };

  const checkSystemHealth = () => {
    const interval = setInterval(() => {
      const statuses: Array<'healthy' | 'warning' | 'error'> = ['healthy', 'healthy', 'healthy', 'warning'];
      setSystemStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 10000);
    return () => clearInterval(interval);
  };

  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.departmentId) {
      alert('جميع الحقول مطلوبة');
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add employee');
      }

      const newEmployee = await response.json();
      setEmployees([...employees, newEmployee]);
      setFilteredEmployees([...filteredEmployees, newEmployee]);
      
      // Reset form
      setFormData({ name: '', email: '', departmentId: '' });
      setShowAddModal(false);
      
      alert('تم إضافة الموظف بنجاح');
      
    } catch (error: any) {
      setFormError(error.message);
      alert(`خطأ: ${error.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="h-full bg-slate-950 text-slate-50 overflow-hidden">
      {/* Header with Stats */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-50">إدارة الموظفين</h1>
              <p className="text-slate-400 mt-1">إدارة وتتبع موظفي شركة الاتحاد</p>
            </div>
            
            {/* Stats Ribbon */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse bg-white/5 backdrop-blur-lg px-4 py-2 rounded-lg border border-slate-800">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-50">Total: {filteredEmployees.length}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse bg-white/5 backdrop-blur-lg px-4 py-2 rounded-lg border border-slate-800">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-50">Active: {activeNow}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse bg-white/5 backdrop-blur-lg px-4 py-2 rounded-lg border border-slate-800">
                <CheckCircle className={`h-4 w-4 ${
                  systemStatus === 'healthy' ? 'text-emerald-400' :
                  systemStatus === 'warning' ? 'text-yellow-400' : 'text-red-400'
                }`} />
                <span className="text-sm font-medium text-slate-50 capitalize">{systemStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Search and Add Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث عن موظف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-white/5 backdrop-blur-lg border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-50 placeholder-slate-400"
                dir="rtl"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 space-x-reverse bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-600/25"
            >
              <UserPlus className="h-5 w-5" />
              <span>إضافة موظف</span>
            </motion.button>
          </div>
        </div>

        {/* Employee Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-slate-800 animate-pulse">
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  <div className="h-12 w-12 bg-slate-800 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-800 rounded mb-2"></div>
                    <div className="h-3 bg-slate-800 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredEmployees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  {/* Employee Header */}
                  <div className="flex items-center space-x-3 space-x-reverse mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {getInitials(employee.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-50">{employee.name}</h3>
                      <p className="text-sm text-slate-400">{employee.department.name}</p>
                    </div>
                  </div>

                  {/* Employee Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-slate-400">البريد:</span>
                      <span className="text-slate-50 mr-2 truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-slate-400">الانضمام:</span>
                      <span className="text-slate-50 mr-2">
                        {new Date(employee.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                      نشط
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 space-x-reverse">
                    <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center space-x-1 space-x-reverse text-sm transition-colors">
                      <QrCode className="h-3 w-3" />
                      <span>QR</span>
                    </button>
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors">
                      تعديل
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-lg p-6 w-full max-w-md border border-slate-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-50">إضافة موظف جديد</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center space-x-2 space-x-reverse">
                  <AlertCircle className="h-4 w-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-50 placeholder-slate-400"
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-50 placeholder-slate-400"
                    placeholder="email@etihad.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    القسم
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-50"
                  >
                    <option value="" className="bg-slate-900">اختر القسم</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id} className="bg-slate-900">
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 space-x-reverse mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={formLoading}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      جاري الإضافة...
                    </>
                  ) : (
                    'إضافة موظف'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
