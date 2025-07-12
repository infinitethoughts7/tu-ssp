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
  username: string; // This comes from user.username in the backend (roll number)
  name: string;
  course: string;
  caste: string;
  phone_number: string;
}

// Legacy Academic Records Types - Updated to match actual API response
export interface LegacyRecord {
  id: number;
  student: {
    id: number;
    user: {
      id: number;
      email: string | null;
      username: string;
      is_student: boolean;
      is_staff: boolean;
      first_name: string;
      last_name: string;
    };
    course: number | null;
    course_name: string;
    caste: string;
    gender: string;
    mobile_number: string | null;
    batch: string;
  };
  due_amount: string;
  tc_number: string | null;
  tc_issued_date: string | null;
  formatted_due_amount: string;
}

export interface LegacyStudentGroup {
  roll_numbers: string[];
  name: string;
  course: string;
  caste: string;
  phone_number: string;
  dues: LegacyRecord[];
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

// Academic Records Types
export interface AcademicDue {
  id: number;
  student: {
    id: number;
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    course: {
      id: number;
      name: string;
    } | null;
    caste: string;
    gender: string;
    mobile_number: string;
    batch: string;
  };
  fee_structure: {
    id: number;
    course_name: string;
    academic_year: string;
    category: string;
    tuition_fee: number;
    special_fee: number | null;
    other_fee: number | null;
    exam_fee: number | null;
  } | null;
  paid_by_govt: number;
  paid_by_student: number;
  academic_year_label: string;
  payment_status: string;
  remarks: string | null;
  due_amount: number;
  total_amount: number;
  unpaid_amount: number;
}

export interface AcademicStudentGroup {
  roll_numbers: string[];
  name: string;
  course: string;
  caste: string;
  phone_number: string;
  dues: AcademicDue[];
  totalAmount: number;
  unpaidAmount: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

// Student Details Types
export interface StudentDetails {
  roll_numbers: string[];
  name: string;
  course: string;
  caste: string;
  phone_number: string;
  dues: any[];
  totalAmount: number;
  unpaidAmount: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

export interface StudentSuggestion {
  username: string;
  name: string;
  course: string;
  caste: string;
  phone_number: string;
}

export interface DepartmentStudentGroup {
  roll_numbers: string[];
  name: string;
  course: string;
  caste: string;
  phone_number: string;
  dues: DepartmentDue[];
  totalAmount: number;
  unpaidAmount: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

// Library Records Types
export interface LibraryRecord {
  id: number;
  student: {
    id: number;
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    course: {
      id: number;
      name: string;
    } | null;
    course_name: string;
    caste: string;
    gender: string;
    mobile_number: string;
    batch: string;
  };
  book_id: string;
  borrowing_date: string;
  fine_amount: string;
  created_at: string;
  updated_at: string;
}

export interface LibraryStudentGroup {
  roll_numbers: string[];
  name: string;
  course: string;
  caste: string;
  phone_number: string;
  records: LibraryRecord[];
  total_fine_amount: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
}
