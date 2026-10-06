import React, { useCallback, useEffect, useState } from "react";

import Table from "../../components/table/table";
import Pagination from "../../components/pagination/pagination";
import SearchBar from "../../components/search";
import Select from "../../components/inputs/select";
import ConfirmDialog from "../../components/confirmDialog/confirmDialog";
import PrimaryButton from "../../components/button/button";
import { getErrorMessage } from "../../lib/apiError";
import DepartmentForm, { useFacultyOptions } from "./departmentForm";
import { useDeleteDepartment, useDepartments } from "./useDepartments";

const PAGE_SIZE = 10;

export default function DepartmentList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [form, setForm] = useState({ open: false, department: null });
  const [toDelete, setToDelete] = useState(null);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useDepartments({ page, limit: PAGE_SIZE, search, facultyId });
  const deleteDepartment = useDeleteDepartment();
  const faculties = useFacultyOptions();

  const departments = data?.departments ?? [];
  const pagination = data?.pagination;
  const filtered = Boolean(search || facultyId);

  const handleSearch = useCallback((term) => {
    setSearch(term);
    setPage(1);
  }, []);

  // Deleted the last row on a page > 1? Step back instead of showing "empty".
  useEffect(() => {
    if (data && data.departments.length === 0 && page > 1) {
      setPage((p) => p - 1);
    }
  }, [data, page]);

  const confirmDelete = () => {
    deleteDepartment.mutate(toDelete.id, {
      onSettled: () => setToDelete(null),
    });
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
          <div className="w-full sm:max-w-xs">
            <SearchBar
              placeholder="Search name or code…"
              onSearch={handleSearch}
            />
          </div>
          <Select
            name="facultyFilter"
            compact
            allowEmpty
            placeholder="All faculties"
            className="sm:max-w-xs"
            value={facultyId}
            onChange={(e) => {
              setFacultyId(e.target.value);
              setPage(1);
            }}
            options={faculties.options}
          />
        </div>
        <PrimaryButton onClick={() => setForm({ open: true, department: null })}>
          Add department
        </PrimaryButton>
      </div>

      <div
        className={isFetching && !isLoading ? "opacity-70 transition-opacity" : ""}
      >
        <Table
          data={departments}
          isLoading={isLoading}
          isError={isError}
          errorMessage={getErrorMessage(error, "Couldn't load departments.")}
          onRetry={refetch}
          emptyMessage={
            filtered
              ? "No departments match your search or filter."
              : "No departments yet. Add the first one."
          }
        >
          <Table.Header
            columns={[
              "Name",
              "Code",
              "Faculty",
              "Subjects",
              "Classrooms",
              "Actions",
            ]}
          />
          <Table.Body
            renderRow={(department) => {
              const subjects = department._count?.subjects ?? 0;
              const classrooms = department._count?.classrooms ?? 0;
              const inUse = subjects + classrooms > 0;
              return (
                <>
                  <td className="p-3">{department.name}</td>
                  <td className="p-3">{department.code}</td>
                  <td className="p-3">
                    {department.faculty?.name ?? (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3">{subjects}</td>
                  <td className="p-3">{classrooms}</td>
                  <td className="space-x-3 p-3">
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => setForm({ open: true, department })}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
                      disabled={inUse}
                      title={
                        inUse
                          ? "Remove or move its subjects and classrooms first"
                          : undefined
                      }
                      onClick={() => setToDelete(department)}
                    >
                      Delete
                    </button>
                  </td>
                </>
              );
            }}
          />
        </Table>
      </div>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
        />
      )}

      <DepartmentForm
        open={form.open}
        department={form.department}
        onClose={() => setForm({ open: false, department: null })}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete department"
        message={`Delete "${toDelete?.name}"? This can't be undone.`}
        isLoading={deleteDepartment.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
