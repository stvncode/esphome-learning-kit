import {
  healthResponseSchema,
  progressSchema,
  projectListSchema,
  type HealthResponse,
  type Progress,
  type Project,
  type ProjectKind,
  type ProjectUpsertInput,
} from "@esphome-learning-kit/types"

/** Base URL of the backend API. */
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001"

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
    throw new Error(`Request to ${path} failed: ${res.status} ${res.statusText}`)
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
