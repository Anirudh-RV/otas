import { styled } from "@mui/material/styles";
import Divider, { dividerClasses } from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import { paperClasses } from "@mui/material/Paper";
import { listClasses } from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon, { listItemIconClasses } from "@mui/material/ListItemIcon";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

const MenuItem = styled(MuiMenuItem)({
  margin: "2px 0",
});

interface OptionsMenuProps {
  anchorEl: null | HTMLElement;
  onClose: () => void;
}

export default function OptionsMenu({ anchorEl, onClose }: OptionsMenuProps) {
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { clearAuth } = useAuth();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
    onClose();
  };

  const handleProfileClick = () => {
    navigate("/profile");
    onClose();
  };

  const handleAccountClick = () => {
    navigate("/account");
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      id="options-menu"
      open={open}
      onClose={onClose}
      onClick={onClose}
      slotProps={{
        list: {
          autoFocusItem: false,
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      sx={{
        [`& .${listClasses.root}`]: { padding: "4px" },
        [`& .${paperClasses.root}`]: { padding: 0 },
        [`& .${dividerClasses.root}`]: { margin: "4px -4px" },
      }}
    >
      <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
      <MenuItem onClick={handleAccountClick}>My Account</MenuItem>
      <Divider />
      <MenuItem
        onClick={handleLogout}
        sx={{
          [`& .${listItemIconClasses.root}`]: {
            ml: "auto",
            minWidth: 0,
          },
        }}
      >
        <ListItemText>Logout</ListItemText>
        <ListItemIcon>
          <LogoutRoundedIcon fontSize="small" />
        </ListItemIcon>
      </MenuItem>
    </Menu>
  );
}
