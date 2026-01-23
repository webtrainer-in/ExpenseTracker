import { useState, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, WalletBalance } from "@shared/schema";

interface AddMoneyToReserveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { amount: number; description: string; date: Date; source: string; selectedUserId?: string }) => void;
  adminWalletBalance: number;
  adminUserId: string;
  adminUserName: string;
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
  adminUserId,
  adminUserName,
  currency 
}: AddMoneyToReserveDialogProps) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState(SOURCE_OPTIONS[0]);
  const [customDescription, setCustomDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedUserId, setSelectedUserId] = useState<string>(""); // Will be set in useEffect

  // Initialize selectedUserId when dialog opens or adminUserId changes
  useEffect(() => {
    if (open && adminUserId && !selectedUserId) {
      setSelectedUserId(adminUserId);
    }
  }, [open, adminUserId, selectedUserId]);

  // Fetch all users for the dropdown
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: open,
  });

  // Fetch selected user's wallet balance
  const { data: selectedUserWallet, isLoading: isLoadingUserWallet } = useQuery<WalletBalance>({
    queryKey: ["/api/wallet/balance", selectedUserId],
    queryFn: async () => {
      console.log('Fetching wallet balance for userId:', selectedUserId);
      const response = await fetch(`/api/wallet/balance?userId=${selectedUserId}`);
      if (!response.ok) throw new Error('Failed to fetch wallet balance');
      const data = await response.json();
      console.log('Fetched wallet balance:', data);
      return data;
    },
    enabled: !!selectedUserId && source === "Added from Wallet",
  });

  // Reset selected user when source changes
  useEffect(() => {
    if (source !== "Added from Wallet") {
      setSelectedUserId(adminUserId);
    }
  }, [source, adminUserId]);

  const amountNum = parseFloat(amount);
  
  // Determine which wallet balance to check
  // If we have query data, use it; otherwise fall back to adminWalletBalance prop
  const walletToCheck = selectedUserWallet 
    ? parseFloat(selectedUserWallet.currentBalance || "0")
    : adminWalletBalance;
  
  console.log('Selected User ID:', selectedUserId);
  console.log('Admin User ID:', adminUserId);
  console.log('Selected User Wallet:', selectedUserWallet);
  console.log('Wallet to Check:', walletToCheck);
  
  const selectedUser = users.find((u: User) => u.id === selectedUserId);
  const showWalletWarning = source === "Added from Wallet" && amountNum > walletToCheck;

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
    if (source === "Added from Wallet" && amountNum > walletToCheck) {
      return;
    }

    // Build final description
    let finalDescription = source;
    if (source === "Added from Wallet" && selectedUserId) {
      const userName = selectedUser?.firstName 
        ? `${selectedUser.firstName} ${selectedUser.lastName || ''}`.trim()
        : selectedUser?.email || "User";
      finalDescription = `Added from ${userName}'s wallet by admin`;
      if (customDescription.trim()) {
        finalDescription += ` - ${customDescription}`;
      }
    } else if (customDescription.trim()) {
      finalDescription = source === "Others" 
        ? `Others: ${customDescription}` 
        : `${source} - ${customDescription}`;
    }

    onSubmit({
      amount: amountNum,
      description: finalDescription,
      date: new Date(date),
      source,
      selectedUserId: selectedUserId !== adminUserId ? selectedUserId : undefined,
    });

    // Reset form
    setAmount("");
    setSource(SOURCE_OPTIONS[0]);
    setCustomDescription("");
    setSelectedUserId(adminUserId);
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
            <>
              <div className="space-y-2">
                <Label htmlFor="user-select">Select User (Optional)</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger id="user-select">
                    <SelectValue placeholder="Your own wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={adminUserId}>Your own wallet ({adminUserName})</SelectItem>
                    {users
                      .filter((u: User) => u.id !== adminUserId)
                      .map((user: User) => {
                        const displayName = user.firstName 
                          ? `${user.firstName} ${user.lastName || ''}`.trim()
                          : user.email;
                        return (
                          <SelectItem key={user.id} value={user.id}>
                            {displayName}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {selectedUserId && selectedUserId !== adminUserId
                    ? `${selectedUser?.firstName ? `${selectedUser.firstName} ${selectedUser.lastName || ''}`.trim() : selectedUser?.email}'s wallet balance: ${currency} ${walletToCheck.toFixed(2)}`
                    : `Your wallet balance: ${currency} ${adminWalletBalance.toFixed(2)}`
                  }
                </AlertDescription>
              </Alert>
            </>
          )}

          {showWalletWarning && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient wallet balance. Need {currency} {amountNum.toFixed(2)} but only have {currency} {walletToCheck.toFixed(2)}
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
