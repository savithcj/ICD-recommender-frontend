import React from "react";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ExpandMenuIcon from "@material-ui/icons/ExpandMore";

const ITEM_HEIGHT = 20;

export default function ComponentMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose(functionToComplete) {
    if (functionToComplete === null) {
      setAnchorEl(null);
      return;
    } else {
      functionToComplete();
      setAnchorEl(null);
    }
  }

  //self-executing arrow function!
  const shouldDisplayMenu = (() => {
    if (props.menuOptions < 1) {
      return false;
    }
    return props.menuOptions.filter(option => option.menuItemOnClick).length > 0;
  })();

  const showMenu = shouldDisplayMenu ? (
    <Menu
      id="long-menu"
      anchorEl={anchorEl}
      open={open}
      keepMounted
      onClose={() => handleClose(null)}
      PaperProps={{
        style: {
          maxHeight: ITEM_HEIGHT * 10,
          width: 200
        }
      }}
      getContentAnchorEl={null}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
    >
      {props.menuOptions.map(option => {
        if (option.menuItemOnClick) {
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
        return null;
      })}
    </Menu>
  ) : null;

  return (
    <span>
      {shouldDisplayMenu ? (
        <IconButton
          aria-label="More"
          aria-controls="long-menu"
          aria-haspopup="true"
          title="More Actions"
          onClick={handleClick}
          disabled={!shouldDisplayMenu}
        >
          <ExpandMenuIcon />
        </IconButton>
      ) : null}

      {showMenu}
    </span>
  );
}
