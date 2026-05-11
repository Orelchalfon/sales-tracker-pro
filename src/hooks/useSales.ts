import { useEffect, useState } from "react";
import type { Sale, SaleInput } from "@/types/sale";

const STORAGE_KEY = "sales-tracker-v1";

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isSale(value: unknown): value is Sale {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.saleDate === "string" &&
    typeof s.systemName === "string" &&
    typeof s.systemPrice === "number" &&
    typeof s.commission === "number" &&
    typeof s.createdAt === "string"
  );
}

function loadSales(): Sale[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSale);
  } catch {
    return [];
  }
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSales(loadSales());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
    } catch {
      // quota or privacy mode — ignore
    }
  }, [sales, loaded]);

  const addSale = (input: SaleInput) => {
    const newSale: Sale = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setSales((prev) => [...prev, newSale]);
  };

  const updateSale = (id: string, patch: Partial<SaleInput>) => {
    setSales((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const deleteSale = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  return { sales, addSale, updateSale, deleteSale, loaded };
}
