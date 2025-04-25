export interface StaffProfile {
  id: number;
  department: string;
  designation: string;
}

export interface User {
  id: number;
  email: string | null;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_student: boolean;
  staff_profile?: StaffProfile;
  student_profile?: {
    id: number;
    roll_number: string;
    course: string;
    course_duration: string;
    caste: string;
    gender: string;
    phone_number: string;
  };
}
