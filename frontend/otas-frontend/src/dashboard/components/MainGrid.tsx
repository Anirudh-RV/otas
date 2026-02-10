import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";

import HighlightedCard from "./HighlightedCard";
import { useAuth } from "../../AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useTheme, useColorScheme } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Tooltip from "@mui/material/Tooltip";

interface Algorithm {
  id: string;
  scriptName: string;
  scriptUrl: string;
  order_domain: string;
  created_at: string;
  updated_at: string;
}

interface Run {
  ID: string;
  OrderDomain: string;
  Status: string;
  Market: string;
  Symbol: string;
  StartTime: string;
  EndTime: string;
  Frequency: string;
  PortfolioSize: number;
}

export default function MainGrid() {
  const { user, accessToken } = useAuth();
  const [rows, setRows] = useState<Algorithm[]>([]);
  const navigate = useNavigate();

  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [runsMap, setRunsMap] = useState<Record<string, Run[]>>({});

  const { mode, systemMode } = useColorScheme();
  const resolvedMode = mode === "system" ? systemMode : mode;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Details
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ width: "100%", maxWidth: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Agent Details
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack
            gap={2}
            direction={{ xs: "column", sm: "row", lg: "column" }}
          ></Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
