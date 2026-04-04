const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

function buildUrl(path) {
  return `${apiBaseUrl}${path}`;
}

async function parseError(response) {
  try {
    const body = await response.json();

    if (body?.error) {
      return body.error;
    }

    if (Array.isArray(body?.details) && body.details.length > 0) {
      return body.details.map((detail) => detail.message).join(", ");
    }
  } catch {
    return `Request failed with status ${response.status}`;
  }

  return `Request failed with status ${response.status}`;
}

async function request(path, { method = "GET", payload } = {}) {
  const headers = {};

  if (payload !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function getPrograms() {
  const data = await request("/api/programs");
  return Array.isArray(data?.items) ? data.items : [];
}

export async function getCohorts() {
  const data = await request("/api/cohorts");
  return Array.isArray(data?.items) ? data.items : [];
}

export function submitInquiry(payload) {
  return request("/api/inquiries", { method: "POST", payload });
}

export function joinWaitlist(payload) {
  return request("/api/waitlist", { method: "POST", payload });
}

export function createEnrollment(payload) {
  return request("/api/enrollments", { method: "POST", payload });
}

export function getEnrollmentStatus(enrollmentId) {
  return request(`/api/enrollments/${enrollmentId}/status`);
}
