import { styled } from "@mui/material/styles";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";

import MenuContent from "./MenuContent";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;
const CREATE_PROJECT_VALUE = "__create__";

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

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

export default function SideMenu({
  selectedPage,
  onSelectPage,
  projects,
  currentProject,
}: {
  selectedPage: "home" | "analytics";
  onSelectPage: (page: "home" | "analytics") => void;
  projects: Project[];
  currentProject?: Project;
}) {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: "24pt", fontWeight: 600 }}>
          OT
          <Typography
            component="span"
            sx={{ fontSize: "24pt", color: "primary.main" }}
          >
            AS
          </Typography>
        </Typography>
      </Box>

      <Divider />

      {/* Project selector */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Project
        </Typography>

        <Tooltip title="">
          <Select
            fullWidth
            size="small"
            value={currentProject?.id || ""}
            onChange={(e) => {
              const value = e.target.value;

              if (value === CREATE_PROJECT_VALUE) {
                navigate("/projects/create");
                return;
              }

              navigate(`/dashboard/${value}/#home`, { replace: true });
            }}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                <Typography variant="body2" fontWeight={500}>
                  {project.name}
                </Typography>
              </MenuItem>
            ))}

            <Divider />

            <MenuItem value={CREATE_PROJECT_VALUE}>
              <Typography variant="body2" fontWeight={500} color="primary.main">
                + Create Project
              </Typography>
            </MenuItem>
          </Select>
        </Tooltip>
      </Box>

      <Divider />

      {/* Menu */}
      <Box sx={{ overflow: "auto", flexGrow: 1 }}>
        <MenuContent selectedPage={selectedPage} onSelectPage={onSelectPage} />
      </Box>
    </Drawer>
  );
}
