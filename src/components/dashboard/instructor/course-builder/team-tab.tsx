"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  Loader2,
  Mail,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";
import {
  listInstructorInvites,
  sendInstructorInvite,
  revokeInstructorInvite,
  type CourseInstructorInvite,
  type InviteStatus,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

const STATUS_LABEL: Record<InviteStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
  revoked: "Revoked",
};

const STATUS_STYLE: Record<InviteStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-green-50 text-green-700",
  declined: "bg-red-50 text-red-700",
  expired: "bg-(--gray-100) text-(--gray-600)",
  revoked: "bg-(--gray-100) text-(--gray-600)",
};

const STATUS_ICON: Record<InviteStatus, React.ElementType> = {
  pending: Clock,
  accepted: CheckCircle2,
  declined: XCircle,
  expired: Clock,
  revoked: Ban,
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function TeamTab({
  courseId,
  isOwner,
  onContinue,
}: {
  courseId: number;
  isOwner: boolean;
  onContinue: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<CourseInstructorInvite[]>([]);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOwner) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    listInstructorInvites(courseId)
      .then((res) => {
        if (active) setInvites(res.results);
      })
      .catch((err) => {
        if (active) {
          notify.error(
            err instanceof ApiError ? err.message : "Failed to load invites.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId, isOwner]);

  const handleSendInvite = async () => {
    if (!email.trim()) {
      notify.error("Please enter an email address.");
      return;
    }
    setSending(true);
    try {
      const { data, message } = await sendInstructorInvite(
        courseId,
        email.trim(),
      );
      setInvites((prev) => [data, ...prev]);
      setEmail("");
      notify.success(message ?? "Invite sent.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to send invite.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleRevoke = async (invite: CourseInstructorInvite) => {
    setBusyId(invite.id);
    try {
      const message = await revokeInstructorInvite(courseId, invite.id);
      setInvites((prev) =>
        prev.map((i) =>
          i.id === invite.id ? { ...i, status: "revoked" as const } : i,
        ),
      );
      notify.success(message ?? "Invite revoked.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to revoke invite.",
      );
    } finally {
      setBusyId(null);
    }
  };

  if (!isOwner) {
    return (
      <div className="space-y-5">
        <div className="bg-white border border-(--gray-200) rounded-xl p-10 text-center text-(--gray-500) text-[14px]">
          Only the course owner can manage co-instructors.
        </div>
        <div className="flex justify-start">
          <button
            onClick={onContinue}
            className="px-5 h-11 text-[14px] cursor-pointer font-semibold bg-(--primary-600) hover:bg-(--primary-700) text-white rounded-lg transition-colors flex items-center gap-2"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-(--gray-200) rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-[16px] lg:text-[18px] font-semibold text-(--text-title)">
            Co-Instructors
          </h2>
          <p className="text-[14px] text-(--gray-500) mt-0.5">
            Invite other verified instructors to help build and edit this
            course. Only you, as the owner, can manage who&rsquo;s invited —
            invited instructors can edit content but not the roster.
          </p>
        </div>

        {/* Send invite */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendInvite();
              }}
              placeholder="instructor@example.com"
              disabled={sending}
              className="w-full h-11 pl-10 pr-3 text-[14px] border border-(--gray-200) rounded-lg outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow disabled:opacity-60"
            />
          </div>
          <button
            onClick={handleSendInvite}
            disabled={sending}
            className="flex items-center gap-2 px-5 h-11 text-[13px] cursor-pointer font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending && <Loader2 className="w-4 h-4 animate-spin" />}
            Send Invite
          </button>
        </div>

        {/* Invite list */}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-(--gray-500)">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading invites…
          </div>
        ) : invites.length === 0 ? (
          <p className="text-[13px] text-(--gray-400) py-4">
            No invites yet. Send one above to add a co-instructor.
          </p>
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => {
              const Icon = STATUS_ICON[invite.status];
              const isBusy = busyId === invite.id;
              return (
                <div
                  key={invite.id}
                  className="border border-(--gray-200) rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-(--gray-100) flex items-center justify-center text-(--gray-500) text-[13px] font-semibold shrink-0">
                      {invite.invited_user_name?.charAt(0).toUpperCase() ||
                        "?"}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-(--text-title)">
                        {invite.invited_user_name}
                      </p>
                      <p className="text-[12px] text-(--gray-500)">
                        {invite.invited_user_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[invite.status]}`}
                    >
                      <Icon className="w-3 h-3" />
                      {STATUS_LABEL[invite.status]}
                    </span>
                    {invite.status === "pending" && (
                      <>
                        <span className="text-[11px] text-(--gray-400)">
                          Expires {formatDateTime(invite.expires_at)}
                        </span>
                        <button
                          onClick={() => handleRevoke(invite)}
                          disabled={isBusy}
                          className="flex items-center gap-1.5 px-3 h-8 text-[12px] cursor-pointer font-medium border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Revoke
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-start">
        <button
          onClick={onContinue}
          className="px-5 h-11 text-[14px] cursor-pointer font-semibold bg-(--primary-600) hover:bg-(--primary-700) text-white rounded-lg transition-colors flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
