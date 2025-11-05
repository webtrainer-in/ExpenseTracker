import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ExpenseTracker</h1>
          <Button
            onClick={() => (window.location.href = "/api/login")}
            data-testid="button-login"
          >
            Log In
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            Manage Your Family Expenses Together
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track spending, set budgets, and gain insights into your family's
            financial health with our intuitive expense management platform.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = "/api/login")}
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Expenses</h3>
            <p className="text-sm text-muted-foreground">
              Log every expense with categories, descriptions, and dates for complete
              visibility.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Family Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Everyone in the family can track their own expenses while admins see the
              full picture.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Visualize spending trends with charts and graphs to make informed
              decisions.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
            <p className="text-sm text-muted-foreground">
              Admins can view consolidated data while members manage their own expenses
              privately.
            </p>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to take control?</h3>
          <p className="text-muted-foreground mb-6">
            Join families who are making smarter financial decisions together.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = "/api/login")}
            data-testid="button-cta"
          >
            Start Tracking Now
          </Button>
        </div>
      </main>
    </div>
  );
}
