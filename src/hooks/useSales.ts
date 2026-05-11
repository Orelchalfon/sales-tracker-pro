import { useEffect, useState } from "react";
import type { Sale } from "@/types/sale";

const STORAGE_KEY = "sales-tracker-v1";

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSales(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  }, [sales, loaded]);

  const addSale = (s: Omit<Sale, "id" | "createdAt">) => {
    const newSale: Sale = {
      ...s,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSales((prev) => [...prev, newSale]);
  };

  const updateSale = (id: string, patch: Partial<Sale>) => {
    setSales((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const deleteSale = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  return { sales, addSale, updateSale, deleteSale };
}
