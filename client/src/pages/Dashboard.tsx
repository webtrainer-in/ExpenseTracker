import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { UserHeader } from "@/components/UserHeader";
import { StatCard } from "@/components/StatCard";
import { ExpenseTable } from "@/components/ExpenseTable";
import { ExpenseChart } from "@/components/ExpenseChart";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, TrendingUp, Plus } from "lucide-react";
import type { Expense, User } from "@shared/schema";

interface ExpenseWithUser extends Expense {
  user: User;
}

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch expenses
  const expensesUrl = selectedCategory === "all"
    ? "/api/expenses"
    : `/api/expenses?category=${selectedCategory}`;
  const { data: expenses = [], isLoading: expensesLoading } = useQuery<ExpenseWithUser[]>({
    queryKey: [expensesUrl],
    enabled: isAuthenticated,
  });

  // Fetch stats
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      await apiRequest("POST", "/api/expenses", expenseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Expense created successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create expense",
        variant: "destructive",
      });
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  // Filter expenses by search query
  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Prepare expense data for table
  const tableExpenses = filteredExpenses.map((expense) => ({
    id: expense.id,
    date: expense.date.toString(),
    category: expense.category as any,
    description: expense.description,
    amount: parseFloat(expense.amount),
    user: expense.user ? {
      name: `${expense.user.firstName || ""} ${expense.user.lastName || ""}`.trim() || expense.user.email || "Unknown",
      avatar: expense.user.profileImageUrl || undefined,
    } : undefined,
  }));

  // Calculate stats
  const isAdmin = user?.role === "admin";
  const totalSpent = stats?.total || 0;
  const thisMonth = stats?.thisMonth || 0;
  const lastMonth = stats?.lastMonth || 0;
  const percentageChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : "0";

  // Prepare monthly chart data
  const monthlyData = expenses.reduce((acc: any[], expense) => {
    const date = new Date(expense.date);
    const monthYear = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const existing = acc.find((item) => item.month === monthYear);
    
    if (existing) {
      existing.amount += parseFloat(expense.amount);
    } else {
      acc.push({ month: monthYear, amount: parseFloat(expense.amount) });
    }
    return acc;
  }, []).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  }).slice(-6); // Last 6 months

  // Prepare category chart data
  const categoryTotals = expenses.reduce((acc: any, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});
  
  const total = Object.values(categoryTotals).reduce((sum: number, amount: any) => sum + amount, 0) as number;
  const categoryData = Object.entries(categoryTotals).map(([category, amount]: [string, any]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
  }));

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <UserHeader
        user={{
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User",
          email: user.email || "",
          role: user.role as "admin" | "member",
          avatar: user.profileImageUrl || undefined,
        }}
        onLogout={() => (window.location.href = "/api/logout")}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {isAdmin ? "Admin Dashboard" : "My Dashboard"}
          </h2>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Overview of family expenses and spending trends"
              : "Track and manage your personal expenses"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title={isAdmin ? "Total Family Spending" : "Total Spent"}
            value={`$${totalSpent.toFixed(2)}`}
            icon={DollarSign}
            testId="stat-total"
          />
          <StatCard
            title="This Month"
            value={`$${thisMonth.toFixed(2)}`}
            icon={Calendar}
            trend={{
              value: `${Math.abs(parseFloat(percentageChange))}% from last month`,
              isPositive: thisMonth <= lastMonth,
            }}
            testId="stat-month"
          />
          <StatCard
            title="Last Month"
            value={`$${lastMonth.toFixed(2)}`}
            icon={TrendingUp}
            testId="stat-last-month"
          />
        </div>

        {expenses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseChart
              type="monthly"
              data={monthlyData}
              title="Monthly Spending Trend"
            />
            <ExpenseChart
              type="category"
              data={categoryData}
              title="Spending by Category"
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {isAdmin ? "All Family Expenses" : "My Expenses"}
            </h3>
            <Button
              onClick={() => setAddDialogOpen(true)}
              data-testid="button-add-expense"
              disabled={createExpenseMutation.isPending}
            >
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

          {expensesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading expenses...</div>
          ) : (
            <ExpenseTable
              expenses={tableExpenses}
              showUser={isAdmin}
              onEdit={(expense) => console.log("Edit:", expense)}
              onDelete={(id) => deleteExpenseMutation.mutate(id)}
            />
          )}
        </div>
      </main>

      <AddExpenseDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={(expense) => createExpenseMutation.mutate(expense)}
      />
    </div>
  );
}
