import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { Category, InsertCategory } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserHeader } from "@/components/UserHeader";
import { Plus, Pencil, Trash2, Tag, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import { CURRENCY_OPTIONS } from "@/lib/currency";

const ICON_OPTIONS = [
  { value: "tag", label: "Tag" },
  { value: "shopping-cart", label: "Shopping Cart" },
  { value: "zap", label: "Utilities" },
  { value: "car", label: "Car" },
  { value: "film", label: "Entertainment" },
  { value: "utensils", label: "Dining" },
  { value: "heart", label: "Healthcare" },
  { value: "graduation-cap", label: "Education" },
  { value: "plane", label: "Travel" },
  { value: "home", label: "Home/Bills" },
  { value: "more-horizontal", label: "Other" },
  { value: "dollar-sign", label: "Money" },
  { value: "briefcase", label: "Work" },
  { value: "smartphone", label: "Phone/Tech" },
  { value: "shirt", label: "Clothing" },
  { value: "dumbbell", label: "Fitness" },
];

export default function Categories() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<InsertCategory>({ name: "", icon: "tag" });

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: settings, isLoading: settingsLoading } = useSettings();

  const updateSettingsMutation = useMutation({
    mutationFn: async (currency: string) => {
      return await apiRequest("PATCH", "/api/settings", { currency });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Currency updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update currency",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      return await apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsAddDialogOpen(false);
      setFormData({ name: "", icon: "tag" });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCategory> }) => {
      return await apiRequest("PATCH", `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: "", icon: "tag" });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    setFormData({ name: "", icon: "tag" });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, icon: category.icon });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data: formData });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return null;
  }

  if (user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <UserHeader
        user={{
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User",
          email: user.email || "",
          role: user.role as "admin" | "member",
          avatar: user.profileImageUrl || undefined,
        }}
        onLogout={() => (window.location.href = "/api/logout")}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Settings</h2>
            <p className="text-muted-foreground">
              Configure your application preferences
            </p>
          </div>
        </div>

        <Card data-testid="card-currency-settings">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Currency</CardTitle>
            </div>
            <CardDescription>
              Select your preferred currency for displaying expense amounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings?.currency || "USD"}
                onValueChange={(value) => updateSettingsMutation.mutate(value)}
                disabled={settingsLoading || updateSettingsMutation.isPending}
              >
                <SelectTrigger id="currency" data-testid="select-currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem 
                      key={currency.code} 
                      value={currency.code}
                      data-testid={`currency-${currency.code}`}
                    >
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Manage Categories</h2>
            <p className="text-muted-foreground">
              Add, rename, or remove expense categories
            </p>
          </div>
          <Button onClick={handleAdd} data-testid="button-add-category">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading categories...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id} data-testid={`card-category-${category.id}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base font-medium">
                      {category.name}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                      data-testid={`button-edit-${category.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(category)}
                      data-testid={`button-delete-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>Icon: {category.icon}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent data-testid="dialog-add-category">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new expense category for tracking expenses
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Category Name</Label>
                <Input
                  id="add-name"
                  data-testid="input-category-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Groceries"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger id="add-icon" data-testid="select-category-icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit-add"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-category">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category name or icon
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  data-testid="input-edit-category-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Groceries"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger id="edit-icon" data-testid="select-edit-category-icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                data-testid="button-submit-edit"
              >
                {updateMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-category">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? This action cannot
              be undone. Existing expenses with this category will still retain the category name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
