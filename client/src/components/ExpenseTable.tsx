import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./CategoryBadge";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/currency";

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod?: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  showUser?: boolean;
  currency?: string;
}

export function ExpenseTable({ expenses, onEdit, onDelete, showUser = false, currency = "USD" }: ExpenseTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Description</TableHead>
            {showUser && <TableHead>User</TableHead>}
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showUser ? 7 : 6}
                className="text-center text-muted-foreground py-8"
              >
                No expenses found
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow
                key={expense.id}
                onMouseEnter={() => setHoveredRow(expense.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className="hover-elevate"
                data-testid={`row-expense-${expense.id}`}
              >
                <TableCell className="font-medium text-sm">
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <CategoryBadge category={expense.category} />
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {expense.paymentMethod || "UPI"}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatCurrency(expense.amount, currency)}
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                {showUser && expense.user && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={expense.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {expense.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{expense.user.name}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <div
                    className="flex items-center gap-1 justify-end"
                    style={{ visibility: hoveredRow === expense.id ? "visible" : "hidden" }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(expense)}
                      data-testid={`button-edit-${expense.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete?.(expense.id)}
                      data-testid={`button-delete-${expense.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
