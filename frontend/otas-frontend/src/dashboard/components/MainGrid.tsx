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

export default function MainGrid({
  projectId,
}: {
  projectId: string | undefined;
}) {
  const { user, accessToken } = useAuth();
  const [rows, setRows] = useState<Algorithm[]>([]);
  const navigate = useNavigate();

  const { mode, systemMode } = useColorScheme();
  const resolvedMode = mode === "system" ? systemMode : mode;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* cards */}
      <Grid container spacing={2} columns={12}>
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create Agent
          </Typography>
        </Box>
      </Grid>
      <Grid container spacing={2} columns={12}>
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Agent Details
          </Typography>
        </Box>
      </Grid>
    </Box>
  );
}
