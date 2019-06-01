import React from "react";
import "./ListViewer.css";
import { makeStyles } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(0.5),
    maxWidth: "30px",
    maxHeight: "30px",
    minWidth: "30px",
    minHeight: "30px"
  },
  input: {
    display: "none"
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

      let removeItemButton =
        props.removeItemButton === undefined ? (
          ""
        ) : (
          <span>
            <Button
              variant="outlined"
              className={classes.button}
              id={item[props.keyName]}
              onClick={props.removeItemButton}
            >
              {"\u2717"} {/*unicode x mark */}
            </Button>
          </span>
        );

      let acceptItemButton =
        props.acceptItemButton === undefined ? (
          ""
        ) : (
          <span>
            <Button
              variant="outlined"
              className={classes.button}
              id={item[props.keyName]}
              onClick={props.acceptItemButton}
            >
              {"\u2713"} {/*unicode check mark */}
            </Button>
          </span>
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
      <span>
        <Button color="primary" onClick={props.removeAllItemsButton}>
          remove all
        </Button>
      </span>
    );

  return (
    <div className="itemContainer">
      <h3 className="containerTitle">{props.title}</h3>
      {displayItems}
      <div className="footer">{removeAllItemsButton}</div>
    </div>
  );
}

export default ListViewer;
