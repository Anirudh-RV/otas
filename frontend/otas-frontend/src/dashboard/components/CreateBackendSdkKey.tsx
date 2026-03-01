import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import {
  BACKEND_SDK_KEY_CREATE_ENDPOINT,
} from "../../constants";

interface BackendSdkKeyResponse {
  id: string;
  prefix: string;
  api_key: string;
  project_id: string;
  name: string | null;
  created_at: string;
  expires_at: string | null;
  active: boolean;
}

interface CreateBackendSdkKeyProps {
  projectId: string | undefined;
  otasAccessToken: string | undefined;
}

export default function CreateBackendSdkKey({
  projectId,
  otasAccessToken,
}: CreateBackendSdkKeyProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [validity, setValidity] = useState<number>(30);
  const [keyResponse, setKeyResponse] = useState<BackendSdkKeyResponse | null>(
    null,
  );

  const handleOpen = () => {
    setOpen(true);
    setStep("form");
    setLoading(false);
    setError(null);
    setValidity(30);
    setKeyResponse(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!otasAccessToken || !projectId) {
      setError("Missing user token or project id.");
      return;
    }

    if (!Number.isInteger(validity) || validity < 1 || validity > 300) {
      setError("Validity must be an integer between 1 and 300.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(BACKEND_SDK_KEY_CREATE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-OTAS-USER-TOKEN": otasAccessToken,
          "X-OTAS-PROJECT-ID": projectId,
        },
        body: JSON.stringify({ validity }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== 1) {
        throw new Error(data.status_description || "Failed to create SDK key.");
      }

      setKeyResponse(data.response_body as BackendSdkKeyResponse);
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!keyResponse?.api_key) return;
    navigator.clipboard.writeText(keyResponse.api_key);
    setSnackbar("Backend SDK key copied!");
  };

  return (
    <>
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
        <KeyOutlinedIcon fontSize="small" className="capsule-icon" />
        <Typography
          variant="body2"
          fontWeight={600}
          className="capsule-text"
          sx={{ letterSpacing: 0.3 }}
        >
          Create Backend SDK Key
        </Typography>
        <AddIcon fontSize="small" className="capsule-icon" />
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <KeyOutlinedIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {step === "form" ? "Create Backend SDK Key" : "SDK Key Created"}
            </Typography>
            {step === "success" && (
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
          {step === "form" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Validity (days)"
                type="number"
                value={validity}
                onChange={(e) => setValidity(Number(e.target.value))}
                inputProps={{ min: 1, max: 300 }}
                fullWidth
                required
              />

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
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <b>Project ID:</b> {projectId || "—"}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          {step === "success" && keyResponse && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Alert severity="warning">
                This key is shown only once. Store it securely now.
              </Alert>

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
                  Backend SDK Key
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
                  <span>{keyResponse.api_key}</span>
                  <Tooltip title="Copy key">
                    <IconButton size="small" onClick={handleCopyKey}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>

              <Typography variant="body2" color="text.secondary">
                <b>Prefix:</b> {keyResponse.prefix}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>Expires At:</b> {keyResponse.expires_at || "Never"}
              </Typography>
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
                    <KeyOutlinedIcon />
                  )
                }
              >
                {loading ? "Creating..." : "Create SDK Key"}
              </Button>
            </>
          )}
          {step === "success" && (
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
