import {
  Box,
  Button,
  Card,
  CssBaseline,
  FormControl,
  FormLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppTheme from "../shared-ui-theme/AppTheme";
import { PASSWORD_RESET_V1_RESET_ENDPOINT } from "../constants";

export default function ResetPassword(props: { disableCustomTheme?: boolean }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const emailId = searchParams.get("emailId");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    document.title = "Reset Password";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!emailId || !token) {
      setError("Invalid or expired password reset link.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(PASSWORD_RESET_V1_RESET_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId, token, password }),
      });

      if (res.ok) {
        setSuccess("Password reset successful. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const err = await res.json();
        setError(err.statusDescription || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Reset error:", err);
      setError("Network error.");
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <Box
        sx={[
          {
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
          },
          (theme) => ({
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              zIndex: -1,
              inset: 0,
              backgroundRepeat: "no-repeat",
              backgroundImage:
                "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
              ...theme.applyStyles?.("dark", {
                backgroundImage:
                  "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
              }),
            },
          }),
        ]}
      >
        <Card
          sx={{
            p: 4,
            maxWidth: 400,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            boxShadow:
              "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
            ...(props.disableCustomTheme
              ? {}
              : {
                  "&": (theme: any) =>
                    theme.applyStyles?.("dark", {
                      boxShadow:
                        "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
                    }),
                }),
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Reset Password
          </Typography>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <FormControl>
              <FormLabel htmlFor="password">New Password</FormLabel>
              <TextField
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="confirm-password">Confirm Password</FormLabel>
              <TextField
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </FormControl>

            {error && (
              <Typography color="error" fontSize="0.9rem">
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" fontSize="0.9rem">
                {success}
              </Typography>
            )}

            <Button variant="contained" type="submit" fullWidth>
              Reset Password
            </Button>
          </form>
        </Card>
      </Box>
    </AppTheme>
  );
}
