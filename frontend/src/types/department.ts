export interface DepartmentDue {
  id: number;
  student: number;
  student_details: {
    user: {
      id: number;
      email: string | null;
      roll_number: string;
      is_student: boolean;
      is_staff: boolean;
      first_name: string;
      last_name: string;
    };
    roll_number: string;
    course: string;
    course_duration: string;
    caste: string;
    gender: string;
    phone_number: string;
  };
  department: number;
  department_details: {
    id: number;
    department: string;
    designation: string;
  };
  amount: string;
  due_date: string;
  description: string;
  is_paid: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}
