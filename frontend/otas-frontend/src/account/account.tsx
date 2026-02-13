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
} from "@mui/material";
import AppTheme from "../shared-ui-theme/AppTheme";
import { useAuth } from "../AuthContext";
import {
  USER_FIELDS_EDIT_V1_ENDPOINT,
  PASSWORD_UPDATE_V1_ENDPOINT,
} from "../constants";
import ColorModeIconDropdown from "../shared-ui-theme/ColorModeIconDropdown";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function Account(props: { disableCustomTheme?: boolean }) {
  const { user, accessToken, refreshAuth, clearAuth } = useAuth();

  const [selectedMenu, setSelectedMenu] = useState<"user" | "resetPassword">(
    "user",
  );
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackBarSuccessValue, snackBarPromptSuccess] = useState<string | null>(
    null,
  );
  const [snackBarErrorValue, snackBarPromptError] = useState<string | null>(
    null,
  );

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Otas | Edit Profile";
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (user) {
      setFirstName(user.first_name);
      setMiddleName(user.middle_name ?? "");
      setLastName(user.last_name);
    }
  }, [user]);

  const handleSave = async () => {
    if (!accessToken) {
      alert("User not authenticated");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateRes = await fetch(USER_FIELDS_EDIT_V1_ENDPOINT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          USER_TOKEN: accessToken,
        },
        body: JSON.stringify({
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
        }),
      });

      if (!updateRes.ok) {
        const err = await updateRes.json();
        console.error("Update failed", err);
        alert("Failed to update profile.");
        return;
      }

      refreshAuth();
      snackBarPromptSuccess("User fields updated!");
    } catch (err) {
      console.error("Network error", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!accessToken) {
      snackBarPromptError("Password update Error");
      return;
    }

    if (newPassword === "") {
      snackBarPromptError("Passwords cannot be empty");
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
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Reset failed", err);
        snackBarPromptError("Failed to reset password.");
        return;
      }

      // Clear input fields
      setNewPassword("");
      setConfirmPassword("");

      // Show success Snackbar
      snackBarPromptSuccess("Password updated");
    } catch (err) {
      console.error("Network error", err);
      snackBarPromptError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  <ColorModeIconDropdown
    sx={{ position: "fixed", top: "1rem", right: "1rem" }}
  />;

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
        {/* Top bar: back button (left) and color picker (right) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 4,
            pt: 3,
          }}
        >
          <IconButton
            size="small"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/dashboard");
              }
            }}
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          {/* Replace this with your actual color picker component */}
          <ColorModeIconDropdown
            sx={{ position: "fixed", top: "1rem", right: "1rem" }}
          />
          ;
        </Box>

        {/* Main layout with left divider + form */}
        <Container maxWidth="md" sx={{ display: "flex", py: 10 }}>
          {/* Vertical Divider Menu */}
          <Box
            sx={{
              pr: 3,
              borderRight: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              gap: 1,
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
                onClick={() => {
                  clearAuth(); // Clear tokens and user
                  navigate("/"); // Redirect to login
                }}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  px: 2,
                  mt: 2,
                  color: "error.main",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <LogoutRoundedIcon
                  fontSize="small"
                  sx={{
                    marginRight: 1,
                    color: "error.main",
                  }}
                />
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 600 }}>Logout</Typography>
                  }
                />
              </ListItemButton>
            </List>
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, pl: 4 }}>
            {selectedMenu === "user" ? (
              <>
                <Typography variant="h4" gutterBottom align="left">
                  Edit Profile
                </Typography>
                <Box
                  component="form"
                  noValidate
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
            ) : (
              <>
                <Typography variant="h4" gutterBottom align="left">
                  Reset Password
                </Typography>
                <Box
                  component="form"
                  noValidate
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

                  <Button variant="contained" onClick={handleResetPassword}>
                    Submit
                  </Button>
                </Box>
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
            iconMapping={{
              success: <span>✅</span>,
            }}
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
            iconMapping={{
              error: <span>❌</span>,
            }}
          >
            {snackBarErrorValue}
          </Alert>
        </Snackbar>
      </Box>
    </AppTheme>
  );
}
