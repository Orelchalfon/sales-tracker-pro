import { useState } from "react";

type Values = {
  saleDate: string;
  systemName: string;
  systemPrice: number;
  commission: number;
};

type Props = {
  onAdd: (v: Values) => void;
};

export function SalesForm({ onAdd }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [saleDate, setSaleDate] = useState(today);
  const [systemName, setSystemName] = useState("");
  const [systemPrice, setSystemPrice] = useState("");
  const [commission, setCommission] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleDate || !systemName.trim() || !systemPrice || !commission) {
      setError("יש למלא את כל השדות");
      return;
    }
    const price = Number(systemPrice);
    const com = Number(commission);
    if (isNaN(price) || price <= 0 || isNaN(com) || com <= 0) {
      setError("המחיר והעמלה חייבים להיות מספרים חיוביים");
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
          <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className={input} />
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
          <label className={label}>מחיר המערכת</label>
          <input
            type="number"
            value={systemPrice}
            onChange={(e) => setSystemPrice(e.target.value)}
            placeholder="לדוגמה: 3500"
            min="0"
            className={input}
          />
        </div>
        <div>
          <label className={label}>עמלת מכירה</label>
          <input
            type="number"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            placeholder="לדוגמה: 400"
            min="0"
            className={input}
          />
        </div>
      </div>
      {error && (
        <div className="mt-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div className="mt-4">
        <button
          type="submit"
          className="w-full sm:w-auto h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          הוסף מכירה
        </button>
      </div>
    </form>
  );
}
