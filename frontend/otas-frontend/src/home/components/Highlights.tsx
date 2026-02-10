import { Box, Card, Container, Grid, Stack, Typography } from "@mui/material";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import { useColorScheme } from "@mui/material/styles";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
import TerminalIcon from "@mui/icons-material/Terminal";

const items = [
  {
    icon: <ConstructionRoundedIcon fontSize="large" />,
    title: "Automated deployments",
    description:
      "Write your algorithm on our IDE and Otas takes care of all the deployments automatically on the cloud.",
  },
  {
    icon: <PsychologyIcon fontSize="large" />,
    title: "Otas AI",
    description:
      "Let Otas AI help you write your algorithms by just describing it in words.",
  },
  {
    icon: <ThumbUpAltRoundedIcon fontSize="large" />,
    title: "Great user experience",
    description:
      "Find all that you need for backtesting, paper trading and live trading on one platform.",
  },
  {
    icon: <TerminalIcon fontSize="large" />,
    title: "Cloud IDE",
    description:
      "Write, run and test your python code on the browser with ease. No installation required.",
  },
  {
    icon: <AssuredWorkloadIcon fontSize="large" />,
    title: "Broker support",
    description: "Connect with your preffered broker for your trades.",
  },
  {
    icon: <QueryStatsRoundedIcon fontSize="large" />,
    title: "Gain deeper insights",
    description:
      "Backtest and Paper trade your algorithm to battle test it before deploying it on Live trades",
  },
];

export default function Highlights() {
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = mode === "system" ? systemMode : mode;

  const isDark = resolvedMode === "dark";

  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: isDark ? "grey.100" : "grey.900",
        bgcolor: "background.default",
      }}
    >
      <Container
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: "100%", md: "60%" },
            textAlign: { sm: "left", md: "center" },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Highlights
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: isDark ? "grey.400" : "grey.600" }}
          >
            Discover what makes Otas the ultimate platform for algorithmic
            trading for everyone.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)", // 3 columns always
            gap: 2, // spacing between cards
          }}
        >
          {items.map((item, index) => (
            <Box key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: "inherit",
                  p: 3,
                  height: "100%",
                  borderColor: isDark ? "hsla(220, 25%, 25%, 0.3)" : "grey.200",
                  backgroundColor: isDark ? "grey.800" : "grey.100",
                }}
              >
                <Box
                  sx={{
                    opacity: 0.6,
                    color: isDark ? "grey.300" : "primary.main",
                  }}
                >
                  {item.icon}
                </Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: "medium" }}>
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isDark ? "grey.400" : "grey.700" }}
                  >
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
