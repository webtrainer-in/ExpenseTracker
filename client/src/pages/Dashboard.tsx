import { useState } from "react";
import { UserHeader } from "@/components/UserHeader";
import { StatCard } from "@/components/StatCard";
import { ExpenseTable, type Expense } from "@/components/ExpenseTable";
import { ExpenseChart } from "@/components/ExpenseChart";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, TrendingUp, Plus } from "lucide-react";
import avatar1 from "@assets/generated_images/Male_family_member_avatar_a839230d.png";
import avatar2 from "@assets/generated_images/Female_family_member_avatar_5b3b40fd.png";
import avatar3 from "@assets/generated_images/Young_adult_avatar_957d036b.png";

export default function Dashboard() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const currentUser = {
    name: "John Doe",
    email: "john@family.com",
    role: "admin" as const,
    avatar: avatar1,
  };

  const mockExpenses: Expense[] = [
    {
      id: "1",
      date: "2025-01-05",
      category: "groceries",
      description: "Weekly grocery shopping at Whole Foods",
      amount: 156.43,
      user: { name: "John Doe", avatar: avatar1 },
    },
    {
      id: "2",
      date: "2025-01-04",
      category: "utilities",
      description: "Electric bill payment",
      amount: 89.99,
      user: { name: "Sarah Doe", avatar: avatar2 },
    },
    {
      id: "3",
      date: "2025-01-03",
      category: "dining",
      description: "Family dinner at Italian restaurant",
      amount: 124.50,
      user: { name: "John Doe", avatar: avatar1 },
    },
    {
      id: "4",
      date: "2025-01-02",
      category: "transportation",
      description: "Gas station fill-up",
      amount: 52.30,
      user: { name: "Alex Doe", avatar: avatar3 },
    },
    {
      id: "5",
      date: "2025-01-01",
      category: "entertainment",
      description: "Movie tickets for family",
      amount: 68.00,
      user: { name: "Sarah Doe", avatar: avatar2 },
    },
  ];

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
    <div className="min-h-screen bg-background">
      <UserHeader user={currentUser} onLogout={() => console.log("Logout")} />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of family expenses and spending trends
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Family Spending"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseChart type="monthly" data={monthlyData} title="Monthly Spending Trend" />
          <ExpenseChart type="category" data={categoryData} title="Spending by Category" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Recent Expenses</h3>
            <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-expense">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>

          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <ExpenseTable
            expenses={mockExpenses}
            showUser={true}
            onEdit={(expense) => console.log("Edit:", expense)}
            onDelete={(id) => console.log("Delete:", id)}
          />
        </div>
      </main>

      <AddExpenseDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={(expense) => console.log("New expense:", expense)}
      />
    </div>
  );
}
