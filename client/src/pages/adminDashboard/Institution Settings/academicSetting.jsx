import React from "react";
import { useForm } from "react-hook-form";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import PrimaryButton from "../../../components/button/button";
import Input from "../../../components/inputs/input";
import Select from "../../../components/inputs/select";
import Headings from "../../../UI/headings";
import VerticalButton from "../../../UI/verticalButton";
import HorizontalButton from "../../../UI/horizontalButton";
import Table from "../../../components/table/table";
import { getErrorMessage } from "../../../lib/apiError";
import {
  academicCalendarKeys,
  gradingSystemKeys,
  sessionKeys,
  semesterKeys,
} from "../../../lib/queryKeys";
import * as academicApi from "../../../features/academic/academicApi";

const academicButtons = [
  { label: "Sessions", value: 1 },
  { label: "Semesters", value: 2 },
  { label: "Grading Systems", value: 3 },
  { label: "Academic Calendars", value: 4 },
];

export default function AcademicSettings() {
  const [tab, setTab] = React.useState(1);

  return (
    <div className="flex flex-wrap">
      <Headings className="w-full text-xl font-semibold">
        Academic Settings
      </Headings>
      <div className="flex w-full flex-wrap justify-between gap-2">
        <VerticalButton
          data={academicButtons}
          className="w-[24%]"
          tab={tab}
          setTab={setTab}
          onClick={setTab}
        />
        <div className="w-full shadow sm:w-[73%]">
          {tab === 1 && <Sessions />}
          {tab === 2 && <Semesters />}
          {tab === 3 && <GradingSystemsSettings />}
          {tab === 4 && <AcademicCalendarsSettings />}
        </div>
      </div>
    </div>
  );
}

function Sessions() {
  const [tab, setTab] = React.useState(1);
  const [editing, setEditing] = React.useState(null);
  const queryClient = useQueryClient();
  const sessionsQuery = useQuery({
    queryKey: sessionKeys.list({ page: 1, limit: 100 }),
    queryFn: () => academicApi.listSessions({ page: 1, limit: 100 }),
  });
  const saveMutation = useMutation({
    mutationFn: ({ id, ...payload }) =>
      id
        ? academicApi.updateSession(id, payload)
        : academicApi.createSession(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      queryClient.invalidateQueries({ queryKey: semesterKeys.all });
      setEditing(null);
      setTab(1);
      toast.success(variables.id ? "Session updated" : "Session created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const deleteMutation = useMutation({
    mutationFn: academicApi.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      toast.success("Session deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  function startEditing(session) {
    setEditing(session);
    setTab(2);
  }

  return (
    <section className="w-full p-4">
      <Headings className="text-sm font-semibold">Academic Sessions</Headings>
      <HorizontalButton
        tab={tab}
        setTab={(nextTab) => {
          setEditing(null);
          setTab(nextTab);
        }}
        onClick={setTab}
        data={[
          { label: "Sessions", value: 1 },
          { label: "Add session", value: 2 },
        ]}
        className="w-full"
      />
      <div className="p-4">
        {tab === 1 ? (
          <Table
            data={sessionsQuery.data?.sessions ?? []}
            isLoading={sessionsQuery.isLoading}
            isError={sessionsQuery.isError}
            errorMessage={getErrorMessage(sessionsQuery.error)}
            onRetry={sessionsQuery.refetch}
            emptyMessage="No academic sessions have been created."
          >
            <Table.Header
              columns={[
                "Session",
                "Start date",
                "End date",
                "Current",
                "Semesters",
                "Actions",
              ]}
            />
            <Table.Body
              renderRow={(session) => {
                const relatedCount =
                  (session._count?.semesters ?? 0) +
                  (session._count?.admissions ?? 0) +
                  (session._count?.enrollments ?? 0);
                return (
                  <>
                    <td className="px-3 py-2">{session.name}</td>
                    <td className="px-3 py-2">{formatDate(session.startDate)}</td>
                    <td className="px-3 py-2">{formatDate(session.endDate)}</td>
                    <td className="px-3 py-2">
                      {session.isCurrent ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2">
                      {session._count?.semesters ?? 0}
                    </td>
                    <td className="space-x-2 px-3 py-2">
                      <button
                        type="button"
                        className="text-blue-700 underline"
                        onClick={() => startEditing(session)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-700 underline disabled:text-gray-400"
                        disabled={relatedCount > 0 || deleteMutation.isPending}
                        title={
                          relatedCount > 0
                            ? "Sessions with related academic records cannot be deleted"
                            : undefined
                        }
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete academic session "${session.name}"?`,
                            )
                          ) {
                            deleteMutation.mutate(session.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                );
              }}
            />
          </Table>
        ) : (
          <SessionForm
            key={editing?.id ?? "new-session"}
            session={editing}
            isSaving={saveMutation.isPending}
            onCancel={() => {
              setEditing(null);
              setTab(1);
            }}
            onSubmit={(payload) =>
              saveMutation.mutateAsync({
                ...(editing ? { id: editing.id } : {}),
                ...payload,
              })
            }
          />
        )}
      </div>
    </section>
  );
}

function SessionForm({ session, isSaving, onCancel, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: session?.name ?? "",
      startDate: toInputDate(session?.startDate),
      endDate: toInputDate(session?.endDate),
      isCurrent: session?.isCurrent ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Headings className="mb-4 text-lg font-semibold">
        {session ? "Edit session" : "Add session"}
      </Headings>
      <Input
        label="Session name"
        name="name"
        placeholder="e.g. 2025/2026"
        register={register}
        rules={{ required: "Session name is required" }}
        error={errors.name}
      />
      <div className="flex flex-wrap gap-4">
        <Input
          label="Start date"
          name="startDate"
          type="date"
          className="min-w-48 flex-1"
          register={register}
          rules={{ required: "Start date is required" }}
          error={errors.startDate}
        />
        <Input
          label="End date"
          name="endDate"
          type="date"
          className="min-w-48 flex-1"
          register={register}
          rules={{ required: "End date is required" }}
          error={errors.endDate}
        />
      </div>
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isCurrent")} />
        Set as current session
      </label>
      <div className="flex gap-2">
        <PrimaryButton type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : session ? "Save changes" : "Create session"}
        </PrimaryButton>
        {session && (
          <button
            type="button"
            className="rounded border px-4 py-2"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Semesters() {
  const [tab, setTab] = React.useState(1);
  const [editing, setEditing] = React.useState(null);
  const [sessionId, setSessionId] = React.useState("");
  const queryClient = useQueryClient();
  const sessionsQuery = useQuery({
    queryKey: sessionKeys.list({ page: 1, limit: 100 }),
    queryFn: () => academicApi.listSessions({ page: 1, limit: 100 }),
  });
  const semesterParams = {
    page: 1,
    limit: 100,
    ...(sessionId ? { sessionId } : {}),
  };
  const semestersQuery = useQuery({
    queryKey: semesterKeys.list(semesterParams),
    queryFn: () => academicApi.listSemesters(semesterParams),
  });
  const saveMutation = useMutation({
    mutationFn: ({ id, ...payload }) =>
      id
        ? academicApi.updateSemester(id, payload)
        : academicApi.createSemester(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: semesterKeys.all });
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      setEditing(null);
      setTab(1);
      toast.success(variables.id ? "Semester updated" : "Semester created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const deleteMutation = useMutation({
    mutationFn: academicApi.deleteSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: semesterKeys.all });
      toast.success("Semester deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const sessionOptions = (sessionsQuery.data?.sessions ?? []).map((session) => ({
    label: session.name,
    value: session.id,
  }));

  return (
    <section className="w-full p-4">
      <Headings className="text-sm font-semibold">Semesters</Headings>
      <HorizontalButton
        tab={tab}
        setTab={(nextTab) => {
          setEditing(null);
          setTab(nextTab);
        }}
        onClick={setTab}
        data={[
          { label: "Semesters", value: 1 },
          { label: "Add semester", value: 2 },
        ]}
        className="w-full"
      />
      <div className="p-4">
        {tab === 1 ? (
          <>
            <Select
              label="Filter by session"
              name="sessionFilter"
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              options={sessionOptions}
              placeholder="All sessions"
              allowEmpty
            />
            <Table
              data={semestersQuery.data?.semesters ?? []}
              isLoading={sessionsQuery.isLoading || semestersQuery.isLoading}
              isError={sessionsQuery.isError || semestersQuery.isError}
              errorMessage={getErrorMessage(
                sessionsQuery.error ?? semestersQuery.error,
              )}
              onRetry={() => {
                sessionsQuery.refetch();
                semestersQuery.refetch();
              }}
              emptyMessage="No semesters have been created."
            >
              <Table.Header
                columns={[
                  "Semester",
                  "Session",
                  "Start date",
                  "End date",
                  "Current",
                  "Actions",
                ]}
              />
              <Table.Body
                renderRow={(semester) => {
                  const relatedCount =
                    (semester._count?.enrollments ?? 0) +
                    (semester._count?.courseOfferings ?? 0);
                  return (
                    <>
                      <td className="px-3 py-2">{semester.name}</td>
                      <td className="px-3 py-2">
                        {semester.session?.name ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        {formatDate(semester.startDate)}
                      </td>
                      <td className="px-3 py-2">
                        {formatDate(semester.endDate)}
                      </td>
                      <td className="px-3 py-2">
                        {semester.isCurrent ? "Yes" : "No"}
                      </td>
                      <td className="space-x-2 px-3 py-2">
                        <button
                          type="button"
                          className="text-blue-700 underline"
                          onClick={() => {
                            setEditing(semester);
                            setTab(2);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-700 underline disabled:text-gray-400"
                          disabled={relatedCount > 0 || deleteMutation.isPending}
                          title={
                            relatedCount > 0
                              ? "Semesters with enrollments or course offerings cannot be deleted"
                              : undefined
                          }
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete semester "${semester.name}"?`,
                              )
                            ) {
                              deleteMutation.mutate(semester.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  );
                }}
              />
            </Table>
          </>
        ) : (
          <SemesterForm
            key={editing?.id ?? "new-semester"}
            semester={editing}
            sessions={sessionOptions}
            isLoadingSessions={sessionsQuery.isLoading}
            isSaving={saveMutation.isPending}
            onCancel={() => {
              setEditing(null);
              setTab(1);
            }}
            onSubmit={(payload) =>
              saveMutation.mutateAsync({
                ...(editing ? { id: editing.id } : {}),
                ...payload,
              })
            }
          />
        )}
      </div>
    </section>
  );
}

function SemesterForm({
  semester,
  sessions,
  isLoadingSessions,
  isSaving,
  onCancel,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: semester?.name ?? "",
      sessionId: semester?.sessionId ?? "",
      startDate: toInputDate(semester?.startDate),
      endDate: toInputDate(semester?.endDate),
      isCurrent: semester?.isCurrent ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Headings className="mb-4 text-lg font-semibold">
        {semester ? "Edit semester" : "Add semester"}
      </Headings>
      <Input
        label="Semester name"
        name="name"
        placeholder="e.g. First semester"
        register={register}
        rules={{ required: "Semester name is required" }}
        error={errors.name}
      />
      <Select
        label="Academic session"
        name="sessionId"
        options={sessions}
        placeholder={isLoadingSessions ? "Loading sessions..." : "Select session"}
        register={register}
        rules={{ required: "Academic session is required" }}
        error={errors.sessionId}
        disabled={isLoadingSessions}
      />
      <div className="flex flex-wrap gap-4">
        <Input
          label="Start date"
          name="startDate"
          type="date"
          className="min-w-48 flex-1"
          register={register}
          rules={{ required: "Start date is required" }}
          error={errors.startDate}
        />
        <Input
          label="End date"
          name="endDate"
          type="date"
          className="min-w-48 flex-1"
          register={register}
          rules={{ required: "End date is required" }}
          error={errors.endDate}
        />
      </div>
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isCurrent")} />
        Set as current semester
      </label>
      <div className="flex gap-2">
        <PrimaryButton type="submit" disabled={isSaving || sessions.length === 0}>
          {isSaving ? "Saving..." : semester ? "Save changes" : "Create semester"}
        </PrimaryButton>
        {semester && (
          <button
            type="button"
            className="rounded border px-4 py-2"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
      {sessions.length === 0 && !isLoadingSessions && (
        <p className="mt-2 text-sm text-amber-800">
          Create an academic session before adding a semester.
        </p>
      )}
    </form>
  );
}

function toInputDate(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function GradingSystemsSettings() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = React.useState(null);
  const query = useQuery({
    queryKey: gradingSystemKeys.all,
    queryFn: academicApi.listGradingSystems,
  });
  const saveMutation = useMutation({
    mutationFn: ({ id, ...payload }) =>
      id
        ? academicApi.updateGradingSystem(id, payload)
        : academicApi.createGradingSystem(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: gradingSystemKeys.all });
      setEditing(null);
      toast.success(variables.id ? "Grading system updated" : "Grading system created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const deleteMutation = useMutation({
    mutationFn: academicApi.deleteGradingSystem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradingSystemKeys.all });
      toast.success("Grading system deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <section className="w-full p-4">
      <Headings className="mb-4 text-lg font-semibold">Grading systems</Headings>
      <GradingSystemForm
        key={editing?.id ?? "new-grading-system"}
        gradingSystem={editing}
        isSaving={saveMutation.isPending}
        onCancel={() => setEditing(null)}
        onSubmit={(payload) =>
          saveMutation.mutateAsync({
            ...(editing ? { id: editing.id } : {}),
            ...payload,
          })
        }
      />
      <div className="mt-6">
        <Table
          data={query.data ?? []}
          isLoading={query.isLoading}
          isError={query.isError}
          errorMessage={getErrorMessage(query.error)}
          onRetry={query.refetch}
          emptyMessage="No grading systems have been created."
        >
          <Table.Header columns={["Name", "Grade ranges", "Actions"]} />
          <Table.Body
            renderRow={(system) => (
              <>
                <td className="px-3 py-2">{system.name}</td>
                <td className="px-3 py-2">
                  {system.grades
                    .map((grade) => `${grade.grade}: ${grade.minScore}-${grade.maxScore}`)
                    .join(", ")}
                </td>
                <td className="space-x-2 px-3 py-2">
                  <button
                    type="button"
                    className="text-blue-700 underline"
                    onClick={() => setEditing(system)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-red-700 underline"
                    onClick={() => {
                      if (window.confirm(`Delete grading system "${system.name}"?`)) {
                        deleteMutation.mutate(system.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </>
            )}
          />
        </Table>
      </div>
    </section>
  );
}

function GradingSystemForm({ gradingSystem, isSaving, onCancel, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: gradingSystem?.name ?? "",
      grades: gradingSystem?.grades
        ?.map((grade) => `${grade.grade},${grade.minScore},${grade.maxScore},${grade.remark ?? ""}`)
        .join("\n") ?? "",
    },
  });

  const submit = (values) => {
    const grades = values.grades
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [grade, min, max, ...remark] = line.split(",");
        return {
          grade: grade?.trim(),
          minScore: Number(min),
          maxScore: Number(max),
          ...(remark.join(",").trim() && { remark: remark.join(",").trim() }),
        };
      });

    if (
      grades.length === 0 ||
      grades.some(
        (grade) =>
          !grade.grade ||
          !Number.isFinite(grade.minScore) ||
          !Number.isFinite(grade.maxScore),
      )
    ) {
      toast.error("Enter at least one valid grade range: grade,min,max,remark");
      return;
    }
    return onSubmit({ name: values.name.trim(), grades });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded border p-4">
      <Input
        label="Grading system name"
        name="name"
        register={register}
        rules={{ required: "Name is required" }}
        error={errors.name}
      />
      <label className="mb-2 block text-sm font-bold uppercase text-blue-500" htmlFor="grade-ranges">
        Grade ranges
      </label>
      <textarea
        id="grade-ranges"
        rows={5}
        placeholder={"A,80,100,Excellent\nB,70,79,Very good"}
        {...register("grades", { required: "Add at least one grade range" })}
        className="mb-2 w-full rounded-md border border-gray-300 p-2"
      />
      <p className="mb-3 text-xs text-gray-500">
        One range per line: grade,min score,max score,remark. Scores are from 0 to 100.
      </p>
      <div className="flex gap-2">
        <PrimaryButton type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : gradingSystem ? "Save changes" : "Create grading system"}
        </PrimaryButton>
        {gradingSystem && (
          <button type="button" className="rounded border px-4 py-2" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function AcademicCalendarsSettings() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = React.useState(null);
  const sessionsQuery = useQuery({
    queryKey: sessionKeys.list({ page: 1, limit: 100 }),
    queryFn: () => academicApi.listSessions({ page: 1, limit: 100 }),
  });
  const params = { page: 1, limit: 100 };
  const query = useQuery({
    queryKey: academicCalendarKeys.list(params),
    queryFn: () => academicApi.listAcademicCalendars(params),
  });
  const saveMutation = useMutation({
    mutationFn: ({ id, ...payload }) =>
      id
        ? academicApi.updateAcademicCalendar(id, payload)
        : academicApi.createAcademicCalendar(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: academicCalendarKeys.all });
      setEditing(null);
      toast.success(variables.id ? "Calendar event updated" : "Calendar event created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const deleteMutation = useMutation({
    mutationFn: academicApi.deleteAcademicCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicCalendarKeys.all });
      toast.success("Calendar event deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const sessions = (sessionsQuery.data?.sessions ?? []).map((session) => ({
    label: session.name,
    value: session.id,
  }));
  const events = query.data?.events ?? [];

  return (
    <section className="w-full p-4">
      <Headings className="mb-4 text-lg font-semibold">Academic calendar</Headings>
      <CalendarEventForm
        key={editing?.id ?? "new-calendar-event"}
        event={editing}
        sessions={sessions}
        isSaving={saveMutation.isPending}
        onCancel={() => setEditing(null)}
        onSubmit={(payload) =>
          saveMutation.mutateAsync({
            ...(editing ? { id: editing.id } : {}),
            ...payload,
          })
        }
      />
      <div className="mt-6">
        <Table
          data={events}
          isLoading={query.isLoading || sessionsQuery.isLoading}
          isError={query.isError || sessionsQuery.isError}
          errorMessage={getErrorMessage(query.error ?? sessionsQuery.error)}
          onRetry={() => {
            query.refetch();
            sessionsQuery.refetch();
          }}
          emptyMessage="No academic calendar events have been added."
        >
          <Table.Header columns={["Event", "Session", "Start date", "End date", "Actions"]} />
          <Table.Body
            renderRow={(event) => (
              <>
                <td className="px-3 py-2">{event.title}</td>
                <td className="px-3 py-2">{event.session?.name ?? "All sessions"}</td>
                <td className="px-3 py-2">{formatDate(event.startDate)}</td>
                <td className="px-3 py-2">{formatDate(event.endDate)}</td>
                <td className="space-x-2 px-3 py-2">
                  <button
                    type="button"
                    className="text-blue-700 underline"
                    onClick={() => setEditing(event)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-red-700 underline"
                    onClick={() => {
                      if (window.confirm(`Delete calendar event "${event.title}"?`)) {
                        deleteMutation.mutate(event.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </>
            )}
          />
        </Table>
      </div>
    </section>
  );
}

function CalendarEventForm({ event, sessions, isSaving, onCancel, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      startDate: toInputDate(event?.startDate),
      endDate: toInputDate(event?.endDate),
      sessionId: event?.sessionId ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => onSubmit({
      ...values,
      description: values.description || null,
      sessionId: values.sessionId || null,
    }))} className="rounded border p-4">
      <Input
        label="Event title"
        name="title"
        register={register}
        rules={{ required: "Event title is required" }}
        error={errors.title}
      />
      <Input label="Description" name="description" register={register} />
      <Select
        label="Academic session"
        name="sessionId"
        options={sessions}
        placeholder="All sessions"
        allowEmpty
        register={register}
      />
      <div className="flex flex-wrap gap-4">
        <Input
          label="Start date"
          name="startDate"
          type="date"
          className="min-w-48 flex-1"
          register={register}
          rules={{ required: "Start date is required" }}
          error={errors.startDate}
        />
        <Input
          label="End date"
          name="endDate"
          type="date"
          className="min-w-48 flex-1"
          register={register}
          rules={{ required: "End date is required" }}
          error={errors.endDate}
        />
      </div>
      <div className="flex gap-2">
        <PrimaryButton type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : event ? "Save changes" : "Add calendar event"}
        </PrimaryButton>
        {event && (
          <button type="button" className="rounded border px-4 py-2" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
