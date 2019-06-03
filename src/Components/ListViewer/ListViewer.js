import React from "react";
import "./ListViewer.css";
import { makeStyles } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import red from "@material-ui/core/colors/red";
import green from "@material-ui/core/colors/green";

import Explore from "@material-ui/icons/ExploreOutlined";

//theme used by the accept and reject buttons
const theme = createMuiTheme({
  palette: {
    primary: green,
    secondary: red
  }
});

//accept and reject button styles
const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(0.3),
    maxWidth: "24px",
    maxHeight: "24px",
    minWidth: "24px",
    minHeight: "24px",
    padding: "0px",
    borderRadius: 25
  }
}));

/**
 * This component takes a list of items and returns
 * a JSX element containing the list of items.
 */
function ListViewer(props) {
  const classes = useStyles();

  let displayItems = null;

  if (props.items === null || props.items === undefined) {
    displayItems = <p>{props.nullItemsMessage}</p>;
  } else if (props.items === 1) {
    displayItems = <p>{props.customMessage}</p>;
  } else if (props.items.length === 0) {
    displayItems = <p>{props.noItemsMessage}</p>;
  } else {
    displayItems = props.items.map(item => {
      const exploreIcon =
        props.exploreButton === undefined ? (
          ""
        ) : (
          <span className="exploreButton">
            <IconButton
              variant="outlined"
              className={classes.button}
              id={item[props.keyName]}
              onClick={props.exploreButton}
              color="primary"
            >
              <Explore />
            </IconButton>
          </span>
        );
      const value = props.valueName === undefined ? "" : <span className="itemValue">{item[props.valueName]}</span>;

      const displayValue = (
        <div className="column value">
          {exploreIcon}
          {value}
        </div>
      );

      const descriptionValue = (
        <div className="column description">
          {item[props.descriptionName] === "" ? "Description N/A" : item[props.descriptionName]}
        </div>
      );
      const tooltip =
        props.tooltipValueName === undefined ? "" : <div className="tooltiptext">{item[props.tooltipValueName]}</div>;

      const acceptItemButton =
        props.acceptItemButton === undefined ? (
          ""
        ) : (
          // Material UI only allows one ThemeProvider
          <ThemeProvider theme={theme}>
            <Button
              variant="outlined"
              className={classes.button}
              id={item[props.keyName]}
              onClick={props.acceptItemButton}
              color="primary"
            >
              {"\u2713"} {/*unicode check mark */}
            </Button>
          </ThemeProvider>
        );

      const removeItemButton =
        props.removeItemButton === undefined ? (
          ""
        ) : (
          <Button
            variant="outlined"
            className={classes.button}
            id={item[props.keyName]}
            onClick={props.removeItemButton}
            color="secondary"
          >
            {"\u2717"} {/*unicode x mark */}
          </Button>
        );

      return (
        <div className="tooltip" key={"tooltip" + item[props.keyName]}>
          {tooltip}
          <div className="listItem" key={"listItem" + item[props.keyName]}>
            {displayValue}
            {descriptionValue}
            <div className="column buttonSet">
              {acceptItemButton}
              {removeItemButton}
            </div>
          </div>
        </div>
      );
    });
  }

  const removeAllItemsButton =
    props.removeAllItemsButton === undefined || props.removeAllItemsButton === null ? (
      ""
    ) : (
      <Button color="default" onClick={props.removeAllItemsButton}>
        Remove All
      </Button>
    );

  return (
    <div className="listViewer">
      <div className="containerTitle">{props.title}</div>
      <div className="itemContainer">{displayItems}</div>
      <div className="footer">{removeAllItemsButton}</div>
    </div>
  );
}

export default ListViewer;
