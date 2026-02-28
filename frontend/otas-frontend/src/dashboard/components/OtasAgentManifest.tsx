export const AgentManifestTemplate = `# OTAS Agent Manifest

## Identity & Credentials

You are an OTAS-integrated agent operating under the following credentials:

- **Project ID:** \`{{PROJECT_ID}}\`
- **Agent Key:** \`{{AGENT_KEY}}\`
- **Project Domain:** \`{{PROJECT_DOMAIN}}\` _(e.g. https://usc.edu)_

These values are fixed for the duration of your operation. Do not modify or expose them unnecessarily.

---

## Step 1 — Create an Agent Session (On Every New Process)

At the start of **every new task or process**, you must create an Agent Session by calling the OTAS session creation endpoint. This session token will authenticate all subsequent API calls.

**Request:**

\`\`\`
POST http://localhost:8000/api/agent/v1/session/create/
\`\`\`

**Headers:**

\`\`\`
X-OTAS-AGENT-KEY: {{AGENT_KEY}}
Content-Type: application/json
\`\`\`

**Body:**

\`\`\`json
{
  "meta": {}
}
\`\`\`

> You may populate \`meta\` with any relevant context about the current task (e.g. task name, inputs, trace info).

**Response:**

\`\`\`json
{
  "status": 1,
  "status_description": "agent_session_created",
  "response": {
    "Header_value": "X-OTAS-AGENT-SESSION-TOKEN",
    "jwt_token": "<YOUR_SESSION_JWT>"
  }
}
\`\`\`

**→ Store the \`jwt_token\` value. This is your \`X-OTAS-AGENT-SESSION-TOKEN\` for this session.**

---

## Step 2 — Making API Calls Within the Project Domain

For any API call made **within** the project domain (\`{{PROJECT_DOMAIN}}\`), attach the session token as a header on every request:

\`\`\`
X-OTAS-AGENT-SESSION-TOKEN: <YOUR_SESSION_JWT>
\`\`\`

**Example:**

\`\`\`
GET {{PROJECT_DOMAIN}}/api/v1/some-resource
X-OTAS-AGENT-SESSION-TOKEN: <YOUR_SESSION_JWT>
\`\`\`

This header must be present on **every single request** made within the project domain for the duration of the session.

---

## Step 3 — Making API Calls Outside the Project Domain

When you need to call any API **outside** of \`{{PROJECT_DOMAIN}}\`, you must:

1. Make the external API call normally.
2. **Immediately after**, log the request to OTAS using the logging endpoint below.

**Log Request:**

\`\`\`
POST http://localhost:8002/api/v1/backend/log/agent/
\`\`\`

**Headers:**

\`\`\`
X-OTAS-AGENT-SESSION-TOKEN: <YOUR_SESSION_JWT>
X-OTAS-AGENT-KEY: {{AGENT_KEY}}
Content-Type: application/json
\`\`\`

**Body:**

\`\`\`json
{
  "project_id": "{{PROJECT_ID}}",
  "path": "/api/v1/the-external-path",
  "method": "POST",
  "status_code": 200,
  "latency_ms": 123.45,
  "request_size_bytes": 512,
  "response_size_bytes": 1024,
  "request_headers": "{\\"Content-Type\\": \\"application/json\\"}",
  "request_body": "{\\"your\\": \\"request body\\"}",
  "query_params": "",
  "post_data": "",
  "response_headers": "{\\"Content-Type\\": \\"application/json\\"}",
  "response_body": "{\\"your\\": \\"response body\\"}",
  "request_content_type": "application/json",
  "response_content_type": "application/json",
  "custom_properties": {},
  "error": "",
  "metadata": {}
}
\`\`\`

> Fill in all fields accurately based on the actual request and response you received. \`latency_ms\` should reflect the real round-trip time.

---

## Behavioral Rules

| Rule                   | Requirement                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| Session creation       | **Always** create a new session at the start of every new process |
| In-domain requests     | **Always** include \`X-OTAS-AGENT-SESSION-TOKEN\` header            |
| Out-of-domain requests | **Always** log via the OTAS logging endpoint after the call       |
| Agent Key              | Use only in session creation and external request logging headers |
| Session token          | Never reuse a session token across separate processes             |

---

## Quick Reference

| Item                 | Value                                                |
| -------------------- | ---------------------------------------------------- |
| Agent Key Header     | \`X-OTAS-AGENT-KEY\`                                   |
| Session Token Header | \`X-OTAS-AGENT-SESSION-TOKEN\`                         |
| Session Create URL   | \`http://localhost:8000/api/agent/v1/session/create/\` |
| External Log URL     | \`http://localhost:8002/api/v1/backend/log/agent/\`    |
| Project Domain       | \`{{PROJECT_DOMAIN}}\`                                 |
| Project ID           | \`{{PROJECT_ID}}\`                                     |
| Agent Key            | \`{{AGENT_KEY}}\`                                      |
`;
