import React, { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Full class names on purpose: Tailwind can't see `max-w-${size}`.
const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

/**
 * Controlled modal: you own `open`. Closes on Escape, backdrop click and the
 * X button. Pass `onClose={undefined}` to lock it (e.g. while saving).
 *
 * Put the submit button in `footer` and point it at the form with the `form`
 * attribute: <button type="submit" form="my-form-id">.
 */
export default function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  role = "dialog",
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onClose?.()}
        aria-hidden="true"
      />
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full ${widths[size] ?? widths.md} rounded-xl bg-white shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-gray-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
