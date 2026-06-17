"use client";

export function ConfirmDeleteButton({
  confirmText,
  label = "Sil",
  className = "btn-danger",
}: {
  confirmText: string;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmText)) {
          e.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
