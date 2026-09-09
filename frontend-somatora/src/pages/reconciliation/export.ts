import { diameterClassLabels, woodClassLabels, type Receipt } from "../../services/receipts";
import type { Statement, StatementFilters } from "./statement";

function monthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function statusLabel(receipt: Receipt) {
  if (receipt.complementaryInvoice) return `Complementada (NF ${receipt.complementaryInvoice.number})`;
  if (receipt.invoiceWeight !== null && receipt.netWeight > receipt.invoiceWeight) return "Pendente";
  return "—";
}

function filterSummary(filters: StatementFilters) {
  const parts: string[] = [];
  if (filters.driver) parts.push(`Motorista: ${filters.driver}`);
  if (filters.type) parts.push(`Classe: ${woodClassLabels[filters.type]}`);
  if (filters.diameterClass) parts.push(`Diâmetro: ${diameterClassLabels[filters.diameterClass]}`);
  return parts.length ? parts.join(" · ") : "Todas as pesagens do período";
}

function buildFilename(filters: StatementFilters, extension: string) {
  return `fechamento-${slug(filters.supplier)}-${filters.month}.${extension}`;
}

function rowValues(receipt: Receipt): (string | number)[] {
  const diff = receipt.invoiceWeight !== null ? receipt.netWeight - receipt.invoiceWeight : null;
  return [
    new Date(receipt.createdAt).toLocaleDateString("pt-BR"),
    receipt.invoiceNumber,
    receipt.driver,
    woodClassLabels[receipt.type],
    diameterClassLabels[receipt.diameterClass],
    receipt.netWeight,
    receipt.invoiceWeight ?? "",
    diff ?? "",
    statusLabel(receipt),
  ];
}

const HEADERS = [
  "Data",
  "Nº NF",
  "Motorista",
  "Classe",
  "Diâmetro",
  "Peso Líquido (kg)",
  "Peso NF (kg)",
  "Diferença (kg)",
  "Status",
];

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportStatementToPdf(statement: Statement, filters: StatementFilters) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text(`Fechamento — ${filters.supplier}`, 14, 16);
  doc.setFontSize(10);
  doc.text(`Período: ${monthLabel(filters.month)}`, 14, 23);
  doc.text(filterSummary(filters), 14, 29);

  autoTable(doc, {
    startY: 35,
    head: [HEADERS],
    body: statement.rows.map(rowValues),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [103, 184, 47] },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  const { totals } = statement;
  doc.setFontSize(10);
  doc.text(`Recebido: ${totals.receivedKg.toLocaleString("pt-BR")} kg`, 14, finalY);
  doc.text(`NF Original: ${totals.invoicedKg.toLocaleString("pt-BR")} kg`, 14, finalY + 6);
  doc.text(`Já Complementado: ${totals.reconciledDiffKg.toLocaleString("pt-BR")} kg`, 14, finalY + 12);
  doc.text(`Diferença Pendente: ${totals.pendingDiffKg.toLocaleString("pt-BR")} kg`, 14, finalY + 18);
  doc.text(
    `Valor Pendente Estimado: ${totals.pendingValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    14,
    finalY + 24,
  );

  doc.save(buildFilename(filters, "pdf"));
}

export async function exportStatementToXlsx(statement: Statement, filters: StatementFilters) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Fechamento");

  sheet.addRow([`Fechamento — ${filters.supplier}`]);
  sheet.addRow([`Período: ${monthLabel(filters.month)}`]);
  sheet.addRow([filterSummary(filters)]);
  sheet.addRow([]);

  const headerRow = sheet.addRow(HEADERS);
  headerRow.font = { bold: true };

  for (const receipt of statement.rows) {
    sheet.addRow(rowValues(receipt));
  }

  sheet.addRow([]);
  const { totals } = statement;
  sheet.addRow(["Recebido (kg)", totals.receivedKg]);
  sheet.addRow(["NF Original (kg)", totals.invoicedKg]);
  sheet.addRow(["Já Complementado (kg)", totals.reconciledDiffKg]);
  sheet.addRow(["Diferença Pendente (kg)", totals.pendingDiffKg]);
  sheet.addRow(["Valor Pendente Estimado (R$)", totals.pendingValue]);

  sheet.columns.forEach((column) => {
    column.width = 16;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    buildFilename(filters, "xlsx"),
  );
}
