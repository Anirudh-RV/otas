import { useEffect } from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppNavbar from "./components/AppNavbar";
import Header from "./components/Header";
import MainGrid from "./components/MainGrid";
import SideMenu from "./components/SideMenu";
import AppTheme from "../shared-ui-theme/AppTheme";
import Analytics from "./components/Analytics";
import { useSearchParams } from "react-router-dom";

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const [selectedPage, setSelectedPage] = useState<"home" | "analytics">(
    "home",
  );

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Otas - Dashboard";
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "analytics" || hash === "home") {
        setSelectedPage(hash as typeof selectedPage);
      }
    };

    handleHashChange(); // run once on mount

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu
          selectedPage={selectedPage}
          onSelectPage={(page) => {
            setSelectedPage(page);
            const params = new URLSearchParams(searchParams);
            params.delete("session_id");
            setSearchParams(params, { replace: true });
            window.location.hash = page;
          }}
        />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            overflow: "auto",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              zIndex: -1,
              inset: 0,
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
          <Stack
            spacing={2}
            sx={{ alignItems: "center", mx: 2, pb: 5, mt: { xs: 8, md: 0 } }}
          >
            <Header />
            {selectedPage === "home" && <MainGrid />}
            {selectedPage === "analytics" && <Analytics />}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
