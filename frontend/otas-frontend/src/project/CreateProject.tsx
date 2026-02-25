import { useEffect, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AppTheme from "../shared-ui-theme/AppTheme";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useAuth } from "../AuthContext";
import Header from "../dashboard/components/Header";
import { CREATE_PROJECT_ENDPOINT } from "../constants";

export default function CreateProject(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "ekaros | Create Project";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCreateProject = async () => {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(CREATE_PROJECT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          USER_TOKEN: accessToken,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      const data = await res.json();

      if (data.status !== 1) {
        throw new Error(data.status_description || "Project creation failed");
      }

      const projectId = data.project.ID;

      navigate(`/dashboard/${projectId}`, {
        replace: true,
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box
        sx={(theme) => ({
          position: "relative",
          minHeight: "100vh",
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
        {/* Top bar */}
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
                navigate("/dashboard/");
              }
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Content */}
        <Container
          maxWidth="sm"
          sx={{
            py: 12,
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box width="100%">
            <Typography variant="h3" gutterBottom>
              Create Project
            </Typography>

            <Typography variant="body1" color="text.secondary" mb={4}>
              Create a new project to start tracking journeys and analytics.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Project Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 4 }}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleCreateProject}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Project"
              )}
            </Button>
          </Box>
        </Container>
      </Box>
    </AppTheme>
  );
}
