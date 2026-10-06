import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import Input from "../../components/inputs/input";
import Select from "../../components/inputs/select";
import PrimaryButton from "../../components/button/button";
import { applyServerErrors, getErrorMessage } from "../../lib/apiError";
import { useCreateDepartment, useUpdateDepartment } from "./useDepartments";
import { useFacultyOptions } from "./useFacultyOptions";

const FIELDS = ["name", "code", "facultyId"];

/**
 * Self-contained add / edit form (fields + buttons, no Dialog) — same split
 * as facultyFormBody.jsx, for the same reason: a Dialog needs an `open` prop
 * it never gets when rendered inside a modal you already control.
 */
export default function DepartmentFormBody({ department = null, onDone, onCancel }) {
  const isEdit = Boolean(department);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: department?.name ?? "",
      code: department?.code ?? "",
      facultyId: department?.facultyId ?? department?.faculty?.id ?? "",
    },
  });

  const faculties = useFacultyOptions();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const isSaving = createDepartment.isPending || updateDepartment.isPending;
  const blocked = faculties.isLoading || faculties.isError;

  // The <select> needs its <option>s to exist before it can show the saved
  // facultyId, so re-sync once the faculty list finishes loading.
  useEffect(() => {
    if (!faculties.isLoading) {
      reset({
        name: department?.name ?? "",
        code: department?.code ?? "",
        facultyId: department?.facultyId ?? department?.faculty?.id ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faculties.isLoading]);

  const onSubmit = async (values) => {
    const payload = {
      name: values.name.trim(),
      code: values.code.trim(),
      // The backend wants a cuid or null. An empty string would be a 400.
      facultyId: values.facultyId || null,
    };

    try {
      if (isEdit) {
        await updateDepartment.mutateAsync({ id: department.id, ...payload });
      } else {
        await createDepartment.mutateAsync(payload);
      }
      if (onDone) onDone();
      else reset({ name: "", code: "", facultyId: "" });
    } catch (error) {
      if (!applyServerErrors(error, setError, FIELDS)) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  if (faculties.isLoading) {
    return <p className="py-6 text-center text-sm text-gray-500">Loading faculties…</p>;
  }

  if (faculties.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center text-sm">
        <p className="text-red-600">
          {getErrorMessage(faculties.error, "Couldn't load faculties.")}
        </p>
        <PrimaryButton variant="secondary" onClick={() => faculties.refetch()}>
          Try again
        </PrimaryButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="Department name"
        name="name"
        placeholder="e.g. Computer Science"
        register={register}
        rules={{
          required: "Department name is required",
          validate: (v) => v.trim().length > 0 || "Department name is required",
          maxLength: { value: 150, message: "Keep it under 150 characters" },
        }}
        error={errors.name}
      />
      <Input
        label="Department code"
        name="code"
        placeholder="e.g. CSC"
        register={register}
        rules={{
          required: "Department code is required",
          validate: (v) => v.trim().length > 0 || "Department code is required",
          maxLength: { value: 50, message: "Keep it under 50 characters" },
        }}
        error={errors.code}
      />
      <Select
        label="Faculty (optional)"
        name="facultyId"
        register={register}
        options={faculties.options}
        placeholder="No faculty"
        allowEmpty
        error={errors.facultyId}
      />

      <div className="mt-4 flex justify-end gap-3">
        {onCancel && (
          <PrimaryButton variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </PrimaryButton>
        )}
        <PrimaryButton type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : isEdit ? "Save changes" : "Add department"}
        </PrimaryButton>
      </div>
    </form>
  );
}
