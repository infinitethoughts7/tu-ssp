// Types for StaffDashboard

import { DepartmentDue } from "./department";

export interface StudentDetails {
  roll_numbers: string[];
  name: string;
  course: string;
  caste: string;
  phone_number: string;
  dues: DepartmentDue[];
  totalAmount: number;
  unpaidAmount: number;
  user?: {
    id: number;
    email: string | null;
    username: string; // This contains the roll number
    is_student: boolean;
    is_staff: boolean;
    first_name?: string;
    last_name?: string;
  };
}

export interface StudentSuggestion {
  roll_numbers: string[];
  name: string;
  course: string;
  caste: string;
  phone_number: string;
  user?: {
    id: number;
    email: string | null;
    username: string; // This contains the roll number
    is_student: boolean;
    is_staff: boolean;
    first_name?: string;
    last_name?: string;
  };
}

export interface AcademicDue {
  id: number;
  student: {
    roll_number: string;
    full_name: string;
    phone_number: string;
    caste?: string;
  };
  fee_structure: {
    course_name: string;
    tuition_fee: number;
    special_fee: number;
    other_fee: number;
    exam_fee: number;
  };
  paid_by_govt: number;
  paid_by_student: number;
  academic_year_label: string;
  payment_status: string;
  remarks: string;
  due_amount: number;
  total_amount: number;
  unpaid_amount: number;
}

export type DepartmentStudentGroup = StudentDetails & { dues: DepartmentDue[] };
export type AcademicStudentGroup = Omit<
  StudentDetails,
  "caste" | "user" | "dues"
> & {
  dues: AcademicDue[];
  caste: string;
};
