import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ReserveWallet {
  id: string;
  currentBalance: string;
  createdAt: string;
  updatedAt: string;
}

interface ReserveTransaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  performedByUserId: string;
  relatedWalletTransactionId: string | null;
  balanceAfter: string;
  date: string;
  createdAt: string;
}

async function apiRequest(method: string, url: string, data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (response.status === 401) {
    window.location.href = "/";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export function useReserve() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: balance, isLoading: isLoadingBalance } = useQuery<ReserveWallet>({
    queryKey: ["/api/reserve/balance"],
    queryFn: () => apiRequest("GET", "/api/reserve/balance"),
    retry: false,
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<ReserveTransaction[]>({
    queryKey: ["/api/reserve/transactions"],
    queryFn: () => apiRequest("GET", "/api/reserve/transactions"),
    retry: false,
  });

  const addMoneyMutation = useMutation({
    mutationFn: async (data: { amount: number; description: string; date: Date; source: string }) => {
      return apiRequest("POST", "/api/reserve/deposit", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reserve/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reserve/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] }); // Refresh admin wallet if "Added from Wallet"
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({
        title: "Success",
        description: "Money added to reserve successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add money to reserve",
        variant: "destructive",
      });
    },
  });

  return {
    balance,
    transactions,
    isLoadingBalance,
    isLoadingTransactions,
    addMoney: addMoneyMutation.mutate,
    isAddingMoney: addMoneyMutation.isPending,
  };
}
