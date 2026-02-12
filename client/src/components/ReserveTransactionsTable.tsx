import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search } from "lucide-react";

interface ReserveTransactionFromAPI {
  id: string;
  type: string;
  amount: string;
  description: string;
  performedByUserId: string;
  relatedWalletTransactionId: string | null;
  balanceAfter: string;
  date: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

interface ReserveTransactionsTableProps {
  transactions: ReserveTransactionFromAPI[];
  currency: string;
  users: User[];
}

export function ReserveTransactionsTable({
  transactions,
  currency,
  users,
}: ReserveTransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;
      const matchesUser =
        userFilter === "all" || transaction.performedByUserId === userFilter;

      return matchesSearch && matchesType && matchesUser;
    });
  }, [transactions, searchQuery, typeFilter, userFilter]);

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return "Unknown";
    return user.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user.email || "Unknown";
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Date",
      "Performed By",
      "Type",
      "Amount",
      "Description",
      "Balance After",
    ];

    const rows = filteredTransactions.map((t) => [
      format(new Date(t.date), "dd/MM/yyyy HH:mm"),
      getUserName(t.performedByUserId),
      t.type,
      t.amount,
      t.description,
      t.balanceAfter,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reserve-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="w-[180px]">
          <Label htmlFor="type-filter">Transaction Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="type-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[200px]">
          <Label htmlFor="user-filter">Performed By</Label>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger id="user-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName
                    ? `${user.firstName} ${user.lastName || ""}`.trim()
                    : user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Balance After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.date), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {getUserName(transaction.performedByUserId)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.type === "deposit"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {currency} {parseFloat(transaction.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {transaction.description}
                  </TableCell>
                  <TableCell className="text-right">
                    {currency} {parseFloat(transaction.balanceAfter).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTransactions.length} of {transactions.length}{" "}
        transactions
      </div>
    </div>
  );
}
