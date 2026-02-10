import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { CircularProgress, Box, Typography } from "@mui/material";
import { PASSWORD_RESET_V1_INIT_ENDPOINT } from "../../constants";

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({
  open,
  handleClose,
}: ForgotPasswordProps) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(PASSWORD_RESET_V1_INIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: email }),
      });

      if (res.ok) {
        setShowSuccessPopup(true);
      } else {
        const error = await res.json();
        alert(error.statusDescription || "Failed to send reset link.");
      }
    } catch (err) {
      console.error("Password reset request failed", err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    setEmail("");
    handleClose();
  };

  return (
    <>
      {/* Main Reset Password Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            component: "form",
            onSubmit: handleSubmit,
            sx: { backgroundImage: "none" },
          },
        }}
      >
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
          }}
        >
          <DialogContentText>
            Enter your account&apos;s email address, and we&apos;ll send you a
            link to reset your password.
          </DialogContentText>
          <OutlinedInput
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            placeholder="Email address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} /> Sending
              </Box>
            ) : (
              "Continue"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Success Popup */}
      <Dialog open={showSuccessPopup} onClose={handleSuccessClose}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: 4,
            py: 5,
            textAlign: "center",
            minWidth: "300px",
          }}
        >
          <CheckCircleIcon
            sx={{ fontSize: 60, color: "success.main", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Check your email
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We've sent a link to reset your password.
          </Typography>
          <Button
            onClick={handleSuccessClose}
            variant="contained"
            sx={{ mt: 3 }}
          >
            Close
          </Button>
        </Box>
      </Dialog>
    </>
  );
}
