"use client";

import UsersTable from "@/app/dashboard/components/UsersTable";

export default function UsersPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <UsersTable />
      </div>
    </div>
  );
}
