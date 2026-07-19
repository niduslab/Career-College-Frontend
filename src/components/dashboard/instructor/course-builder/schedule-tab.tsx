"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  RotateCcw,
  Archive,
  PlayCircle,
  AlertCircle,
  X,
} from "lucide-react";
import {
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  activateSchedule,
  reworkSchedule,
  archiveSchedule,
  getCourse,
  type CourseSchedule,
  type ScheduleStatus,
  type ScheduleCreateInput,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import DatePicker from "@/components/common/date-picker";
import { format } from "date-fns";

const STATUS_LABEL: Record<ScheduleStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  ongoing: "Ongoing",
  completed: "Completed",
  archived: "Archived",
};

const STATUS_STYLE: Record<ScheduleStatus, string> = {
  draft: "bg-(--gray-100) text-(--gray-600)",
  scheduled: "bg-amber-50 text-amber-700",
  ongoing: "bg-green-50 text-green-700",
  completed: "bg-(--gray-100) text-(--gray-600)",
  archived: "bg-(--gray-100) text-(--gray-600)",
};

interface ScheduleFormState {
  cohort_label: string;
  timezone: string;
  enrollment_opens_at: string;
  enrollment_closes_at: string;
  start_date: string;
  end_date: string;
  max_seats: string;
}

const emptyForm: ScheduleFormState = {
  cohort_label: "",
  timezone: "",
  enrollment_opens_at: "",
  enrollment_closes_at: "",
  start_date: "",
  end_date: "",
  max_seats: "",
};

/** ISO 8601 -> value a datetime-local input accepts. */
function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

/** datetime-local string -> the Date part, for the calendar picker. */
function localInputToDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** datetime-local string -> the time part, for the time input. */
function localInputToTime(value: string): string {
  if (!value) return "";
  const [, timePart] = value.split("T");
  return timePart ?? "";
}

/** Combine a picked date with a time-input value into a datetime-local string. */
function combineDateAndTime(date: Date | undefined, time: string): string {
  if (!date) return "";
  return `${format(date, "yyyy-MM-dd")}T${time || "00:00"}`;
}

function DateTimeField({
  label,
  value,
  onChange,
  error,
  optional,
  onClear,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  optional?: boolean;
  onClear?: () => void;
}) {
  return (
    <div>
      <label className="block text-[12px] md:text-[14px] lg:text-[14px] font-medium text-(--gray-500) mb-1">
        {label}{" "}
        {optional && (
          <span className="text-(--gray-400) font-normal">
            (optional — open-ended if blank)
          </span>
        )}
      </label>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <DatePicker
            value={localInputToDate(value)}
            onChange={(date) =>
              onChange(combineDateAndTime(date, localInputToTime(value)))
            }
            placeholder="Pick a date"
            disablePast={false}
            captionDropdown
            fromYear={new Date().getFullYear() - 1}
            toYear={new Date().getFullYear() + 5}
          />
        </div>
        <input
          type="time"
          value={localInputToTime(value)}
          onChange={(e) =>
            onChange(
              combineDateAndTime(localInputToDate(value), e.target.value),
            )
          }
          className={`h-11 mt-1 px-3 text-[14px] cursor-pointer border rounded-lg outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow ${
            error ? "border-red-300" : "border-(--gray-200)"
          }`}
        />
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 mt-1 h-11 px-3 text-[14px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function scheduleToForm(s: CourseSchedule): ScheduleFormState {
  return {
    cohort_label: s.cohort_label ?? "",
    timezone: s.timezone ?? "",
    enrollment_opens_at: isoToLocalInput(s.enrollment_opens_at),
    enrollment_closes_at: isoToLocalInput(s.enrollment_closes_at),
    start_date: isoToLocalInput(s.start_date),
    end_date: isoToLocalInput(s.end_date),
    max_seats: s.max_seats != null ? String(s.max_seats) : "",
  };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type FormErrors = Partial<Record<keyof ScheduleFormState, string>>;

export default function ScheduleTab({
  courseId,
  onContinue,
}: {
  courseId: number;
  onContinue: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [coursePublished, setCoursePublished] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ScheduleFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([listSchedules(courseId), getCourse(courseId)])
      .then(([list, course]) => {
        if (!active) return;
        setSchedules(list);
        setCoursePublished(course.status === "published");
      })
      .catch((err) => {
        if (!active) return;
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load schedules.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditForm = (schedule: CourseSchedule) => {
    setEditingId(schedule.id);
    setForm(scheduleToForm(schedule));
    setFormErrors({});
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!form.enrollment_opens_at) {
      errors.enrollment_opens_at = "Enrollment opening date is required.";
    }
    if (!form.enrollment_closes_at) {
      errors.enrollment_closes_at = "Enrollment closing date is required.";
    }
    if (!form.start_date) {
      errors.start_date = "Start date is required.";
    }
    if (
      form.enrollment_opens_at &&
      form.enrollment_closes_at &&
      new Date(form.enrollment_opens_at) >= new Date(form.enrollment_closes_at)
    ) {
      errors.enrollment_closes_at = "Enrollment must open before it closes.";
    }
    if (
      form.enrollment_closes_at &&
      form.start_date &&
      new Date(form.start_date) < new Date(form.enrollment_closes_at)
    ) {
      errors.start_date = "Start date must be on or after enrollment closes.";
    }
    if (
      form.end_date &&
      form.start_date &&
      new Date(form.end_date) <= new Date(form.start_date)
    ) {
      errors.end_date = "End date must be after the start date.";
    }
    if (form.max_seats && Number(form.max_seats) <= 0) {
      errors.max_seats = "Seat cap must be a positive number.";
    }
    return errors;
  };

  const buildInput = (): ScheduleCreateInput => ({
    cohort_label: form.cohort_label || undefined,
    timezone: form.timezone || undefined,
    enrollment_opens_at: new Date(form.enrollment_opens_at).toISOString(),
    enrollment_closes_at: new Date(form.enrollment_closes_at).toISOString(),
    start_date: new Date(form.start_date).toISOString(),
    end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    max_seats: form.max_seats ? Number(form.max_seats) : null,
  });

  const handleSubmitForm = async () => {
    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      return;
    }
    setSaving(true);
    setFormErrors({});
    try {
      const input = buildInput();
      if (editingId !== null) {
        const { data, message } = await updateSchedule(
          courseId,
          editingId,
          input,
        );
        setSchedules((prev) => prev.map((s) => (s.id === data.id ? data : s)));
        notify.success(message ?? "Schedule updated.");
      } else {
        const { data, message } = await createSchedule(courseId, input);
        setSchedules((prev) => [data, ...prev]);
        notify.success(message ?? "Schedule added.");
      }
      closeForm();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        setFormErrors(err.fieldErrors as FormErrors);
      } else {
        notify.error(
          err instanceof ApiError ? err.message : "Failed to save schedule.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (schedule: CourseSchedule) => {
    setBusyId(schedule.id);
    try {
      const message = await deleteSchedule(courseId, schedule.id);
      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
      notify.success(message ?? "Schedule deleted.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to delete schedule.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleActivate = async (schedule: CourseSchedule) => {
    setBusyId(schedule.id);
    try {
      const { data, message } = await activateSchedule(courseId, schedule.id);
      setSchedules((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      notify.success(message ?? "Schedule activated.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to activate schedule.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleRework = async (schedule: CourseSchedule) => {
    setBusyId(schedule.id);
    try {
      const { data, message } = await reworkSchedule(courseId, schedule.id);
      setSchedules((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      notify.success(message ?? "Schedule moved back to draft.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to rework schedule.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleArchive = async (schedule: CourseSchedule) => {
    setBusyId(schedule.id);
    try {
      const { data, message } = await archiveSchedule(courseId, schedule.id);
      setSchedules((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      notify.success(message ?? "Schedule archived.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to archive schedule.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-(--gray-200) rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-[16px] lg:text-[18px] font-semibold text-(--text-title)">
            Course Schedules (Cohorts)
          </h2>
          <p className="text-[14px] text-(--gray-500) mt-0.5">
            Attach one or more cohort runs — each has its own enrollment window,
            start/end dates, and seat cap. At least one schedule and a written
            course outline are required before this course can be submitted for
            review.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-(--gray-500)">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading schedules…
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.length === 0 && (
              <p className="text-[13px] text-(--gray-400) py-4">
                No schedules yet. Add your first cohort below.
              </p>
            )}
            {schedules.map((schedule) => {
              const needsAttention =
                schedule.status === "draft" && coursePublished;
              const isBusy = busyId === schedule.id;
              return (
                <div
                  key={schedule.id}
                  className="border border-(--gray-200) rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[14px] font-semibold text-(--text-title)">
                        {schedule.cohort_label || "Untitled Cohort"}
                      </h3>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[schedule.status]}`}
                      >
                        {STATUS_LABEL[schedule.status]}
                      </span>
                      {needsAttention && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700">
                          <AlertCircle className="w-3 h-3" />
                          Needs attention
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {schedule.status === "draft" && (
                        <>
                          <button
                            onClick={() => handleActivate(schedule)}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 h-8 text-[12px] cursor-pointer font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <PlayCircle className="w-3.5 h-3.5" />
                            )}
                            Activate
                          </button>
                          <button
                            onClick={() => openEditForm(schedule)}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 h-8 text-[12px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(schedule)}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 h-8 text-[12px] cursor-pointer font-medium border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Delete
                          </button>
                        </>
                      )}

                      {schedule.status === "scheduled" && (
                        <>
                          <button
                            onClick={() => openEditForm(schedule)}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 h-8 text-[12px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleRework(schedule)}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 h-8 text-[12px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                            Rework
                          </button>
                        </>
                      )}

                      {schedule.status === "completed" && (
                        <button
                          onClick={() => handleArchive(schedule)}
                          disabled={isBusy}
                          className="flex items-center gap-1.5 px-3 h-8 text-[12px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Archive className="w-3.5 h-3.5" />
                          )}
                          Archive
                        </button>
                      )}

                      {schedule.status === "archived" && (
                        <button
                          onClick={() => handleRework(schedule)}
                          disabled={isBusy}
                          className="flex items-center gap-1.5 px-3 h-8 text-[12px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          Rework
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-(--gray-100)">
                    <div>
                      <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                        Enrollment Window
                      </p>
                      <p className="text-[14px] text-(--text-title) mt-0.5">
                        {formatDateTime(schedule.enrollment_opens_at)} –{" "}
                        {formatDateTime(schedule.enrollment_closes_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                        Start Date
                      </p>
                      <p className="text-[14px] text-(--text-title) mt-0.5">
                        {formatDateTime(schedule.start_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                        End Date
                      </p>
                      <p className="text-[14px] text-(--text-title) mt-0.5">
                        {schedule.end_date
                          ? formatDateTime(schedule.end_date)
                          : "Open-ended"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                        Seats · Timezone
                      </p>
                      <p className="text-[14px] text-(--text-title) mt-0.5">
                        {schedule.max_seats != null
                          ? schedule.max_seats
                          : "Unlimited"}
                        <span className="mx-1.5 text-(--gray-300)">·</span>
                        {schedule.timezone || "UTC"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!formOpen && (
          <button
            onClick={openAddForm}
            className="w-full h-13 flex items-center justify-center gap-2 border border-(--primary-600) rounded-lg text-(--primary-600) text-[14px] font-semibold hover:bg-(--primary-50) cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        )}

        {formOpen && (
          <div className="border border-(--gray-200) rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-(--text-title)">
                {editingId !== null ? "Edit Schedule" : "Add Schedule"}
              </h3>
              <button
                onClick={closeForm}
                disabled={saving}
                className="p-1 cursor-pointer text-(--gray-400) hover:text-(--gray-600) transition-colors disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] md:text-[14px] lg:text-[14px] font-medium text-(--gray-500) mb-1">
                  Cohort Label
                </label>
                <input
                  type="text"
                  value={form.cohort_label}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cohort_label: e.target.value }))
                  }
                  placeholder="e.g. Fall 2026 Batch"
                  className="w-full h-11 px-3 text-[14px] border border-(--gray-200) rounded-lg outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>

              <div>
                <label className="block text-[12px] md:text-[14px] lg:text-[14px]  font-medium text-(--gray-500) mb-1">
                  Timezone
                </label>
                <input
                  type="text"
                  value={form.timezone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, timezone: e.target.value }))
                  }
                  placeholder="e.g. Asia/Dhaka (default: UTC)"
                  className="w-full h-11 px-3 text-[14px] border border-(--gray-200) rounded-lg outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                />
              </div>

              <DateTimeField
                label="Enrollment Opens"
                value={form.enrollment_opens_at}
                onChange={(next) =>
                  setForm((f) => ({ ...f, enrollment_opens_at: next }))
                }
                error={formErrors.enrollment_opens_at}
              />

              <DateTimeField
                label="Enrollment Closes"
                value={form.enrollment_closes_at}
                onChange={(next) =>
                  setForm((f) => ({ ...f, enrollment_closes_at: next }))
                }
                error={formErrors.enrollment_closes_at}
              />

              <DateTimeField
                label="Start Date"
                value={form.start_date}
                onChange={(next) =>
                  setForm((f) => ({ ...f, start_date: next }))
                }
                error={formErrors.start_date}
              />

              <DateTimeField
                label="End Date"
                value={form.end_date}
                onChange={(next) => setForm((f) => ({ ...f, end_date: next }))}
                error={formErrors.end_date}
                optional
                onClear={() => setForm((f) => ({ ...f, end_date: "" }))}
              />

              <div>
                <label className="block text-[12px] md:text-[14px] lg:text-[14px]  font-medium text-(--gray-500) mb-1">
                  Seat Cap{" "}
                  <span className="text-(--gray-400) font-normal">
                    (optional — unlimited if blank)
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.max_seats}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, max_seats: e.target.value }))
                  }
                  placeholder="Unlimited"
                  className={`w-full h-11 px-3 text-[14px] border rounded-lg outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow ${
                    formErrors.max_seats
                      ? "border-red-300"
                      : "border-(--gray-200)"
                  }`}
                />
                {formErrors.max_seats && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {formErrors.max_seats}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={closeForm}
                disabled={saving}
                className="px-5 h-11 text-[13px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForm}
                disabled={saving}
                className="flex items-center gap-2 px-5 h-11 text-[13px] cursor-pointer font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId !== null ? "Save Changes" : "Add Schedule"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-start">
        <button
          onClick={onContinue}
          className="px-5 h-11 text-[14px] cursor-pointer font-semibold bg-(--primary-600) hover:bg-(--primary-700) text-white rounded-lg transition-colors flex items-center gap-2"
        >
          Continue to Curriculum
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
