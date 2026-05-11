import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { Sale, SaleInput } from "@/types/sale";
import { formatILS, formatSaleDate } from "@/types/sale";

type Props = {
  sales: Sale[];
  onUpdate: (id: string, patch: Partial<SaleInput>) => void;
  onDelete: (id: string) => void;
};

type Draft = {
  saleDate: string;
  systemName: string;
  systemPrice: string;
  commission: string;
};

const emptyDraft: Draft = { saleDate: "", systemName: "", systemPrice: "", commission: "" };

export function SalesTable({ sales, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const startEdit = (s: Sale) => {
    setEditingId(s.id);
    setDraft({
      saleDate: s.saleDate,
      systemName: s.systemName,
      systemPrice: String(s.systemPrice),
      commission: String(s.commission),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const price = Number(draft.systemPrice);
    const com = Number(draft.commission);
    if (
      !draft.saleDate ||
      !draft.systemName.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isFinite(com) ||
      com < 0
    ) {
      alert("יש למלא את כל השדות עם ערכים תקינים");
      return;
    }
    onUpdate(editingId, {
      saleDate: draft.saleDate,
      systemName: draft.systemName.trim(),
      systemPrice: price,
      commission: com,
    });
    cancelEdit();
  };

  const confirmDelete = (id: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק את המכירה?")) onDelete(id);
  };

  if (sales.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-10 text-center text-muted-foreground">
        אין מכירות לחודש הנבחר
      </div>
    );
  }

  const inp =
    "w-full h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-muted">
            <tr className="text-sm text-muted-foreground">
              <th className="px-4 py-3 font-medium">תאריך</th>
              <th className="px-4 py-3 font-medium">שם המערכת</th>
              <th className="px-4 py-3 font-medium">מחיר המערכת</th>
              <th className="px-4 py-3 font-medium">עמלת מכירה</th>
              <th className="px-4 py-3 font-medium w-40">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sales.map((s) => {
              const editing = editingId === s.id;
              return (
                <tr key={s.id} className="text-sm text-foreground">
                  <td className="px-4 py-3 align-middle">
                    {editing ? (
                      <input
                        type="date"
                        value={draft.saleDate}
                        onChange={(e) => setDraft((d) => ({ ...d, saleDate: e.target.value }))}
                        className={inp}
                      />
                    ) : (
                      formatSaleDate(s.saleDate)
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {editing ? (
                      <input
                        value={draft.systemName}
                        onChange={(e) => setDraft((d) => ({ ...d, systemName: e.target.value }))}
                        className={inp}
                      />
                    ) : (
                      s.systemName
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {editing ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        value={draft.systemPrice}
                        onChange={(e) => setDraft((d) => ({ ...d, systemPrice: e.target.value }))}
                        className={inp}
                      />
                    ) : (
                      formatILS(s.systemPrice)
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {editing ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        value={draft.commission}
                        onChange={(e) => setDraft((d) => ({ ...d, commission: e.target.value }))}
                        className={inp}
                      />
                    ) : (
                      formatILS(s.commission)
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex gap-2">
                      {editing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="px-3 h-8 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 inline-flex items-center gap-1"
                          >
                            <Check className="h-3.5 w-3.5" /> שמור
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 h-8 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 inline-flex items-center gap-1"
                          >
                            <X className="h-3.5 w-3.5" /> ביטול
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(s)}
                            aria-label="ערוך מכירה"
                            className="px-3 h-8 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 inline-flex items-center gap-1"
                          >
                            <Pencil className="h-3.5 w-3.5" /> ערוך
                          </button>
                          <button
                            onClick={() => confirmDelete(s.id)}
                            aria-label="מחק מכירה"
                            className="px-3 h-8 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> מחק
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border">
        {sales.map((s) => {
          const editing = editingId === s.id;
          return (
            <div key={s.id} className="p-4 space-y-2">
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={draft.saleDate}
                    onChange={(e) => setDraft((d) => ({ ...d, saleDate: e.target.value }))}
                    className={inp}
                  />
                  <input
                    value={draft.systemName}
                    onChange={(e) => setDraft((d) => ({ ...d, systemName: e.target.value }))}
                    className={inp}
                    placeholder="שם המערכת"
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    value={draft.systemPrice}
                    onChange={(e) => setDraft((d) => ({ ...d, systemPrice: e.target.value }))}
                    className={inp}
                    placeholder="מחיר"
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    value={draft.commission}
                    onChange={(e) => setDraft((d) => ({ ...d, commission: e.target.value }))}
                    className={inp}
                    placeholder="עמלה"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveEdit}
                      className="flex-1 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center gap-1"
                    >
                      <Check className="h-4 w-4" /> שמור
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 h-9 rounded-md bg-secondary text-secondary-foreground text-sm font-medium inline-flex items-center justify-center gap-1"
                    >
                      <X className="h-4 w-4" /> ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-3">
                    <div className="font-medium text-foreground break-words min-w-0">
                      {s.systemName}
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {formatSaleDate(s.saleDate)}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">מחיר:</span>
                    <span className="text-foreground">{formatILS(s.systemPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">עמלה:</span>
                    <span className="text-foreground font-medium">{formatILS(s.commission)}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="flex-1 h-9 rounded-md bg-secondary text-secondary-foreground text-sm font-medium inline-flex items-center justify-center gap-1"
                    >
                      <Pencil className="h-4 w-4" /> ערוך
                    </button>
                    <button
                      onClick={() => confirmDelete(s.id)}
                      className="flex-1 h-9 rounded-md bg-destructive text-destructive-foreground text-sm font-medium inline-flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> מחק
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
