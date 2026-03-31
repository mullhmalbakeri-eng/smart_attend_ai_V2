import { Metadata } from "next";
import UsersTable from "@/app/dashboard/components/UsersTable";

export const metadata: Metadata = {
  title: "Users | SmartAttend",
  description: "Manage users and employees",
};

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar will be included from layout */}
        <main className="flex-1 p-6">
          <UsersTable />
        </main>
      </div>
    </div>
  );
}