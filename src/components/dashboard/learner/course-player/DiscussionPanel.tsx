"use client";

import { useState } from "react";
import {
  MessageCircle,
  ThumbsUp,
  Pin,
  Trash2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import {
  useCourseQuestions,
  useQuestionDetail,
  usePostQuestion,
  useDeleteQuestion,
  usePostReply,
  useDeleteReply,
  useToggleQuestionPin,
  useUpvoteQuestion,
  useUpvoteReply,
} from "@/hooks/use-discussion";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { CourseQuestion } from "@/lib/course-api";

function QuestionThread({
  question,
  courseSlug,
  isInstructor,
  onClose,
}: {
  question: CourseQuestion;
  courseSlug: string;
  isInstructor: boolean;
  onClose: () => void;
}) {
  const { data: detail, isLoading } = useQuestionDetail(question.id);
  const postReply = usePostReply(courseSlug);
  const deleteReply = useDeleteReply(courseSlug);
  const upvoteReply = useUpvoteReply(question.id);
  const [replyBody, setReplyBody] = useState("");

  const handleReply = () => {
    if (!replyBody.trim()) return;
    postReply.mutate(
      { questionId: question.id, body: replyBody },
      {
        onSuccess: () => setReplyBody(""),
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.message : "Failed to post reply.",
          ),
      },
    );
  };

  const handleDeleteReply = (replyId: number) => {
    deleteReply.mutate(
      { replyId, questionId: question.id },
      {
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.message : "Failed to delete reply.",
          ),
      },
    );
  };

  return (
    <div className="p-4 rounded-lg border border-(--gray-200) bg-white mb-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[14px] font-semibold text-(--text-title)">
            {question.title}
          </p>
          <p className="text-[12px] text-(--gray-500) mt-0.5">
            {question.author_name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[12px] text-(--gray-400) hover:text-(--text-title) cursor-pointer shrink-0"
        >
          Close
        </button>
      </div>
      <p className="text-[13px] text-(--gray-500) mt-2">{question.body}</p>

      {isLoading ? (
        <div className="flex items-center gap-2 text-(--gray-400) text-[13px] mt-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading replies...
        </div>
      ) : (
        <div className="mt-4 pt-3 border-t border-(--gray-100) space-y-3">
          {(detail?.replies ?? []).map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-(--text-title)">
                    {r.author_name}
                  </span>
                  {r.is_instructor_reply && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-(--primary-50) text-(--primary-700)">
                      Instructor
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-(--gray-500) mt-0.5">
                  {r.body}
                </p>
                <button
                  onClick={() => upvoteReply.mutate(r.id)}
                  disabled={upvoteReply.isPending}
                  className="flex items-center gap-1 text-[11px] text-(--gray-400) hover:text-(--text-title) mt-1 cursor-pointer"
                >
                  <ThumbsUp className="w-3 h-3" />
                  {r.upvote_count}
                </button>
              </div>
              {(r.is_own || isInstructor) && (
                <button
                  onClick={() => handleDeleteReply(r.id)}
                  className="w-6 h-6 shrink-0 flex items-center justify-center rounded-md hover:bg-(--gray-100) cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </button>
              )}
            </div>
          ))}
          {(detail?.replies.length ?? 0) === 0 && (
            <p className="text-[12px] text-(--gray-400)">No replies yet.</p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 h-9 px-3 rounded-md border border-(--gray-200) text-[13px] outline-none focus:border-(--primary-600)"
            />
            <button
              onClick={handleReply}
              disabled={postReply.isPending || !replyBody.trim()}
              className="px-3 h-9 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-60"
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiscussionPanel({
  courseSlug,
  isInstructorPreview,
}: {
  courseSlug?: string;
  isInstructorPreview?: boolean;
}) {
  const { data: questionsPage, isLoading } = useCourseQuestions(courseSlug);
  const postQuestion = usePostQuestion(courseSlug);
  const deleteQuestion = useDeleteQuestion(courseSlug);
  const togglePin = useToggleQuestionPin(courseSlug);
  const upvoteQuestion = useUpvoteQuestion(courseSlug);

  const [asking, setAsking] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);

  const isInstructor = !!isInstructorPreview;
  const questions = questionsPage?.results ?? [];

  const handleAsk = () => {
    if (!title.trim() || !body.trim()) {
      notify.error("Please fill in both title and question.");
      return;
    }
    postQuestion.mutate(
      { title, body },
      {
        onSuccess: (res) => {
          notify.success(res.message || "Question posted.");
          setTitle("");
          setBody("");
          setAsking(false);
        },
        onError: (err) =>
          notify.error(
            err instanceof ApiError ? err.message : "Failed to post question.",
          ),
      },
    );
  };

  const handleDelete = (questionId: number) => {
    deleteQuestion.mutate(questionId, {
      onSuccess: () => {
        notify.success("Question deleted.");
        if (openQuestionId === questionId) setOpenQuestionId(null);
      },
      onError: (err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to delete question.",
        ),
    });
  };

  const handlePin = (questionId: number) => {
    togglePin.mutate(questionId, {
      onError: (err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to pin question.",
        ),
    });
  };

  const handleUpvote = (questionId: number) => {
    upvoteQuestion.mutate(questionId, {
      onError: (err) =>
        notify.error(
          err instanceof ApiError ? err.message : "Failed to upvote.",
        ),
    });
  };

  return (
    <div className="max-w-3xl mt-6 pt-6 border-t border-(--gray-100)">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-(--text-title)">
          Discussion Q&A
        </h3>
        {!asking && (
          <button
            onClick={() => setAsking(true)}
            className="px-3 py-1.5 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            Ask a question
          </button>
        )}
      </div>

      {asking && (
        <div className="mb-4 p-4 rounded-lg border border-(--gray-200) bg-(--gray-50) space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Question title"
            className="w-full h-9 px-3 rounded-md border border-(--gray-200) text-[14px] outline-none focus:border-(--primary-600)"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe what you're stuck on..."
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-(--gray-200) text-[14px] outline-none focus:border-(--primary-600) resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleAsk}
              disabled={postQuestion.isPending}
              className="px-4 py-2 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-60"
            >
              {postQuestion.isPending ? "Posting..." : "Post question"}
            </button>
            <button
              onClick={() => setAsking(false)}
              className="px-4 py-2 rounded-md text-(--gray-500) hover:bg-(--gray-100) text-[13px] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-(--gray-400) text-[14px]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <p className="text-[13px] text-(--gray-400)">
          No questions yet. Be the first to ask.
        </p>
      ) : (
        <div className="space-y-2">
          {questions.map((q) =>
            openQuestionId === q.id && courseSlug ? (
              <QuestionThread
                key={q.id}
                question={q}
                courseSlug={courseSlug}
                isInstructor={isInstructor}
                onClose={() => setOpenQuestionId(null)}
              />
            ) : (
              <div
                key={q.id}
                className="p-4 rounded-lg border border-(--gray-200) hover:border-(--gray-300) transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => setOpenQuestionId(q.id)}
                    className="flex-1 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      {q.is_pinned && (
                        <Pin className="w-3.5 h-3.5 text-(--primary-600) fill-(--primary-600)" />
                      )}
                      <span className="text-[14px] font-semibold text-(--text-title)">
                        {q.title}
                      </span>
                    </div>
                    <p className="text-[12px] text-(--gray-500) mt-0.5">
                      {q.author_name}
                      {q.related_content && (
                        <span className="text-(--gray-400)">
                          {" "}
                          · {q.related_content.item_type}
                        </span>
                      )}
                    </p>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    {isInstructor && (
                      <button
                        onClick={() => handlePin(q.id)}
                        className={`w-7 h-7 flex items-center justify-center rounded-md hover:bg-(--gray-100) cursor-pointer ${
                          q.is_pinned ? "text-(--primary-600)" : "text-(--gray-400)"
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(q.is_own || isInstructor) && (
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-(--gray-100) cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    )}
                    <button
                      onClick={() => setOpenQuestionId(q.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-(--gray-100) cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-(--gray-400)" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => handleUpvote(q.id)}
                    className="flex items-center gap-1 text-[12px] text-(--gray-400) hover:text-(--text-title) cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {q.upvote_count}
                  </button>
                  <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {q.reply_count} repl{q.reply_count === 1 ? "y" : "ies"}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
