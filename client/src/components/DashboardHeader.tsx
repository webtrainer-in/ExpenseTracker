import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DashboardHeaderProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthlyData: Array<{ month: string; amount: number }>;
  onExportSummary?: () => void;
  onExportDetails?: () => void;
  showExportButtons?: boolean;
}

export function DashboardHeader({
  selectedMonth,
  onMonthChange,
  monthlyData,
  onExportSummary,
  onExportDetails,
  showExportButtons = false,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="w-full sm:w-[250px]">
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger data-testid="select-month-year-header">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {monthlyData.slice().reverse().map((item) => {
              const [month, year] = item.month.split(' ');
              const monthNum = new Date(`${month} 1, ${year}`).getMonth() + 1;
              const monthYearValue = `${year}-${String(monthNum).padStart(2, '0')}`;
              return (
                <SelectItem key={monthYearValue} value={monthYearValue}>
                  {item.month}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      {showExportButtons && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportSummary}
            data-testid="button-export-summary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Summary
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportDetails}
            data-testid="button-export-detail"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Details
          </Button>
        </div>
      )}
    </div>
  );
}
