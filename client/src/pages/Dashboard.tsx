import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { UserHeader } from "@/components/UserHeader";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { ExpenseTable } from "@/components/ExpenseTable";
import { CategoryExpenseTable } from "@/components/CategoryExpenseTable";
import { UserExpenseTable } from "@/components/UserExpenseTable";
import { ExpenseChart } from "@/components/ExpenseChart";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Calendar, TrendingUp, Plus, FileText, BarChart3, Table } from "lucide-react";
import type { Expense, User } from "@shared/schema";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency } from "@/lib/currency";
import { exportSummaryToCSV, exportDetailToCSV, exportUserSummaryToCSV } from "@/lib/csvExport";

interface ExpenseWithUser extends Expense {
  user: User;
}

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expenseBookCategory, setExpenseBookCategory] = useState("all");
  const [expenseBookMonth, setExpenseBookMonth] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState("all");
  const [activeTab, setActiveTab] = useState("data-entry");
  const [summarySubTab, setSummarySubTab] = useState("category");
  
  // Initialize with current month
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthYear, setSelectedMonthYear] = useState(defaultMonth);

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

  // Fetch expenses for Expense Book (filtered by category)
  const expensesUrl = expenseBookCategory === "all"
    ? "/api/expenses"
    : `/api/expenses?category=${expenseBookCategory}`;
  const { data: expenses = [], isLoading: expensesLoading } = useQuery<ExpenseWithUser[]>({
    queryKey: [expensesUrl],
    enabled: isAuthenticated,
  });

  // Fetch all expenses for dashboard (unfiltered for charts)
  const { data: allExpenses = [] } = useQuery<ExpenseWithUser[]>({
    queryKey: ["/api/expenses"],
    enabled: isAuthenticated,
  });

  // Fetch stats
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
  });

  // Fetch settings for currency
  const { data: settings } = useSettings();

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      await apiRequest("POST", "/api/expenses", expenseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === "string" && key.startsWith("/api/expenses");
        },
      });
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

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/expenses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === "string" && key.startsWith("/api/expenses");
        },
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Expense updated successfully",
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
        description: "Failed to update expense",
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
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === "string" && key.startsWith("/api/expenses");
        },
      });
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

  // Filter expenses by search query and month
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = selectedUser === "all" || expense.user?.id === selectedUser;
    
    // Always filter by selectedMonthYear (from DashboardHeader) or expenseBookMonth (from drill-down)
    const monthToFilter = expenseBookMonth || selectedMonthYear;
    const [year, month] = monthToFilter.split('-').map(Number);
    const expenseDate = new Date(expense.date);
    const matchesMonth = expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === month;
    
    return matchesSearch && matchesUser && matchesMonth;
  });

  // Prepare expense data for table
  const tableExpenses = filteredExpenses.map((expense) => ({
    id: expense.id,
    date: expense.date.toString(),
    category: expense.category as any,
    description: expense.description,
    amount: parseFloat(expense.amount),
    paymentMethod: expense.paymentMethod,
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

  // Get selected month's date range
  const [selectedYear, selectedMonthNum] = selectedMonthYear.split('-').map(Number);
  const firstDaySelectedMonth = new Date(selectedYear, selectedMonthNum - 1, 1);
  const lastDaySelectedMonth = new Date(selectedYear, selectedMonthNum, 0, 23, 59, 59, 999);

  // Filter expenses for selected month only (using all expenses for dashboard)
  const selectedMonthExpenses = allExpenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= firstDaySelectedMonth && expenseDate <= lastDaySelectedMonth;
  });

  // Prepare monthly chart data (from all expenses)
  const monthlyData = allExpenses.reduce((acc: any[], expense) => {
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

  // Prepare category chart data using selected month expenses only (from all expenses)
  const categoryTotals = selectedMonthExpenses.reduce((acc: any, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = { amount: 0, count: 0 };
    }
    acc[category].amount += parseFloat(expense.amount);
    acc[category].count += 1;
    return acc;
  }, {});
  
  const total = Object.values(categoryTotals).reduce((sum: number, item: any) => sum + item.amount, 0) as number;
  const categoryData = Object.entries(categoryTotals).map(([category, data]: [string, any]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount: data.amount,
    percentage: total > 0 ? Math.round((data.amount / total) * 100) : 0,
    count: data.count,
  }));

  // Prepare category expense table data
  const categoryTableData = Object.entries(categoryTotals).map(([category, data]: [string, any]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount: data.amount,
    percentage: total > 0 ? Math.round((data.amount / total) * 100) : 0,
    count: data.count,
  }));

  // Prepare user expense table data
  const userTotals = selectedMonthExpenses.reduce((acc: any, expense) => {
    const userId = expense.user?.id || 'unknown';
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        userName: expense.user ? `${expense.user.firstName || ""} ${expense.user.lastName || ""}`.trim() || expense.user.email || "Unknown" : "Unknown",
        userAvatar: expense.user?.profileImageUrl,
        amount: 0,
        count: 0
      };
    }
    acc[userId].amount += parseFloat(expense.amount);
    acc[userId].count += 1;
    return acc;
  }, {});

  const userTableData = Object.values(userTotals).map((data: any) => ({
    userId: data.userId,
    userName: data.userName,
    userAvatar: data.userAvatar,
    amount: data.amount,
    percentage: total > 0 ? Math.round((data.amount / total) * 100) : 0,
    count: data.count,
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList data-testid="tabs-main">
            <TabsTrigger value="data-entry" data-testid="tab-data-entry">
              <FileText className="h-4 w-4 mr-2" />
              Expense Book
            </TabsTrigger>
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="summary" data-testid="tab-summary">
              <Table className="h-4 w-4 mr-2" />
              Expense Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data-entry" className="space-y-4">
            <div className="w-full sm:w-[250px]">
              <DashboardHeader
                selectedMonth={selectedMonthYear}
                onMonthChange={setSelectedMonthYear}
                monthlyData={monthlyData}
                showExportButtons={false}
              />
            </div>

            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={expenseBookCategory}
              onCategoryChange={(category) => {
                setExpenseBookCategory(category);
                setExpenseBookMonth(null); // Reset month filter when manually changing category
              }}
              selectedUser={selectedUser}
              onUserChange={setSelectedUser}
              users={expenses.map(e => e.user).filter((u, index, self) => u && self.findIndex(x => x?.id === u?.id) === index) as User[]}
              showUserFilter={isAdmin}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold">Expense Book</h3>
              <Button
                onClick={() => setAddDialogOpen(true)}
                data-testid="button-add-expense"
                disabled={createExpenseMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>

            {expensesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading expenses...</div>
            ) : (
              <ExpenseTable
                expenses={tableExpenses}
                showUser={isAdmin}
                currency={settings?.currency || "USD"}
                onEdit={(expense) => {
                  const fullExpense = expenses.find((e) => e.id === expense.id);
                  if (fullExpense) {
                    setSelectedExpense(fullExpense);
                    setEditDialogOpen(true);
                  }
                }}
                onDelete={(id) => deleteExpenseMutation.mutate(id)}
              />
            )}
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardHeader
              selectedMonth={selectedMonthYear}
              onMonthChange={setSelectedMonthYear}
              monthlyData={monthlyData}
              showExportButtons={false}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title={isAdmin ? "Total Family Spending" : "Total Spent"}
                value={formatCurrency(totalSpent, settings?.currency || "USD")}
                icon={DollarSign}
                testId="stat-total"
              />
              <StatCard
                title="This Month"
                value={formatCurrency(thisMonth, settings?.currency || "USD")}
                icon={Calendar}
                trend={{
                  value: `${Math.abs(parseFloat(percentageChange))}% from last month`,
                  isPositive: thisMonth <= lastMonth,
                }}
                testId="stat-month"
              />
              <StatCard
                title="Last Month"
                value={formatCurrency(lastMonth, settings?.currency || "USD")}
                icon={TrendingUp}
                testId="stat-last-month"
              />
            </div>

            {expenses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ExpenseChart
                    type="monthly"
                    data={monthlyData}
                    title="Monthly Spending Trend"
                    currency={settings?.currency || "USD"}
                  />
                  <ExpenseChart
                    type="category"
                    data={categoryData}
                    title={`Spending by Category - ${new Date(selectedYear, selectedMonthNum - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
                    currency={settings?.currency || "USD"}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No expense data available yet. Add some expenses to see charts and insights.
              </div>
            )}
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <DashboardHeader
              selectedMonth={selectedMonthYear}
              onMonthChange={setSelectedMonthYear}
              monthlyData={monthlyData}
              showExportButtons={false}
            />

            {expenses.length > 0 ? (
              <Tabs value={summarySubTab} onValueChange={setSummarySubTab} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="category">Category-wise</TabsTrigger>
                  {isAdmin && <TabsTrigger value="user">User-wise</TabsTrigger>}
                </TabsList>

                <TabsContent value="category" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Category-wise Breakdown - {new Date(selectedYear, selectedMonthNum - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          exportSummaryToCSV(
                            categoryTableData,
                            selectedMonthYear,
                            settings?.currency || "USD"
                          );
                        }}
                      >
                        Export Summary
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const detailData = selectedMonthExpenses.map((expense) => ({
                            date: new Date(expense.date).toLocaleDateString(),
                            category: expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
                            description: expense.description,
                            amount: parseFloat(expense.amount),
                            user: expense.user ? `${expense.user.firstName || ""} ${expense.user.lastName || ""}`.trim() || expense.user.email || undefined : undefined,
                          }));
                          exportDetailToCSV(
                            detailData,
                            selectedMonthYear,
                            isAdmin
                          );
                        }}
                      >
                        Export Details
                      </Button>
                    </div>
                  </div>
                  <CategoryExpenseTable
                    data={categoryTableData}
                    currency={settings?.currency || "USD"}
                    totalAmount={total}
                    onCountClick={(category) => {
                      setExpenseBookCategory(category);
                      setExpenseBookMonth(selectedMonthYear);
                      setActiveTab("data-entry");
                    }}
                  />
                </TabsContent>

                {isAdmin && (
                  <TabsContent value="user" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        User-wise Breakdown - {new Date(selectedYear, selectedMonthNum - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            exportUserSummaryToCSV(
                              userTableData.map(u => ({
                                userName: u.userName,
                                amount: u.amount,
                                count: u.count,
                                percentage: u.percentage
                              })),
                              selectedMonthYear,
                              settings?.currency || "USD"
                            );
                          }}
                        >
                          Export Summary
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const detailData = selectedMonthExpenses.map((expense) => ({
                              date: new Date(expense.date).toLocaleDateString(),
                              category: expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
                              description: expense.description,
                              amount: parseFloat(expense.amount),
                              user: expense.user ? `${expense.user.firstName || ""} ${expense.user.lastName || ""}`.trim() || expense.user.email || undefined : undefined,
                            }));
                            exportDetailToCSV(
                              detailData,
                              selectedMonthYear,
                              isAdmin
                            );
                          }}
                        >
                          Export Details
                        </Button>
                      </div>
                    </div>
                    {userTableData.length > 0 ? (
                      <UserExpenseTable
                        data={userTableData}
                        currency={settings?.currency || "USD"}
                        totalAmount={total}
                        onCountClick={(userId) => {
                          setSelectedUser(userId);
                          setExpenseBookMonth(selectedMonthYear);
                          setActiveTab("data-entry");
                        }}
                      />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No user expense data available for the selected month.
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No expense data available yet. Add some expenses to see charts and insights.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AddExpenseDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={(expense) => createExpenseMutation.mutate(expense)}
      />

      <EditExpenseDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        expense={selectedExpense}
        onSubmit={(id, data) => updateExpenseMutation.mutate({ id, data })}
      />
    </div>
  );
}
