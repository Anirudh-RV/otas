import { styled } from "@mui/material/styles";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import MenuContent from "./MenuContent";
import { useAuth } from "../../AuthContext";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu({
  selectedPage,
  onSelectPage,
}: {
  selectedPage: "home" | "analytics";
  onSelectPage: (page: "home" | "analytics") => void;
}) {
  const { user } = useAuth();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center", // vertically center
          justifyContent: "center", // horizontally center
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            fontSize: "clamp(1rem, 4vw, 2.5rem)",
          }}
        >
          OT
          <Typography
            component="span"
            variant="body2"
            sx={{
              fontSize: "inherit",
              color: "primary.main",
            }}
          >
            AS
          </Typography>
        </Typography>
      </Box>

      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent selectedPage={selectedPage} onSelectPage={onSelectPage} />
        <Divider />
      </Box>
    </Drawer>
  );
}
