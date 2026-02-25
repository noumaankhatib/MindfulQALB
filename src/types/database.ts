export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin' | 'therapist';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'therapist';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | 'therapist';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string | null;
          session_type: 'individual' | 'couples' | 'family';
          session_format: 'chat' | 'audio' | 'video';
          duration_minutes: number;
          scheduled_date: string;
          scheduled_time: string;
          timezone: string;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          calcom_booking_id: string | null;
          calcom_booking_uid: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          cancelled_at: string | null;
          cancellation_reason: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_type: 'individual' | 'couples' | 'family';
          session_format: 'chat' | 'audio' | 'video';
          duration_minutes?: number;
          scheduled_date: string;
          scheduled_time: string;
          timezone?: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          calcom_booking_id?: string | null;
          calcom_booking_uid?: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_type?: 'individual' | 'couples' | 'family';
          session_format?: 'chat' | 'audio' | 'video';
          duration_minutes?: number;
          scheduled_date?: string;
          scheduled_time?: string;
          timezone?: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          calcom_booking_id?: string | null;
          calcom_booking_uid?: string | null;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          booking_id: string | null;
          user_id: string | null;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          amount_paise: number;
          currency: string;
          status: 'pending' | 'paid' | 'failed' | 'refunded';
          created_at: string;
          paid_at: string | null;
          refunded_at: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          user_id?: string | null;
          razorpay_order_id: string;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          amount_paise: number;
          currency?: string;
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          created_at?: string;
          paid_at?: string | null;
          refunded_at?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          user_id?: string | null;
          razorpay_order_id?: string;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          amount_paise?: number;
          currency?: string;
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          created_at?: string;
          paid_at?: string | null;
          refunded_at?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      consent_records: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          consent_version: string;
          session_type: string;
          acknowledgments: Json;
          ip_address: string | null;
          user_agent: string | null;
          consented_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          consent_version: string;
          session_type: string;
          acknowledgments: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          consented_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          consent_version?: string;
          session_type?: string;
          acknowledgments?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          consented_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          request_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          request_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          request_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: 'percent' | 'fixed';
          discount_value: number;
          min_amount_paise: number;
          valid_from: string | null;
          valid_until: string | null;
          max_uses: number | null;
          used_count: number;
          is_active: boolean;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: 'percent' | 'fixed';
          discount_value: number;
          min_amount_paise?: number;
          valid_from?: string | null;
          valid_until?: string | null;
          max_uses?: number | null;
          used_count?: number;
          is_active?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_type?: 'percent' | 'fixed';
          discount_value?: number;
          min_amount_paise?: number;
          valid_from?: string | null;
          valid_until?: string | null;
          max_uses?: number | null;
          used_count?: number;
          is_active?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      validate_coupon: {
        Args: { p_code: string; p_amount_paise: number };
        Returns: Json;
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type ConsentRecord = Database['public']['Tables']['consent_records']['Row'];
