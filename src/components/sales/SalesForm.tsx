import { useState } from "react";
import { Plus } from "lucide-react";
import type { SaleInput } from "@/types/sale";

type Props = {
  onAdd: (v: SaleInput) => void;
};

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function SalesForm({ onAdd }: Props) {
  const [saleDate, setSaleDate] = useState(todayISO);
  const [systemName, setSystemName] = useState("");
  const [systemPrice, setSystemPrice] = useState("");
  const [commission, setCommission] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(systemPrice);
    const com = Number(commission);
    if (!saleDate || !systemName.trim()) {
      setError("יש למלא תאריך ושם מערכת");
      return;
    }
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(com) || com < 0) {
      setError("המחיר חייב להיות חיובי והעמלה לא שלילית");
      return;
    }
    setError("");
    onAdd({ saleDate, systemName: systemName.trim(), systemPrice: price, commission: com });
    setSystemName("");
    setSystemPrice("");
    setCommission("");
  };

  const input =
    "w-full h-11 rounded-lg border border-input bg-background px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const label = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <form onSubmit={submit} className="bg-card rounded-2xl shadow-sm border border-border p-5">
      <h2 className="text-lg font-semibold text-foreground mb-4">הוספת מכירה חדשה</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className={label}>תאריך מכירה</label>
          <input
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className={input}
          />
        </div>
        <div>
          <label className={label}>שם המערכת</label>
          <input
            type="text"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            placeholder="לדוגמה: מערכת מים תת כיורית"
            className={input}
          />
        </div>
        <div>
          <label className={label}>מחיר המערכת (₪)</label>
          <input
            type="number"
            inputMode="decimal"
            value={systemPrice}
            onChange={(e) => setSystemPrice(e.target.value)}
            placeholder="3500"
            min="0"
            step="1"
            className={input}
          />
        </div>
        <div>
          <label className={label}>עמלת מכירה (₪)</label>
          <input
            type="number"
            inputMode="decimal"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            placeholder="400"
            min="0"
            step="1"
            className={input}
          />
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="mt-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
        >
          {error}
        </div>
      )}
      <div className="mt-4">
        <button
          type="submit"
          className="w-full sm:w-auto h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          הוסף מכירה
        </button>
      </div>
    </form>
  );
}
