import { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import AppTheme from "../shared-ui-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";
import Footer from "./components/Footer";

export default function CompanyPage(props: { disableCustomTheme?: boolean }) {
  useEffect(() => {
    document.title = "About Otas";
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
          sx={{
            pt: { xs: 6, sm: 12 },
            pb: { xs: 8, sm: 12 },
            maxWidth: "md",
            my: 5,
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            About Otas
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
            Empowering everyone with a better way to Trade
          </Typography>
          <Typography variant="body1">
            <strong>Otas</strong> is an algorithmic trading platform primarily
            built for people who are trying to find a smarter way to trade.
            Empower yourself to trade with the power of algorithms and AI. We
            have tools for both novice and experienced traders and we help you
            from ideation to execution. Use our AI to help you with your
            ideation and Backtest your algorithm before your make them live.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1">
            To make Otas the easiest way to do algorithmic trading and the
            smartest way to trade.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" gutterBottom>
            What Makes Otas Different?
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li>
              <Typography variant="body1">
                <strong>AI-assisted Strategy Builder:</strong> Quickly create
                trading algorithms using natural language prompts and
                intelligent templates, powered by Otas AI.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Cloud Development Environment:</strong> Write, edit and
                deploy your algorithms using Python code. Use our IDE to edit
                and run Python without any hassles of installations.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Fast and Accurate Backtesting:</strong> Test your
                strategies against high-quality historical datasets. Fine tune
                parameters and get meaningful performance metrics instantly.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Paper & Live Trading Integration:</strong> Deploy your
                strategies directly from the dashboard using integrated brokers
                and simulators.
              </Typography>
            </li>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" gutterBottom>
            Why the Name "Otas"?
          </Typography>
          <Typography variant="body1">
            "Otas" is inspired by our Founder's spoken langugaes where Zhu means
            to Build or to Create in Mandarin and Hana means Money in Kannada.
            The name perfectly matched our vision for helping our users create
            wealth through smarter forms of Trading.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" gutterBottom>
            Our Values
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li>
              <Typography variant="body1">
                <strong>Transparency First:</strong> We believe users should
                always know how their strategies behave and why.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Security by Design:</strong> Your data, your strategies
                , fully encrypted and never shared without permission.
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Continuous Learning:</strong> From model improvements to
                market coverage, we're always evolving to stay ahead of the
                curve.
              </Typography>
            </li>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" gutterBottom>
            Join Us
          </Typography>
          <Typography variant="body1" paragraph>
            Whether you're here to learn, build, or trade, you're welcome at
            Otas. Sign up for free, explore our features, and start turning your
            ideas into automated strategies.
          </Typography>
        </Container>
      </Box>
      <Footer />
    </AppTheme>
  );
}
