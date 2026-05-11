import { Package, Receipt, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatILS } from "@/types/sale";

type Props = {
  count: number;
  totalSales: number;
  totalCommission: number;
};

function Card({
  title,
  value,
  Icon,
  highlight,
}: {
  title: string;
  value: string;
  Icon: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div
        className={`mt-2 text-2xl sm:text-3xl font-bold ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function SummaryCards({ count, totalSales, totalCommission }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card title="כמות מערכות שנמכרו" value={String(count)} Icon={Package} />
      <Card title="סה״כ מכירות" value={formatILS(totalSales)} Icon={Receipt} />
      <Card
        title="סה״כ עמלה לחודש"
        value={formatILS(totalCommission)}
        Icon={Wallet}
        highlight
      />
    </div>
  );
}
