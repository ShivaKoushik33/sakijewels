import { useEffect, useRef } from "react";

/**
 * A confirmation the panel draws itself, in place of the browser's own
 * confirm box. Escape or the backdrop cancels; while the action runs, both
 * buttons are held so it cannot be fired twice.
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "",
  confirmText = "Delete",
  cancelText = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onCancel?.();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !busy && onCancel?.()}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[380px] bg-white rounded-lg shadow-xl p-5"
      >
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {message && <p className="mt-2 text-sm text-gray-600 leading-relaxed">{message}</p>}

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-10 px-4 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="h-10 px-4 rounded bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
