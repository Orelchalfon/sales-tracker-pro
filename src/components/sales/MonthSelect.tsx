import { HEBREW_MONTHS } from "@/types/sale";

type Props = {
  month: number;
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  years: number[];
};

export function MonthSelect({ month, year, onMonthChange, onYearChange, years }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium text-foreground mb-1.5">בחר חודש</label>
        <select
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="w-full h-11 rounded-lg border border-input bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {HEBREW_MONTHS.map((m, i) => (
            <option key={m} value={i}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:w-40">
        <label className="block text-sm font-medium text-foreground mb-1.5">שנה</label>
        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="w-full h-11 rounded-lg border border-input bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
