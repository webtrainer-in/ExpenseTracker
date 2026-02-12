import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { getCurrencySymbol } from "@/lib/currency";

interface WithdrawMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { amount: number; description: string; date: Date }) => void;
  currentBalance: number;
}

export function WithdrawMoneyDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  currentBalance 
}: WithdrawMoneyDialogProps) {
  const { data: settings } = useSettings();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const amountNum = parseFloat(amount);
  const hasInsufficientBalance = !isNaN(amountNum) && amountNum > currentBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    if (hasInsufficientBalance) {
      return;
    }

    if (!description.trim()) {
      return;
    }

    onSubmit({
      amount: amountNum,
      description: description.trim(),
      date: new Date(date),
    });

    // Reset form
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Withdraw Money from Wallet</DialogTitle>
          <DialogDescription>
            For non-expense transactions like investments, transfers, or loans
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            {/* Current Balance Display */}
            <Alert>
              <AlertDescription>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Wallet Balance:</span>
                  <span className="text-lg font-bold">
                    {getCurrencySymbol(settings?.currency || "USD")} {currentBalance.toFixed(2)}
                  </span>
                </div>
              </AlertDescription>
            </Alert>

            {/* Amount Field */}
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                  {getCurrencySymbol(settings?.currency || "USD")}
                </span>
                <Input
                  id="withdraw-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 font-mono"
                  required
                  data-testid="input-withdraw-amount"
                />
              </div>
              {hasInsufficientBalance && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Insufficient balance. You need {getCurrencySymbol(settings?.currency || "USD")} {(amountNum - currentBalance).toFixed(2)} more.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="withdraw-description">Description *</Label>
              <Textarea
                id="withdraw-description"
                placeholder="e.g., Investment in mutual fund, Loan to friend, Transfer to savings..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none h-24"
                required
                data-testid="input-withdraw-description"
              />
              <p className="text-xs text-muted-foreground">
                Describe the purpose of this withdrawal (investment, transfer, loan, etc.)
              </p>
            </div>

            {/* Date Field */}
            <div className="space-y-2">
              <Label htmlFor="withdraw-date">Date *</Label>
              <Input
                id="withdraw-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                data-testid="input-withdraw-date"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-4 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              data-testid="button-withdraw-submit"
              disabled={hasInsufficientBalance}
            >
              Withdraw Money
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
