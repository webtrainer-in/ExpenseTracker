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

interface AddMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { amount: number; description: string; date: Date }) => void;
}

const SOURCE_OPTIONS = [
  "ATM Withdrawal",
  "Added from Reserve",
  "Others",
];

export function AddMoneyDialog({ open, onOpenChange, onSubmit }: AddMoneyDialogProps) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState(SOURCE_OPTIONS[0]);
  const [customDescription, setCustomDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    // Validate custom description if "Others" is selected
    if (source === "Others" && !customDescription.trim()) {
      return;
    }

    // Build final description based on source and custom description
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
          <DialogTitle>Add Money to Wallet</DialogTitle>
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
            <Button type="submit" data-testid="button-submit">
              Add Money
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
