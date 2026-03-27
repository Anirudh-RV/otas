import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import {
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
} from "@mui/material";
import {
  AGENT_SESSION_LIST_V1_ENDPOINT,
} from "../../constants";

type Agent = {
  id: string;
  name: string;
  provider?: string;
};

type AgentSession = {
  id: string;
  created_at: string;
  meta?: Record<string, unknown>;
};

export default function SessionLogs({
  projectId,
  agents = [],
}: {
  projectId: string | undefined;
  agents: Agent[];
}) {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const agentIdFromUrl = searchParams.get("agent_id") || "";
  const [selectedAgentId, setSelectedAgentId] = useState(agentIdFromUrl);

  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const syncAgentToUrl = useCallback(
    (agentId: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("agent_id", agentId);
      next.delete("session_id"); // OTAS-51 does not need a session dropdown
      navigate({ search: next.toString(), hash: "timeline" }, { replace: true });
    },
    [navigate, searchParams],
  );

  useEffect(() => {
    if (agents.length === 0) {
      setSelectedAgentId("");
      setSessions([]);
      return;
    }

    if (agentIdFromUrl && agents.some((a) => a.id === agentIdFromUrl)) {
      setSelectedAgentId(agentIdFromUrl);
      return;
    }

    const firstAgentId = agents[0].id;
    setSelectedAgentId(firstAgentId);
    syncAgentToUrl(firstAgentId);
  }, [agents, agentIdFromUrl, syncAgentToUrl]);

  useEffect(() => {
    if (!accessToken || !projectId || !selectedAgentId) {
      setSessions([]);
      return;
    }

    const loadSessions = async () => {
      setSessionsLoading(true);
      setSessionsError(null);

      try {
        const res = await fetch(
          `${AGENT_SESSION_LIST_V1_ENDPOINT}?agent_id=${selectedAgentId}`,
          {
            headers: {
              "X-OTAS-USER-TOKEN": accessToken,
              "X-OTAS-PROJECT-ID": projectId,
            },
          },
        );

        const data = await res.json();

        if (data.status === 1) {
          const list = data.response?.sessions ?? [];
          setSessions(list);
          setPage(0);
        } else {
          setSessions([]);
          setSessionsError(data.status_description || "Failed to load sessions");
        }
      } catch (err) {
        setSessions([]);
        setSessionsError("Network error");
      } finally {
        setSessionsLoading(false);
      }
    };

    loadSessions();
  }, [accessToken, projectId, selectedAgentId]);

  const visibleSessions = useMemo(() => {
    const start = page * rowsPerPage;
    return sessions.slice(start, start + rowsPerPage);
  }, [sessions, page, rowsPerPage]);

  const handleAgentChange = (newAgentId: string) => {
    setSelectedAgentId(newAgentId);
    setSessions([]);
    setPage(0);
    syncAgentToUrl(newAgentId);
  };

  const handleShowLogs = (sessionId: string) => {
    navigate(
      `/dashboard/${projectId}/session-logs?agent_id=${selectedAgentId}&session_id=${sessionId}`,
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: 1100 } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
        Sessions for Agent
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select an agent, then browse all of its sessions here. Pagination is handled on the frontend.
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ sm: "center" }}
      >
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="agent-select-label">Agent</InputLabel>
          <Select
            labelId="agent-select-label"
            label="Agent"
            value={selectedAgentId}
            onChange={(e) => handleAgentChange(e.target.value)}
            disabled={agents.length === 0}
          >
            {agents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                {agent.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={`${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
            variant="outlined"
            size="small"
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              if (selectedAgentId) {
                syncAgentToUrl(selectedAgentId);
              }
            }}
            disabled={!selectedAgentId}
          >
            Refresh URL
          </Button>
        </Box>
      </Stack>

      {sessionsLoading && (
        <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {sessionsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {sessionsError}
        </Alert>
      )}

      {!sessionsLoading && selectedAgentId && sessions.length === 0 && !sessionsError && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No sessions found for this agent.
        </Alert>
      )}

      {!sessionsLoading && sessions.length > 0 && (
        <Paper variant="outlined" sx={{ width: "100%", overflow: "hidden" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Session ID</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Meta</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleSessions.map((session) => (
                <TableRow key={session.id} hover>
                  <TableCell sx={{ fontFamily: "monospace" }}>
                    {session.id}
                  </TableCell>

                  <TableCell>
                    {new Date(session.created_at).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    {session.meta && Object.keys(session.meta).length > 0 ? (
                      <Chip label="Has meta" size="small" color="success" variant="outlined" />
                    ) : (
                      <Chip label="No meta" size="small" variant="outlined" />
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleShowLogs(session.id)}
                    >
                      Show Logs
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={sessions.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}
    </Box>
  );
}