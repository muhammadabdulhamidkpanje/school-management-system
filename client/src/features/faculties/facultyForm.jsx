import React from "react";
import Dialog from "../../components/dialog/dialog";
import FacultyFormBody from "./facultyFormBody";

/**
 * Dialog wrapper for the Faculties list page (edit/add there needs a
 * controlled open state). For a modal you already control yourself (e.g. the
 * dashboard's Modal.Window), render <FacultyFormBody /> directly instead.
 */
export default function FacultyForm({ open, faculty, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={faculty ? "Edit faculty" : "Add faculty"}
    >
      <FacultyFormBody faculty={faculty} onDone={onClose} onCancel={onClose} />
    </Dialog>
  );
}
