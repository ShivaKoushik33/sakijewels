import { useEffect, useRef } from 'react';

/**
 * A confirmation the site draws itself, in place of the browser's own
 * confirm box. Escape or the backdrop cancels; while the action runs, both
 * buttons are held so it cannot be fired twice.
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape' && !busy) onCancel?.();
    };
    document.addEventListener('keydown', onKey);

    // The page behind must not scroll away under the dialog.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    confirmRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !busy && onCancel?.()}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[380px] bg-white rounded-2xl shadow-xl p-5 md:p-6"
      >
        <h2 className="text-base md:text-lg font-semibold text-[#141416]">{title}</h2>
        {message && <p className="mt-2 text-sm text-[#353945] leading-relaxed">{message}</p>}

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-[42px] px-5 rounded-lg border border-[#E6E8EC] text-sm font-medium text-[#353945] hover:bg-[#F4F5F6] transition-colors disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="h-[42px] px-5 rounded-lg bg-[#FF3B30] text-sm font-medium text-white hover:bg-[#E0352B] transition-colors disabled:opacity-60"
          >
            {busy ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
