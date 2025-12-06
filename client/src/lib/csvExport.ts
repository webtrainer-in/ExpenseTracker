export interface SummaryRow {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface DetailRow {
  date: string;
  category: string;
  description: string;
  amount: number;
  user?: string;
}

export interface UserSummaryRow {
  userName: string;
  amount: number;
  count: number;
  percentage: number;
}


export function exportSummaryToCSV(
  data: SummaryRow[],
  month: string,
  currency: string = "USD"
): void {
  const headers = ["Category", "Amount", "Count", "Percentage"];
  const rows = data.map((item) => [
    item.category,
    item.amount.toFixed(2),
    item.count.toString(),
    `${item.percentage}%`,
  ]);

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  rows.push(["Total", total.toFixed(2), totalCount.toString(), "100%"]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

  downloadCSV(csv, `expense-summary-${month}.csv`);
}

export function exportUserSummaryToCSV(
  data: UserSummaryRow[],
  month: string,
  currency: string = "USD"
): void {
  const headers = ["User", "Amount", "Count", "Percentage"];
  const rows = data.map((item) => [
    item.userName,
    item.amount.toFixed(2),
    item.count.toString(),
    `${item.percentage}%`,
  ]);

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  rows.push(["Total", total.toFixed(2), totalCount.toString(), "100%"]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

  downloadCSV(csv, `user-summary-${month}.csv`);
}


export function exportDetailToCSV(
  data: DetailRow[],
  month: string,
  showUser: boolean = false
): void {
  const headers = showUser ? ["Date", "Category", "Description", "Amount", "User"] : ["Date", "Category", "Description", "Amount"];
  const rows = data.map((item) => {
    const row = [
      item.date,
      item.category,
      item.description,
      item.amount.toString(),
    ];
    if (showUser && item.user) {
      row.push(item.user);
    }
    return row;
  });

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

  downloadCSV(csv, `expense-details-${month}.csv`);
}

function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
