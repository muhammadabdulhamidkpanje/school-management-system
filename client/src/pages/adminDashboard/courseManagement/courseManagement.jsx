import React from "react";
import Dialog from "../../../components/dialog/dialog";
import ConfirmDialog from "../../../components/confirmDialog/confirmDialog";
import LoadingButton from "../../../components/button/loadingButton";
import Pagination from "../../../components/pagination/pagination";
import Table from "../../../components/table/table";
import { useDepartments } from "../../../features/departments";
import { useStaff } from "../../../features/stafflist/useStaff";
import { getErrorMessage } from "../../../lib/apiError";
import {
  useAssignCourseTeacher,
  useCourseOfferingOptions,
  useCourseOfferings,
  useCreateCourseOffering,
  useCourses,
  useDeleteCourse,
  useSaveCourse,
} from "../../../features/courses/useCourses";

const PAGE_SIZE = 10;
const DEPARTMENT_OPTIONS_PARAMS = { page: 1, limit: 100 };
const STAFF_OPTIONS_PARAMS = { page: 1, limit: 100, isActive: true };

export default function CourseManagement() {
  const [tab, setTab] = React.useState("catalog");
  const [page, setPage] = React.useState(1);
  const [offeringPage, setOfferingPage] = React.useState(1);
  const [offeringFormOpen, setOfferingFormOpen] = React.useState(false);
  const [offeringFormError, setOfferingFormError] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState(null);
  const [toDelete, setToDelete] = React.useState(null);
  const [formError, setFormError] = React.useState("");

  const queryParams = {
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(departmentId ? { departmentId } : {}),
  };
  const coursesQuery = useCourses(queryParams);
  const courseTotalQuery = useCourses({ page: 1, limit: 1 });
  const offeringsQuery = useCourseOfferings({ page: offeringPage, limit: PAGE_SIZE });
  const offeringOptionsQuery = useCourseOfferingOptions();
  const departmentsQuery = useDepartments(DEPARTMENT_OPTIONS_PARAMS);
  const staffQuery = useStaff(STAFF_OPTIONS_PARAMS);
  const saveCourse = useSaveCourse();
  const deleteCourse = useDeleteCourse();
  const assignTeacher = useAssignCourseTeacher();
  const createOffering = useCreateCourseOffering();
  const courses = coursesQuery.data?.courses ?? [];
  const departments = departmentsQuery.data?.departments ?? [];
  const pagination = coursesQuery.data?.pagination;
  const offerings = offeringsQuery.data?.offerings ?? [];
  const offeringPagination = offeringsQuery.data?.pagination;
  const staff = staffQuery.data?.staff ?? [];
  const offeringOptions = offeringOptionsQuery.data;
  const offeringStats = offeringsQuery.data?.stats;

  const onSearch = React.useCallback((event) => {
    setSearchInput(event.target.value);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    setPage(1);
  }, [departmentId]);

  React.useEffect(() => {
    if (coursesQuery.data && courses.length === 0 && page > 1) {
      setPage((current) => current - 1);
    }
  }, [coursesQuery.data, courses.length, page]);

  function openForm(course = null) {
    setFormError("");
    setFormOpen(true);
    setEditingCourse(course);
  }

  async function handleSave(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      code: String(formData.get("code") ?? "").trim(),
      departmentId: String(formData.get("departmentId") ?? "") || null,
    };
    setFormError("");
    try {
      await saveCourse.mutateAsync({
        ...(editingCourse ? { id: editingCourse.id } : {}),
        ...payload,
      });
      setFormOpen(false);
      setEditingCourse(null);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function handleCreateOffering(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setOfferingFormError("");
    try {
      await createOffering.mutateAsync({
        courseId: String(values.get("courseId") ?? ""),
        classroomId: String(values.get("classroomId") ?? ""),
        semesterId: String(values.get("semesterId") ?? ""),
      });
      setOfferingFormOpen(false);
    } catch (error) {
      setOfferingFormError(getErrorMessage(error));
    }
  }

  return (
    <section className="space-y-4 p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CourseStat label="Catalog courses" value={courseTotalQuery.data?.pagination?.total ?? "—"} />
        <CourseStat label="Class/semester offerings" value={offeringStats?.total ?? "—"} />
        <CourseStat label="With staff assigned" value={offeringStats?.assigned ?? "—"} tint="green" />
        <CourseStat label="Awaiting assignment" value={offeringStats?.unassigned ?? "—"} tint="amber" />
      </div>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Course management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and organize the course catalog by department.
          </p>
        </div>
      </header>

      <div role="tablist" aria-label="Course management sections" className="flex flex-wrap gap-2 border-b">
        {[
          ["catalog", "Course catalog"],
          ["instructors", "Staff assignments"],
        ].map(([value, label]) => (
          <button
            key={value}
            id={`course-management-tab-${value}`}
            type="button"
            role="tab"
            aria-selected={tab === value}
            aria-controls="course-management-panel"
            onClick={() => setTab(value)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === value
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div id="course-management-panel" role="tabpanel" aria-labelledby={`course-management-tab-${tab}`}>
      {tab === "catalog" && <>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openForm()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add course
          </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_16rem]">
        <label className="block">
          <span className="sr-only">Search courses</span>
          <input
            type="search"
            value={searchInput}
            onChange={onSearch}
            placeholder="Search course name or code"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>
        <label className="block">
          <span className="sr-only">Filter by department</span>
          <select
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
            disabled={departmentsQuery.isLoading || departmentsQuery.isError}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100"
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name} ({department.code})
              </option>
            ))}
          </select>
        </label>
      </div>

      {departmentsQuery.isError && (
        <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          <p>{getErrorMessage(departmentsQuery.error, "Unable to load departments.")}</p>
          <LoadingButton type="button" className="mt-1 underline" onClick={() => departmentsQuery.refetch()} isLoading={departmentsQuery.isFetching} loadingText="Retrying...">
            Try again
          </LoadingButton>
        </div>
      )}

      <Table
        data={courses}
        isLoading={coursesQuery.isLoading}
        isError={coursesQuery.isError}
        errorMessage={getErrorMessage(coursesQuery.error, "Unable to load courses.")}
        onRetry={coursesQuery.refetch}
        emptyMessage={search || departmentId
          ? "No courses match your search or department filter."
          : "No courses yet. Add the first course to the catalog."}
      >
        <Table.Header columns={["Course name", "Code", "Department", "Actions"]} />
        <Table.Body
          renderRow={(course) => (
            <>
              <td className="p-3 font-medium text-gray-900">{course.name}</td>
              <td className="p-3">{course.code}</td>
              <td className="p-3">{course.department?.name ?? <span className="text-gray-400">Unassigned</span>}</td>
              <td className="space-x-3 p-3">
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => openForm(course)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-red-600 hover:underline"
                  onClick={() => setToDelete(course)}
                >
                  Delete
                </button>
              </td>
            </>
          )}
        />
      </Table>

      {pagination && <Pagination {...pagination} onPageChange={setPage} />}
      </>}

      {tab === "instructors" && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Assign active staff to a subject offering for a specific class and semester.
            </p>
            <button
              type="button"
              onClick={() => {
                setOfferingFormError("");
                setOfferingFormOpen(true);
              }}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add class offering
            </button>
          </div>
          {staffQuery.isError && (
            <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              <p>{getErrorMessage(staffQuery.error, "Unable to load staff options.")}</p>
              <LoadingButton type="button" className="mt-1 underline" onClick={() => staffQuery.refetch()} isLoading={staffQuery.isFetching} loadingText="Retrying...">
                Try again
              </LoadingButton>
            </div>
          )}
          <Table
            data={offerings}
            isLoading={offeringsQuery.isLoading || staffQuery.isLoading || offeringOptionsQuery.isLoading}
            isError={offeringsQuery.isError}
            errorMessage={getErrorMessage(offeringsQuery.error, "Unable to load course offerings.")}
            onRetry={offeringsQuery.refetch}
            emptyMessage="No class offerings yet. Add a class offering to make a course available for staff assignment."
          >
            <Table.Header columns={["Course / subject", "Class", "Semester", "Staff member", "Action"]} />
            <Table.Body
              renderRow={(offering) => (
                <OfferingAssignment
                  key={offering.id}
                  offering={offering}
                  staff={staff}
                  mutation={assignTeacher}
                />
              )}
            />
          </Table>
          {offeringPagination && (
            <Pagination {...offeringPagination} onPageChange={setOfferingPage} />
          )}
          <OfferingFormDialog
            open={offeringFormOpen}
            options={offeringOptions ?? { courses: [], classrooms: [], semesters: [] }}
            isLoadingOptions={offeringOptionsQuery.isLoading}
            isRefreshingOptions={offeringOptionsQuery.isFetching}
            optionsError={offeringOptionsQuery.isError
              ? getErrorMessage(offeringOptionsQuery.error, "Unable to load course options.")
              : ""}
            onRetryOptions={() => offeringOptionsQuery.refetch()}
            isSaving={createOffering.isPending}
            error={offeringFormError}
            onClose={() => {
              if (createOffering.isPending) return;
              setOfferingFormOpen(false);
              setOfferingFormError("");
            }}
            onSubmit={handleCreateOffering}
          />
        </section>
      )}

      <CourseFormDialog
        course={editingCourse}
        departments={departments}
        open={formOpen}
        isSaving={saveCourse.isPending}
        error={formError}
        onClose={() => {
          if (saveCourse.isPending) return;
          setFormOpen(false);
          setEditingCourse(null);
          setFormError("");
        }}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete course"
        message={`Delete "${toDelete?.name}"? This can't be undone.`}
        isLoading={deleteCourse.isPending}
        onConfirm={() => {
          if (!toDelete) return;
          deleteCourse.mutate(toDelete.id, {
            onSettled: () => setToDelete(null),
          });
        }}
        onCancel={() => setToDelete(null)}
      />
      </div>
    </section>
  );
}

function OfferingAssignment({ offering, staff, mutation }) {
  const [teacherId, setTeacherId] = React.useState(offering.teacher?.id ?? "");

  React.useEffect(() => {
    setTeacherId(offering.teacher?.id ?? "");
  }, [offering.teacher?.id]);

  const assignedStaffIsInactive =
    offering.teacher && !offering.teacher.isActive &&
    !staff.some((member) => member.id === offering.teacher.id);
  const isSaving = mutation.isPending && mutation.variables?.offeringId === offering.id;
  const unchanged = teacherId === (offering.teacher?.id ?? "");
  const course = offering.course ?? offering.subject;

  return (
    <>
      <td className="p-3 text-left">
        <p className="font-medium text-gray-900">{course?.name ?? "Unknown course"}</p>
        {course?.code && <p className="text-xs text-gray-500">{course.code}</p>}
      </td>
      <td className="p-3">{offering.classroom.name} ({offering.classroom.level})</td>
      <td className="p-3">
        {offering.semester.name}
        {offering.semester.session?.name ? ` · ${offering.semester.session.name}` : ""}
      </td>
      <td className="p-3">
        <select
          value={teacherId}
          onChange={(event) => setTeacherId(event.target.value)}
          disabled={isSaving}
          aria-label={`Staff member for ${course?.name ?? "course"} in ${offering.classroom.name}`}
          className="w-full min-w-52 rounded-md border border-gray-300 bg-white px-2 py-2 text-sm disabled:bg-gray-100"
        >
          <option value="">Unassigned</option>
          {assignedStaffIsInactive && (
            <option value={offering.teacher.id}>
              {offering.teacher.firstName} {offering.teacher.lastName} (inactive)
            </option>
          )}
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.firstName} {member.lastName} · {member.employeeNo}
            </option>
          ))}
        </select>
      </td>
      <td className="p-3">
        <LoadingButton
          type="button"
          isLoading={isSaving}
          loadingText="Saving..."
          disabled={unchanged}
          onClick={() => mutation.mutate({ offeringId: offering.id, teacherId: teacherId || null })}
          className="rounded-md border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </LoadingButton>
      </td>
    </>
  );
}

function CourseStat({ label, value, tint = "blue" }) {
  const tintClasses = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    green: "border-green-100 bg-green-50 text-green-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
  };

  return (
    <div className={`rounded-lg border p-4 ${tintClasses[tint]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function OfferingFormDialog({
  open,
  options,
  isLoadingOptions,
  isRefreshingOptions,
  optionsError,
  onRetryOptions,
  isSaving,
  error,
  onClose,
  onSubmit,
}) {
  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      title="Add class offering"
      size="md"
      footer={(
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <LoadingButton
            type="submit"
            form="offering-form"
            isLoading={isSaving}
            loadingText="Creating..."
            disabled={isLoadingOptions || Boolean(optionsError) || options.courses.length === 0 || options.classrooms.length === 0 || options.semesters.length === 0}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isLoadingOptions ? "Loading options..." : "Create offering"}
          </LoadingButton>
        </>
      )}
    >
      <form id="offering-form" onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Course
          <select
            name="courseId"
            required
            defaultValue=""
            disabled={isLoadingOptions || Boolean(optionsError)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-normal disabled:bg-gray-100"
          >
            <option value="" disabled>
              {isLoadingOptions ? "Loading courses..." : options.courses.length ? "Select a course" : "No courses available"}
            </option>
            {options.courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Class
          <select
            name="classroomId"
            required
            defaultValue=""
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-normal"
          >
            <option value="" disabled>Select a class</option>
            {options.classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} ({classroom.level})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Semester
          <select
            name="semesterId"
            required
            defaultValue=""
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-normal"
          >
            <option value="" disabled>Select a semester</option>
            {options.semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name}{semester.session?.name ? ` · ${semester.session.name}` : ""}
              </option>
            ))}
          </select>
        </label>
        {optionsError && (
          <div role="alert" className="text-sm text-red-700">
            <p>{optionsError}</p>
            <LoadingButton type="button" className="mt-1 underline" onClick={onRetryOptions} isLoading={isRefreshingOptions} loadingText="Retrying...">
              Try again
            </LoadingButton>
          </div>
        )}
        {!isLoadingOptions && !optionsError && options.courses.length === 0 && (
          <p className="text-sm text-amber-700">Add a course to the catalog before creating an offering.</p>
        )}
        {options.classrooms.length === 0 && <p className="text-sm text-amber-700">Create classes before adding class offerings.</p>}
        {options.semesters.length === 0 && <p className="text-sm text-amber-700">Create semesters before adding class offerings.</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </form>
    </Dialog>
  );
}

function CourseFormDialog({ course, departments, open, isSaving, error, onClose, onSubmit }) {
  const [formKey, setFormKey] = React.useState(0);

  React.useEffect(() => {
    if (open) setFormKey((key) => key + 1);
  }, [open, course?.id]);

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      title={course ? "Edit course" : "Add course"}
      size="md"
      footer={(
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <LoadingButton
            type="submit"
            form="course-form"
            isLoading={isSaving}
            loadingText="Saving..."
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {course ? "Save changes" : "Create course"}
          </LoadingButton>
        </>
      )}
    >
      <form key={formKey} id="course-form" onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Course name
          <input
            name="name"
            required
            maxLength={150}
            defaultValue={course?.name ?? ""}
            placeholder="e.g. Introduction to Biology"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Course code
          <input
            name="code"
            required
            maxLength={50}
            defaultValue={course?.code ?? ""}
            placeholder="e.g. BIO101"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Department
          <select
            name="departmentId"
            defaultValue={course?.departmentId ?? course?.department?.id ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-normal"
          >
            <option value="">No department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name} ({department.code})
              </option>
            ))}
          </select>
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </form>
    </Dialog>
  );
}
