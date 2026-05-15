import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSales } from "@/hooks/useSales";
import { useAuth } from "@/hooks/useAuth";
import { SalesForm } from "@/components/sales/SalesForm";
import { MonthSelect } from "@/components/sales/MonthSelect";
import { SummaryCards } from "@/components/sales/SummaryCards";
import { SalesTable } from "@/components/sales/SalesTable";
import { ExportButton } from "@/components/sales/ExportButton";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  const { profile, signOut } = useAuth();
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const { sales, isLoading, availableYears, addSale, updateSale, deleteSale } = useSales(
    year,
    month
  );

  const years = useMemo(() => {
    const set = new Set<number>([today.getFullYear(), year, ...availableYears]);
    return Array.from(set).sort((a, b) => b - a);
  }, [availableYears, today, year]);

  const totals = useMemo(
    () =>
      sales.reduce(
        (acc, s) => {
          acc.totalSales += s.systemPrice;
          acc.totalCommission += s.commission;
          return acc;
        },
        { totalSales: 0, totalCommission: 0 }
      ),
    [sales]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">מעקב מכירות חודשי</h1>
            {profile ? (
              <p className="text-sm sm:text-base text-muted-foreground">
                שלום, {profile.displayName}
              </p>
            ) : (
              <p className="text-sm sm:text-base text-muted-foreground">
                ניהול מכירות, עמלות וייצוא דוח חודשי לאקסל
              </p>
            )}
          </div>
          <button
            onClick={signOut}
            className="h-9 px-4 rounded-lg border border-input bg-background text-sm font-medium text-foreground hover:bg-accent transition-colors shrink-0"
          >
            התנתק
          </button>
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

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        ) : (
          <>
            <SummaryCards
              count={sales.length}
              totalSales={totals.totalSales}
              totalCommission={totals.totalCommission}
            />

            <div className="flex justify-start sm:justify-end">
              <ExportButton
                sales={sales}
                year={year}
                month={month}
                displayName={profile?.displayName ?? ""}
              />
            </div>

            <SalesTable sales={sales} onUpdate={updateSale} onDelete={deleteSale} />
          </>
        )}
      </div>
    </div>
  );
}
