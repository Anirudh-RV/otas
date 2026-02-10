import Typography from "@mui/material/Typography";
import * as React from "react";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import MenuButton from "./MenuButton";
import ColorModeIconDropdown from "../../shared-ui-theme/ColorModeIconDropdown";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { useAuth } from "../../AuthContext";
import OptionsMenu from "./OptionsMenu";

export default function Header() {
  const { user } = useAuth();
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const iconWrapperSx = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "action.hover",
    },
  };

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: "none", md: "flex" },
        width: "100%",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: 1.5,
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction="row" sx={{ gap: 1 }}>
        <Box>
          <ColorModeIconDropdown />
        </Box>

        <Avatar
          alt={user?.FirstName}
          src="/static/images/avatar/7.jpg"
          sx={{
            width: 36,
            height: 36,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
          onClick={handleAvatarClick}
        />

        <OptionsMenu anchorEl={menuAnchorEl} onClose={handleMenuClose} />
      </Stack>
    </Stack>
  );
}
