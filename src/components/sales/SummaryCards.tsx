import { formatILS } from "@/types/sale";

type Props = {
  count: number;
  totalSales: number;
  totalCommission: number;
};

function Card({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className={`mt-2 text-2xl sm:text-3xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

export function SummaryCards({ count, totalSales, totalCommission }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card title="כמות מערכות שנמכרו" value={String(count)} accent="text-foreground" />
      <Card title='סה״כ מכירות' value={formatILS(totalSales)} accent="text-primary" />
      <Card title='סה״כ עמלה לחודש' value={formatILS(totalCommission)} accent="text-accent-foreground" />
    </div>
  );
}
