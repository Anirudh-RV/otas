import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { Box, Typography } from "@mui/material";

import HighlightedCard from "./HighlightedCard";
import { useAuth } from "../../AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useTheme, useColorScheme } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Tooltip from "@mui/material/Tooltip";
import CreateAgent from "./CreateAgent";

export default function MainGrid({
  projectId,
  projectDomain,
}: {
  projectId: string | undefined;
  projectDomain: string | null | undefined;
}) {
  const { user, otasAccessToken } = useAuth();
  const [rows, setRows] = useState<Algorithm[]>([]);
  const navigate = useNavigate();

  const { mode, systemMode } = useColorScheme();
  const resolvedMode = mode === "system" ? systemMode : mode;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Create Agent Section */}
      <Grid container spacing={2} columns={12}>
        <Box sx={{ width: "100%", maxWidth: "100%", mb: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create Agent
          </Typography>
          <CreateAgent
            projectId={projectId}
            projectDomain={projectDomain}
            otasAccessToken={otasAccessToken}
            onAgentCreated={(agent) => {
              console.log("Agent created:", agent);
              // optionally refresh agent list here
            }}
          />
        </Box>
      </Grid>

      {/* Agent Details Section */}
      <Grid container spacing={2} columns={12} sx={{ mt: 2 }}>
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Agent Details
          </Typography>
        </Box>
      </Grid>
    </Box>
  );
}
