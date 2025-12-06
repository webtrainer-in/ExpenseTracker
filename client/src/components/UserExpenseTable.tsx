import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";

interface UserExpenseItem {
  userId: string;
  userName: string;
  userAvatar?: string;
  amount: number;
  percentage: number;
  count: number;
}

interface UserExpenseTableProps {
  data: UserExpenseItem[];
  currency?: string;
  totalAmount?: number;
  onCountClick?: (userId: string) => void;
}

export function UserExpenseTable({
  data,
  currency = "USD",
  totalAmount = 0,
  onCountClick,
}: UserExpenseTableProps) {
  // Sort by amount in descending order
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Count</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No expenses for the selected month
              </TableCell>
            </TableRow>
          ) : (
            <>
              {sortedData.map((item) => (
                <TableRow key={item.userId} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.userAvatar} alt={item.userName} />
                        <AvatarFallback>{getInitials(item.userName)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{item.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(item.amount, currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-blue-600 hover:text-blue-800 underline cursor-pointer"
                      onClick={() => onCountClick?.(item.userId)}
                    >
                      {item.count}
                    </Button>
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
