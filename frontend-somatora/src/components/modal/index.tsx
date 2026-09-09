import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** "md" (padrão) cabe formulários; "lg" dá mais espaço para tabelas de prévia. */
  size?: "md" | "lg";
}

const sizeClass = {
  md: "max-w-2xl",
  lg: "max-w-5xl",
};

export default function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-navy-deep/45 px-4 py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`flex max-h-full w-full ${sizeClass[size]} flex-col overflow-hidden rounded-card bg-paper-raised shadow-hero`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-4.5">
          <h2 id="modal-title" className="font-display text-lg font-semibold text-ink-navy">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-control text-ink-soft transition hover:bg-paper hover:text-ink"
          >
            <X className="h-4.5 w-4.5" strokeWidth={1.8} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
