import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../../AuthContext";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AGENT_PATH_TIMESERIES_ENDPOINT,
  AGENT_SESSION_LIST_V1_ENDPOINT,
  AGENT_LATENCY_PERCENTILES_ENDPOINT,
  AGENT_ERROR_COUNT_ENDPOINT,
} from "../../constants";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function getLast7Days() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return { start: formatDate(start), end: formatDate(end) };
}

function buildLast7DaysBuckets(): { date: string; sessions: number }[] {
  const buckets = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.push({ date: formatDate(d), sessions: 0 });
  }
  return buckets;
}

function pivotPathData(
  paths: { path: string; data: { date: string; count: number }[] }[],
) {
  const dateMap: Record<string, Record<string, number>> = {};
  for (const { path, data } of paths) {
    for (const { date, count } of data) {
      if (!dateMap[date]) dateMap[date] = {};
      dateMap[date][path] = count;
    }
  }
  return Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}

const LINE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
];

// ── TimeseriesChart ───────────────────────────────────────────────────────────

function TimeseriesChart({
  paths,
  height = 220,
}: {
  paths: { path: string; data: { date: string; count: number }[] }[];
  height?: number;
}) {
  const chartData = pivotPathData(paths);
  const allPaths = paths.map((p) => p.path);

  if (chartData.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height,
          width: "100%",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No data for this period
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          labelFormatter={(l) => `Date: ${l}`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {allPaths.map((path, i) => (
          <Line
            key={path}
            type="monotone"
            dataKey={path}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── SessionsPerDayChart ───────────────────────────────────────────────────────

function SessionsPerDayChart({
  data,
  height = 220,
}: {
  data: { date: string; sessions: number }[];
  height?: number;
}) {
  if (data.every((d) => d.sessions === 0)) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height,
          width: "100%",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No sessions in the last 7 days
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          labelFormatter={(l) => `Date: ${l}`}
          formatter={(v: any) => [v, "Sessions"]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="sessions"
          name="Sessions"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── LatencyBarChart ───────────────────────────────────────────────────────────

function LatencyBarChart({
  data,
  height = 220,
}: {
  data: {
    date: string;
    p50: number | null;
    p95: number | null;
    p99: number | null;
  }[];
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height,
          width: "100%",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No data for this period
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis tick={{ fontSize: 11 }} unit="ms" />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          labelFormatter={(l) => `Date: ${l}`}
          formatter={(value: any, name: string) => [`${value} ms`, name]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="p50"
          name="p50 (median)"
          fill="#2563eb"
          radius={[3, 3, 0, 0]}
        />
        <Bar dataKey="p95" name="p95" fill="#7c3aed" radius={[3, 3, 0, 0]} />
        <Bar dataKey="p99" name="p99" fill="#d97706" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── ErrorCountChart ───────────────────────────────────────────────────────────

function ErrorCountChart({
  data,
  height = 220,
}: {
  data: { date: string; error_count: number }[];
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height,
          width: "100%",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No errors in this period
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => v.slice(5)}
        />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          labelFormatter={(l) => `Date: ${l}`}
          formatter={(v: any) => [v, "Errors"]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="error_count"
          name="Errors"
          stroke="#dc2626"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── AnalyticsCard ─────────────────────────────────────────────────────────────

function AnalyticsCard({
  title,
  loading,
  children,
}: {
  title: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          position: "relative",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          bgcolor: "background.paper",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          minHeight: 280,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {title}
          </Typography>
          <IconButton size="small" onClick={() => setOpen(true)} title="Expand">
            <OpenInFullIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 220,
          }}
        >
          {loading ? <CircularProgress size={28} /> : children}
        </Box>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>{children}</Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Analytics (page) ──────────────────────────────────────────────────────────

export default function Analytics({
  projectId,
  agents = [],
}: {
  projectId: string | undefined;
  agents: any[];
}) {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const agentIdFromUrl = searchParams.get("agent_id");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  const setAgentInUrl = (id: string, replace = false) => {
    const next = new URLSearchParams(searchParams);
    next.set("agent_id", id);
    navigate({ search: next.toString(), hash: "analytics" }, { replace });
  };

  useEffect(() => {
    if (agents.length === 0) return;
    if (agentIdFromUrl && agents.some((a) => a.id === agentIdFromUrl)) {
      setSelectedAgentId(agentIdFromUrl);
    } else {
      const firstId = agents[0].id;
      setSelectedAgentId(firstId);
      setAgentInUrl(firstId, true);
    }
  }, [agents, agentIdFromUrl]);

  const handleAgentChange = (newId: string) => {
    setSelectedAgentId(newId);
    setAgentInUrl(newId, true);
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const { start, end } = getLast7Days();

  // ── path timeseries ──────────────────────────────────────────────────────
  const [timeseriesData, setTimeseriesData] = useState<
    { path: string; data: { date: string; count: number }[] }[]
  >([]);
  const [timeseriesLoading, setTimeseriesLoading] = useState(false);

  useEffect(() => {
    if (!accessToken || !projectId || !selectedAgentId) return;
    const fetch_ = async () => {
      setTimeseriesLoading(true);
      try {
        const res = await fetch(
          `${AGENT_PATH_TIMESERIES_ENDPOINT}?start_date=${start}&end_date=${end}`,
          {
            headers: {
              "X-OTAS-USER-TOKEN": accessToken,
              "X-OTAS-AGENT-ID": selectedAgentId,
              "X-OTAS-PROJECT-ID": projectId,
            },
          },
        );
        const result = await res.json();
        setTimeseriesData(result.status === 1 ? (result.paths ?? []) : []);
      } catch {
        setTimeseriesData([]);
      } finally {
        setTimeseriesLoading(false);
      }
    };
    fetch_();
  }, [selectedAgentId, projectId, accessToken]);

  // ── sessions per day ─────────────────────────────────────────────────────
  const [sessionsPerDay, setSessionsPerDay] = useState<
    { date: string; sessions: number }[]
  >([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    if (!accessToken || !projectId || !selectedAgentId) return;
    const fetch_ = async () => {
      setSessionsLoading(true);
      const buckets = buildLast7DaysBuckets();
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
          const sessions: { created_at: string }[] =
            data.response.sessions ?? [];
          for (const session of sessions) {
            const day = session.created_at.split("T")[0];
            const bucket = buckets.find((b) => b.date === day);
            if (bucket) bucket.sessions += 1;
          }
        }
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      } finally {
        setSessionsPerDay(buckets);
        setSessionsLoading(false);
      }
    };
    fetch_();
  }, [selectedAgentId, projectId, accessToken]);

  // ── latency percentiles ──────────────────────────────────────────────────
  const [latencyData, setLatencyData] = useState<
    {
      date: string;
      p50: number | null;
      p95: number | null;
      p99: number | null;
    }[]
  >([]);
  const [latencyLoading, setLatencyLoading] = useState(false);

  useEffect(() => {
    if (!accessToken || !projectId || !selectedAgentId) return;
    const fetch_ = async () => {
      setLatencyLoading(true);
      try {
        const res = await fetch(
          `${AGENT_LATENCY_PERCENTILES_ENDPOINT}?start_date=${start}&end_date=${end}`,
          {
            headers: {
              "X-OTAS-USER-TOKEN": accessToken,
              "X-OTAS-AGENT-ID": selectedAgentId,
              "X-OTAS-PROJECT-ID": projectId,
            },
          },
        );
        const result = await res.json();
        setLatencyData(result.status === 1 ? (result.data ?? []) : []);
      } catch {
        setLatencyData([]);
      } finally {
        setLatencyLoading(false);
      }
    };
    fetch_();
  }, [selectedAgentId, projectId, accessToken]);

  // ── error counts ─────────────────────────────────────────────────────────
  const [errorData, setErrorData] = useState<
    { date: string; error_count: number }[]
  >([]);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    if (!accessToken || !projectId || !selectedAgentId) return;
    const fetch_ = async () => {
      setErrorLoading(true);
      try {
        const res = await fetch(
          `${AGENT_ERROR_COUNT_ENDPOINT}?start_date=${start}&end_date=${end}`,
          {
            headers: {
              "X-OTAS-USER-TOKEN": accessToken,
              "X-OTAS-AGENT-ID": selectedAgentId,
              "X-OTAS-PROJECT-ID": projectId,
            },
          },
        );
        const result = await res.json();
        setErrorData(result.status === 1 ? (result.data ?? []) : []);
      } catch {
        setErrorData([]);
      } finally {
        setErrorLoading(false);
      }
    };
    fetch_();
  }, [selectedAgentId, projectId, accessToken]);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Analytics
      </Typography>

      {/* Agent selector */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="agent-select-label">Agent</InputLabel>
          <Select
            labelId="agent-select-label"
            value={selectedAgentId}
            label="Agent"
            onChange={(e) => handleAgentChange(e.target.value)}
            disabled={agents.length === 0}
          >
            {agents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>{agent.name}</span>
                  <Chip
                    label={agent.provider}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.65rem", height: 18 }}
                  />
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedAgent && (
          <Typography variant="body2" color="text.secondary">
            {selectedAgent.description}
          </Typography>
        )}
      </Stack>

      {/* Chart grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        <AnalyticsCard
          title={`API Path Requests  ${start} → ${end}`}
          loading={timeseriesLoading}
        >
          <TimeseriesChart paths={timeseriesData} height={220} />
        </AnalyticsCard>

        <AnalyticsCard
          title={`Sessions per Day  ${start} → ${end}`}
          loading={sessionsLoading}
        >
          <SessionsPerDayChart data={sessionsPerDay} height={220} />
        </AnalyticsCard>

        <AnalyticsCard
          title={`Latency Percentiles  ${start} → ${end}`}
          loading={latencyLoading}
        >
          <LatencyBarChart data={latencyData} height={220} />
        </AnalyticsCard>

        <AnalyticsCard
          title={`Errors per Day  ${start} → ${end}`}
          loading={errorLoading}
        >
          <ErrorCountChart data={errorData} height={220} />
        </AnalyticsCard>
      </Box>
    </Box>
  );
}
