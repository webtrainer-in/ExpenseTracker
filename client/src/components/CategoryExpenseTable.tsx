import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryBadge } from "./CategoryBadge";
import { formatCurrency } from "@/lib/currency";

interface CategoryExpenseItem {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

interface CategoryExpenseTableProps {
  data: CategoryExpenseItem[];
  currency?: string;
  totalAmount?: number;
}

export function CategoryExpenseTable({
  data,
  currency = "USD",
  totalAmount = 0,
}: CategoryExpenseTableProps) {
  // Sort by amount in descending order
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Count</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No expenses in this category for the selected month
              </TableCell>
            </TableRow>
          ) : (
            <>
              {sortedData.map((item) => (
                <TableRow key={item.category} className="hover:bg-muted/50">
                  <TableCell>
                    <CategoryBadge category={item.category.toLowerCase()} />
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(item.amount, currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.count}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm text-muted-foreground">
                      {item.percentage}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(totalAmount, currency)}
                </TableCell>
                <TableCell className="text-right">
                  {sortedData.reduce((sum, item) => sum + item.count, 0)}
                </TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
