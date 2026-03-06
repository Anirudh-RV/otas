import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import { useAuth } from "../../AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

export default function Analytics({
  projectId,
  agents,
}: {
  projectId: string | undefined;
  agents: any[];
}) {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read agent_id from URL, fall back to first agent
  const agentIdFromUrl = searchParams.get("agent_id");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  const setAgentInUrl = (id: string, replace = false) => {
    const next = new URLSearchParams(searchParams);
    next.set("agent_id", id);
    navigate({ search: next.toString(), hash: "analytics" }, { replace });
  };

  // Once agents load, initialise selection
  useEffect(() => {
    if (agents.length === 0) return;

    if (agentIdFromUrl && agents.some((a) => a.id === agentIdFromUrl)) {
      setSelectedAgentId(agentIdFromUrl);
    } else {
      // Default to first agent and write it into the URL
      const firstId = agents[0].id;
      setSelectedAgentId(firstId);
      setAgentInUrl(firstId, true);
    }
  }, [agents, agentIdFromUrl]);

  const handleAgentChange = (newId: string) => {
    setSelectedAgentId(newId);
    setAgentInUrl(newId, true);
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Analytics
      </Typography>

      {/* Agent selector */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="agent-select-label">Agent</InputLabel>
          <Select
            labelId="agent-select-label"
            value={selectedAgentId}
            label="Agent"
            onChange={(e) => handleAgentChange(e.target.value)}
            disabled={agents.length === 0}
          >
            {agents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>{agent.name}</span>
                  <Chip
                    label={agent.provider}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.65rem", height: 18 }}
                  />
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedAgent && (
          <Typography variant="body2" color="text.secondary">
            {selectedAgent.description}
          </Typography>
        )}
      </Stack>

      {/* Analytics content for selectedAgent goes here */}
    </Box>
  );
}
