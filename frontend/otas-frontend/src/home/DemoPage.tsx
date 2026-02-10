import { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AppTheme from "../shared-ui-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";

export default function DemoPage(props: { disableCustomTheme?: boolean }) {
  useEffect(() => {
    document.title = "Otas | Demo";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />
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
        <Container
          maxWidth="md"
          sx={{
            py: 12,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            textAlign: "center",
          }}
        >
          <Box>
            <Typography variant="h3" gutterBottom>
              Demo
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Coming soon. Stay tuned for updates, insights, and trading
              strategies.
            </Typography>
          </Box>
        </Container>
      </Box>
    </AppTheme>
  );
}
