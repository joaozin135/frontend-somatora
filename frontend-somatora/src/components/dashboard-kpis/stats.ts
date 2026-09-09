import type { Receipt } from "../../services/receipts";

export interface DashboardStats {
  weighingsToday: number;
  weighingsYesterday: number;
  volumeThisMonthKg: number;
  volumeLastMonthKg: number;
  suppliersThisMonth: number;
  suppliersLastMonth: number;
  avgNetWeightThisMonthKg: number;
  avgNetWeightLastMonthKg: number;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function sumNetWeight(receipts: Receipt[]) {
  return receipts.reduce((total, receipt) => total + receipt.netWeight, 0);
}

function countSuppliers(receipts: Receipt[]) {
  return new Set(receipts.map((receipt) => receipt.supplier)).size;
}

export function computeDashboardStats(receipts: Receipt[]): DashboardStats {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const today = receipts.filter((r) => isSameDay(new Date(r.createdAt), now));
  const ontem = receipts.filter((r) => isSameDay(new Date(r.createdAt), yesterday));
  const thisMonth = receipts.filter((r) => isSameMonth(new Date(r.createdAt), now));
  const lastMonth = receipts.filter((r) => isSameMonth(new Date(r.createdAt), lastMonthRef));

  return {
    weighingsToday: today.length,
    weighingsYesterday: ontem.length,
    volumeThisMonthKg: sumNetWeight(thisMonth),
    volumeLastMonthKg: sumNetWeight(lastMonth),
    suppliersThisMonth: countSuppliers(thisMonth),
    suppliersLastMonth: countSuppliers(lastMonth),
    avgNetWeightThisMonthKg: thisMonth.length ? sumNetWeight(thisMonth) / thisMonth.length : 0,
    avgNetWeightLastMonthKg: lastMonth.length ? sumNetWeight(lastMonth) / lastMonth.length : 0,
  };
}
