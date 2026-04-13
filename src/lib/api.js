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

async function request(path, { method = "GET", payload, headers: extraHeaders } = {}) {
  const headers = { ...(extraHeaders ?? {}) };

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

  if (response.status === 204) {
    return null;
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

function adminHeaders(apiKey) {
  return { "x-api-key": apiKey };
}

export function getAdminOverview(apiKey) {
  return request("/api/admin/overview", { headers: adminHeaders(apiKey) });
}

export function getAdminEnrollments(apiKey) {
  return request("/api/enrollments", { headers: adminHeaders(apiKey) });
}

export function getAdminInquiries(apiKey) {
  return request("/api/inquiries", { headers: adminHeaders(apiKey) });
}

export function getAdminWaitlist(apiKey) {
  return request("/api/waitlist", { headers: adminHeaders(apiKey) });
}

export async function getAdminPrograms(apiKey) {
  const data = await request("/api/admin/programs", { headers: adminHeaders(apiKey) });
  return Array.isArray(data?.items) ? data.items : [];
}

export async function getAdminCohorts(apiKey) {
  const data = await request("/api/admin/cohorts", { headers: adminHeaders(apiKey) });
  return Array.isArray(data?.items) ? data.items : [];
}

export function createAdminProgram(apiKey, payload) {
  return request("/api/admin/programs", { method: "POST", payload, headers: adminHeaders(apiKey) });
}

export function updateAdminProgram(apiKey, programId, payload) {
  return request(`/api/admin/programs/${programId}`, {
    method: "PATCH",
    payload,
    headers: adminHeaders(apiKey),
  });
}

export function deleteAdminProgram(apiKey, programId) {
  return request(`/api/admin/programs/${programId}`, {
    method: "DELETE",
    headers: adminHeaders(apiKey),
  });
}

export function createAdminCohort(apiKey, payload) {
  return request("/api/admin/cohorts", { method: "POST", payload, headers: adminHeaders(apiKey) });
}

export function updateAdminCohort(apiKey, cohortId, payload) {
  return request(`/api/admin/cohorts/${cohortId}`, {
    method: "PATCH",
    payload,
    headers: adminHeaders(apiKey),
  });
}

export function deleteAdminCohort(apiKey, cohortId) {
  return request(`/api/admin/cohorts/${cohortId}`, {
    method: "DELETE",
    headers: adminHeaders(apiKey),
  });
}
