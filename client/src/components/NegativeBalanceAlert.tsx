import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface NegativeBalanceAlertProps {
  balance: number;
  currency: string;
  onAddMoney: () => void;
}

export function NegativeBalanceAlert({
  balance,
  currency,
  onAddMoney,
}: NegativeBalanceAlertProps) {
  const amountNeeded = Math.abs(balance);

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Negative Wallet Balance</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          Your wallet balance is negative: <strong>{formatCurrency(balance, currency)}</strong>
        </p>
        <p className="text-sm mb-3">
          Add {formatCurrency(amountNeeded, currency)} or more to reach positive balance.
        </p>
        <Button onClick={onAddMoney} size="sm" variant="outline">
          Add Money Now
        </Button>
      </AlertDescription>
    </Alert>
  );
}
