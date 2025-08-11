import React, {
  cloneElement,
  createContext,
  useContext,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Overlay from "./overlay";

const ModalContext = createContext();

export default function Modal({ children }) {
  const [openName, setOpenName] = useState("");

  const open = (name) => setOpenName(name);
  const close = () => setOpenName("");

  return (
    <ModalContext.Provider value={{ openName, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

// ========== Modal.Open ==========
function Open({ children, opens: openWindowName }) {
  const { open } = useContext(ModalContext);

  return cloneElement(children, {
    onClick: () => open(openWindowName),
  });
}

// ========== Modal.Window ==========
function Window({ children, name, width, height }) {
  const { openName, close } = useContext(ModalContext);

  if (name !== openName) return null;

  return createPortal(
    <Overlay width={width} height={height} bg="black-500" onClickOutside={close}>
      <div className="relative z-10 w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl">
        {children}
      </div>
    </Overlay>,
    document.body,
  );
}

// ========== Modal.Header ==========
function Header({ children }) {
  const { close } = useContext(ModalContext);

  return (
    <div className="flex items-center justify-between border-b p-4">
      <h2 className="text-lg font-semibold">{children}</h2>
      <button
        onClick={close}
        className="text-xl font-bold text-gray-400 hover:text-red-500"
      >
        &times;
      </button>
    </div>
  );
}

// ========== Modal.Footer ==========
function Footer({ children }) {
  return <div className="flex justify-end gap-3 border-t p-4">{children}</div>;
}

// Attach subcomponents
Modal.Open = Open;
Modal.Window = Window;
Modal.Header = Header;
Modal.Footer = Footer;
