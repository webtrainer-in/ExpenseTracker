import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ReserveWalletCardProps {
  balance: number;
  currency: string;
  onAddMoney: () => void;
  isLoading?: boolean;
}

export function ReserveWalletCard({ balance, currency, onAddMoney, isLoading }: ReserveWalletCardProps) {
  const isNegative = balance < 0;
  const balanceColor = isNegative ? "text-red-600" : "text-green-600";

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reserve Wallet (Admin Only)</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Reserve Wallet (Admin Only)</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${balanceColor}`}>
          {currency} {balance.toFixed(2)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Shared family reserve fund
        </p>
        <div className="mt-4 flex gap-2">
          <Button onClick={onAddMoney} size="sm" className="flex-1">
            <Plus className="h-4 w-4 mr-1" />
            Add Money to Reserve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
