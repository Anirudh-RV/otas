import { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Fade,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Autocomplete from "@mui/material/Autocomplete";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReactMarkdown from "react-markdown";
import { AgentManifestTemplate } from "./OtasAgentManifest";

const AGENT_PROVIDER_SUGGESTIONS = [
  "Claude",
  "OpenAI",
  "Gemini",
  "Mistral",
  "Llama",
];

interface AgentResponse {
  agent: {
    id: string;
    name: string;
    description: string;
    provider: string;
    project_id: string;
    created_by: string;
    created_at: string;
  };
  agent_key: {
    id: string;
    prefix: string;
    api_key: string;
    agent_id: string;
    created_at: string;
    expires_at: string;
    active: boolean;
  };
}

interface CreateAgentProps {
  projectId: string | undefined;
  projectDomain: string | null | undefined;
  otasAccessToken: string | undefined;
  onAgentCreated?: (agent: AgentResponse) => void;
}

function buildManifest(
  template: string,
  projectId: string,
  agentKey: string,
  projectDomain: string,
): string {
  return template
    .replace(/\{\{PROJECT_ID\}\}/g, projectId)
    .replace(/\{\{AGENT_KEY\}\}/g, agentKey)
    .replace(/\{\{PROJECT_DOMAIN\}\}/g, projectDomain);
}

export default function CreateAgent({
  projectId,
  projectDomain,
  otasAccessToken,
  onAgentCreated,
}: CreateAgentProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "manifest">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [agentProvider, setAgentProvider] = useState("Claude");

  const [agentResponse, setAgentResponse] = useState<AgentResponse | null>(
    null,
  );
  const [manifestContent, setManifestContent] = useState<string | null>(null);

  const handleOpen = () => {
    setOpen(true);
    setStep("form");
    setError(null);
    setAgentName("");
    setAgentDescription("");
    setAgentProvider("Claude");
    setAgentResponse(null);
    setManifestContent(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!agentName.trim()) {
      setError("Agent name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/agent/v1/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-OTAS-USER-TOKEN": otasAccessToken || "",
          "X-OTAS-PROJECT-ID": projectId || "",
        },
        body: JSON.stringify({
          agent_name: agentName,
          agent_description: agentDescription,
          agent_provider: agentProvider,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== 1) {
        throw new Error(data.status_description || "Failed to create agent.");
      }

      const agentData: AgentResponse = data.response;
      setAgentResponse(agentData);

      // Load and populate the manifest template
      const populated = buildManifest(
        AgentManifestTemplate,
        agentData.agent.project_id,
        agentData.agent_key.api_key,
        projectDomain || "{{PROJECT_DOMAIN}}",
      );
      setManifestContent(populated);

      setStep("manifest");
      onAgentCreated?.(agentData);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (manifestContent) {
      navigator.clipboard.writeText(manifestContent);
      setSnackbar("Manifest copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (!manifestContent) return;
    const blob = new Blob([manifestContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OTAS_AGENT_MANIFEST_${agentResponse?.agent.name.replace(/\s+/g, "_") || "agent"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Capsule Button */}
      <Box
        onClick={handleOpen}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 1.25,
          borderRadius: "999px",
          border: "1.5px solid",
          borderColor: "primary.main",
          cursor: "pointer",
          userSelect: "none",
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "& .capsule-icon": { color: "primary.contrastText" },
            "& .capsule-text": { color: "primary.contrastText" },
          },
          "& .capsule-icon": {
            color: "primary.main",
            transition: "color 0.2s",
          },
          "& .capsule-text": { transition: "color 0.2s" },
        }}
      >
        <SmartToyOutlinedIcon fontSize="small" className="capsule-icon" />
        <Typography
          variant="body2"
          fontWeight={600}
          className="capsule-text"
          sx={{ letterSpacing: 0.3 }}
        >
          Create Agent
        </Typography>
        <AddIcon fontSize="small" className="capsule-icon" />
      </Box>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SmartToyOutlinedIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {step === "form" ? "Create New Agent" : "Agent Created"}
            </Typography>
            {step === "manifest" && (
              <Chip
                icon={<CheckCircleOutlineIcon />}
                label="Success"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {/* ── STEP 1: FORM ── */}
          {step === "form" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Agent Name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                fullWidth
                required
                placeholder="e.g. My Research Agent"
              />

              <TextField
                label="Description"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="What does this agent do?"
              />

              <Autocomplete
                freeSolo
                options={AGENT_PROVIDER_SUGGESTIONS}
                value={agentProvider}
                onInputChange={(_, value) => setAgentProvider(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Provider"
                    placeholder="e.g. Claude, OpenAI, or enter your own"
                  />
                )}
              />

              {/* Preview info */}
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}
                >
                  Project Context
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    <b>Project ID:</b> {projectId || "—"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>Domain:</b> {projectDomain || "—"}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          {/* ── STEP 2: MANIFEST ── */}
          {step === "manifest" && agentResponse && manifestContent && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Agent key highlight */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: "success.light",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(46,125,50,0.08)"
                      : "rgba(46,125,50,0.05)",
                }}
              >
                <Typography
                  variant="caption"
                  color="success.main"
                  fontWeight={700}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}
                >
                  Agent Key — store this securely
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: "action.selected",
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    wordBreak: "break-all",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <span>{agentResponse.agent_key.api_key}</span>
                  <Tooltip title="Copy key">
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          agentResponse.agent_key.api_key,
                        );
                        setSnackbar("Agent key copied!");
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>

              {/* Manifest preview */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Agent Manifest
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Copy markdown">
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon fontSize="small" />}
                      variant="outlined"
                      onClick={handleCopy}
                    >
                      Copy
                    </Button>
                  </Tooltip>
                  <Tooltip title="Download .md file">
                    <Button
                      size="small"
                      startIcon={<DownloadIcon fontSize="small" />}
                      variant="contained"
                      onClick={handleDownload}
                    >
                      Download
                    </Button>
                  </Tooltip>
                </Box>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  maxHeight: 420,
                  overflowY: "auto",
                  "& h1, & h2, & h3": { mt: 1.5, mb: 0.5 },
                  "& code": {
                    bgcolor: "action.selected",
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontFamily: "monospace",
                    fontSize: "0.82em",
                  },
                  "& pre": {
                    bgcolor: "action.selected",
                    p: 1.5,
                    borderRadius: 1.5,
                    overflowX: "auto",
                    "& code": { bgcolor: "transparent", p: 0 },
                  },
                  "& table": { borderCollapse: "collapse", width: "100%" },
                  "& th, & td": {
                    border: "1px solid",
                    borderColor: "divider",
                    p: "6px 10px",
                    fontSize: "0.82rem",
                  },
                }}
              >
                <ReactMarkdown>{manifestContent}</ReactMarkdown>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          {step === "form" && (
            <>
              <Button onClick={handleClose} color="inherit">
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                variant="contained"
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SmartToyOutlinedIcon />
                  )
                }
              >
                {loading ? "Creating…" : "Create Agent"}
              </Button>
            </>
          )}
          {step === "manifest" && (
            <Button onClick={handleClose} variant="contained">
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={2500}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
