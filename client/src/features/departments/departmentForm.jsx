import React from "react";
import Dialog from "../../components/dialog/dialog";
import DepartmentFormBody from "./departmentFormBody";

/**
 * Dialog wrapper for the Departments list page. For a modal you already
 * control yourself (e.g. the dashboard's Modal.Window), render
 * <DepartmentFormBody /> directly instead — see facultyForm.jsx for why.
 */
export default function DepartmentForm({ open, department, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={department ? "Edit department" : "Add department"}
    >
      <DepartmentFormBody department={department} onDone={onClose} onCancel={onClose} />
    </Dialog>
  );
}

export { useFacultyOptions, FACULTY_OPTIONS_PARAMS } from "./useFacultyOptions";
