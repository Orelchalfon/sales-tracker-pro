import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import type { Sale } from "@/types/sale";
import { formatSaleDate, HEBREW_MONTHS } from "@/types/sale";

type Props = {
  sales: Sale[];
  year: number;
  month: number; // 0-indexed
};

export function ExportButton({ sales, year, month }: Props) {
  const disabled = sales.length === 0;

  const handleExport = () => {
    if (disabled) return;

    const header = ["תאריך", "שם המערכת", "מחיר המערכת (₪)", "עמלת מכירה (₪)"];
    const rows: (string | number)[][] = [
      header,
      ...sales.map((s) => [
        formatSaleDate(s.saleDate),
        s.systemName,
        s.systemPrice,
        s.commission,
      ]),
    ];

    const totalSales = sales.reduce((sum, s) => sum + s.systemPrice, 0);
    const totalCommission = sales.reduce((sum, s) => sum + s.commission, 0);

    rows.push([]);
    rows.push(["כמות מערכות שנמכרו", sales.length]);
    rows.push(["סה״כ מכירות", totalSales]);
    rows.push(["סה״כ עמלה", totalCommission]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 14 }, { wch: 30 }, { wch: 18 }, { wch: 18 }];
    // Mark sheet as RTL for Excel
    ws["!views"] = [{ RTL: true }];

    // Currency formatting for price/commission columns (columns C & D, rows 2..n+1)
    const dataRowCount = sales.length;
    for (let i = 0; i < dataRowCount; i++) {
      const r = i + 1; // row index in sheet (0-based; +1 because header is row 0)
      const priceCell = XLSX.utils.encode_cell({ r, c: 2 });
      const comCell = XLSX.utils.encode_cell({ r, c: 3 });
      if (ws[priceCell]) ws[priceCell].z = '#,##0" ₪"';
      if (ws[comCell]) ws[comCell].z = '#,##0" ₪"';
    }

    const wb = XLSX.utils.book_new();
    const sheetName = `${HEBREW_MONTHS[month]} ${year}`.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const mm = String(month + 1).padStart(2, "0");
    XLSX.writeFile(wb, `sales-report-${year}-${mm}.xlsx`);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      className="h-11 px-5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download className="h-4 w-4" />
      <span>הורד דוח אקסל</span>
    </button>
  );
}
