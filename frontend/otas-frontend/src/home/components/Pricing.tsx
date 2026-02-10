import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Link } from "react-router-dom";

const tiers = [
  {
    title: "Free",
    price: "0",
    description: [
      "No credit card required",
      "Create upto 5 algorithms",
      "Backtesting on 5 years of data",
      "5,000 daily credits for Otas AI",
      "10,000 daily credits for Backtesting",
    ],
    buttonText: "Sign up for free",
    buttonVariant: "outlined",
    buttonColor: "secondary",
  },
  {
    title: "Standard",
    subheader: "Recommended",
    price: "20",
    description: [
      "Create upto 25 algorithms",
      "Access to Otas vault",
      "Backtest on all available datasets",
      "25,000 daily credits for Otas AI",
      "50,000 daily credits for Backtesting",
      "Support for Paper Trading and Live Trading",
    ],
    buttonText: "Start now",
    buttonVariant: "contained",
    buttonColor: "secondary",
    comingSoon: true,
  },
  {
    title: "Pro",
    price: "99",
    description: [
      "Unlimited algorithm creation",
      "Access to Otas vault",
      "Backtest on all available datasets",
      "Provide custom datasets for Backtesting",
      "100,000 daily credits for Otas AI",
      "250,000 daily credits for Backtesting",
      "Support for Paper Trading and Live Trading",
      "Priority access to new features",
      "Premium customer support",
    ],
    buttonText: "Get started",
    buttonVariant: "outlined",
    buttonColor: "secondary",
    comingSoon: true,
  },
];

export default function Pricing() {
  return (
    <Container
      id="pricing"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
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
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          Pricing
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Enjoy a generous Free Tier to test our product and choose a plan that
          best suites your needs.
        </Typography>
      </Box>
      <Grid
        container
        spacing={3}
        sx={{ alignItems: "center", justifyContent: "center", width: "100%" }}
      >
        {tiers.map((tier) => (
          <Grid
            size={{ xs: 12, sm: tier.title === "Pro" ? 12 : 6, md: 4 }}
            key={tier.title}
          >
            <Card
              sx={[
                {
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  width: "100%",
                  minHeight: 560,
                },
                tier.title === "Standard" &&
                  ((theme) => ({
                    border: "none",
                    background:
                      "radial-gradient(circle at 50% 0%, hsl(220, 20%, 35%), hsl(220, 30%, 6%))",
                    boxShadow: `0 8px 12px hsla(220, 20%, 42%, 0.2)`,
                    ...theme.applyStyles("dark", {
                      background:
                        "radial-gradient(circle at 50% 0%, hsl(220, 20%, 20%), hsl(220, 30%, 16%))",
                      boxShadow: `0 8px 12px hsla(0, 0%, 0%, 0.8)`,
                    }),
                  })),
              ]}
            >
              <CardContent>
                <Box
                  sx={[
                    {
                      mb: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    },
                    tier.title === "Standard"
                      ? { color: "grey.100" }
                      : { color: "" },
                  ]}
                >
                  <Typography component="h3" variant="h6">
                    {tier.title}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {tier.subheader && tier.title === "" && (
                      <Chip icon={<AutoAwesomeIcon />} label={tier.subheader} />
                    )}
                    {tier.comingSoon && (
                      <Chip label="Coming Soon" color="warning" />
                    )}
                  </Box>
                </Box>
                <Box
                  sx={[
                    {
                      display: "flex",
                      alignItems: "baseline",
                    },
                    tier.title === "Standard"
                      ? { color: "grey.50" }
                      : { color: null },
                  ]}
                >
                  <Typography component="h3" variant="h2">
                    ${tier.price}
                  </Typography>
                  <Typography component="h3" variant="h6">
                    &nbsp; per month
                  </Typography>
                </Box>
                <Divider sx={{ my: 2, opacity: 0.8, borderColor: "divider" }} />
                {tier.description.map((line) => (
                  <Box
                    key={line}
                    sx={{
                      py: 1,
                      display: "flex",
                      gap: 1.5,
                      alignItems: "center",
                    }}
                  >
                    <CheckCircleRoundedIcon
                      sx={[
                        {
                          width: 20,
                        },
                        tier.title === "Standard"
                          ? { color: "primary.light" }
                          : { color: "primary.main" },
                      ]}
                    />
                    <Typography
                      variant="subtitle2"
                      component={"span"}
                      sx={[
                        tier.title === "Standard"
                          ? { color: "grey.50" }
                          : { color: null },
                      ]}
                    >
                      {line}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
              <CardActions sx={{ mt: "auto" }}>
                <Button
                  fullWidth
                  variant={tier.buttonVariant as "outlined" | "contained"}
                  color={tier.buttonColor as "primary" | "secondary"}
                  disabled={!!tier.comingSoon}
                  component={tier.title === "Free" ? Link : "button"}
                  to={tier.title === "Free" ? "/signup" : undefined}
                >
                  {tier.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
