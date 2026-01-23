import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { WalletBalance, WalletTransaction } from "@shared/schema";

export function useWallet() {
  const { toast } = useToast();

  // Fetch wallet balance
  const { data: balance, isLoading: balanceLoading } = useQuery<WalletBalance>({
    queryKey: ["/api/wallet/balance"],
  });

  // Fetch wallet transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/wallet/transactions"],
  });

  // Add money mutation
  const addMoneyMutation = useMutation({
    mutationFn: async (data: { amount: number; description: string; date: Date }) => {
      await apiRequest("POST", "/api/wallet/deposit", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({
        title: "Success",
        description: "Money added to wallet successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add money to wallet",
        variant: "destructive",
      });
    },
  });

  return {
    balance,
    transactions,
    isLoading: balanceLoading || transactionsLoading,
    addMoney: addMoneyMutation.mutate,
    isAddingMoney: addMoneyMutation.isPending,
  };
}
