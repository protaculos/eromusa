import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Payment {
  id: string;
  vexutopia_id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  credits: number;
  status: PaymentStatus;
  payment_method?: string;
  completed_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  userId: string;
  vexutopiaId: string;
  planId: string;
  planName: string;
  amount: number;
  credits: number;
}

// Internal helper to get client
function getClient(client?: SupabaseClient): SupabaseClient {
  return client || supabase;
}

// Create a new payment record (uses regular client - for client-side use)
export async function createPaymentRecord(data: CreatePaymentData): Promise<Payment | null> {
  return createPaymentRecordWithClient(supabase, data);
}

// Create payment record with a specific Supabase client (use this for server-side with admin client)
export async function createPaymentRecordWithClient(
  client: SupabaseClient,
  data: CreatePaymentData
): Promise<Payment | null> {
  const { data: payment, error } = await client
    .from("payments")
    .insert({
      vexutopia_id: data.vexutopiaId,
      user_id: data.userId,
      plan_id: data.planId,
      plan_name: data.planName,
      amount: data.amount,
      credits: data.credits,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating payment record:", JSON.stringify(error, null, 2));
    console.error("Insert data:", JSON.stringify({
      vexutopia_id: data.vexutopiaId,
      user_id: data.userId,
      plan_id: data.planId,
      plan_name: data.planName,
      amount: data.amount,
      credits: data.credits,
    }, null, 2));
    return null;
  }

  return payment as Payment;
}

// Get payment by Vexutopia ID (with optional client)
export async function getPaymentByVexutopiaId(vexutopiaId: string, client?: SupabaseClient): Promise<Payment | null> {
  const { data, error } = await getClient(client)
    .from("payments")
    .select("*")
    .eq("vexutopia_id", vexutopiaId)
    .single();

  if (error) {
    console.error("Error getting payment by vexutopia id:", error);
    return null;
  }
  return data as Payment;
}

// Get payment by internal ID (with optional client)
export async function getPaymentById(paymentId: string, client?: SupabaseClient): Promise<Payment | null> {
  const { data, error } = await getClient(client)
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (error) {
    console.error("Error getting payment by id:", error);
    return null;
  }
  return data as Payment;
}

// Get all payments for a user
export async function getUserPayments(userId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as Payment[];
}

// Update payment status to completed (with optional client)
export async function completePayment(vexutopiaId: string, client?: SupabaseClient): Promise<boolean> {
  const { error } = await getClient(client)
    .from("payments")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("vexutopia_id", vexutopiaId);

  if (error) {
    console.error("Error completing payment:", error);
    return false;
  }
  return true;
}

// Update payment with additional info (with optional client)
export async function updatePaymentInfo(
  vexutopiaId: string,
  info: { status?: PaymentStatus; payment_method?: string },
  client?: SupabaseClient
): Promise<boolean> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (info.status) updateData.status = info.status;
  if (info.payment_method) updateData.payment_method = info.payment_method;

  const { error } = await getClient(client)
    .from("payments")
    .update(updateData)
    .eq("vexutopia_id", vexutopiaId);

  if (error) {
    console.error("Error updating payment info:", error);
    return false;
  }
  return true;
}

// Delete expired pending payments (called by cron or manually)
export async function cleanupExpiredPayments(): Promise<{ deleted: number }> {
  const { count, error } = await supabase
    .from("payments")
    .delete()
    .eq("status", "pending")
    .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error("Error cleaning up payments:", error);
    return { deleted: 0 };
  }

  return { deleted: count || 0 };
}