import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import Input from "../../components/inputs/input";
import PrimaryButton from "../../components/button/button";
import { applyServerErrors, getErrorMessage } from "../../lib/apiError";
import { useCreateFaculty, useUpdateFaculty } from "./useFaculties";

const FIELDS = ["name", "code"];

/**
 * Self-contained add / edit form (fields + buttons, no Dialog). Pass `faculty`
 * to edit. This is what actually renders inside a modal — `facultyForm.jsx`
 * is a thin Dialog wrapper around this for the Faculties list page; the
 * dashboard's "Add Faculty" card renders this directly inside its own
 * Modal.Window, since a Dialog-inside-a-modal would need an `open` prop it
 * was never given and would render nothing.
 *
 *  - onDone:   called after a successful save (the list page uses this to
 *              close its Dialog). Without it, the form clears so you can
 *              add another (used by the dashboard modal).
 *  - onCancel: shows a Cancel button when provided.
 */
export default function FacultyFormBody({ faculty = null, onDone, onCancel }) {
  const isEdit = Boolean(faculty);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: { name: faculty?.name ?? "", code: faculty?.code ?? "" } });

  const createFaculty = useCreateFaculty();
  const updateFaculty = useUpdateFaculty();
  const isSaving = createFaculty.isPending || updateFaculty.isPending;

  const onSubmit = async (values) => {
    // The backend's Zod trim() only validates; it doesn't rewrite req.body,
    // so trim here to avoid saving stray spaces.
    const payload = { name: values.name.trim(), code: values.code.trim() };

    try {
      if (isEdit) {
        await updateFaculty.mutateAsync({ id: faculty.id, ...payload });
      } else {
        await createFaculty.mutateAsync(payload);
      }
      if (onDone) onDone();
      else reset({ name: "", code: "" });
    } catch (error) {
      // Field-level problems (duplicate code, too long...) go under the input;
      // anything else (403, 500, offline) becomes a toast.
      if (!applyServerErrors(error, setError, FIELDS)) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Faculty name"
        name="name"
        placeholder="e.g. Faculty of Science"
        register={register}
        rules={{
          required: "Faculty name is required",
          validate: (v) => v.trim().length > 0 || "Faculty name is required",
          maxLength: { value: 150, message: "Keep it under 150 characters" },
        }}
        error={errors.name}
      />
      <Input
        label="Faculty code"
        name="code"
        placeholder="e.g. SCI"
        register={register}
        rules={{
          required: "Faculty code is required",
          validate: (v) => v.trim().length > 0 || "Faculty code is required",
          maxLength: { value: 50, message: "Keep it under 50 characters" },
        }}
        error={errors.code}
      />

      <div className="mt-4 flex justify-end gap-3">
        {onCancel && (
          <PrimaryButton variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </PrimaryButton>
        )}
        <PrimaryButton type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : isEdit ? "Save changes" : "Add faculty"}
        </PrimaryButton>
      </div>
    </form>
  );
}
