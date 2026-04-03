export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: string;
  departmentId?: number | null;
  department?: Department | null;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId?: number | null;
  department?: Department | null;
}

export interface Department {
  id: number;
  name: string;
  manager?: string;
}

export interface AttendanceEntry {
  id?: number;
  userId: number;
  name: string;
  dept: string;
  time: string;
  type: "In" | "Out";
}
