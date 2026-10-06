import React from "react";
import Dialog from "../dialog/dialog";
import PrimaryButton from "../button/button";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  loadingLabel = "Deleting…",
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onCancel}
      title={title}
      size="sm"
      role="alertdialog"
      footer={
        <>
          <PrimaryButton
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? loadingLabel : confirmLabel}
          </PrimaryButton>
        </>
      }
    >
      <p className="text-sm text-gray-600">{message}</p>
    </Dialog>
  );
}
