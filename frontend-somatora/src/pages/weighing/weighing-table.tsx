import { diameterClassLabels, woodClassLabels, type Receipt } from "../../services/receipts";

export interface WeighingTableProps {
  receipts: Receipt[];
}

const columns = [
  "Data",
  "Nota Fiscal",
  "Fornecedor",
  "Fazenda",
  "Comprimento",
  "Classe",
  "Diâmetro",
  "Placa Cavalo",
  "Placa Julieta",
  "Motorista",
  "Peso Líquido",
];

const dash = <span className="text-ink-placeholder">—</span>;

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function WeighingTable({ receipts }: WeighingTableProps) {
  if (receipts.length === 0) {
    return (
      <div className="rounded-card border border-line bg-paper-raised px-6 py-12 text-center text-[13px] text-ink-soft shadow-card">
        Nenhuma pesagem registrada ainda.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-paper-raised shadow-card">
      <table className="w-full min-w-240 border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-line bg-paper">
            {columns.map((column) => (
              <th
                key={column}
                className="whitespace-nowrap px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-ink-soft"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt) => (
            <tr key={receipt.id} className="border-b border-line last:border-0 hover:bg-paper/60">
              <td className="whitespace-nowrap px-4 py-3 text-ink">{formatDate(receipt.createdAt)}</td>
              <td className="px-4 py-3">{dash}</td>
              <td className="px-4 py-3">{dash}</td>
              <td className="px-4 py-3">{dash}</td>
              <td className="px-4 py-3">{dash}</td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">{woodClassLabels[receipt.type]}</td>
              <td className="whitespace-nowrap px-4 py-3 text-ink">{diameterClassLabels[receipt.diameterClass]}</td>
              <td className="px-4 py-3">{dash}</td>
              <td className="px-4 py-3">{dash}</td>
              <td className="px-4 py-3">{dash}</td>
              <td className="px-4 py-3">{dash}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
