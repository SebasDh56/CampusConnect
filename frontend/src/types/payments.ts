export type Payment = {
  payment_id: string;
  student_id: string;
  school_id: string;
  invoice_id: string;
  amount: string;
  currency: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
};

export type PaymentCreate = {
  student_id: string;
  school_id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
};

export type PaymentUpdate = {
  student_id?: string;
  school_id?: string;
  invoice_id?: string;
  amount?: number;
  currency?: string;
  payment_method?: string;
  payment_status?: string;
};
