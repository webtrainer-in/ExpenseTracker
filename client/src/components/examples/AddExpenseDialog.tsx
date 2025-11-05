import { useState } from "react";
import { AddExpenseDialog } from "../AddExpenseDialog";
import { Button } from "@/components/ui/button";

export default function AddExpenseDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8 bg-background">
      <Button onClick={() => setOpen(true)}>Open Add Expense Dialog</Button>
      <AddExpenseDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(expense) => {
          console.log("New expense:", expense);
        }}
      />
    </div>
  );
}
