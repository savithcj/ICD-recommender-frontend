import React from "react";
import "./ListViewer.css";
import { makeStyles } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";

import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import red from "@material-ui/core/colors/red";
import green from "@material-ui/core/colors/green";

const theme = createMuiTheme({
  palette: {
    primary: green,
    secondary: red
  }
});

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(0.3),
    maxWidth: "25px",
    maxHeight: "25px",
    minWidth: "25px",
    minHeight: "25px",
    padding: "0px",
    borderRadius: 25
  }
}));

/**
 * This component takes a list of items and returns
 * a JSX element containing the list of items. When an
 * item is clicked, it is removed from the original list
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
      let displayValue = props.valueName === undefined ? "" : item[props.valueName];
      let descriptionValue = props.descriptionName === undefined ? "" : ": " + item[props.descriptionName];
      let tooltip =
        props.tooltipValueName === undefined ? "" : <span className="tooltiptext">{item[props.tooltipValueName]}</span>;

      let acceptItemButton =
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

      let removeItemButton =
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
        <div className="listItem" key={item[props.keyName]}>
          <div className="tooltip">
            {displayValue + descriptionValue}
            <span className="buttonSet">
              {acceptItemButton}
              {removeItemButton}
            </span>
            {tooltip}
          </div>
        </div>
      );
    });
  }

  let removeAllItemsButton =
    props.removeAllItemsButton === undefined || props.removeAllItemsButton === null ? (
      ""
    ) : (
      <Button color="default" onClick={props.removeAllItemsButton}>
        remove all
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
