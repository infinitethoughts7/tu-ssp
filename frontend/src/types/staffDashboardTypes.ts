// Types for StaffDashboard

import { DepartmentDue } from "./department";

export interface GroupedDue {
  roll_numbers: string[]; // This will contain usernames (roll numbers)
  count: number;
  total_amount: number;
  dues: Due[];
}

export interface Due {
  id: number;
  student: {
    user: {
      username: string; // This is the roll number
      first_name: string;
      last_name: string;
    };
    username: string; // Changed from roll_number to username
    course: string;
    caste: string;
    phone_number: string;
  };
  department: string;
  amount: string;
  due_date: string;
  description: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  username: string; // Changed from roll_number to username
  name: string;
  course: string;
  caste: string;
  phone_number: string;
}
