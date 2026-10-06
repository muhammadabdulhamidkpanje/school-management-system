import React, { useCallback, useEffect, useState } from "react";

import Table from "../../components/table/table";
import Pagination from "../../components/pagination/pagination";
import SearchBar from "../../components/search";
import ConfirmDialog from "../../components/confirmDialog/confirmDialog";
import PrimaryButton from "../../components/button/button";
import { getErrorMessage } from "../../lib/apiError";
import FacultyForm from "./facultyForm";
import { useDeleteFaculty, useFaculties } from "./useFaculties";

const PAGE_SIZE = 10;

export default function FacultyList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ open: false, faculty: null });
  const [toDelete, setToDelete] = useState(null);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useFaculties({ page, limit: PAGE_SIZE, search });
  const deleteFaculty = useDeleteFaculty();

  const faculties = data?.faculties ?? [];
  const pagination = data?.pagination;

  // Stable callback: SearchBar re-fires onSearch whenever this identity changes.
  const handleSearch = useCallback((term) => {
    setSearch(term);
    setPage(1);
  }, []);

  // Deleted the last row on a page > 1? Step back instead of showing "empty".
  useEffect(() => {
    if (data && data.faculties.length === 0 && page > 1) {
      setPage((p) => p - 1);
    }
  }, [data, page]);

  const confirmDelete = () => {
    deleteFaculty.mutate(toDelete.id, { onSettled: () => setToDelete(null) });
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <SearchBar placeholder="Search name or code…" onSearch={handleSearch} />
        </div>
        <PrimaryButton onClick={() => setForm({ open: true, faculty: null })}>
          Add faculty
        </PrimaryButton>
      </div>

      <div className={isFetching && !isLoading ? "opacity-70 transition-opacity" : ""}>
        <Table
          data={faculties}
          isLoading={isLoading}
          isError={isError}
          errorMessage={getErrorMessage(error, "Couldn't load faculties.")}
          onRetry={refetch}
          emptyMessage={
            search
              ? `No faculties match "${search}".`
              : "No faculties yet. Add the first one."
          }
        >
          <Table.Header columns={["Name", "Code", "Departments", "Actions"]} />
          <Table.Body
            renderRow={(faculty) => {
              const departmentCount = faculty._count?.departments ?? 0;
              return (
                <>
                  <td className="p-3">{faculty.name}</td>
                  <td className="p-3">{faculty.code}</td>
                  <td className="p-3">{departmentCount}</td>
                  <td className="space-x-3 p-3">
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => setForm({ open: true, faculty })}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
                      disabled={departmentCount > 0}
                      title={
                        departmentCount > 0
                          ? "Remove or move its departments first"
                          : undefined
                      }
                      onClick={() => setToDelete(faculty)}
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

      <FacultyForm
        open={form.open}
        faculty={form.faculty}
        onClose={() => setForm({ open: false, faculty: null })}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete faculty"
        message={`Delete "${toDelete?.name}"? This can't be undone.`}
        isLoading={deleteFaculty.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
