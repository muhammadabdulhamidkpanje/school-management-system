import React from "react";
import PrimaryButton from "./button";

export default function LoadingButton({
  children,
  isLoading = false,
  loadingText = "Loading...",
  disabled = false,
  className = "",
  variant = "unstyled",
  type = "button",
  onClick,
  ...rest
}) {
  const [clickPending, setClickPending] = React.useState(false);
  const pending = isLoading || clickPending;

  async function handleClick(event) {
    const result = onClick?.(event);
    if (!result || typeof result.then !== "function") return;
    setClickPending(true);
    try {
      await result;
    } finally {
      setClickPending(false);
    }
  }

  return (
    <PrimaryButton
      type={type}
      disabled={disabled}
      isLoading={pending}
      loadingText={loadingText}
      variant={variant}
      className={className}
      onClick={onClick ? handleClick : undefined}
      {...rest}
    >
      {children}
    </PrimaryButton>
  );
}
