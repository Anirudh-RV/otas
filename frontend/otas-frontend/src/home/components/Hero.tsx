import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { useColorScheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

const StyledBox = styled("div")(({ theme }) => ({
  alignSelf: "center",
  width: "100%",
  marginTop: theme.spacing(8),
  borderRadius: (theme.vars || theme).shape.borderRadius,
  outline: "6px solid",
  outlineColor: "hsla(220, 25%, 80%, 0.2)",
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.grey[200],
  boxShadow: "0 0 12px 8px hsla(220, 25%, 80%, 0.2)",
  overflow: "hidden",
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(10),
  },
  ...(theme.applyStyles?.("dark", {
    boxShadow: "0 0 24px 12px hsla(210, 100%, 25%, 0.2)",
    outlineColor: "hsla(220, 20%, 42%, 0.1)",
    borderColor: (theme.vars || theme).palette.grey[700],
  }) || {}),
}));

export default function Hero() {
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = mode === "system" ? systemMode : mode;
  const navigate = useNavigate();

  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: "100%",
        backgroundRepeat: "no-repeat",
        backgroundImage:
          "radial-gradient(ellipse 80% 25% at 50% 0%, hsl(210, 100%, 90%), transparent)",
        ...theme.applyStyles?.("dark", {
          backgroundImage:
            "radial-gradient(ellipse 80% 25% at 50% 0%, hsl(210, 100%, 16%), transparent)",
        }),
      })}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          sx={{ alignItems: "center", width: { xs: "100%", sm: "70%" } }}
        >
          <Typography
            variant="h1"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              fontSize: "clamp(3rem, 10vw, 3.5rem)",
            }}
          >
            OT
            <Typography
              component="span"
              variant="h1"
              sx={(theme) => ({
                fontSize: "inherit",
                color: "primary.main",
              })}
            >
              AS
            </Typography>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              fontWeight: 500,
              color: "text.primary",
              fontSize: "clamp(1.25rem, 5vw, 2rem)",
            }}
          >
            Know what your agents are doing
          </Typography>

          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              width: { sm: "100%", md: "80%" },
              fontSize: "1rem",
            }}
          >
            OTAS is an Agentic Observability Platform. Integrate our SDKs and
            add our Manifest to your agent and get complete visibility of what
            your agents are doing!
          </Typography>
          <Button
            color="primary"
            variant="contained"
            size="large"
            onClick={() => navigate("/signup")}
            sx={{
              fontSize: "1.125rem",
              px: 4,
              py: 1.5,
              boxShadow: "0 0 12px 4px hsla(210, 100%, 70%, 0.7) !important",
              backgroundColor: "primary.main",
              "&:focus-visible": {
                boxShadow: "0 0 24px 8px hsla(210, 100%, 70%, 0.9) !important",
              },
            }}
          >
            Sign Up
          </Button>
        </Stack>

        {/* ✅ Styled container + image */}
        <StyledBox id="image">
          <img
            src={
              resolvedMode == "dark"
                ? "/images/dark-code.png"
                : "/images/light-code.png"
            }
            alt="Dashboard Screenshot"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </StyledBox>
      </Container>
    </Box>
  );
}
