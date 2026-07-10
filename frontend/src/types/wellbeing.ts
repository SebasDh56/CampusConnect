export type Attendance = {
  attendance_id: string;
  student_id: string;
  school_id: string;
  grade: string;
  record_date: string;
  status: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;
};

export type AttendanceCreate = {
  student_id: string;
  school_id: string;
  grade: string;
  record_date: string;
  status: string;
  recorded_by: string;
};

export type Incident = {
  incident_id: string;
  student_id: string;
  school_id: string;
  incident_type: string;
  severity: string;
  description: string;
  reported_by: string;
  created_at: string;
  updated_at: string;
};

export type IncidentCreate = {
  student_id: string;
  school_id: string;
  incident_type: string;
  severity: string;
  description: string;
  reported_by: string;
};
