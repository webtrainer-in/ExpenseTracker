import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Tags } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useLocation } from "wouter";
import { UserButton, useClerk } from "@clerk/clerk-react";

interface UserHeaderProps {
  user: {
    name: string;
    email: string;
    role: "admin" | "member";
    avatar?: string;
  };
  onLogout?: () => void;
}

export function UserHeader({ user, onLogout }: UserHeaderProps) {
  const [, setLocation] = useLocation();
  const { signOut } = useClerk();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
          <h1 className="text-xl font-bold">ExpenseTracker</h1>
          {user.role === "admin" && (
            <Badge variant="outline" className="text-xs">
              Admin
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user.role === "admin" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/categories")}
            >
              <Tags className="mr-2 h-4 w-4" />
              Categories
            </Button>
          )}
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
