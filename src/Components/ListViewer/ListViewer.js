import React, { useState } from "react";

import IconButton from "@material-ui/core/IconButton";

import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider, makeStyles } from "@material-ui/styles";

import red from "@material-ui/core/colors/red";
import green from "@material-ui/core/colors/green";
import RejectIcon from "@material-ui/icons/HighlightOff";

import Typography from "@material-ui/core/Typography";

import Card from "@material-ui/core/Card";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import ExploreIcon from "@material-ui/icons/ExploreOutlined";
import CheckIcon from "@material-ui/icons/CheckCircleOutlined";

import { sortableContainer, sortableElement, sortableHandle } from "react-sortable-hoc";
import arrayMove from "array-move";

import Menu from "../ComponentMenu/ComponentMenu";

//theme used by the accept and reject buttons
const theme = createMuiTheme({
  palette: {
    primary: green,
    secondary: red
  }
});

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    width: "100%",
    height: "100%",
    overflow: "auto",
    backgroundColor: "inherit",
    padding: 0
  },
  listSection: {
    backgroundColor: "inherit",
    paddding: 0
  },
  ul: {
    backgroundColor: "inherit",
    padding: "2%"
  },
  card: {
    margin: "3% 0"
  },
  listTitle: {
    fontWeight: "bold",
    textAlign: "left",
    padding: 0,
    margin: "0 0 2% 0"
  }
}));

function ListViewer(props) {
  const classes = useStyles();
  const [areItemsRearrangable, setItemRearrangeMode] = useState(true);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (Array.isArray(props.items)) {
      if (props.items.length > 0) {
        props.onSortEnd(arrayMove(props.items, oldIndex, newIndex));
      }
    }
  };

  const SortableItem = sortableElement(({ value, description, id }) => (
    <Card className={classes.card}>
      <ListItem>
        <IconButton id={id} aria-label="Explore" title="Explore on Tree" onClick={props.exploreButton}>
          <ExploreIcon />
        </IconButton>
        <ListItemText primary={value} secondary={description === "" ? "Description N/A" : description} />
        <IconButton
          id={id}
          edge="end"
          aria-label="Accept"
          title="Accept"
          color="primary"
          onClick={props.acceptItemButton}
        >
          <CheckIcon />
        </IconButton>
        <IconButton
          id={id}
          edge="end"
          aria-label="Reject"
          title="Reject"
          color="secondary"
          onClick={props.removeItemButton}
        >
          <RejectIcon />
        </IconButton>
      </ListItem>
    </Card>
  ));

  const SortableContainer = sortableContainer(({ children }) => {
    let displayItems = null;

    if (props.items === null || props.items === undefined) {
      displayItems = <Typography variant="body2">{props.nullItemsMessage}</Typography>;
    } else if (props.items === 1) {
      displayItems = <Typography variant="body2">{props.customMessage}</Typography>;
    } else if (props.items.length === 0) {
      displayItems = <Typography variant="body2">{props.noItemsMessage}</Typography>;
    } else {
      displayItems = <ul className={classes.ul}>{children}</ul>;
    }
    return (
      <List dense={true} className={classes.root}>
        <ThemeProvider theme={theme}>
          <ListSubheader className={classes.listTitle} disableSticky={false}>
            <span>
              <Menu />
            </span>
            <span>{props.title}</span>
          </ListSubheader>
          {displayItems}
        </ThemeProvider>
      </List>
    );
  });

  let listItems = null;

  if (Array.isArray(props.items)) {
    if (props.items.length > 0) {
      {
        listItems = props.items.map((value, index) => (
          <SortableItem
            key={`item-${index}`}
            id={index}
            index={index}
            value={value[props.valueName]}
            description={value[props.descriptionName]}
            disabled={!areItemsRearrangable}
          />
        ));
      }
    }
  }

  return (
    <SortableContainer onSortEnd={onSortEnd} lockAxis="y" useDragHandle={areItemsRearrangable}>
      {listItems}
    </SortableContainer>
  );
}

export default ListViewer;
