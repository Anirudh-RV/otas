import { useEffect, useMemo, useState, useCallback } from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppNavbar from "./AppNavbar";
import Header from "./Header";
import SideMenu from "./SideMenu";
import AppTheme from "../../shared-ui-theme/AppTheme";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { AGENT_LIST_V1_ENDPOINT, PROJECT_LIST_ENDPOINT, AGENT_SESSION_EVENTS_ENDPOINT } from "../../constants";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Project {
  id: string;
  name: string;
  description: string | null;
  domain: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  created_by: string;
  privilege: number;
}

interface Agent {
  id: string;
  name: string;
  provider?: string;
}

interface SessionLogEvent {
  event_id: string;
  event_time: string;
  event_date: string | null;
  project_id: string;
  agent_id: string | null;
  agent_session_id: string | null;
  path: string;
  method: string;
  status_code: number;
  latency_ms: number;
  request_size_bytes: number;
  response_size_bytes: number;
  request_headers: string | null;
  request_body: string | null;
  query_params: string | null;
  post_data: string | null;
  response_headers: string | null;
  response_body: string | null;
  request_content_type: string | null;
  response_content_type: string | null;
  custom_properties: unknown;
  error: string | null;
  metadata: unknown;
  created_at: string;
}

function statusChipColor(
  status: number,
): "success" | "warning" | "error" | "default" {
  if (status >= 500) return "error";
  if (status >= 400) return "warning";
  if (status >= 200 && status < 300) return "success";
  return "default";
}

function timelineDotColor(status: number): string {
  if (status >= 500) return "#d32f2f";
  if (status >= 400) return "#ed6c02";
  if (status >= 200 && status < 300) return "#2e7d32";
  return "#9e9e9e";
}

function SessionLogsTimeline({
  projectId,
  agents,
}: {
  projectId: string | undefined;
  agents: Agent[];
}) {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const agentId = searchParams.get("agent_id") || "";
  const sessionId = searchParams.get("session_id") || "";

  const [events, setEvents] = useState<SessionLogEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === agentId),
    [agents, agentId],
  );

  const sessionShort = useMemo(
    () => (sessionId ? `${sessionId.slice(0, 8)}…` : "—"),
    [sessionId],
  );

  const fetchEvents = useCallback(async () => {
    if (!accessToken || !projectId || !agentId || !sessionId) {
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL(AGENT_SESSION_EVENTS_ENDPOINT);
      url.searchParams.set("session_id", sessionId);
      url.searchParams.set("limit", "200");

      const res = await fetch(url.toString(), {
        headers: {
          "X-OTAS-USER-TOKEN": accessToken,
          "X-OTAS-AGENT-ID": agentId,
          "X-OTAS-PROJECT-ID": projectId,
        },
      });

      const data = await res.json();

      if (data.status === 1) {
        const list: SessionLogEvent[] = data.events ?? data.response?.events ?? [];
        const sorted = [...list].sort(
          (a, b) =>
            new Date(a.event_time).getTime() - new Date(b.event_time).getTime(),
        );
        setEvents(sorted);
      } else {
        setEvents([]);
        setError(data.status_description || "Failed to load events");
      }
    } catch {
      setEvents([]);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [accessToken, agentId, projectId, sessionId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        sx={{ mb: 3 }}
      >
        <Button
          variant="outlined"
          onClick={() =>
            navigate({
              pathname: `/dashboard/${projectId}`,
              search: agentId ? `?agent_id=${agentId}` : "",
              hash: "logs",
            })
          }
        >
          Back to Sessions
        </Button>

        <Box>
          <Typography variant="h5" fontWeight={700}>
            Session Log Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedAgent ? selectedAgent.name : "Agent"} · Session {sessionShort}
          </Typography>
        </Box>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          width: "100%",
        }}
      >
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Chip label={`Agent: ${selectedAgent?.name || agentId || "—"}`} variant="outlined" />
          <Chip label={`Session: ${sessionShort}`} variant="outlined" />
          <Chip label={`Events: ${events.length}`} color="primary" variant="outlined" />
        </Stack>
      </Paper>

      {loading && (
        <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && events.length === 0 && (
        <Alert severity="info">No events found for this session.</Alert>
      )}

      <Stack spacing={2}>
        {events.map((ev) => {
          const isExpanded = expandedEventId === ev.event_id;
          const dotColor = timelineDotColor(ev.status_code);

          return (
            <Box
              key={ev.event_id}
              sx={{
                position: "relative",
                pl: 4,
                pb: 1.5,
                borderLeft: "2px solid",
                borderColor: "divider",
                ml: 1,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: -9,
                  top: 22,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor: dotColor,
                  border: "3px solid",
                  borderColor: "background.paper",
                }}
              />

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {new Date(ev.event_time).toLocaleString()}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                      <Chip label={ev.method} size="small" variant="outlined" />
                      <Chip
                        label={ev.status_code}
                        size="small"
                        color={statusChipColor(ev.status_code)}
                      />
                      <Chip
                        label={`${ev.latency_ms} ms`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>

                  <IconButton
                    onClick={() =>
                      setExpandedEventId(isExpanded ? null : ev.event_id)
                    }
                  >
                    <ExpandMoreIcon
                      style={{
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 150ms ease",
                      }}
                    />
                  </IconButton>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{ mt: 1.5, wordBreak: "break-all" }}
                >
                  {ev.path}
                </Typography>

                <AccordionDetails sx={{ px: 0 }}>
                  <CollapseContent
                    isExpanded={isExpanded}
                    ev={ev}
                  />
                </AccordionDetails>
              </Paper>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function CollapseContent({
  isExpanded,
  ev,
}: {
  isExpanded: boolean;
  ev: SessionLogEvent;
}) {
  if (!isExpanded) return null;

  return (
    <Box>
      <Divider sx={{ my: 2 }} />

      <Stack spacing={1.5}>
        <Typography variant="body2">
          <b>Event ID:</b> {ev.event_id}
        </Typography>

        {ev.error && <Alert severity="error">{ev.error}</Alert>}

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Request
          </Typography>
          <Typography
            variant="caption"
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              p: 1.5,
              borderRadius: 2,
              bgcolor: "action.hover",
              m: 0,
              fontFamily: "monospace",
              fontSize: "0.78rem",
            }}
          >
            <b>Headers:</b> {ev.request_headers || "—"}
            {"\n\n"}
            <b>Body:</b> {ev.request_body || "—"}
            {"\n\n"}
            <b>Query Params:</b> {ev.query_params || "—"}
            {"\n\n"}
            <b>Post Data:</b> {ev.post_data || "—"}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Response
          </Typography>
          <Typography
            variant="caption"
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              p: 1.5,
              borderRadius: 2,
              bgcolor: "action.hover",
              m: 0,
              fontFamily: "monospace",
              fontSize: "0.78rem",
            }}
          >
            <b>Headers:</b> {ev.response_headers || "—"}
            {"\n\n"}
            <b>Body:</b> {ev.response_body || "—"}
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary">
          {ev.request_content_type
            ? `Request Content-Type: ${ev.request_content_type}`
            : "Request Content-Type: —"}
          {" · "}
          {ev.response_content_type
            ? `Response Content-Type: ${ev.response_content_type}`
            : "Response Content-Type: —"}
        </Typography>
      </Stack>
    </Box>
  );
}

export default function SessionLogPages(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { project_id } = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState<"home" | "analytics" | "logs">("logs");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!accessToken) return;

    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const res = await fetch(PROJECT_LIST_ENDPOINT, {
          headers: { "X-OTAS-USER-TOKEN": accessToken },
        });
        const result = await res.json();
        if (result.status === 1) {
          setProjects(result.response_body?.projects ?? []);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, [accessToken]);

  useEffect(() => {
    document.title = "Otas - Session Logs";
  }, []);

  useEffect(() => {
    if (projectsLoading) return;

    if (projects.length === 0) {
      navigate("/projects/create/", { replace: true });
      return;
    }

    if (!project_id) {
      navigate(`/dashboard/${projects[0].id}/#home`, { replace: true });
    }
  }, [projectsLoading, projects, project_id, navigate]);

  const currentProject = projects.find((p) => p.id === project_id);

  useEffect(() => {
    if (!accessToken || !project_id) return;

    const fetchAgents = async () => {
      setAgentsLoading(true);
      try {
        const res = await fetch(AGENT_LIST_V1_ENDPOINT, {
          headers: {
            "X-OTAS-USER-TOKEN": accessToken,
            "X-OTAS-PROJECT-ID": project_id,
          },
        });

        const result = await res.json();

        if (result.status === 1) {
          setAgents(result.response.agents);
        } else {
          setAgents([]);
        }
      } catch (err) {
        console.error("Failed to fetch agents", err);
        setAgents([]);
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAgents();
  }, [project_id, accessToken]);

  const refreshAgents = async () => {
    if (!accessToken || !project_id) return;

    try {
      const res = await fetch(AGENT_LIST_V1_ENDPOINT, {
        headers: {
          "X-OTAS-USER-TOKEN": accessToken,
          "X-OTAS-PROJECT-ID": project_id,
        },
      });

      const result = await res.json();

      if (result.status === 1) {
        setAgents(result.response.agents);
      }
    } catch (err) {
      console.error("Failed to refresh agents", err);
    }
  };
  const handleSelectPage = (page: "home" | "analytics" | "logs") => {
  setSelectedPage(page);

  const params = new URLSearchParams(searchParams);
  params.delete("session_id");
  params.delete("agent_id");
  setSearchParams(params, { replace: true });

  navigate(`/dashboard/${project_id}#${page}`, { replace: true });
};

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu
          selectedPage={selectedPage}
          onSelectPage={handleSelectPage}
          projects={projects}
          currentProject={currentProject}
        />

        <AppNavbar />

        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            overflow: "auto",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              zIndex: -1,
              inset: 0,
              backgroundRepeat: "no-repeat",
              backgroundImage:
                "radial-gradient(ellipse 80% 25% at 50% 0%, hsl(210, 100%, 90%), transparent)",
              ...theme.applyStyles?.("dark", {
                backgroundImage:
                  "radial-gradient(ellipse 80% 25% at 50% 0%, hsl(210, 100%, 16%), transparent)",
              }),
            },
          })}
        >
          <Stack
            spacing={2}
            sx={{ alignItems: "center", mx: 2, pb: 5, mt: { xs: 8, md: 0 } }}
          >
            <Header projectId={project_id ?? ""} />

            <SessionLogsTimeline
              projectId={project_id}
              agents={agents}
            />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}