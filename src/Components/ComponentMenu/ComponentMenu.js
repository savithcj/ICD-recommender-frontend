import React from "react";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";

const options = ["None", "Atria", "Callisto"];

const ITEM_HEIGHT = 20;

export default function ComponentMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <span>
      <IconButton aria-label="More" aria-controls="long-menu" aria-haspopup="true" title="Menu" onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 10,
            width: 200
          }
        }}
      >
        {options.map(option => (
          <MenuItem key={option} selected={option === "Pyxis"} onClick={handleClose}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </span>
  );
}
