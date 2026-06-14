import {
  classroomDetailSchema,
  classroomListSchema,
  classroomMemberDetailSchema,
  classroomSchema,
  healthResponseSchema,
  inviteInfoSchema,
  progressSchema,
  projectListSchema,
  quizScoreListSchema,
  type Classroom,
  type ClassroomDetail,
  type ClassroomMemberDetail,
  type InviteInfo,
  type HealthResponse,
  type Progress,
  type Project,
  type ProjectKind,
  type ProjectUpsertInput,
  type QuizScore,
  type QuizScoreUpsertInput,
} from "@esphome-learning-kit/types"

/** Base URL of the backend API (trailing slashes stripped so paths never double up). */
export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3001").replace(/\/+$/, "")

/**
 * Fetch JSON from the backend and validate it with the provided parser.
 * Sends credentials so the session cookie travels with every request.
 *
 * The validator is passed as a plain function (rather than a Zod schema) so
 * Zod's types never cross the package boundary — that keeps the type checker
 * from comparing the frontend's Zod copy against the shared package's copy.
 */
async function apiFetch<T>(
  path: string,
  parse: (data: unknown) => T,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })

  if (!res.ok) {
    // Surface the server's `{ error }` message when present.
    const message = await res
      .clone()
      .json()
      .then((body) => (body && typeof body.error === "string" ? body.error : null))
      .catch(() => null)
    throw new Error(message ?? `Request to ${path} failed: ${res.status} ${res.statusText}`)
  }

  return parse(await res.json())
}

export function getHealth(): Promise<HealthResponse> {
  return apiFetch("/api/health", (data) => healthResponseSchema.parse(data))
}

// ── Progress ──────────────────────────────────────────────────────────────────

export function getProgress(): Promise<Progress> {
  return apiFetch("/api/progress", (data) => progressSchema.parse(data))
}

export function putProgress(input: Progress): Promise<Progress> {
  return apiFetch("/api/progress", (data) => progressSchema.parse(data), {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

// ── Projects ──────────────────────────────────────────────────────────────────

export function listProjects(kind: ProjectKind): Promise<Project[]> {
  return apiFetch(`/api/projects?kind=${kind}`, (data) => projectListSchema.parse(data))
}

export function putProject(input: ProjectUpsertInput): Promise<Project> {
  return apiFetch("/api/projects", (data) => projectListSchema.element.parse(data), {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export function deleteProject(kind: ProjectKind, name: string): Promise<void> {
  return apiFetch(
    `/api/projects?kind=${kind}&name=${encodeURIComponent(name)}`,
    () => undefined,
    { method: "DELETE" },
  )
}

// ── Quiz scores ───────────────────────────────────────────────────────────────

export function listQuizScores(): Promise<QuizScore[]> {
  return apiFetch("/api/quiz-scores", (data) => quizScoreListSchema.parse(data))
}

export function putQuizScore(input: QuizScoreUpsertInput): Promise<QuizScore> {
  return apiFetch("/api/quiz-scores", (data) => quizScoreListSchema.element.parse(data), {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

// ── Classrooms ──────────────────────────────────────────────────────────────────

export function listClassrooms(): Promise<Classroom[]> {
  return apiFetch("/api/classrooms", (data) => classroomListSchema.parse(data))
}

export function getClassroom(id: string): Promise<ClassroomDetail> {
  return apiFetch(`/api/classrooms/${id}`, (data) => classroomDetailSchema.parse(data))
}

export function createClassroom(name: string): Promise<Classroom> {
  return apiFetch("/api/classrooms", (data) => classroomSchema.parse(data), {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export function joinClassroom(code: string): Promise<Classroom> {
  return apiFetch("/api/classrooms/join", (data) => classroomSchema.parse(data), {
    method: "POST",
    body: JSON.stringify({ code }),
  })
}

export function deleteClassroom(id: string): Promise<void> {
  return apiFetch(`/api/classrooms/${id}`, () => undefined, { method: "DELETE" })
}

export function leaveClassroom(id: string): Promise<void> {
  return apiFetch(`/api/classrooms/${id}/leave`, () => undefined, { method: "POST" })
}

export function renameClassroom(id: string, name: string): Promise<void> {
  return apiFetch(`/api/classrooms/${id}`, () => undefined, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  })
}

export function removeClassroomMember(id: string, userId: string): Promise<void> {
  return apiFetch(`/api/classrooms/${id}/members/${userId}`, () => undefined, { method: "DELETE" })
}

export function getClassroomMember(id: string, userId: string): Promise<ClassroomMemberDetail> {
  return apiFetch(`/api/classrooms/${id}/members/${userId}`, (data) =>
    classroomMemberDetailSchema.parse(data),
  )
}

// ── Invites ───────────────────────────────────────────────────────────────────

export function getInviteInfo(token: string): Promise<InviteInfo> {
  return apiFetch(`/api/invites/${token}`, (data) => inviteInfoSchema.parse(data))
}

export function inviteStudents(classId: string, emails: string[]): Promise<{ invited: number }> {
  return apiFetch(
    `/api/classrooms/${classId}/invites`,
    (data) => data as { invited: number },
    { method: "POST", body: JSON.stringify({ emails }) },
  )
}

export function acceptInvite(token: string): Promise<Classroom> {
  return apiFetch("/api/invites/accept", (data) => classroomSchema.parse(data), {
    method: "POST",
    body: JSON.stringify({ token }),
  })
}

// ── Account ───────────────────────────────────────────────────────────────────

export function deleteAccount(): Promise<void> {
  return apiFetch("/api/account", () => undefined, { method: "DELETE" })
}
