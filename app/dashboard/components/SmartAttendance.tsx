"use client";
import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { useToast } from "@/components/ui/toast";
import IDCardModal from "./IDCardModal";

interface SmartAttendanceProps {
  users: User[];
  attendanceRecords: any[];
  onAttendance: (userId: number, dept: string, requestedType?: "In" | "Out") => void;
}

export default function SmartAttendance({
  users,
  attendanceRecords,
  onAttendance,
}: SmartAttendanceProps) {
  const { addToast } = useToast();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAttendance = async (userId: number) => {
    // Immediate disable - prevent any clicks
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoadingUserId(userId);
    
    const user = users.find(u => u.id === userId);
    if (!user) {
      setIsSubmitting(false);
      setLoadingUserId(null);
      return;
    }
    
    const dept = user?.department?.name || "عام";
    
    try {
      await onAttendance(userId, dept); // API will determine actual type
      // Use router.refresh() to update logs instantly
      router.refresh();
    } catch (error: any) {
      // Show toast message instead of throwing error to prevent page crash
      addToast({
        title: "تنبيه",
        description: error.message || "حدث خطأ أثناء تسجيل الحضور",
        type: "success" // Use success type to avoid red error screen
      });
    } finally {
      // Clear loading states after response
      setLoadingUserId(null);
      setIsSubmitting(false);
    }
  };

  const handleIDCard = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getUserStatus = (userId: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance records for this user
    const userRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.timestamp);
      return record.userId === userId && recordDate >= today;
    });
    
    if (userRecords.length === 0) return 'OUT'; // No records today -> show "تسجيل دخول"
    
    // Get the latest record for today
    const latestRecord = userRecords.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    return latestRecord.type; // Return actual status (IN or OUT)
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            تسجيل الحضور اليدوي
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {users.map((user) => {
            const status = getUserStatus(user.id);
            const isInOffice = status === 'IN';
            
            return (
              <div
                key={user.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 group"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Avatar with Status Indicator */}
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md group-hover:scale-105 transition-transform">
                      {user.name.charAt(0)}
                    </div>
                    <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800 ${
                      isInOffice ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
                  </div>

                  {/* User Info */}
                  <div className="space-y-1">
                    <button
                      onClick={() => handleIDCard(user)}
                      className="text-sm font-bold text-slate-800 dark:text-white hover:text-blue-600 transition-colors"
                    >
                      {user.name}
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {user.department?.name || "عام"}
                    </p>
                    <p className={`text-xs font-medium ${
                      isInOffice ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isInOffice ? 'داخل المكتب' : 'خارج المكتب'}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 transform active:scale-95 shadow-sm ${
                      isSubmitting || loadingUserId === user.id
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed opacity-60'
                        : isInOffice 
                          ? 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400' 
                          : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400'
                    }`}
                    onClick={() => handleAttendance(user.id)}
                    disabled={isSubmitting || loadingUserId === user.id}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                        جاري التسجيل...
                      </div>
                    ) : (
                      isInOffice ? 'تسجيل خروج' : 'تسجيل دخول'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ID Card Modal */}
      <IDCardModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}