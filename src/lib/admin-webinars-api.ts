import { apiPost, type ApiEnvelope } from "./api";

export interface ArchivedWebinar {
  id: number;
  title: string;
  status: string;
}

export async function archiveWebinar(id: number): Promise<ArchivedWebinar> {
  const res = (await apiPost(
    `/webinars/${id}/archive/`,
    {},
  )) as ApiEnvelope<ArchivedWebinar>;
  return res.data as ArchivedWebinar;
}
