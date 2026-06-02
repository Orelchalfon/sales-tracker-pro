import type { Sale, SaleInput } from "@/types/sale";
import { supabase } from "./client";

type SaleRow = {
  id: string;
  user_id: string;
  sale_date: string;
  system_name: string;
  system_price: string | number;
  commission: string | number;
  created_at: string;
};

function rowToSale(row: SaleRow): Sale {
  return {
    id: row.id,
    saleDate: row.sale_date,
    systemName: row.system_name,
    systemPrice: Number(row.system_price),
    commission: Number(row.commission),
    createdAt: row.created_at,
  };
}

export async function fetchSalesForMonth(year: number, month: number): Promise<Sale[]> {
  const mm = String(month + 1).padStart(2, "0");
  const from = `${year}-${mm}-01`;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMm = month === 11 ? "01" : String(month + 2).padStart(2, "0");
  const to = `${nextYear}-${nextMm}-01`;

  const { data, error } = await supabase
    .from("sales")
    .select("id, user_id, sale_date, system_name, system_price, commission, created_at")
    .gte("sale_date", from)
    .lt("sale_date", to)
    .order("sale_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as SaleRow[]).map(rowToSale);
}

export async function fetchSaleYears(): Promise<number[]> {
  const { data, error } = await supabase.from("sales").select("sale_date");
  if (error) throw new Error(error.message);

  const years = new Set<number>(
    (data as { sale_date: string }[]).map((r) =>
      new Date(r.sale_date + "T00:00:00").getFullYear()
    )
  );
  return Array.from(years).sort((a, b) => b - a);
}

export async function insertSale(input: SaleInput): Promise<Sale> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("לא מחובר");

  const { data, error } = await supabase
    .from("sales")
    .insert({
      user_id: userData.user.id,
      sale_date: input.saleDate,
      system_name: input.systemName,
      system_price: input.systemPrice,
      commission: input.commission,
    })
    .select("id, user_id, sale_date, system_name, system_price, commission, created_at")
    .single();

  if (error) throw new Error(error.message);
  return rowToSale(data as SaleRow);
}

type SaleUpdate = {
  sale_date?: string;
  system_name?: string;
  system_price?: number;
  commission?: number;
};

export async function updateSale(id: string, patch: Partial<SaleInput>): Promise<Sale> {
  const dbPatch: SaleUpdate = {};
  if (patch.saleDate !== undefined) dbPatch.sale_date = patch.saleDate;
  if (patch.systemName !== undefined) dbPatch.system_name = patch.systemName;
  if (patch.systemPrice !== undefined) dbPatch.system_price = patch.systemPrice;
  if (patch.commission !== undefined) dbPatch.commission = patch.commission;

  const { data, error } = await supabase
    .from("sales")
    .update(dbPatch)
    .eq("id", id)
    .select("id, user_id, sale_date, system_name, system_price, commission, created_at")
    .single();

  if (error) throw new Error(error.message);
  return rowToSale(data as SaleRow);
}

export async function deleteSale(id: string): Promise<void> {
  const { error } = await supabase.from("sales").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
