import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Divider,
  MenuItem,
  Chip,
} from "@mui/material";
import AppTheme from "../shared-ui-theme/AppTheme";
import { useAuth } from "../AuthContext";
import {
  USER_FIELDS_EDIT_V1_ENDPOINT,
  PASSWORD_UPDATE_V1_ENDPOINT,
  AGENT_LIST_V1_ENDPOINT,
  AGENT_KEY_REVOKE_ENDPOINT,
  BACKEND_SDK_KEY_LIST_ENDPOINT,
  BACKEND_SDK_KEY_REVOKE_ENDPOINT,
} from "../constants";
import ColorModeIconDropdown from "../shared-ui-theme/ColorModeIconDropdown";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useSearchParams } from "react-router-dom";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import KeyIcon from "@mui/icons-material/Key";
import BlockIcon from "@mui/icons-material/Block";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

interface AgentKey {
  id: string;
  prefix: string;
  name: string | null;
  created_at: string;
  expires_at: string | null;
  active: boolean;
}

interface BackendSdkKey {
  id: string;
  prefix: string;
  name: string | null;
  created_at: string;
  expires_at: string | null;
  active: boolean;
  revoked_at: string | null;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  provider: string;
  is_active: boolean;
  agent_keys: AgentKey[];
}

export default function Account(props: { disableCustomTheme?: boolean }) {
  const { user, accessToken, refreshAuth, clearAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";

  const [selectedMenu, setSelectedMenu] = useState<
    "user" | "resetPassword" | "agentKeys" | "backendSdkKeys"
  >("user");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const [backendSdkKeys, setBackendSdkKeys] = useState<BackendSdkKey[]>([]);
  const [backendSdkKeysLoading, setBackendSdkKeysLoading] = useState(false);
  const [revokingBackendKeyId, setRevokingBackendKeyId] = useState<
    string | null
  >(null);
  const [snackBarSuccessValue, snackBarPromptSuccess] = useState<string | null>(
    null,
  );
  const [snackBarErrorValue, snackBarPromptError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    document.title = "Otas | Account";
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (user) {
      setFirstName(user.first_name);
      setMiddleName(user.middle_name ?? "");
      setLastName(user.last_name);
    }
  }, [user]);

  useEffect(() => {
    if (selectedMenu === "agentKeys" && projectId && accessToken) {
      fetchAgents();
    }
  }, [selectedMenu]);

  useEffect(() => {
    if (selectedMenu === "backendSdkKeys" && projectId && accessToken) {
      fetchBackendSdkKeys();
    }
  }, [selectedMenu]);

  const fetchAgents = async () => {
    if (!accessToken || !projectId) return;
    setAgentsLoading(true);
    setAgents([]);
    setSelectedAgentId("");
    try {
      const res = await fetch(AGENT_LIST_V1_ENDPOINT, {
        method: "GET",
        headers: {
          "X-OTAS-USER-TOKEN": accessToken,
          "X-OTAS-PROJECT-ID": projectId,
        },
      });
      const data = await res.json();
      if (data.status === 1) setAgents(data.response.agents ?? []);
      else snackBarPromptError("Failed to load agents.");
    } catch {
      snackBarPromptError("Network error loading agents.");
    } finally {
      setAgentsLoading(false);
    }
  };

  const fetchBackendSdkKeys = async () => {
    if (!accessToken || !projectId) return;
    setBackendSdkKeysLoading(true);
    setBackendSdkKeys([]);
    try {
      const res = await fetch(BACKEND_SDK_KEY_LIST_ENDPOINT, {
        method: "GET",
        headers: {
          "X-OTAS-USER-TOKEN": accessToken,
          "X-OTAS-PROJECT-ID": projectId,
        },
      });
      const data = await res.json();
      if (data.status === 1) setBackendSdkKeys(data.response_body?.keys ?? []);
      else snackBarPromptError("Failed to load backend SDK keys.");
    } catch {
      snackBarPromptError("Network error loading backend SDK keys.");
    } finally {
      setBackendSdkKeysLoading(false);
    }
  };

  const handleRevokeBackendKey = async (keyId: string) => {
    if (!accessToken || !projectId) return;
    setRevokingBackendKeyId(keyId);
    try {
      const res = await fetch(BACKEND_SDK_KEY_REVOKE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-OTAS-USER-TOKEN": accessToken,
          "X-OTAS-PROJECT-ID": projectId,
        },
        body: JSON.stringify({ sdk_key_id: keyId }),
      });
      const data = await res.json();
      if (data.status === 1) {
        setBackendSdkKeys((prev) =>
          prev.map((k) => (k.id === keyId ? { ...k, active: false } : k)),
        );
        snackBarPromptSuccess("Backend SDK key revoked successfully.");
      } else {
        snackBarPromptError(data.status_description || "Failed to revoke key.");
      }
    } catch {
      snackBarPromptError("Network error revoking key.");
    } finally {
      setRevokingBackendKeyId(null);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!accessToken || !projectId) return;
    setRevokingKeyId(keyId);
    try {
      const res = await fetch(AGENT_KEY_REVOKE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-OTAS-USER-TOKEN": accessToken,
          "X-OTAS-PROJECT-ID": projectId,
        },
        body: JSON.stringify({ agent_key_id: keyId }),
      });
      const data = await res.json();
      if (data.status === 1) {
        setAgents((prev) =>
          prev.map((agent) => ({
            ...agent,
            agent_keys: agent.agent_keys.map((k) =>
              k.id === keyId ? { ...k, active: false } : k,
            ),
          })),
        );
        snackBarPromptSuccess("Key revoked successfully.");
      } else {
        snackBarPromptError("Failed to revoke key.");
      }
    } catch {
      snackBarPromptError("Network error revoking key.");
    } finally {
      setRevokingKeyId(null);
    }
  };

  const handleSave = async () => {
    if (!accessToken) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(USER_FIELDS_EDIT_V1_ENDPOINT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-OTAS-USER-TOKEN": accessToken,
        },
        body: JSON.stringify({
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
        }),
      });
      if (!res.ok) {
        snackBarPromptError("Failed to update profile.");
        return;
      }
      refreshAuth();
      snackBarPromptSuccess("Profile updated!");
    } catch {
      snackBarPromptError("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!accessToken) return;
    if (!newPassword) {
      snackBarPromptError("Password cannot be empty");
      return;
    }
    if (newPassword !== confirmPassword) {
      snackBarPromptError("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(PASSWORD_UPDATE_V1_ENDPOINT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          USER_TOKEN: accessToken,
        },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        snackBarPromptError("Failed to reset password.");
        return;
      }
      setNewPassword("");
      setConfirmPassword("");
      snackBarPromptSuccess("Password updated!");
    } catch {
      snackBarPromptError("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box
        sx={(theme) => ({
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: -1,
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 4,
            pt: 3,
          }}
        >
          <IconButton size="small" onClick={() => navigate(-1)}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <ColorModeIconDropdown
            sx={{ position: "fixed", top: "1rem", right: "1rem" }}
          />
        </Box>

        <Container maxWidth="md" sx={{ display: "flex", py: 10 }}>
          {/* Sidebar */}
          <Box
            sx={{
              pr: 3,
              borderRight: "1px solid",
              borderColor: "divider",
              minWidth: 190,
            }}
          >
            <List disablePadding>
              <ListItemButton
                selected={selectedMenu === "user"}
                onClick={() => setSelectedMenu("user")}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  px: 2,
                  ...(selectedMenu === "user" && {
                    backgroundColor: "action.selected",
                  }),
                }}
              >
                <ListItemText primary="Profile" />
              </ListItemButton>
              <ListItemButton
                selected={selectedMenu === "resetPassword"}
                onClick={() => setSelectedMenu("resetPassword")}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  px: 2,
                  ...(selectedMenu === "resetPassword" && {
                    backgroundColor: "action.selected",
                  }),
                }}
              >
                <ListItemText primary="Reset Password" />
              </ListItemButton>
              <ListItemButton
                selected={selectedMenu === "agentKeys"}
                onClick={() => setSelectedMenu("agentKeys")}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  px: 2,
                  ...(selectedMenu === "agentKeys" && {
                    backgroundColor: "action.selected",
                  }),
                }}
              >
                <KeyIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                <ListItemText primary="Agent Keys" />
              </ListItemButton>
              <ListItemButton
                selected={selectedMenu === "backendSdkKeys"}
                onClick={() => setSelectedMenu("backendSdkKeys")}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  px: 2,
                  ...(selectedMenu === "backendSdkKeys" && {
                    backgroundColor: "action.selected",
                  }),
                }}
              >
                <VpnKeyIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                <ListItemText primary="Backend SDK Keys" />
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  clearAuth();
                  navigate("/");
                }}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  px: 2,
                  mt: 2,
                  color: "error.main",
                }}
              >
                <LogoutRoundedIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "error.main" }}
                />
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 600 }}>Logout</Typography>
                  }
                />
              </ListItemButton>
            </List>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, pl: 4 }}>
            {selectedMenu === "user" && (
              <>
                <Typography variant="h4" gutterBottom>
                  Edit Profile
                </Typography>
                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      First Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Middle Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Last Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </Box>
              </>
            )}

            {selectedMenu === "resetPassword" && (
              <>
                <Typography variant="h4" gutterBottom>
                  Reset Password
                </Typography>
                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      New Password
                    </Typography>
                    <TextField
                      type="password"
                      fullWidth
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Confirm Password
                    </Typography>
                    <TextField
                      type="password"
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleResetPassword}
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                </Box>
              </>
            )}

            {selectedMenu === "agentKeys" && (
              <>
                <Typography variant="h4" gutterBottom>
                  Agent Keys
                </Typography>
                {!projectId ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    No project selected. Please navigate here from the Dashboard
                    with a project selected.
                  </Typography>
                ) : agentsLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 6 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Select an agent to view and manage its API keys.
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Agent
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      sx={{ mb: 3 }}
                    >
                      {agents.length === 0 ? (
                        <MenuItem disabled value="">
                          No agents found in this project
                        </MenuItem>
                      ) : (
                        agents.map((a) => (
                          <MenuItem key={a.id} value={a.id}>
                            {a.name}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              ({a.provider})
                            </Typography>
                          </MenuItem>
                        ))
                      )}
                    </TextField>

                    {selectedAgent && (
                      <>
                        <Divider sx={{ mb: 2 }} />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            Keys for <em>{selectedAgent.name}</em>
                          </Typography>
                          <Chip
                            label={`${selectedAgent.agent_keys.length} key${selectedAgent.agent_keys.length !== 1 ? "s" : ""}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        {selectedAgent.agent_keys.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No active keys for this agent.
                          </Typography>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1.5,
                            }}
                          >
                            {selectedAgent.agent_keys.map((key) => (
                              <Box
                                key={key.id}
                                sx={(theme) => ({
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  px: 2,
                                  py: 1.5,
                                  borderRadius: 2,
                                  border: "1px solid",
                                  borderColor: key.active
                                    ? "divider"
                                    : "error.main",
                                  backgroundColor: key.active
                                    ? theme.palette.mode === "dark"
                                      ? "rgba(255,255,255,0.03)"
                                      : "rgba(0,0,0,0.02)"
                                    : theme.palette.mode === "dark"
                                      ? "rgba(255,0,0,0.05)"
                                      : "rgba(255,0,0,0.03)",
                                })}
                              >
                                <Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mb: 0.5,
                                    }}
                                  >
                                    <KeyIcon
                                      fontSize="small"
                                      sx={{
                                        color: key.active
                                          ? "primary.main"
                                          : "error.main",
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      sx={{ fontFamily: "monospace" }}
                                    >
                                      {key.prefix}••••••••
                                    </Typography>
                                    <Chip
                                      label={key.active ? "Active" : "Inactive"}
                                      color={key.active ? "success" : "error"}
                                      size="small"
                                    />
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 3.5 }}
                                  >
                                    Created: {formatDate(key.created_at)}
                                    {key.expires_at &&
                                      `  ·  Expires: ${formatDate(key.expires_at)}`}
                                  </Typography>
                                </Box>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={
                                    revokingKeyId === key.id ? (
                                      <CircularProgress
                                        size={14}
                                        color="error"
                                      />
                                    ) : (
                                      <BlockIcon fontSize="small" />
                                    )
                                  }
                                  disabled={
                                    !key.active || revokingKeyId === key.id
                                  }
                                  onClick={() => handleRevoke(key.id)}
                                  sx={{ ml: 2, whiteSpace: "nowrap" }}
                                >
                                  {revokingKeyId === key.id
                                    ? "Revoking..."
                                    : key.active
                                      ? "Revoke"
                                      : "Revoked"}
                                </Button>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {selectedMenu === "backendSdkKeys" && (
              <>
                <Typography variant="h4" gutterBottom>
                  Backend SDK Keys
                </Typography>
                {!projectId ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    No project selected. Please navigate here from the Dashboard
                    with a project selected.
                  </Typography>
                ) : backendSdkKeysLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 6 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Backend SDK keys are used to authenticate your server with
                      the OTAS API. Create keys from the Dashboard; revoke them
                      here when no longer needed.
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        Project SDK Keys
                      </Typography>
                      <Chip
                        label={`${backendSdkKeys.length} key${backendSdkKeys.length !== 1 ? "s" : ""}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    {backendSdkKeys.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No backend SDK keys for this project.
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                        }}
                      >
                        {backendSdkKeys.map((key) => (
                          <Box
                            key={key.id}
                            sx={(theme) => ({
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              px: 2,
                              py: 1.5,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: key.active
                                ? "divider"
                                : "error.main",
                              backgroundColor: key.active
                                ? theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.03)"
                                  : "rgba(0,0,0,0.02)"
                                : theme.palette.mode === "dark"
                                  ? "rgba(255,0,0,0.05)"
                                  : "rgba(255,0,0,0.03)",
                            })}
                          >
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 0.5,
                                }}
                              >
                                <VpnKeyIcon
                                  fontSize="small"
                                  sx={{
                                    color: key.active
                                      ? "primary.main"
                                      : "error.main",
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{ fontFamily: "monospace" }}
                                >
                                  otas_{key.prefix}••••••••
                                </Typography>
                                {key.name && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ({key.name})
                                  </Typography>
                                )}
                                <Chip
                                  label={key.active ? "Active" : "Revoked"}
                                  color={key.active ? "success" : "error"}
                                  size="small"
                                />
                              </Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 3.5 }}
                              >
                                Created: {formatDate(key.created_at)}
                                {key.expires_at &&
                                  `  ·  Expires: ${formatDate(key.expires_at)}`}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={
                                revokingBackendKeyId === key.id ? (
                                  <CircularProgress size={14} color="error" />
                                ) : (
                                  <BlockIcon fontSize="small" />
                                )
                              }
                              disabled={
                                !key.active || revokingBackendKeyId === key.id
                              }
                              onClick={() => handleRevokeBackendKey(key.id)}
                              sx={{ ml: 2, whiteSpace: "nowrap" }}
                            >
                              {revokingBackendKeyId === key.id
                                ? "Revoking..."
                                : key.active
                                  ? "Revoke"
                                  : "Revoked"}
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        </Container>

        <Snackbar
          open={!!snackBarSuccessValue}
          autoHideDuration={4000}
          onClose={() => snackBarPromptSuccess(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => snackBarPromptSuccess(null)}
            severity="success"
            variant="outlined"
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              color: "text.primary",
              borderColor: "success.main",
              boxShadow: 2,
            }}
            iconMapping={{ success: <span>✅</span> }}
          >
            {snackBarSuccessValue}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!snackBarErrorValue}
          autoHideDuration={4000}
          onClose={() => snackBarPromptError(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => snackBarPromptError(null)}
            severity="error"
            variant="outlined"
            sx={{
              width: "100%",
              bgcolor: "background.default",
              color: "text.primary",
              borderColor: "error.main",
              boxShadow: 2,
            }}
            iconMapping={{ error: <span>❌</span> }}
          >
            {snackBarErrorValue}
          </Alert>
        </Snackbar>
      </Box>
    </AppTheme>
  );
}
