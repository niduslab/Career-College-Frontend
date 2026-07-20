"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Check, X, RotateCcw, Archive } from "lucide-react";
import {
  getDepartments,
  createDepartment,
  renameDepartment,
  deactivateDepartment,
  setDepartmentActive,
  type Department,
} from "@/lib/partner-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import { SectionCard, Input } from "../../settings-shared/ui";

export function DepartmentsTab() {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    getDepartments(!showInactive)
      .then(setDepartments)
      .catch((err) => {
        notify.error(
          err instanceof ApiError ? err.message : "Failed to load departments.",
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await createDepartment(name);
      setNewName("");
      notify.success("Department created.");
      load();
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to create department.",
      );
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (dept: Department) => {
    setEditingId(dept.id);
    setEditValue(dept.name);
  };

  const handleRename = async (id: number) => {
    const name = editValue.trim();
    if (!name) return;
    setBusyId(id);
    try {
      await renameDepartment(id, name);
      notify.success("Department renamed.");
      setEditingId(null);
      load();
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to rename department.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (dept: Department) => {
    setBusyId(dept.id);
    try {
      if (dept.is_active) {
        await deactivateDepartment(dept.id);
        notify.success("Department deactivated.");
      } else {
        await setDepartmentActive(dept.id, true);
        notify.success("Department reactivated.");
      }
      load();
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to update department.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SectionCard
      title="Departments"
      description="Define departments your experts can be assigned to."
    >
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          placeholder="e.g. Computer Science"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="flex items-center gap-1.5 h-12 px-4 rounded-lg bg-(--primary-700) text-white text-[14px] font-medium hover:bg-(--primary-600) transition-colors cursor-pointer disabled:opacity-60 shrink-0"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add
        </button>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[13px] text-(--gray-500)">
          {departments.length} department{departments.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => setShowInactive((v) => !v)}
          className="text-[13px] font-medium text-(--primary-600) hover:underline cursor-pointer"
        >
          {showInactive ? "Hide inactive" : "Show inactive"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-(--gray-500)">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading departments…
        </div>
      ) : departments.length === 0 ? (
        <p className="text-[13px] text-(--gray-400) py-6 text-center">
          No departments yet. Add one above.
        </p>
      ) : (
        <div className="divide-y divide-(--gray-100)">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              {editingId === dept.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(dept.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 h-9 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700)"
                  />
                  <button
                    type="button"
                    onClick={() => handleRename(dept.id)}
                    disabled={busyId === dept.id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-(--primary-50) text-(--primary-600) hover:bg-(--primary-100) cursor-pointer transition-colors disabled:opacity-60"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-500) cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <p
                      className={`text-[14px] font-medium ${dept.is_active ? "text-(--text-title)" : "text-(--gray-400) line-through"}`}
                    >
                      {dept.name}
                    </p>
                    {!dept.is_active && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-(--gray-100) text-(--gray-500)">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {dept.is_active && (
                      <button
                        type="button"
                        onClick={() => startEdit(dept)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-500) hover:text-(--text-title) cursor-pointer transition-colors"
                        title="Rename"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(dept)}
                      disabled={busyId === dept.id}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--gray-100) cursor-pointer transition-colors disabled:opacity-60 ${dept.is_active ? "text-(--gray-500) hover:text-red-500" : "text-(--gray-500) hover:text-(--primary-600)"}`}
                      title={dept.is_active ? "Deactivate" : "Reactivate"}
                    >
                      {busyId === dept.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : dept.is_active ? (
                        <Archive className="w-4 h-4" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
