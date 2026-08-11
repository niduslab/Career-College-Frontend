import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PaginatedResponse } from "@/lib/course-api";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
  type LearnerNote,
  type NoteCreateInput,
  type NoteFilterParams,
  type NoteUpdateInput,
} from "@/lib/notes-api";

type NotePage = PaginatedResponse<LearnerNote>;

/** Patch every cached notes page, whatever filter/page it was fetched with. */
function patchNotePages(
  queryClient: ReturnType<typeof useQueryClient>,
  patch: (page: NotePage) => NotePage,
) {
  queryClient.setQueriesData<NotePage>({ queryKey: ["notes"] }, (old) =>
    old ? patch(old) : old,
  );
}

/** The caller's notes. Pinned notes always sort first, server-side. */
export function useNotes(params: NoteFilterParams = {}) {
  return useQuery({
    queryKey: ["notes", params],
    queryFn: () => getNotes(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Notes CRUD used to be pure local state, so every action was instant. These
 * mutations keep that by patching the cache in `onMutate` and rolling back on
 * error; `onSettled` refetches so the server's ordering and timestamps win.
 */
function useNoteSnapshot() {
  const queryClient = useQueryClient();

  const snapshot = async () => {
    await queryClient.cancelQueries({ queryKey: ["notes"] });
    return queryClient.getQueriesData<NotePage>({ queryKey: ["notes"] });
  };

  const rollback = (previous?: ReturnType<typeof queryClient.getQueriesData>) => {
    previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
  };

  const settle = () => queryClient.invalidateQueries({ queryKey: ["notes"] });

  return { queryClient, snapshot, rollback, settle };
}

export function useCreateNote() {
  const { settle, queryClient } = useNoteSnapshot();
  return useMutation({
    mutationFn: (input: NoteCreateInput) => createNote(input),
    // No optimistic insert: a placeholder note would need a fabricated id and
    // the server derives `course` from `lecture_id`. The create form closes
    // on success and the refetch lands in the same tick.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
    onSettled: settle,
  });
}

export function useUpdateNote() {
  const { snapshot, rollback, settle } = useNoteSnapshot();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: NoteUpdateInput }) =>
      updateNote(id, input),
    onMutate: async ({ id, input }) => {
      const previous = await snapshot();
      patchNotePages(queryClient, (page) => ({
        ...page,
        results: page.results.map((note) =>
          note.id === id ? { ...note, ...input } : note,
        ),
      }));
      return { previous };
    },
    onError: (_error, _input, context) => rollback(context?.previous),
    onSettled: settle,
  });
}

export function useToggleNotePin() {
  const updateMutation = useUpdateNote();
  return {
    ...updateMutation,
    toggle: (note: LearnerNote) =>
      updateMutation.mutate({
        id: note.id,
        input: { is_pinned: !note.is_pinned },
      }),
  };
}

export function useDeleteNote() {
  const { snapshot, rollback, settle } = useNoteSnapshot();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteNote(id),
    onMutate: async (id: number) => {
      const previous = await snapshot();
      patchNotePages(queryClient, (page) => {
        const results = page.results.filter((note) => note.id !== id);
        if (results.length === page.results.length) return page;
        return { ...page, results, count: Math.max(0, page.count - 1) };
      });
      return { previous };
    },
    onError: (_error, _id, context) => rollback(context?.previous),
    onSettled: settle,
  });
}
