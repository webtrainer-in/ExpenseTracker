import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useSettings } from "@/hooks/useSettings";
import { getCurrencySymbol } from "@/lib/currency";

interface Expense {
  id: string;
  amount: string | number;
  category: string;
  description: string;
  date: string | Date;
  paymentMethod?: string;
}

interface EditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onSubmit?: (id: string, expense: {
    amount: number;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
  }) => void;
}

export function EditExpenseDialog({ open, onOpenChange, expense, onSubmit }: EditExpenseDialogProps) {
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategory(expense.category.toLowerCase());
      setDescription(expense.description);
      const expenseDate = new Date(expense.date);
      setDate(expenseDate.toISOString().split("T")[0]);
      setPaymentMethod(expense.paymentMethod || "UPI");
    }
  }, [expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expense) {
      onSubmit?.(expense.id, {
        amount: parseFloat(amount),
        category,
        description,
        date,
        paymentMethod,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col" data-testid="dialog-edit-expense">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the details of your expense below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                  {getCurrencySymbol(settings?.currency || "USD")}
                </span>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 font-mono"
                  required
                  data-testid="input-edit-amount"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
              >
                <SelectTrigger id="edit-category" data-testid="select-edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === "UPI" ? "default" : "outline"}
                  className="h-12 text-sm font-semibold"
                  onClick={() => setPaymentMethod("UPI")}
                  data-testid="button-edit-payment-upi"
                >
                  UPI
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "CASH" ? "default" : "outline"}
                  className="h-12 text-sm font-semibold"
                  onClick={() => setPaymentMethod("CASH")}
                  data-testid="button-edit-payment-cash"
                >
                  Cash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "CARD" ? "default" : "outline"}
                  className="h-12 text-sm font-semibold"
                  onClick={() => setPaymentMethod("CARD")}
                  data-testid="button-edit-payment-card"
                >
                  Card
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                data-testid="input-edit-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="What was this expense for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none h-24"
                required
                data-testid="input-edit-description"
              />
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save-edit-expense">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
