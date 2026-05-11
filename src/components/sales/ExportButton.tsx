import * as XLSX from "xlsx";
import type { Sale } from "@/types/sale";

type Props = {
  sales: Sale[];
  year: number;
  month: number; // 0-indexed
};

export function ExportButton({ sales, year, month }: Props) {
  const handleExport = () => {
    if (sales.length === 0) {
      alert("אין מכירות לייצא לחודש זה");
      return;
    }

    const rows: (string | number)[][] = [
      ["תאריך", "שם המערכת", "מחיר המערכת", "עמלת מכירה"],
      ...sales.map((s) => [
        new Date(s.saleDate).toLocaleDateString("he-IL"),
        s.systemName,
        s.systemPrice,
        s.commission,
      ]),
    ];

    const totalSales = sales.reduce((sum, s) => sum + s.systemPrice, 0);
    const totalCommission = sales.reduce((sum, s) => sum + s.commission, 0);

    rows.push([]);
    rows.push(["כמות מערכות שנמכרו", sales.length]);
    rows.push(['סה״כ מכירות', totalSales]);
    rows.push(['סה״כ עמלה', totalCommission]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 14 }, { wch: 28 }, { wch: 16 }, { wch: 16 }];
    if (!ws["!props"]) ws["!props"] = {};
    // RTL sheet
    (ws as XLSX.WorkSheet & { ["!views"]?: unknown[] })["!views"] = [{ RTL: true }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "דוח מכירות");

    const mm = String(month + 1).padStart(2, "0");
    XLSX.writeFile(wb, `sales-report-${year}-${mm}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="h-11 px-5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
    >
      <span>הורד דוח אקסל</span>
    </button>
  );
}
