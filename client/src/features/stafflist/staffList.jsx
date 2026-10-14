import React from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import Dialog from "../../components/dialog/dialog";
import PrimaryButton from "../../components/button/button";
import LoadingButton from "../../components/button/loadingButton";
import Table from "../../components/table/table";
import Pagination from "../../components/pagination/pagination";
import { getErrorMessage } from "../../lib/apiError";
import { staffKeys } from "../../lib/queryKeys";
import { useDepartments } from "../departments/useDepartments";
import { staffApi, useStaff, useStaffMutations } from "./useStaff";

const PAGE_SIZE = 20;

export default function StaffList() {
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(null);
  const [editing, setEditing] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const params = {
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(activeFilter ? { isActive: activeFilter } : {}),
  };
  const staffQuery = useStaff(params);
  const detailQuery = useQuery({
    queryKey: staffKeys.detail(selectedId),
    queryFn: () => staffApi.getStaff(selectedId),
    enabled: Boolean(selectedId),
  });
  const mutations = useStaffMutations();

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  React.useEffect(() => setPage(1), [activeFilter]);

  const staff = staffQuery.data?.staff ?? [];
  const pagination = staffQuery.data?.pagination;
  const selectedStaff = detailQuery.data;
  const closeModal = () => {
    if (mutations.update.isPending) return;
    setSelectedId(null);
    setEditing(false);
  };

  async function downloadCsv() {
    setExporting(true);
    try {
      const blob = await staffApi.exportStaff();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "staff.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to export staff records."));
    } finally {
      setExporting(false);
    }
  }

  async function importFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      await mutations.importCsv.mutateAsync(await file.text());
      setPage(1);
    } catch {
      // The mutation reports API and network errors.
    }
  }

  async function removeStaff(member) {
    const name = `${member.firstName} ${member.lastName}`;
    if (!window.confirm(`Delete ${name}'s staff record? This cannot be undone.`)) {
      return;
    }
    try {
      await mutations.remove.mutateAsync(member.id);
      if (staff.length === 1 && page > 1) setPage((current) => current - 1);
    } catch {
      // The mutation reports API and network errors.
    }
  }

  return (
    <section className="py-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold text-blue-600 uppercase">Staff list</h2>
          <p className="mt-1 text-sm text-gray-600">
            Search, review, update, and manage staff records.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LoadingButton
            type="button"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            isLoading={mutations.importCsv.isPending}
            loadingText="Importing..."
          >
            Import CSV
          </LoadingButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={importFile}
          />
          <LoadingButton
            type="button"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={downloadCsv}
            isLoading={exporting}
            loadingText="Exporting..."
          >
            Export CSV
          </LoadingButton>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="block">
          <span className="sr-only">Search staff</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name, email, or employee number"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
        <label className="block">
          <span className="sr-only">Filter staff by status</span>
          <select
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">All staff</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
      </div>

      <Table
        data={staff}
        isLoading={staffQuery.isLoading}
        isError={staffQuery.isError}
        errorMessage={getErrorMessage(staffQuery.error, "Couldn't load staff records.")}
        onRetry={staffQuery.refetch}
        emptyMessage="No staff records match these filters."
        className="rounded-lg border border-gray-300"
      >
        <Table.Header columns={[
          "Employee No.",
          "Name",
          "Department",
          "Position",
          "Phone",
          "Email",
          "Status",
          "Actions",
        ]} />
        <Table.Body
          renderRow={(member) => {
            const hasCourseAssignments = member._count?.courseOfferings > 0;
            return (
              <>
                <td className="p-3">{member.employeeNo}</td>
                <td className="p-3">{`${member.firstName} ${member.lastName}`}</td>
                <td className="p-3">{member.department?.name ?? "—"}</td>
                <td className="p-3">{member.designation || "—"}</td>
                <td className="p-3">{member.phone || "—"}</td>
                <td className="p-3">{member.email || "—"}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    member.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                  }`}>
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="space-x-2 whitespace-nowrap p-3">
                  <button
                    type="button"
                    className="text-blue-700 hover:underline"
                    onClick={() => {
                      setSelectedId(member.id);
                      setEditing(false);
                    }}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="text-indigo-700 hover:underline"
                    onClick={() => {
                      setSelectedId(member.id);
                      setEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <LoadingButton
                    type="button"
                    className="text-amber-700 hover:underline disabled:text-gray-400"
                    disabled={mutations.update.isPending}
                    isLoading={mutations.update.isPending && mutations.update.variables?.id === member.id}
                    loadingText={member.isActive ? "Deactivating..." : "Activating..."}
                    onClick={() => mutations.update.mutate({
                      id: member.id,
                      isActive: !member.isActive,
                    })}
                  >
                    {member.isActive ? "Deactivate" : "Activate"}
                  </LoadingButton>
                  <LoadingButton
                    type="button"
                    className="text-red-700 hover:underline disabled:text-gray-400"
                    disabled={hasCourseAssignments || mutations.remove.isPending}
                    isLoading={mutations.remove.isPending && mutations.remove.variables === member.id}
                    loadingText="Deleting..."
                    title={hasCourseAssignments
                      ? "Staff assigned to course offerings cannot be deleted"
                      : undefined}
                    onClick={() => removeStaff(member)}
                  >
                    Delete
                  </LoadingButton>
                </td>
              </>
            );
          }}
        />
      </Table>
      {pagination && (
        <Pagination {...pagination} onPageChange={setPage} className="px-2" />
      )}

      <Dialog
        open={Boolean(selectedId)}
        onClose={closeModal}
        title={editing ? "Edit staff record" : "Staff details"}
        size="lg"
      >
        {detailQuery.isLoading && <p>Loading staff details...</p>}
        {detailQuery.isError && (
          <div role="alert" className="text-red-700">
            <p>{getErrorMessage(detailQuery.error, "Couldn't load staff details.")}</p>
            <LoadingButton type="button" className="mt-2 underline" onClick={() => detailQuery.refetch()} isLoading={detailQuery.isFetching} loadingText="Retrying...">
              Try again
            </LoadingButton>
          </div>
        )}
        {selectedStaff && editing && (
          <StaffEditForm
            key={selectedStaff.id}
            staff={selectedStaff}
            isSaving={mutations.update.isPending}
            onCancel={() => setEditing(false)}
            onSubmit={(payload) =>
              mutations.update.mutateAsync({ id: selectedStaff.id, ...payload }).then(() => {
                setEditing(false);
                detailQuery.refetch();
              })
            }
          />
        )}
        {selectedStaff && !editing && (
          <StaffDetails staff={selectedStaff} onEdit={() => setEditing(true)} />
        )}
      </Dialog>
    </section>
  );
}

function StaffEditForm({ staff, isSaving, onCancel, onSubmit }) {
  const departmentsQuery = useDepartments({ page: 1, limit: 100 });
  const departmentOptions = (departmentsQuery.data?.departments ?? []).map((department) => ({
    id: department.id,
    name: department.name,
  }));
  const [values, setValues] = React.useState({
    employeeNo: staff.employeeNo ?? "",
    firstName: staff.firstName ?? "",
    lastName: staff.lastName ?? "",
    email: staff.email ?? "",
    phone: staff.phone ?? "",
    designation: staff.designation ?? "",
    employmentType: staff.employmentType ?? "",
    employmentDate: toDateInput(staff.employmentDate),
    departmentId: staff.departmentId ?? "",
    isActive: staff.isActive,
  });
  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          employeeNo: values.employeeNo.trim(),
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim() || null,
          phone: values.phone.trim() || null,
          designation: values.designation.trim() || null,
          employmentType: values.employmentType.trim() || null,
          employmentDate: values.employmentDate || null,
          departmentId: values.departmentId || null,
          isActive: values.isActive,
        });
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <StaffTextField label="Employee number" name="employeeNo" value={values.employeeNo} onChange={change} required />
      <StaffTextField label="First name" name="firstName" value={values.firstName} onChange={change} required />
      <StaffTextField label="Last name" name="lastName" value={values.lastName} onChange={change} required />
      <StaffTextField label="Email" name="email" type="email" value={values.email} onChange={change} />
      <StaffTextField label="Phone" name="phone" value={values.phone} onChange={change} />
      <StaffTextField label="Position" name="designation" value={values.designation} onChange={change} />
      <label className="block text-sm font-medium text-gray-700">
        Department
        <select
          name="departmentId"
          value={values.departmentId}
          onChange={change}
          disabled={departmentsQuery.isLoading || departmentsQuery.isError}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="">No department</option>
          {departmentOptions.map((department) => (
            <option key={department.id} value={department.id}>{department.name}</option>
          ))}
        </select>
      </label>
      <StaffTextField label="Employment type" name="employmentType" value={values.employmentType} onChange={change} />
      <StaffTextField label="Employment date" name="employmentDate" type="date" value={values.employmentDate} onChange={change} />
      <label className="flex items-center gap-2 self-end pb-3 text-sm">
        <input type="checkbox" name="isActive" checked={values.isActive} onChange={change} />
        Active staff member
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <PrimaryButton type="submit" isLoading={isSaving} loadingText="Saving...">
          Save changes
        </PrimaryButton>
        <button type="button" className="rounded border px-4 py-2" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function StaffTextField({ label, name, type = "text", value, onChange, required = false }) {
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

function StaffDetails({ staff, onEdit }) {
  return (
    <div className="space-y-5">
      <dl className="grid gap-3 sm:grid-cols-2">
        <Detail label="Employee number" value={staff.employeeNo} />
        <Detail label="Name" value={`${staff.firstName} ${staff.lastName}`} />
        <Detail label="Email" value={staff.email} />
        <Detail label="Phone" value={staff.phone} />
        <Detail label="Department" value={staff.department?.name} />
        <Detail label="Position" value={staff.designation} />
        <Detail label="Employment type" value={staff.employmentType} />
        <Detail label="Employment date" value={formatDate(staff.employmentDate)} />
        <Detail label="Date of birth" value={formatDate(staff.user?.profile?.dateOfBirth)} />
        <Detail label="Address" value={staff.user?.profile?.address} />
        <Detail label="Status" value={staff.isActive ? "Active" : "Inactive"} />
      </dl>
      <section>
        <h3 className="mb-2 font-semibold">Qualifications</h3>
        {staff.qualifications?.length ? (
          <ul className="space-y-2">
            {staff.qualifications.map((item) => (
              <li key={item.id} className="rounded border p-3 text-sm">
                <p className="font-medium">{item.qualification}</p>
                <p>{item.level} · {item.institution} · {item.year}</p>
                {item.documentFileName && <p>Document: {item.documentFileName}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No qualifications recorded.</p>
        )}
      </section>
      <section>
        <h3 className="mb-2 font-semibold">Course assignments</h3>
        {staff.courseOfferings?.length ? (
          <ul className="space-y-2">
            {staff.courseOfferings.map((course) => (
              <li key={course.id} className="rounded border p-3 text-sm">
                {course.subject.name} ({course.subject.code}) · {course.classroom.name} ·{" "}
                {course.semester.name}, {course.semester.session.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No course assignments.</p>
        )}
      </section>
      <button type="button" className="rounded border px-4 py-2 text-blue-700" onClick={onEdit}>
        Edit staff
      </button>
    </div>
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

function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}
