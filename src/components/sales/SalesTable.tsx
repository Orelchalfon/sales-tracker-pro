import { useState } from "react";
import type { Sale } from "@/types/sale";
import { formatILS } from "@/types/sale";

type Props = {
  sales: Sale[];
  onUpdate: (id: string, patch: Partial<Sale>) => void;
  onDelete: (id: string) => void;
};

export function SalesTable({ sales, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Sale>>({});

  const startEdit = (s: Sale) => {
    setEditingId(s.id);
    setDraft({
      saleDate: s.saleDate,
      systemName: s.systemName,
      systemPrice: s.systemPrice,
      commission: s.commission,
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (
      !draft.saleDate ||
      !draft.systemName?.toString().trim() ||
      !draft.systemPrice ||
      !draft.commission ||
      Number(draft.systemPrice) <= 0 ||
      Number(draft.commission) <= 0
    ) {
      alert("יש למלא את כל השדות עם ערכים תקינים");
      return;
    }
    onUpdate(editingId, {
      saleDate: draft.saleDate as string,
      systemName: (draft.systemName as string).trim(),
      systemPrice: Number(draft.systemPrice),
      commission: Number(draft.commission),
    });
    setEditingId(null);
    setDraft({});
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
              <th className="px-4 py-3 font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sales.map((s) => {
              const editing = editingId === s.id;
              return (
                <tr key={s.id} className="text-sm text-foreground">
                  <td className="px-4 py-3">
                    {editing ? (
                      <input
                        type="date"
                        value={draft.saleDate as string}
                        onChange={(e) => setDraft((d) => ({ ...d, saleDate: e.target.value }))}
                        className={inp}
                      />
                    ) : (
                      new Date(s.saleDate).toLocaleDateString("he-IL")
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing ? (
                      <input
                        value={draft.systemName as string}
                        onChange={(e) => setDraft((d) => ({ ...d, systemName: e.target.value }))}
                        className={inp}
                      />
                    ) : (
                      s.systemName
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing ? (
                      <input
                        type="number"
                        value={draft.systemPrice as number}
                        onChange={(e) => setDraft((d) => ({ ...d, systemPrice: Number(e.target.value) }))}
                        className={inp}
                      />
                    ) : (
                      formatILS(s.systemPrice)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing ? (
                      <input
                        type="number"
                        value={draft.commission as number}
                        onChange={(e) => setDraft((d) => ({ ...d, commission: Number(e.target.value) }))}
                        className={inp}
                      />
                    ) : (
                      formatILS(s.commission)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {editing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="px-3 h-8 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
                          >
                            שמור
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setDraft({});
                            }}
                            className="px-3 h-8 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80"
                          >
                            ביטול
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(s)}
                            className="px-3 h-8 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80"
                          >
                            ערוך
                          </button>
                          <button
                            onClick={() => confirmDelete(s.id)}
                            className="px-3 h-8 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90"
                          >
                            מחק
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
                    value={draft.saleDate as string}
                    onChange={(e) => setDraft((d) => ({ ...d, saleDate: e.target.value }))}
                    className={inp}
                  />
                  <input
                    value={draft.systemName as string}
                    onChange={(e) => setDraft((d) => ({ ...d, systemName: e.target.value }))}
                    className={inp}
                    placeholder="שם המערכת"
                  />
                  <input
                    type="number"
                    value={draft.systemPrice as number}
                    onChange={(e) => setDraft((d) => ({ ...d, systemPrice: Number(e.target.value) }))}
                    className={inp}
                    placeholder="מחיר"
                  />
                  <input
                    type="number"
                    value={draft.commission as number}
                    onChange={(e) => setDraft((d) => ({ ...d, commission: Number(e.target.value) }))}
                    className={inp}
                    placeholder="עמלה"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveEdit}
                      className="flex-1 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium"
                    >
                      שמור
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setDraft({});
                      }}
                      className="flex-1 h-9 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-foreground">{s.systemName}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.saleDate).toLocaleDateString("he-IL")}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">מחיר:</span>
                    <span className="text-foreground">{formatILS(s.systemPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">עמלה:</span>
                    <span className="text-foreground">{formatILS(s.commission)}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="flex-1 h-9 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
                    >
                      ערוך
                    </button>
                    <button
                      onClick={() => confirmDelete(s.id)}
                      className="flex-1 h-9 rounded-md bg-destructive text-destructive-foreground text-sm font-medium"
                    >
                      מחק
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
