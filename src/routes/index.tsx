import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSales } from "@/hooks/useSales";
import { SalesForm } from "@/components/sales/SalesForm";
import { MonthSelect } from "@/components/sales/MonthSelect";
import { SummaryCards } from "@/components/sales/SummaryCards";
import { SalesTable } from "@/components/sales/SalesTable";
import { ExportButton } from "@/components/sales/ExportButton";
import { getSaleYearMonth } from "@/types/sale";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { sales, addSale, updateSale, deleteSale } = useSales();
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const years = useMemo(() => {
    const set = new Set<number>([today.getFullYear(), year]);
    sales.forEach((s) => set.add(getSaleYearMonth(s.saleDate).year));
    return Array.from(set).sort((a, b) => b - a);
  }, [sales, today, year]);

  const filtered = useMemo(
    () =>
      sales
        .filter((s) => {
          const { year: y, month: m } = getSaleYearMonth(s.saleDate);
          return y === year && m === month;
        })
        .sort((a, b) => a.saleDate.localeCompare(b.saleDate)),
    [sales, month, year]
  );

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, s) => {
          acc.totalSales += s.systemPrice;
          acc.totalCommission += s.commission;
          return acc;
        },
        { totalSales: 0, totalCommission: 0 }
      ),
    [filtered]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">מעקב מכירות חודשי</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            ניהול מכירות, עמלות וייצוא דוח חודשי לאקסל
          </p>
        </header>

        <SalesForm onAdd={addSale} />

        <div className="bg-card rounded-2xl shadow-sm border border-border p-5 space-y-4">
          <MonthSelect
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
            years={years}
          />
        </div>

        <SummaryCards
          count={filtered.length}
          totalSales={totals.totalSales}
          totalCommission={totals.totalCommission}
        />

        <div className="flex justify-start sm:justify-end">
          <ExportButton sales={filtered} year={year} month={month} />
        </div>

        <SalesTable sales={filtered} onUpdate={updateSale} onDelete={deleteSale} />
      </div>
    </div>
  );
}
