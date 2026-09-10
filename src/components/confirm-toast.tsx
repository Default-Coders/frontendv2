"use client";

import { toast } from "react-toastify";

interface ConfirmToastOptions {
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function confirmToast({
  message,
  confirmLabel = "Confirmar",
  danger = true,
}: ConfirmToastOptions): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (confirmed: boolean) => {
      if (settled) return;
      settled = true;
      resolve(confirmed);
    };

    toast(
      ({ closeToast }) => (
        <div className="space-y-3">
          <p className="text-sm font-medium">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
              onClick={() => {
                finish(false);
                closeToast();
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={() => {
                finish(true);
                closeToast();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        onClose: () => finish(false),
      },
    );
  });
}
