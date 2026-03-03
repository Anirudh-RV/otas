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

const MenuItem = styled(MuiMenuItem)({ margin: "2px 0" });

interface OptionsMenuProps {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  projectId: string;
}

export default function OptionsMenu({ anchorEl, onClose, projectId }: OptionsMenuProps) {
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { clearAuth } = useAuth();

  return (
    <Menu
      anchorEl={anchorEl}
      id="options-menu"
      open={open}
      onClose={onClose}
      onClick={onClose}
      slotProps={{ list: { autoFocusItem: false } }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      sx={{
        [`& .${listClasses.root}`]: { padding: "4px" },
        [`& .${paperClasses.root}`]: { padding: 0 },
        [`& .${dividerClasses.root}`]: { margin: "4px -4px" },
      }}
    >
      <MenuItem onClick={() => { navigate("/profile"); onClose(); }}>Profile</MenuItem>
      <MenuItem onClick={() => {
        const dest = projectId ? `/account?projectId=${projectId}` : "/account";
        navigate(dest);
        onClose();
      }}>My Account</MenuItem>
      <Divider />
      <MenuItem
        onClick={() => { clearAuth(); navigate("/"); onClose(); }}
        sx={{ [`& .${listItemIconClasses.root}`]: { ml: "auto", minWidth: 0 } }}
      >
        <ListItemText>Logout</ListItemText>
        <ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
      </MenuItem>
    </Menu>
  );
}