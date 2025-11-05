import { StatCard } from "../StatCard";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="p-8 space-y-4 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Spent"
          value="$2,847"
          icon={DollarSign}
          trend={{ value: "12% from last month", isPositive: false }}
          testId="stat-total"
        />
        <StatCard
          title="This Month"
          value="$1,234"
          icon={Calendar}
          trend={{ value: "5% from last month", isPositive: true }}
          testId="stat-month"
        />
        <StatCard
          title="Budget Remaining"
          value="$766"
          icon={TrendingUp}
          testId="stat-budget"
        />
      </div>
    </div>
  );
}
