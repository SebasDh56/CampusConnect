export type Student = {
  student_id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  document_number: string;
  grade: string;
  academic_year: string;
  enrollment_status: string;
  created_at: string;
  updated_at: string;
};

export type StudentCreate = {
  school_id: string;
  first_name: string;
  last_name: string;
  document_number: string;
  grade: string;
  academic_year: string;
  enrollment_status: string;
};
