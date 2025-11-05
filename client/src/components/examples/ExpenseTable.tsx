import { ExpenseTable, type Expense } from "../ExpenseTable";
import avatar1 from "@assets/generated_images/Male_family_member_avatar_a839230d.png";
import avatar2 from "@assets/generated_images/Female_family_member_avatar_5b3b40fd.png";

export default function ExpenseTableExample() {
  const mockExpenses: Expense[] = [
    {
      id: "1",
      date: "2025-01-05",
      category: "groceries",
      description: "Weekly grocery shopping",
      amount: 156.43,
      user: { name: "John Doe", avatar: avatar1 },
    },
    {
      id: "2",
      date: "2025-01-04",
      category: "utilities",
      description: "Electric bill payment",
      amount: 89.99,
      user: { name: "Sarah Doe", avatar: avatar2 },
    },
    {
      id: "3",
      date: "2025-01-03",
      category: "dining",
      description: "Family dinner at Italian restaurant",
      amount: 124.50,
      user: { name: "John Doe", avatar: avatar1 },
    },
  ];

  return (
    <div className="p-8 bg-background">
      <ExpenseTable
        expenses={mockExpenses}
        showUser={true}
        onEdit={(expense) => console.log("Edit expense:", expense)}
        onDelete={(id) => console.log("Delete expense:", id)}
      />
    </div>
  );
}
