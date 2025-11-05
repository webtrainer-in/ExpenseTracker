import { ExpenseChart } from "../ExpenseChart";

export default function ExpenseChartExample() {
  const monthlyData = [
    { month: "Sep", amount: 1250 },
    { month: "Oct", amount: 1450 },
    { month: "Nov", amount: 1100 },
    { month: "Dec", amount: 1850 },
    { month: "Jan", amount: 1234 },
  ];

  const categoryData = [
    { category: "Groceries", amount: 450, percentage: 36 },
    { category: "Utilities", amount: 280, percentage: 23 },
    { category: "Dining", amount: 220, percentage: 18 },
    { category: "Transportation", amount: 184, percentage: 15 },
    { category: "Other", amount: 100, percentage: 8 },
  ];

  return (
    <div className="p-8 bg-background space-y-6">
      <ExpenseChart type="monthly" data={monthlyData} title="Monthly Spending Trend" />
      <ExpenseChart type="category" data={categoryData} title="Spending by Category" />
    </div>
  );
}
