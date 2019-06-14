import React, { useState } from "react";
import "./ListViewer.css";

import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider, makeStyles } from "@material-ui/styles";

import red from "@material-ui/core/colors/red";
import green from "@material-ui/core/colors/green";
import AcceptIcon from "@material-ui/icons/CheckCircleOutlined";
import RejectIcon from "@material-ui/icons/HighlightOff";

import Explore from "@material-ui/icons/ExploreOutlined";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import ExploreIcon from "@material-ui/icons/ExploreOutlined";
import CheckIcon from "@material-ui/icons/CheckCircleOutlined";

import { sortableContainer, sortableElement } from "react-sortable-hoc";
import arrayMove from "array-move";

import RearrangeableList from "../SortableList/SortableList";

//theme used by the accept and reject buttons
const theme = createMuiTheme({
  palette: {
    primary: green,
    secondary: red
  }
});

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    width: "100%",
    height: "100%",
    overflow: "auto",
    backgroundColor: "inherit",
    paddingBottom: 0
  },
  listSection: {
    backgroundColor: "inherit",
    paddding: 0
  },
  ul: {
    backgroundColor: "inherit",
    padding: 0
  }
}));

const SortableItem = sortableElement(({ value }) => (
  <ListItem>
    <IconButton aria-label="Explore" title="Explore on Tree">
      <ExploreIcon />
    </IconButton>
    <ListItemText
      primary={value}
      secondary="Poisoning by and exposure to antiepileptic, sedative-hypnotic, antiparkinsonism and psychotropic drugs, not elsewhere classified, undetermined intent"
    />
    <IconButton edge="end" aria-label="Accept" title="Accept" color="primary">
      <CheckIcon />
    </IconButton>
    <IconButton edge="end" aria-label="Reject" title="Reject" color="secondary">
      <RejectIcon />
    </IconButton>
  </ListItem>
));

const SortableContainer = sortableContainer(({ children }) => {
  return <ul>{children}</ul>;
});

const onSortEnd = () => {
  console.log("test");
};

function ListViewer(props) {
  const classes = useStyles();
  const [areItemsRearrangable, setItemRearrangeMode] = useState(false);

  const nonRearrangableList = (
    <List dense={true} className={classes.root} subheader={<li />}>
      <ThemeProvider theme={theme}>
        <li className={classes.listSection}>
          <ul className={classes.ul}>
            <ListSubheader disableSticky={false}>{props.title}</ListSubheader>
            <ListItem>
              <IconButton aria-label="Explore" title="Explore on Tree">
                <ExploreIcon />
              </IconButton>
              <ListItemText
                primary="A00"
                secondary="Poisoning by and exposure to antiepileptic, sedative-hypnotic, antiparkinsonism and psychotropic drugs, not elsewhere classified, undetermined intent"
              />
              <IconButton edge="end" aria-label="Accept" title="Accept" color="primary">
                <CheckIcon />
              </IconButton>
              <IconButton edge="end" aria-label="Reject" title="Reject" color="secondary">
                <RejectIcon />
              </IconButton>
            </ListItem>

            <ListItem>
              <IconButton aria-label="Explore" title="Explore on Tree">
                <ExploreIcon />
              </IconButton>
              <ListItemText
                primary="A00"
                secondary="Poisoning by and exposure to antiepileptic, sedative-hypnotic, antiparkinsonism and psychotropic drugs, not elsewhere classified, undetermined intent"
              />
              <IconButton edge="end" aria-label="Accept" title="Accept">
                <CheckIcon />
              </IconButton>
              <IconButton edge="end" aria-label="Reject" title="Reject">
                <RejectIcon />
              </IconButton>
            </ListItem>
          </ul>
        </li>
      </ThemeProvider>
    </List>
  );

  const rearrangableList = (
    <SortableContainer onSortEnd={onSortEnd}>
      <SortableItem key={`1`} index={0} value={1} />
      <SortableItem key={`2`} index={1} value={2} />
    </SortableContainer>
  );

  return areItemsRearrangable ? rearrangableList : nonRearrangableList;
}

/**
 * This component takes a list of items and returns
 * a JSX element containing the list of items.
 */
function ListViewer2(props) {
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
              // className={classes.button}
              id={item[props.keyName]}
              onClick={props.exploreButton}
              color="default"
              title="Explore on tree"
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
          // <ThemeProvider theme={theme}>
          <IconButton
            variant="outlined"
            // className={classes.button}
            id={item[props.keyName]}
            onClick={props.acceptItemButton}
            color="primary"
            title="Accept"
          >
            <AcceptIcon />
          </IconButton>
          // </ThemeProvider>
        );

      const removeItemButton =
        props.removeItemButton === undefined ? (
          ""
        ) : (
          <IconButton
            variant="outlined"
            // className={classes.button}
            id={item[props.keyName]}
            onClick={props.removeItemButton}
            color="secondary"
            title="Remove"
          >
            <RejectIcon />
          </IconButton>
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
