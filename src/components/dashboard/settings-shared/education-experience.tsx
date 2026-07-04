"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { SelectDropdown } from "@/components/common/select-dropdown";
import DatePicker from "@/components/common/date-picker";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { isoToDate, dateToIso } from "./helpers";
import {
  listEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  listWorkExperience,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  DEGREE_OPTIONS,
  type Education,
  type WorkExperience,
} from "@/lib/profile-api";

// shared bits

const INPUT_CLS =
  "w-full h-11 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[13px] font-medium text-(--text-title) mb-1.5 block">
      {children}
    </label>
  );
}

function fmtRange(start: string, end: string | null, isCurrent: boolean) {
  const fmt = (d: string) => {
    const [y, m] = d.split("-");
    return m ? `${m}/${y}` : y;
  };
  return `${fmt(start)} — ${isCurrent ? "Present" : end ? fmt(end) : ""}`;
}

const CURRENT_YEAR = new Date().getFullYear();

// Labelled wrapper around the shared DatePicker for form date fields.
function DateField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <DatePicker
        value={isoToDate(value)}
        onChange={(d) => onChange(dateToIso(d))}
        placeholder="Select date"
        disabled={disabled}
        disablePast={false}
        disableFuture
        captionDropdown
        fromYear={CURRENT_YEAR - 60}
        toYear={CURRENT_YEAR}
      />
    </div>
  );
}

// Education

interface EduForm {
  degree: string;
  field_of_study: string;
  institution: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

const EMPTY_EDU: EduForm = {
  degree: "",
  field_of_study: "",
  institution: "",
  start_date: "",
  end_date: "",
  is_current: false,
};

function EducationSection() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Education | "new" | null>(null);
  const [form, setForm] = useState<EduForm>(EMPTY_EDU);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    listEducation()
      .then((d) => active && setItems(d))
      .catch(() => notify.error("Failed to load education."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const openNew = () => {
    setForm(EMPTY_EDU);
    setEditing("new");
  };
  const openEdit = (e: Education) => {
    setForm({
      degree: e.degree,
      field_of_study: e.field_of_study,
      institution: e.institution,
      start_date: e.start_date,
      end_date: e.end_date ?? "",
      is_current: e.is_current,
    });
    setEditing(e);
  };

  const save = async () => {
    if (
      !form.degree ||
      !form.field_of_study ||
      !form.institution ||
      !form.start_date
    ) {
      notify.error("Please fill in all required fields.");
      return;
    }
    if (!form.is_current && !form.end_date) {
      notify.error("End date is required for completed education.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        degree: form.degree,
        field_of_study: form.field_of_study,
        institution: form.institution,
        start_date: form.start_date,
        end_date: form.is_current ? null : form.end_date,
        is_current: form.is_current,
      };
      if (editing === "new") {
        const created = await createEducation(payload);
        setItems((prev) => [...prev, created]);
        notify.success("Education added.");
      } else if (editing) {
        const updated = await updateEducation(editing.id, payload);
        setItems((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i)),
        );
        notify.success("Education updated.");
      }
      setEditing(null);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to save education.",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this education entry?")) return;
    setDeletingId(id);
    try {
      await deleteEducation(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      notify.success("Education deleted.");
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  const degreeLabel = (v: string) =>
    DEGREE_OPTIONS.find((o) => o.value === v)?.label ?? v;

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-6 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4.5 h-4.5 text-(--primary-700)" />
          <p className="text-[16px] font-semibold text-(--text-title)">
            Education
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-(--primary-200) text-(--primary-700) text-[13px] font-medium hover:bg-(--primary-50) transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="border-t border-(--gray-100)" />

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-(--gray-500) text-[14px]">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-[14px] text-(--gray-400)">
          No education added yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <div
              key={e.id}
              className="flex items-start justify-between gap-3 py-3 border-b border-(--gray-100) last:border-0"
            >
              <div>
                <p className="text-[14px] font-semibold text-(--text-title)">
                  {degreeLabel(e.degree)} · {e.field_of_study}
                </p>
                <p className="text-[13px] text-(--gray-600)">{e.institution}</p>
                <p className="text-[12px] text-(--gray-400) mt-0.5">
                  {fmtRange(e.start_date, e.end_date, e.is_current)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(e)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-(--gray-500) hover:bg-(--gray-100) cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  disabled={deletingId === e.id}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                >
                  {deletingId === e.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal
          title={editing === "new" ? "Add Education" : "Edit Education"}
          onClose={() => setEditing(null)}
          onSave={save}
          saving={saving}
        >
          <div>
            <FieldLabel>Degree *</FieldLabel>
            <SelectDropdown
              value={form.degree}
              onChange={(v) => setForm((f) => ({ ...f, degree: v }))}
              options={DEGREE_OPTIONS}
              placeholder="Select degree"
            />
          </div>
          <div>
            <FieldLabel>Field of study *</FieldLabel>
            <input
              className={INPUT_CLS}
              value={form.field_of_study}
              onChange={(e) =>
                setForm((f) => ({ ...f, field_of_study: e.target.value }))
              }
              placeholder="e.g. Computer Science"
            />
          </div>
          <div>
            <FieldLabel>Institution *</FieldLabel>
            <input
              className={INPUT_CLS}
              value={form.institution}
              onChange={(e) =>
                setForm((f) => ({ ...f, institution: e.target.value }))
              }
              placeholder="e.g. MIT"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DateField
              label="Start date *"
              value={form.start_date}
              onChange={(iso) => setForm((f) => ({ ...f, start_date: iso }))}
            />
            <DateField
              label="End date"
              value={form.end_date}
              disabled={form.is_current}
              onChange={(iso) => setForm((f) => ({ ...f, end_date: iso }))}
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-(--gray-600) cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_current}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  is_current: e.target.checked,
                  end_date: e.target.checked ? "" : f.end_date,
                }))
              }
              style={{ accentColor: "var(--primary-700)" }}
              className="w-4 h-4 cursor-pointer"
            />
            I currently study here
          </label>
        </Modal>
      )}
    </div>
  );
}

// Work Experience

interface WorkForm {
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

const EMPTY_WORK: WorkForm = {
  job_title: "",
  company: "",
  location: "",
  start_date: "",
  end_date: "",
  is_current: false,
};

function WorkSection() {
  const [items, setItems] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<WorkExperience | "new" | null>(null);
  const [form, setForm] = useState<WorkForm>(EMPTY_WORK);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    listWorkExperience()
      .then((d) => active && setItems(d))
      .catch(() => notify.error("Failed to load work experience."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const openNew = () => {
    setForm(EMPTY_WORK);
    setEditing("new");
  };
  const openEdit = (w: WorkExperience) => {
    setForm({
      job_title: w.job_title,
      company: w.company,
      location: w.location,
      start_date: w.start_date,
      end_date: w.end_date ?? "",
      is_current: w.is_current,
    });
    setEditing(w);
  };

  const save = async () => {
    if (!form.job_title || !form.company || !form.start_date) {
      notify.error("Please fill in all required fields.");
      return;
    }
    if (!form.is_current && !form.end_date) {
      notify.error("End date is required for past positions.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        job_title: form.job_title,
        company: form.company,
        location: form.location,
        start_date: form.start_date,
        end_date: form.is_current ? null : form.end_date,
        is_current: form.is_current,
      };
      if (editing === "new") {
        const created = await createWorkExperience(payload);
        setItems((prev) => [...prev, created]);
        notify.success("Work experience added.");
      } else if (editing) {
        const updated = await updateWorkExperience(editing.id, payload);
        setItems((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i)),
        );
        notify.success("Work experience updated.");
      }
      setEditing(null);
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this work experience?")) return;
    setDeletingId(id);
    try {
      await deleteWorkExperience(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      notify.success("Work experience deleted.");
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-6 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4.5 h-4.5 text-(--primary-700)" />
          <p className="text-[16px] font-semibold text-(--text-title)">
            Work Experience
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-(--primary-200) text-(--primary-700) text-[13px] font-medium hover:bg-(--primary-50) transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="border-t border-(--gray-100)" />

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-(--gray-500) text-[14px]">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-[14px] text-(--gray-400)">
          No work experience added yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((w) => (
            <div
              key={w.id}
              className="flex items-start justify-between gap-3 py-3 border-b border-(--gray-100) last:border-0"
            >
              <div>
                <p className="text-[14px] font-semibold text-(--text-title)">
                  {w.job_title}
                </p>
                <p className="text-[13px] text-(--gray-600)">
                  {w.company}
                  {w.location ? ` · ${w.location}` : ""}
                </p>
                <p className="text-[12px] text-(--gray-400) mt-0.5">
                  {fmtRange(w.start_date, w.end_date, w.is_current)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(w)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-(--gray-500) hover:bg-(--gray-100) cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(w.id)}
                  disabled={deletingId === w.id}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                >
                  {deletingId === w.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal
          title={
            editing === "new" ? "Add Work Experience" : "Edit Work Experience"
          }
          onClose={() => setEditing(null)}
          onSave={save}
          saving={saving}
        >
          <div>
            <FieldLabel>Job title *</FieldLabel>
            <input
              className={INPUT_CLS}
              value={form.job_title}
              onChange={(e) =>
                setForm((f) => ({ ...f, job_title: e.target.value }))
              }
              placeholder="e.g. Data Analyst"
            />
          </div>
          <div>
            <FieldLabel>Company *</FieldLabel>
            <input
              className={INPUT_CLS}
              value={form.company}
              onChange={(e) =>
                setForm((f) => ({ ...f, company: e.target.value }))
              }
              placeholder="e.g. Google"
            />
          </div>
          <div>
            <FieldLabel>Location</FieldLabel>
            <input
              className={INPUT_CLS}
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              placeholder="e.g. San Francisco, CA"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DateField
              label="Start date *"
              value={form.start_date}
              onChange={(iso) => setForm((f) => ({ ...f, start_date: iso }))}
            />
            <DateField
              label="End date"
              value={form.end_date}
              disabled={form.is_current}
              onChange={(iso) => setForm((f) => ({ ...f, end_date: iso }))}
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-(--gray-600) cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_current}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  is_current: e.target.checked,
                  end_date: e.target.checked ? "" : f.end_date,
                }))
              }
              style={{ accentColor: "var(--primary-700)" }}
              className="w-4 h-4 cursor-pointer"
            />
            I currently work here
          </label>
        </Modal>
      )}
    </div>
  );
}

// Shared modal
function Modal({
  title,
  children,
  onClose,
  onSave,
  saving,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--gray-100)">
          <p className="text-[16px] font-semibold text-(--text-title)">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-(--gray-500) hover:bg-(--gray-100) cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">{children}</div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-(--gray-100)">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-md border border-(--gray-200) text-[14px] font-medium text-(--gray-600) hover:bg-(--gray-50) cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 h-10 px-5 rounded-md bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EducationAndExperience() {
  return (
    <>
      <EducationSection />
      <WorkSection />
    </>
  );
}
