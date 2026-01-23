import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AddMoneyToReserveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { amount: number; description: string; date: Date; source: string }) => void;
  adminWalletBalance: number;
  currency: string;
}

const SOURCE_OPTIONS = [
  "ATM Withdrawal",
  "Added from Wallet",
  "Others",
];

export function AddMoneyToReserveDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  adminWalletBalance,
  currency 
}: AddMoneyToReserveDialogProps) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState(SOURCE_OPTIONS[0]);
  const [customDescription, setCustomDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const amountNum = parseFloat(amount);
  const showWalletWarning = source === "Added from Wallet" && amountNum > adminWalletBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    // Validate custom description if "Others" is selected
    if (source === "Others" && !customDescription.trim()) {
      return;
    }

    // Validate wallet balance if "Added from Wallet"
    if (source === "Added from Wallet" && amountNum > adminWalletBalance) {
      return;
    }

    // Build final description
    let finalDescription = source;
    if (customDescription.trim()) {
      finalDescription = source === "Others" 
        ? `Others: ${customDescription}` 
        : `${source} - ${customDescription}`;
    }

    onSubmit({
      amount: amountNum,
      description: finalDescription,
      date: new Date(date),
      source,
    });

    // Reset form
    setAmount("");
    setSource(SOURCE_OPTIONS[0]);
    setCustomDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Money to Reserve Wallet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              data-testid="input-amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source of Money *</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="source" data-testid="select-source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {source === "Added from Wallet" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your wallet balance: {currency} {adminWalletBalance.toFixed(2)}
              </AlertDescription>
            </Alert>
          )}

          {showWalletWarning && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient wallet balance. You need {currency} {amountNum.toFixed(2)} but only have {currency} {adminWalletBalance.toFixed(2)}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="customDescription">
              Description {source === "Others" && "*"}
            </Label>
            <Input
              id="customDescription"
              type="text"
              placeholder={source === "Others" ? "Enter description (required)" : "Add optional note"}
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              required={source === "Others"}
              data-testid="input-custom-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              data-testid="input-date"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              data-testid="button-submit"
              disabled={showWalletWarning}
            >
              Add Money
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
