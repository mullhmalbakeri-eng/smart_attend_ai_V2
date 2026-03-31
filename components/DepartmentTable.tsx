"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { PlusIcon, Edit2Icon, Trash2Icon } from "lucide-react"

interface Department {
  id: number
  name: string
  manager: string
}

interface Props {
  departments: Department[]
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>
}

export default function DepartmentsTable({
  departments,
  setDepartments,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [form, setForm] = useState({ name: "", manager: "" })

  const openCreate = () => {
    setEditingDept(null)
    setForm({ name: "", manager: "" })
    setModalOpen(true)
  }

  const openEdit = (dept: Department) => {
    setEditingDept(dept)
    setForm({ name: dept.name, manager: dept.manager })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.manager) return

    if (editingDept) {
      setDepartments(prev =>
        prev.map(d =>
          d.id === editingDept.id
            ? { ...d, name: form.name, manager: form.manager }
            : d
        )
      )
    } else {
      const newDept: Department = {
        id: departments.length
          ? Math.max(...departments.map(d => d.id)) + 1
          : 1,
        name: form.name,
        manager: form.manager,
      }
      setDepartments(prev => [...prev, newDept])
    }

    setModalOpen(false)
    setEditingDept(null)
    setForm({ name: "", manager: "" })
  }

  const handleDelete = (id: number) => {
    setDepartments(prev => prev.filter(d => d.id !== id))
  }

  return (
    <>
      {/* Header with Create */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Departments
        </h1>

        <Button onClick={openCreate} className="flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Create Department</span>
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Manager</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {departments.map(dept => (
              <tr
                key={dept.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-2">{dept.id}</td>
                <td className="px-4 py-2">{dept.name}</td>
                <td className="px-4 py-2">{dept.manager}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(dept)}
                  >
                    <Edit2Icon className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(dept.id)}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDept ? "Edit Department" : "Create Department"}
            </DialogTitle>
            <DialogDescription>
              Fill department information below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <input
              type="text"
              placeholder="Department Name"
              value={form.name}
              onChange={e =>
                setForm(prev => ({ ...prev, name: e.target.value }))
              }
              className="w-full p-2 border rounded dark:bg-gray-900"
            />

            <input
              type="text"
              placeholder="Manager"
              value={form.manager}
              onChange={e =>
                setForm(prev => ({ ...prev, manager: e.target.value }))
              }
              className="w-full p-2 border rounded dark:bg-gray-900"
            />
          </div>

          <DialogFooter>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingDept ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}