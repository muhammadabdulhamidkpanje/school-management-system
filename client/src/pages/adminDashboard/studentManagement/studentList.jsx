import React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Dialog from "../../../components/dialog/dialog";
import LoadingButton from "../../../components/button/loadingButton";
import Pagination from "../../../components/pagination/pagination";
import Table from "../../../components/table/table";
import { getErrorMessage } from "../../../lib/apiError";
import { studentKeys } from "../../../lib/queryKeys";
import {
  useStudentMutations,
  useStudents,
} from "../../../features/students/useStudents";
import * as studentApi from "../../../features/students/studentApi";

const PAGE_SIZE = 20;
const STUDENT_STATUSES = ["ACTIVE", "GRADUATED", "WITHDRAWN", "SUSPENDED"];

export default function StudentList() {
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [classroomId, setClassroomId] = React.useState("");
  const [studentId, setStudentId] = React.useState(null);
  const [dialogMode, setDialogMode] = React.useState(null);
  const [formError, setFormError] = React.useState("");
  const [importing, setImporting] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const params = {
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(classroomId ? { classroomId } : {}),
  };
  const studentsQuery = useStudents(params);
  const classroomsQuery = useQuery({
    queryKey: studentKeys.classrooms,
    queryFn: () => studentApi.listClassrooms(),
    staleTime: 60_000,
  });
  const detailQuery = useQuery({
    queryKey: studentKeys.detail(studentId),
    queryFn: () => studentApi.getStudent(studentId),
    enabled: Boolean(studentId),
  });
  const mutations = useStudentMutations();
  const students = studentsQuery.data?.students ?? [];
  const pagination = studentsQuery.data?.pagination;
  const selectedStudent = detailQuery.data;
  const classrooms = classroomsQuery.data ?? [];

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  React.useEffect(() => {
    setPage(1);
  }, [status, classroomId]);

  function openDialog(mode, id = null) {
    setFormError("");
    setDialogMode(mode);
    setStudentId(id);
  }

  function closeDialog() {
    if (mutations.create.isPending || mutations.update.isPending || mutations.updateProfile.isPending) return;
    setDialogMode(null);
    setStudentId(null);
    setFormError("");
  }

  async function downloadCsv() {
    setExporting(true);
    try {
      const blob = await studentApi.exportStudents();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "students.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to export student records."));
    } finally {
      setExporting(false);
    }
  }

  async function importCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      await mutations.importCsv.mutateAsync(await file.text());
      setPage(1);
    } catch {
      // The mutation shows API and network errors.
    } finally {
      setImporting(false);
    }
  }

  async function saveStudent(payload) {
    setFormError("");
    try {
      if (dialogMode === "create") {
        await mutations.create.mutateAsync(payload);
      } else {
        await mutations.update.mutateAsync({ id: studentId, ...payload });
      }
      setDialogMode(null);
      setStudentId(null);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <section className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="py-2 text-2xl font-semibold text-blue-600">Student Directory</h2>
          <p className="text-sm text-gray-600">Manage student records, status, class placement, and academic profiles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openDialog("create")}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add student
          </button>
          <LoadingButton
            type="button"
            isLoading={importing}
            loadingText="Importing..."
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Import CSV
          </LoadingButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={importCsv}
          />
          <LoadingButton
            type="button"
            isLoading={exporting}
            loadingText="Exporting..."
            onClick={downloadCsv}
            className="border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Export CSV
          </LoadingButton>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_14rem]">
        <label className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
          <span className="sr-only">Search students</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name, email, or admission number"
            className="w-full text-sm outline-none"
          />
        </label>
        <label>
          <span className="sr-only">Filter by student status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STUDENT_STATUSES.map((item) => (
              <option key={item} value={item}>{statusLabel(item)}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by classroom</span>
          <select
            value={classroomId}
            onChange={(event) => setClassroomId(event.target.value)}
            disabled={classroomsQuery.isLoading || classroomsQuery.isError}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100"
          >
            <option value="">All classes</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} ({classroom.level})
              </option>
            ))}
          </select>
        </label>
      </div>
      {classroomsQuery.isError && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {getErrorMessage(classroomsQuery.error, "Couldn't load classes for filtering.")}
          <LoadingButton type="button" className="ml-2 underline" onClick={() => classroomsQuery.refetch()} isLoading={classroomsQuery.isFetching} loadingText="Retrying...">
            Try again
          </LoadingButton>
        </p>
      )}

      <Table
        data={students}
        isLoading={studentsQuery.isLoading}
        isError={studentsQuery.isError}
        errorMessage={getErrorMessage(studentsQuery.error)}
        onRetry={studentsQuery.refetch}
        emptyMessage={search || status || classroomId
          ? "No students match these filters."
          : "No students have been added yet."}
      >
        <Table.Header columns={["Admission No.", "Student", "Email", "Class", "Status", "Actions"]} />
        <Table.Body
          renderRow={(student) => {
            const name = getStudentName(student);
            return (
              <>
                <td className="px-4 py-3">{student.admissionNo}</td>
                <td className="px-4 py-3">{name}</td>
                <td className="px-4 py-3">{student.user?.email ?? "—"}</td>
                <td className="px-4 py-3">{student.classroom?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(student.status)}`}>
                    {statusLabel(student.status)}
                  </span>
                </td>
                <td className="space-x-2 whitespace-nowrap px-4 py-3">
                  <button type="button" className="text-blue-700 hover:underline" onClick={() => openDialog("details", student.id)}>
                    View
                  </button>
                  <button type="button" className="text-indigo-700 hover:underline" onClick={() => openDialog("edit", student.id)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-amber-700 hover:underline"
                    onClick={() => openDialog("profile", student.id)}
                  >
                    Academic profile
                  </button>
                </td>
              </>
            );
          }}
        />
      </Table>
      {pagination && (
        <Pagination {...pagination} onPageChange={setPage} />
      )}

      <Dialog
        open={Boolean(dialogMode)}
        onClose={closeDialog}
        title={
          dialogMode === "create" ? "Add student"
            : dialogMode === "edit" ? "Edit student"
              : dialogMode === "profile" ? "Academic profile"
                : "Student details"
        }
        size="lg"
      >
        {dialogMode === "create" && (
          <StudentForm
            classrooms={classrooms}
            isSaving={mutations.create.isPending}
            error={formError}
            onSubmit={saveStudent}
          />
        )}
        {studentId && detailQuery.isLoading && <p>Loading student details...</p>}
        {studentId && detailQuery.isError && (
          <div role="alert" className="text-red-700">
            <p>{getErrorMessage(detailQuery.error, "Couldn't load student details.")}</p>
            <LoadingButton type="button" className="mt-2 underline" onClick={() => detailQuery.refetch()} isLoading={detailQuery.isFetching} loadingText="Retrying...">
              Try again
            </LoadingButton>
          </div>
        )}
        {selectedStudent && dialogMode === "details" && (
          <StudentDetails student={selectedStudent} onEdit={() => setDialogMode("edit")} />
        )}
        {selectedStudent && dialogMode === "edit" && (
          <StudentForm
            key={selectedStudent.id}
            student={selectedStudent}
            classrooms={classrooms}
            isSaving={mutations.update.isPending}
            error={formError}
            onCancel={() => setDialogMode("details")}
            onSubmit={saveStudent}
          />
        )}
        {studentId && dialogMode === "profile" && (
          <StudentAcademicProfile studentId={studentId} />
        )}
      </Dialog>
    </section>
  );
}

function StudentForm({ student, classrooms, isSaving, error, onCancel, onSubmit }) {
  const [values, setValues] = React.useState({
    admissionNo: student?.admissionNo ?? "",
    firstName: student?.firstName ?? "",
    middleName: student?.middleName ?? "",
    lastName: student?.lastName ?? "",
    dob: toDateInput(student?.dob),
    gender: student?.gender ?? "",
    classroomId: student?.classroomId ?? "",
    status: student?.status ?? "ACTIVE",
  });
  const change = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const payload = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          dob: values.dob,
          gender: values.gender,
          classroomId: values.classroomId || null,
          ...(student && { status: values.status }),
        };
        if (student) {
          payload.middleName = values.middleName.trim() || null;
        } else {
          payload.admissionNo = values.admissionNo.trim();
          if (values.middleName.trim()) payload.middleName = values.middleName.trim();
        }
        onSubmit(payload);
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {!student && (
        <StudentField label="Admission number" name="admissionNo" value={values.admissionNo} onChange={change} required />
      )}
      <StudentField label="First name" name="firstName" value={values.firstName} onChange={change} required />
      <StudentField label="Middle name" name="middleName" value={values.middleName} onChange={change} />
      <StudentField label="Last name" name="lastName" value={values.lastName} onChange={change} required />
      <StudentField label="Date of birth" name="dob" type="date" value={values.dob} onChange={change} required />
      <label className="block text-sm font-medium text-gray-700">
        Gender
        <select name="gender" value={values.gender} onChange={change} required className="mt-1 w-full rounded border border-gray-300 px-3 py-2">
          <option value="">Choose gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Class
        <select name="classroomId" value={values.classroomId} onChange={change} className="mt-1 w-full rounded border border-gray-300 px-3 py-2">
          <option value="">No class assigned</option>
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>{classroom.name} ({classroom.level})</option>
          ))}
        </select>
      </label>
      {student && (
        <label className="block text-sm font-medium text-gray-700">
          Status
          <select name="status" value={values.status} onChange={change} className="mt-1 w-full rounded border border-gray-300 px-3 py-2">
            {STUDENT_STATUSES.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
          </select>
        </label>
      )}
      {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <LoadingButton
          type="submit"
          isLoading={isSaving}
          loadingText="Saving..."
          className="bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {student ? "Save changes" : "Create student"}
        </LoadingButton>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isSaving} className="rounded-md border px-4 py-2 text-sm">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function StudentField({ label, name, type = "text", value, onChange, required = false }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
      />
    </label>
  );
}

function StudentDetails({ student, onEdit }) {
  const profile = student.academicProfile;
  return (
    <div className="space-y-5">
      <dl className="grid gap-3 sm:grid-cols-2">
        <Detail label="Admission number" value={student.admissionNo} />
        <Detail label="Name" value={getStudentName(student)} />
        <Detail label="Email" value={student.user?.email} />
        <Detail label="Phone" value={student.user?.profile?.phone} />
        <Detail label="Date of birth" value={formatDate(student.dob)} />
        <Detail label="Gender" value={student.gender} />
        <Detail label="Class" value={student.classroom?.name} />
        <Detail label="Status" value={statusLabel(student.status)} />
        <Detail label="Admission date" value={formatDate(student.admissionDate)} />
        <Detail label="Address" value={student.user?.profile?.address} />
        <Detail label="Current level" value={profile?.currentLevel} />
        <Detail label="Admission year" value={profile?.admissionYear} />
        <Detail label="Previous school" value={profile?.previousSchool} />
        <Detail label="Attendance records" value={student._count?.attendanceRecords} />
        <Detail label="Assessment scores" value={student._count?.scores} />
        <Detail label="Invoices" value={student._count?.invoices} />
      </dl>
      {student.guardians?.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold">Guardians</h3>
          <ul className="space-y-2">
            {student.guardians.map((item, index) => (
              <li key={`${item.guardian.firstName}-${index}`} className="rounded border p-3 text-sm">
                <p className="font-medium">
                  {item.guardian.firstName} {item.guardian.lastName}
                  {item.isPrimary ? " · Primary" : ""}
                </p>
                <p>{item.relationship.replaceAll("_", " ").toLowerCase()}</p>
                <p>{item.guardian.phone} {item.guardian.email ? `· ${item.guardian.email}` : ""}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {student.enrollments?.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold">Enrollment history</h3>
          <ul className="space-y-2">
            {student.enrollments.map((enrollment) => (
              <li key={enrollment.id} className="rounded border p-3 text-sm">
                {enrollment.classroom.name} · {enrollment.session.name}
                {enrollment.semester?.name ? ` · ${enrollment.semester.name}` : ""}
                {" · "}{statusLabel(enrollment.status)}
              </li>
            ))}
          </ul>
        </section>
      )}
      {profile?.notes && <Detail label="Academic notes" value={profile.notes} />}
      <button type="button" className="rounded border px-4 py-2 text-blue-700" onClick={onEdit}>
        Edit student
      </button>
    </div>
  );
}

function StudentAcademicProfile({ studentId }) {
  const query = useQuery({
    queryKey: studentKeys.academicProfile(studentId),
    queryFn: () => studentApi.getAcademicProfile(studentId),
  });
  const mutations = useStudentMutations();
  const [values, setValues] = React.useState(null);

  React.useEffect(() => {
    if (query.data === undefined) return;
    const profile = query.data;
    setValues({
      currentLevel: profile?.currentLevel ?? "",
      admissionYear: profile?.admissionYear ?? "",
      previousSchool: profile?.previousSchool ?? "",
      notes: profile?.notes ?? "",
    });
  }, [query.data]);

  if (query.isLoading) return <p>Loading academic profile...</p>;
  if (query.isError) {
    return (
      <div role="alert" className="text-red-700">
        <p>{getErrorMessage(query.error)}</p>
        <LoadingButton type="button" className="mt-2 underline" onClick={() => query.refetch()} isLoading={query.isFetching} loadingText="Retrying...">Try again</LoadingButton>
      </div>
    );
  }
  if (!values) return null;

  const change = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          await mutations.updateProfile.mutateAsync({
            id: studentId,
            currentLevel: values.currentLevel || null,
            admissionYear: values.admissionYear ? Number(values.admissionYear) : null,
            previousSchool: values.previousSchool || null,
            notes: values.notes || null,
          });
          query.refetch();
        } catch {
          // The mutation reports API and network errors.
        }
      }}
    >
      <StudentField label="Current level" name="currentLevel" value={values.currentLevel} onChange={change} />
      <StudentField label="Admission year" name="admissionYear" type="number" value={values.admissionYear} onChange={change} />
      <StudentField label="Previous school" name="previousSchool" value={values.previousSchool} onChange={change} />
      <label className="block text-sm font-medium text-gray-700">
        Notes
        <textarea name="notes" value={values.notes} onChange={change} rows={4} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </label>
      <LoadingButton
        type="submit"
        isLoading={mutations.updateProfile.isPending}
        loadingText="Saving..."
        className="bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Save academic profile
      </LoadingButton>
    </form>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || "—"}</dd>
    </div>
  );
}

function getStudentName(student) {
  const profile = student.user?.profile;
  return [
    student.firstName || profile?.firstName,
    student.middleName || profile?.middleName,
    student.lastName || profile?.lastName,
  ].filter(Boolean).join(" ") || "—";
}

function statusLabel(status) {
  return status ? status.charAt(0) + status.slice(1).toLowerCase() : "—";
}

function statusClass(status) {
  if (status === "ACTIVE") return "bg-green-100 text-green-800";
  if (status === "SUSPENDED") return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-700";
}

function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}
