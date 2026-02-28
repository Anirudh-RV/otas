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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { PROJECT_LIST_ENDPOINT } from "../constants";

interface Project {
  id: string;
  name: string;
  description: string | null;
  domain: string | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  is_active: boolean;
  created_by: string;
  privilege: number;
}

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const { otasAccessToken } = useAuth();
  const { project_id } = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [selectedPage, setSelectedPage] = useState<"home" | "analytics">(
    "home",
  );

  useEffect(() => {
    if (!otasAccessToken) return;

    const fetchProjects = async () => {
      setProjectsLoading(true);

      try {
        const res = await fetch(PROJECT_LIST_ENDPOINT, {
          headers: { "X-OTAS-USER-TOKEN": otasAccessToken },
        });

        const result = await res.json();

        if (result.status === 1) {
          setProjects(result.response_body?.projects ?? []);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, [otasAccessToken]);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Otas - Dashboard";
  }, []);

  useEffect(() => {
    if (projectsLoading) return;
    if (project_id || projects.length === 0) return;

    const firstProject = projects[0];
    navigate(`/dashboard/${firstProject.id}/#home`, { replace: true });
  }, [project_id, projects, projectsLoading, navigate]);

  const currentProject = projects.find((p) => p.id === project_id);

  useEffect(() => {
    if (projectsLoading) return;
    console.log("PROJECT LEGNTH", projects.length);
    if (projects.length === 0) {
      navigate("/projects/create/", { replace: true });
    }
  }, [projects, projectsLoading, navigate]);

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
          projects={projects}
          currentProject={currentProject}
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
            {selectedPage === "home" && (
              <MainGrid
                projectId={project_id}
                projectDomain={currentProject?.domain}
              />
            )}

            {selectedPage === "analytics" && (
              <Analytics projectId={project_id} />
            )}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
