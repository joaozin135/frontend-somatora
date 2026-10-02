import logoUrl from "../../assets/somapar-icon.png";
import { diameterClassLabels, woodClassLabels, type Receipt } from "../../services/receipts";
import { receiptValue, type Statement, type StatementFilters } from "./statement";

// Paleta do sistema (src/index.css) em RGB, para jsPDF/ExcelJS.
const INK_NAVY: [number, number, number] = [27, 17, 77];
const CANOPY: [number, number, number] = [103, 184, 47];
const SAGE: [number, number, number] = [175, 203, 128];
const PAPER: [number, number, number] = [245, 243, 234];
const LINE: [number, number, number] = [230, 225, 211];
const INK: [number, number, number] = [44, 36, 56];
const INK_SOFT: [number, number, number] = [110, 102, 124];
const AMBER_SOFT: [number, number, number] = [244, 227, 206];
const AMBER_TEXT: [number, number, number] = [140, 84, 23];

const CANOPY_HEX = "67B82F";
const INK_NAVY_HEX = "1B114D";

let cachedLogoDataUrl: Promise<string | null> | null = null;

function loadLogoDataUrl(): Promise<string | null> {
  if (!cachedLogoDataUrl) {
    cachedLogoDataUrl = fetch(logoUrl)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }),
      )
      .catch(() => null);
  }
  return cachedLogoDataUrl;
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function periodLabel(filters: StatementFilters) {
  return `${formatDate(filters.startDate)} a ${formatDate(filters.endDate)}`;
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
  return `fechamento-${slug(filters.supplier)}-${filters.startDate}_a_${filters.endDate}.${extension}`;
}

function formatKg(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} kg`;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function roundCents(value: number) {
  return Math.round(value * 100) / 100;
}

function rowValues(receipt: Receipt): (string | number)[] {
  const diff = receipt.invoiceWeight !== null ? receipt.netWeight - receipt.invoiceWeight : null;
  const value = receiptValue(receipt);
  return [
    new Date(receipt.createdAt).toLocaleDateString("pt-BR"),
    receipt.invoiceNumber,
    receipt.driver,
    woodClassLabels[receipt.type],
    diameterClassLabels[receipt.diameterClass],
    receipt.netWeight,
    receipt.invoiceWeight ?? "",
    diff ?? "",
    receipt.pricePerTon ?? "",
    value !== null ? roundCents(value) : "",
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
  "R$/t",
  "Valor (R$)",
  "Status",
];

/** Colunas de dinheiro no HEADERS — no PDF saem formatadas em R$. */
const CURRENCY_COLUMNS = new Set([HEADERS.indexOf("R$/t"), HEADERS.indexOf("Valor (R$)")]);

function unpricedNote(count: number) {
  return count === 1
    ? "1 pesagem sem preço por tonelada não entrou no valor total."
    : `${count} pesagens sem preço por tonelada não entraram no valor total.`;
}

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
  const [{ default: jsPDF }, { default: autoTable }, logoDataUrl] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    loadLogoDataUrl(),
  ]);

  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  function drawHeader() {
    doc.setFillColor(...INK_NAVY);
    doc.rect(0, 0, pageWidth, 24, "F");

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", margin, 4, 23.2, 16);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("SOMAPAR", logoDataUrl ? margin + 28 : margin, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...SAGE);
    doc.text("PESAGEM & RECEBIMENTO", logoDataUrl ? margin + 28 : margin, 17);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("Fechamento de Notas Complementares", pageWidth - margin, 11, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...SAGE);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, pageWidth - margin, 17, { align: "right" });
  }

  function drawFooter() {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...INK_SOFT);
    doc.text("SOMAPAR — Sistema de Pesagem & Recebimento", margin, pageHeight - 8);
    doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  drawHeader();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK_NAVY);
  doc.text(filters.supplier, margin, 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK_SOFT);
  doc.text(`Período: ${periodLabel(filters)}  ·  ${filterSummary(filters)}`, margin, 38);

  autoTable(doc, {
    startY: 44,
    margin: { top: 28, left: margin, right: margin, bottom: 16 },
    head: [HEADERS],
    body: statement.rows.map((receipt) =>
      rowValues(receipt).map((cell, i) =>
        CURRENCY_COLUMNS.has(i) && typeof cell === "number" ? formatCurrency(cell) : cell,
      ),
    ),
    styles: { fontSize: 8, textColor: INK, lineColor: LINE, lineWidth: 0.1 },
    headStyles: { fillColor: CANOPY, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: PAPER },
    didDrawPage: () => {
      drawHeader();
      drawFooter();
    },
  });

  let cardsY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  const cardHeight = 18;
  const noteHeight = statement.totals.unpricedCount > 0 ? 6 : 0;
  if (cardsY + cardHeight + noteHeight > pageHeight - 16) {
    doc.addPage();
    drawHeader();
    drawFooter();
    cardsY = 32;
  }

  const { totals } = statement;
  const cards: { label: string; value: string; highlight?: boolean; accent?: boolean }[] = [
    { label: "RECEBIDO", value: formatKg(totals.receivedKg) },
    { label: "NF ORIGINAL", value: formatKg(totals.invoicedKg) },
    { label: "JÁ COMPLEMENTADO", value: formatKg(totals.reconciledDiffKg) },
    { label: "DIFERENÇA PENDENTE", value: formatKg(totals.pendingDiffKg), highlight: totals.pendingDiffKg > 0 },
    { label: "VALOR PENDENTE", value: formatCurrency(totals.pendingValue) },
    { label: "VALOR TOTAL DO PERÍODO", value: formatCurrency(totals.totalValue), accent: true },
  ];

  const gap = 3;
  const usableWidth = pageWidth - margin * 2;
  const cardWidth = (usableWidth - gap * (cards.length - 1)) / cards.length;

  cards.forEach((card, i) => {
    const x = margin + i * (cardWidth + gap);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.setFillColor(...(card.accent ? INK_NAVY : card.highlight ? AMBER_SOFT : PAPER));
    doc.roundedRect(x, cardsY, cardWidth, cardHeight, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...(card.accent ? SAGE : INK_SOFT));
    doc.text(card.label, x + 3, cardsY + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    if (card.accent) doc.setTextColor(255, 255, 255);
    else doc.setTextColor(...(card.highlight ? AMBER_TEXT : INK_NAVY));
    doc.text(card.value, x + 3, cardsY + 14);
  });

  if (totals.unpricedCount > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...AMBER_TEXT);
    doc.text(unpricedNote(totals.unpricedCount), pageWidth - margin, cardsY + cardHeight + 5, { align: "right" });
  }

  doc.save(buildFilename(filters, "pdf"));
}

export async function exportStatementToXlsx(statement: Statement, filters: StatementFilters) {
  const [{ default: ExcelJS }, logoDataUrl] = await Promise.all([import("exceljs"), loadLogoDataUrl()]);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Fechamento");
  sheet.properties.defaultRowHeight = 16;

  if (logoDataUrl) {
    const imageId = workbook.addImage({ base64: logoDataUrl, extension: "png" });
    sheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 58, height: 40 } });
  }

  sheet.mergeCells("B1:E1");
  sheet.getCell("B1").value = "SOMAPAR — Fechamento de Notas Complementares";
  sheet.getCell("B1").font = { bold: true, size: 14, color: { argb: `FF${INK_NAVY_HEX}` } };

  sheet.mergeCells("B2:E2");
  sheet.getCell("B2").value = `${filters.supplier} — Período: ${periodLabel(filters)}`;
  sheet.getCell("B2").font = { size: 10, color: { argb: "FF6E667C" } };

  sheet.mergeCells("B3:E3");
  sheet.getCell("B3").value = filterSummary(filters);
  sheet.getCell("B3").font = { size: 9, italic: true, color: { argb: "FF6E667C" } };

  sheet.addRow([]);
  sheet.addRow([]);

  const headerRow = sheet.addRow(HEADERS);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${CANOPY_HEX}` } };
    cell.alignment = { vertical: "middle" };
  });

  for (const receipt of statement.rows) {
    sheet.addRow(rowValues(receipt));
  }

  sheet.addRow([]);
  const { totals } = statement;
  const totalsRows: [string, number][] = [
    ["Recebido (kg)", totals.receivedKg],
    ["NF Original (kg)", totals.invoicedKg],
    ["Já Complementado (kg)", totals.reconciledDiffKg],
    ["Diferença Pendente (kg)", totals.pendingDiffKg],
    ["Valor Pendente Estimado (R$)", roundCents(totals.pendingValue)],
    ["Valor Total do Período (R$)", roundCents(totals.totalValue)],
  ];
  for (const [label, value] of totalsRows) {
    const row = sheet.addRow([label, value]);
    row.getCell(1).font = { bold: true, color: { argb: `FF${INK_NAVY_HEX}` } };
    if (label.endsWith("(R$)")) row.getCell(2).numFmt = '"R$" #,##0.00';
  }
  if (totals.unpricedCount > 0) {
    const row = sheet.addRow([unpricedNote(totals.unpricedCount)]);
    row.getCell(1).font = { italic: true, size: 9, color: { argb: "FF8C5417" } };
  }

  sheet.columns.forEach((column) => {
    column.width = 16;
  });
  for (const index of CURRENCY_COLUMNS) {
    sheet.getColumn(index + 1).numFmt = '"R$" #,##0.00';
  }

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    buildFilename(filters, "xlsx"),
  );
}
