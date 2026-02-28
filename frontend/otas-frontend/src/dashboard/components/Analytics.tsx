import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import HighlightedCard from "./HighlightedCard";
import { useAuth } from "../../AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

export default function Analytics({
  projectId,
}: {
  projectId: string | undefined;
}) {
  const { user, otasAccessToken } = useAuth();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Analytics
      </Typography>
    </Box>
  );
}
