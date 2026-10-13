import React from "react";
import { Search } from "lucide-react";
import Pagination from "../../../components/pagination/pagination";
import Table from "../../../components/table/table";
import { getErrorMessage } from "../../../lib/apiError";
import { useStudents } from "../../../features/students/useStudents";

const PAGE_SIZE = 10;

export default function StudentList() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const studentsQuery = useStudents({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });
  const students = studentsQuery.data?.students ?? [];
  const pagination = studentsQuery.data?.pagination;

  return (
    <section className="p-4">
      <h2 className="py-2 text-2xl font-semibold text-blue-600">Student List</h2>

      <label className="my-3 flex w-full max-w-lg items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
        <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500" />
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search students by name, email, or ID"
          aria-label="Search students by name, email, or ID"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>

      <Table
        data={students}
        isLoading={studentsQuery.isLoading}
        isError={studentsQuery.isError}
        errorMessage={getErrorMessage(studentsQuery.error)}
        onRetry={studentsQuery.refetch}
        emptyMessage={
          debouncedSearch
            ? "No students match your search."
            : "No students have been added yet."
        }
      >
        <Table.Header
          columns={["Student ID", "Name", "Email", "Class", "Status"]}
        />
        <Table.Body
          renderRow={(student) => (
            <>
              <td className="px-4 py-3">
                {student.studentId || student.admissionNumber || student.id}
              </td>
              <td className="px-4 py-3">
                {student.name ||
                  student.user?.name ||
                  [
                    student.firstName || student.user?.firstName,
                    student.middleName || student.user?.middleName,
                    student.lastName || student.user?.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  "—"}
              </td>
              <td className="px-4 py-3">{student.email || student.user?.email || "—"}</td>
              <td className="px-4 py-3">
                {student.classroom?.name || student.class?.name || "—"}
              </td>
              <td className="px-4 py-3">{student.status || "—"}</td>
            </>
          )}
        />
      </Table>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}
