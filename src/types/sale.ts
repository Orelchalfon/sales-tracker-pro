export type Sale = {
  id: string;
  saleDate: string; // ISO date string YYYY-MM-DD
  systemName: string;
  systemPrice: number;
  commission: number;
  createdAt: string; // ISO timestamp
};

export type SaleInput = Omit<Sale, "id" | "createdAt">;

export const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
] as const;

export const formatILS = (n: number): string =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);

/**
 * Parse a YYYY-MM-DD string as a *local* date.
 * Avoids the UTC shift you get from `new Date("2025-01-01")`.
 */
export function parseSaleDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatSaleDate(iso: string): string {
  return parseSaleDate(iso).toLocaleDateString("he-IL");
}

export function getSaleYearMonth(iso: string): { year: number; month: number } {
  const d = parseSaleDate(iso);
  return { year: d.getFullYear(), month: d.getMonth() };
}
