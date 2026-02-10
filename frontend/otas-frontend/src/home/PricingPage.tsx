import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import AppTheme from "../shared-ui-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";

export default function PricingPage(props: { disableCustomTheme?: boolean }) {
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    document.title = "Otas | Pricing";

    setTimeout(() => {
      if (location.hash) {
        const el = document.querySelector(location.hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  }, [location]);

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
        <div>
          <Pricing />
          <Divider />
          <div id="faqs">
            <FAQ />
          </div>
          <Divider />
          <Footer />
        </div>
      </Box>
    </AppTheme>
  );
}
