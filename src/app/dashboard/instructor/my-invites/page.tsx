"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, Clock } from "lucide-react";
import PageHeader from "@/components/dashboard/common/page-header";
import {
  getMyInstructorInvites,
  acceptInstructorInvite,
  declineInstructorInvite,
  type MyCourseInstructorInvite,
} from "@/lib/course-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function MyInvitesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<MyCourseInstructorInvite[]>([]);
  const [busyToken, setBusyToken] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyInstructorInvites("pending")
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
  }, []);

  const handleAccept = async (invite: MyCourseInstructorInvite) => {
    setBusyToken(invite.token);
    try {
      const { message } = await acceptInstructorInvite(invite.token);
      setInvites((prev) => prev.filter((i) => i.token !== invite.token));
      notify.success(
        message ?? `You have joined "${invite.course_title}" as a co-instructor.`,
      );
      router.push(`/dashboard/instructor/course-builder?courseId=${invite.course}`);
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to accept invite.",
      );
    } finally {
      setBusyToken(null);
    }
  };

  const handleDecline = async (invite: MyCourseInstructorInvite) => {
    setBusyToken(invite.token);
    try {
      const { message } = await declineInstructorInvite(invite.token);
      setInvites((prev) => prev.filter((i) => i.token !== invite.token));
      notify.success(message ?? "Invite declined.");
    } catch (err) {
      notify.error(
        err instanceof ApiError ? err.message : "Failed to decline invite.",
      );
    } finally {
      setBusyToken(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Invites"
        subtitle="Pending invitations to co-teach other instructors' courses."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-(--gray-500)">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading invites…
        </div>
      ) : invites.length === 0 ? (
        <div className="bg-white border border-(--gray-200) rounded-xl p-10 text-center text-(--gray-500) text-[14px]">
          No pending invites right now.
        </div>
      ) : (
        <div className="space-y-3">
          {invites.map((invite) => {
            const isBusy = busyToken === invite.token;
            return (
              <div
                key={invite.id}
                className="bg-white border border-(--gray-200) rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap"
              >
                <div>
                  <p className="text-[15px] font-semibold text-(--text-title)">
                    {invite.course_title}
                  </p>
                  <p className="text-[13px] text-(--gray-500) mt-0.5">
                    Invited by {invite.invited_by_name}
                  </p>
                  <p className="flex items-center gap-1.5 text-[12px] text-(--gray-400) mt-1">
                    <Clock className="w-3 h-3" />
                    Expires {formatDateTime(invite.expires_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecline(invite)}
                    disabled={isBusy}
                    className="flex items-center gap-1.5 px-4 h-10 text-[13px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                  <button
                    onClick={() => handleAccept(invite)}
                    disabled={isBusy}
                    className="flex items-center gap-1.5 px-4 h-10 text-[13px] cursor-pointer font-semibold bg-(--primary-700) hover:bg-(--primary-900) text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isBusy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Accept
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
