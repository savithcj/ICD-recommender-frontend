import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { Menu } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  }
}));

function ButtonAppBar(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);

  function handleMenuOpen(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose(event) {
    setAnchorEl(null);
  }

  function handleToggleLayout(event) {
    props.handleButton();
    setAnchorEl(null);
  }

  function handleAdminButton(event) {
    //TODO: Implementation
    console.log("Admin button pressed in menu");
    setAnchorEl(null);
  }

  function handleAboutButton(event) {
    //TODO: Implementation
    console.log("About button pressed in menu");
    setAnchorEl(null);
  }

  const menuId = "settings-menu";

  let renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleToggleLayout}>{props.buttonText}</MenuItem>
      <MenuItem onClick={handleAdminButton}>Admin</MenuItem>
      <MenuItem onClick={handleAboutButton}>About</MenuItem>
    </Menu>
  );

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="Menu" />

          <Typography variant="h6" className={classes.title}>
            ICD-10 Code Suggestion and Usage Insight
          </Typography>

          {/* <Button color="inherit" onClick={props.handleButton}>
            {props.buttonText}
          </Button> */}

          <IconButton
            edge="end"
            // className={classes.menuButton}
            // aria-label="Settings"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            {/* TODO:Uncomment the following line after fixing the bug in D3 Tree */}
            {/* <MenuIcon /> */}
            {"\u2699"}
          </IconButton>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </div>
  );
}

export default ButtonAppBar;
