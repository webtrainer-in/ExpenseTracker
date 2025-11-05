import { useAuth } from "@/hooks/useAuth";
import { UserHeader } from "@/components/UserHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Shield, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading || !user) {
    return null;
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <UserHeader
        user={{
          name: fullName,
          email: user.email || "",
          role: user.role as "admin" | "member",
          avatar: user.profileImageUrl || undefined,
        }}
        onLogout={() => (window.location.href = "/api/logout")}
      />

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-2">Profile & Settings</h2>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your personal information from your Replit account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={fullName} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{fullName}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  {user.role === "admin" && (
                    <Badge variant="outline" className="mt-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <p className="text-base" data-testid="text-full-name">{fullName}</p>
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <p className="text-base" data-testid="text-email">{user.email}</p>
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Account Role
                  </Label>
                  <p className="text-base" data-testid="text-role">
                    {user.role === "admin" ? "Administrator" : "Family Member"}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </Label>
                  <p className="text-base" data-testid="text-created-at">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Recently joined"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Authentication Provider</p>
                  <p className="text-sm text-muted-foreground">
                    You're signed in with Replit Auth
                  </p>
                </div>
                <Badge variant="secondary">Replit</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Account Type</p>
                  <p className="text-sm text-muted-foreground">
                    {user.role === "admin"
                      ? "Administrator - Full access to all family expenses"
                      : "Family Member - Access to personal expenses only"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="pt-2">
                <Button
                  variant="destructive"
                  onClick={() => (window.location.href = "/api/logout")}
                  data-testid="button-logout"
                >
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
