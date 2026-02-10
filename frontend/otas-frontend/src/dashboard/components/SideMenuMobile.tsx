import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import Box from "@mui/material/Box";
import MenuButton from "./MenuButton";
import { useAuth } from "../../AuthContext";

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({
  open,
  toggleDrawer,
}: SideMenuMobileProps) {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
          width: "70dvw",
          maxWidth: 320,
        },
      }}
    >
      <Stack sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Branding like SideMenu */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 2,
            px: 2,
            py: 1.5,
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

        {/* User Info + Notifications */}
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: "center", flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={user?.FirstName}
              src="/static/images/avatar/7.jpg"
              sx={{ width: 24, height: 24 }}
            />
            <Typography component="p" variant="h6">
              {user?.FirstName}
            </Typography>
          </Stack>
          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>

        <Divider />

        {/* Main Menu Content */}
        <Box
          sx={{
            overflow: "auto",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Divider sx={{ mt: "auto" }} />
        </Box>

        {/* Alerts and Logout */}
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={() => {
              clearAuth(); // Clear tokens and user
              navigate("/"); // Redirect to login page
            }}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
