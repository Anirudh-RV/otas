import * as React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import MuiChip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import TerminalIcon from "@mui/icons-material/Terminal";
import TimelineIcon from "@mui/icons-material/Timeline";
import BugReportIcon from "@mui/icons-material/BugReport";
import { useColorScheme } from "@mui/material/styles";

const items = [
  {
    icon: <TerminalIcon />,
    title: "One-File Integration",
    description:
      "Drop a single manifest file into your agent. That's the entire setup.",
    points: [
      "Add otas_agent_manifest.md to your agent — no SDK wiring, no config files.",
      "Works with any Python-based agent or backend framework out of the box.",
      "Generate and revoke agent keys from the dashboard in seconds.",
    ],
    imageLight: `url("/images/manifest-light.png")`,
    imageDark: `url("/images/manifest-dark.png")`,
  },
  {
    icon: <TimelineIcon />,
    title: "Full API Observability",
    description:
      "Every API call your agent makes is captured, timestamped, and surfaced automatically.",
    points: [
      "See every path your agent hits across all sessions in a single bar graph view.",
      "Inspect individual sessions as a step-by-step DAG — each action as a node.",
      "Track latency distributions, log counts per day, and session frequency over time.",
    ],
    imageLight: `url("/images/dag-light.png")`,
    imageDark: `url("/images/dag-dark.png")`,
  },
  {
    icon: <BugReportIcon />,
    title: "Counts, Latency, Error & Anomaly Tracking",
    description:
      "Track counts, measure latencies, catch failures before your users do. Monitor latencies & error rates and drill into exactly where things broke.",
    points: [
      "A wide array of anayltics for everything you want to know about your agents.",
      "Expand any graph into a full-screen view for deeper inspection.",
      "Agent log API lets your agent emit structured logs tied to its session.",
    ],
    imageLight: `url("/images/analytics-light.png")`,
    imageDark: `url("/images/analytics-dark.png")`,
  },
];

interface ChipProps {
  selected?: boolean;
}

const Chip = styled(MuiChip)<ChipProps>(({ theme }) => ({
  variants: [
    {
      props: ({ selected }) => !!selected,
      style: {
        background:
          "linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))",
        color: "hsl(0, 0%, 100%)",
        borderColor: (theme.vars || theme).palette.primary.light,
        "& .MuiChip-label": {
          color: "hsl(0, 0%, 100%)",
        },
        ...theme.applyStyles?.("dark", {
          borderColor: (theme.vars || theme).palette.primary.dark,
        }),
      },
    },
  ],
}));

interface MobileLayoutProps {
  selectedItemIndex: number;
  handleItemClick: (index: number) => void;
  selectedFeature: (typeof items)[0];
}

function extractUrl(cssUrl: string): string {
  return cssUrl.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
}

export function MobileLayout({
  selectedItemIndex,
  handleItemClick,
  selectedFeature,
}: MobileLayoutProps) {
  if (!items[selectedItemIndex]) return null;

  return (
    <Box
      sx={{
        display: { xs: "flex", sm: "none" },
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, overflow: "auto" }}>
        {items.map(({ title }, index) => (
          <Chip
            size="medium"
            key={index}
            label={title}
            onClick={() => handleItemClick(index)}
            selected={selectedItemIndex === index}
          />
        ))}
      </Box>
      <Card variant="outlined">
        <Box
          sx={(theme) => ({
            mb: 2,
            display: { xs: "block", md: "none" },
            backgroundSize: "contain",
            backgroundPosition: "center",
            minHeight: 280,
            backgroundImage: "var(--items-imageLight)",
            ...theme.applyStyles?.("dark", {
              backgroundImage: "var(--items-imageDark)",
            }),
          })}
          style={
            items[selectedItemIndex]
              ? ({
                  "--items-imageLight": items[selectedItemIndex].imageLight,
                  "--items-imageDark": items[selectedItemIndex].imageDark,
                } as any)
              : {}
          }
        />

        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            gutterBottom
            sx={{ color: "text.primary", fontWeight: "medium" }}
          >
            {selectedFeature.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            {selectedFeature.description}
          </Typography>
          {selectedFeature.points?.length && (
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              {selectedFeature.points.map((point, idx) => (
                <Typography
                  key={idx}
                  component="li"
                  variant="body2"
                  sx={{ mb: 0.5 }}
                >
                  {point}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
}

export default function Features() {
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = mode === "system" ? systemMode : mode;

  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
  };

  const selectedFeature = items[selectedItemIndex];

  const imageUrl = extractUrl(
    resolvedMode === "dark"
      ? selectedFeature.imageDark
      : selectedFeature.imageLight,
  );

  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      <Box sx={{ width: { sm: "100%", md: "60%" }, mb: { xs: 4, sm: 6 } }}>
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          How It Works
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          OTAS gives you complete visibility into your AI agents — what APIs
          they call, how they behave across sessions, and where they fail. Setup
          takes one file. Everything else is automatic.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row-reverse" },
          gap: 2,
        }}
      >
        {/* Desktop list */}
        <div>
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            {items.map(({ icon, title, description, points }, index) => (
              <Box
                key={index}
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={[
                  (theme) => ({
                    p: 2,
                    height: "100%",
                    width: "100%",
                    textAlign: "left",
                    "&:hover": {
                      backgroundColor: (theme.vars || theme).palette.action
                        .hover,
                    },
                  }),
                  selectedItemIndex === index && {
                    backgroundColor: "action.selected",
                  },
                ]}
              >
                <Box
                  sx={[
                    {
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 1,
                      textTransform: "none",
                      color: "text.secondary",
                    },
                    selectedItemIndex === index && {
                      color: "text.primary",
                    },
                  ]}
                >
                  {icon}
                  <Typography variant="h6">{title}</Typography>
                  <Typography variant="body2">{description}</Typography>
                  {points?.length && (
                    <Box component="ul" sx={{ pl: 3, mt: 1 }}>
                      {points.map((point, idx) => (
                        <Typography
                          key={idx}
                          component="li"
                          variant="body2"
                          sx={{ mb: 0.5 }}
                        >
                          {point}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              flexDirection: "column",
              width: "100%",
            }}
          >
            <MobileLayout
              selectedItemIndex={selectedItemIndex}
              handleItemClick={handleItemClick}
              selectedFeature={selectedFeature}
            />
          </Box>
        </div>

        {/* Image Preview Card */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            width: { xs: "100%", md: "70%" },
            height: "var(--items-image-height)",
          }}
        >
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              width: "100%",
              display: { xs: "none", sm: "flex" },
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                m: "auto",
                width: "100%",
                maxWidth: 480,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <img
                src={imageUrl}
                alt={selectedFeature.title}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
