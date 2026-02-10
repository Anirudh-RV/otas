import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
import TerminalIcon from "@mui/icons-material/Terminal";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";

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

export default function Content() {
  return (
    <Stack
      sx={{
        flexDirection: "column",
        alignSelf: "center",
        gap: 4,
        maxWidth: 450,
      }}
    >
      <Box sx={{ display: { xs: "none", md: "flex" } }}></Box>
      {items.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2 }}>
          {item.icon}
          <div>
            <Typography gutterBottom sx={{ fontWeight: "medium" }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {item.description}
            </Typography>
          </div>
        </Stack>
      ))}
    </Stack>
  );
}
