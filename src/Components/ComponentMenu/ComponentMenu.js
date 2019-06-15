import React from "react";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";

const ITEM_HEIGHT = 20;

export default function ComponentMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose(functionToComplete) {
    if (functionToComplete != null || functionToComplete != undefined) {
      functionToComplete();
    }
    setAnchorEl(null);
  }

  const showMenu =
    props.menuOptions.length > 0 ? (
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={() => handleClose(null)}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 10,
            width: 200
          }
        }}
      >
        {props.menuOptions.map(option => {
          if (option.menuItemOnClick != null || option.menuItemOnClick != undefined) {
            return (
              <MenuItem
                key={option.menuItemText}
                selected={option.menuItemText === "Pyxis"}
                onClick={() => handleClose(option.menuItemOnClick)}
              >
                {option.menuItemText}
              </MenuItem>
            );
          }
        })}
      </Menu>
    ) : null;

  return (
    <span>
      <IconButton aria-label="More" aria-controls="long-menu" aria-haspopup="true" title="Menu" onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      {showMenu}
    </span>
  );
}
