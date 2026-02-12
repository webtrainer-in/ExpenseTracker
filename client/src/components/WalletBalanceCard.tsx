import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface WalletBalanceCardProps {
  balance: number;
  currency: string;
  onAddMoney: () => void;
  onWithdraw: () => void;
  isLoading?: boolean;
}

export function WalletBalanceCard({
  balance,
  currency,
  onAddMoney,
  onWithdraw,
  isLoading = false,
}: WalletBalanceCardProps) {
  const isNegative = balance < 0;
  const balanceColor = isNegative ? "text-destructive" : "text-green-600 dark:text-green-500";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div className={`text-2xl font-bold ${balanceColor}`}>
              {formatCurrency(balance, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current cash on hand
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={onAddMoney}
                size="sm"
                className="flex-1"
                data-testid="button-add-money"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Money
              </Button>
              <Button
                onClick={onWithdraw}
                size="sm"
                variant="outline"
                className="flex-1"
                data-testid="button-withdraw-money"
              >
                <Minus className="h-4 w-4 mr-1" />
                Withdraw
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
