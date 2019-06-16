import React, { useState, useEffect } from "react";
import IconButton from "@material-ui/core/IconButton";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider, makeStyles } from "@material-ui/styles";
import red from "@material-ui/core/colors/red";
import green from "@material-ui/core/colors/green";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import ExploreIcon from "@material-ui/icons/ExploreOutlined";
import CheckIcon from "@material-ui/icons/CheckCircleOutlined";
import RejectIcon from "@material-ui/icons/HighlightOff";
import DragHandle from "@material-ui/icons/DragHandle";
import { ReactComponent as CheckMark } from "../../Assets/Icons/baseline-done-24px.svg";
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
    padding: "0 2% 2% 2%"
  },
  card: {
    margin: "13px 0"
  },
  listTitle: {
    fontWeight: "bold",
    textAlign: "left",
    padding: 0,
    margin: "0"
  },
  drag: {
    cursor: "row-resize",
    padding: 12
  },
  listItemIndex: {
    display: "flex",
    justifyContent: "flex-end"
  }
}));

export default React.memo(
  function ListViewer(props) {
    const classes = useStyles();
    const [areItemsRearrangable, setItemRearrangeMode] = useState(false);

    useEffect(() => {
      if (props.allowRearrage) {
        const rearrangeItems = () => setItemRearrangeMode(true);
        props.menuOptions.push({
          menuItemOnClick: rearrangeItems,
          menuItemText: "Rearrange Items"
        });
      }
    }, [props.menuOptions]);

    const onSortEnd = ({ oldIndex, newIndex }) => {
      props.onSortEndCallback(arrayMove(props.items, oldIndex, newIndex));
    };

    const SortableItem = sortableElement(({ value, description, id }) => {
      const DragHandleButton = sortableHandle(() => (
        <span>
          <DragHandle className={classes.drag} />
        </span>
      ));

      const showDragHandleOrExploreButton = areItemsRearrangable ? (
        <DragHandleButton />
      ) : (
        <IconButton id={id} aria-label="Explore" title="Explore on Tree" onClick={props.exploreButton}>
          <ExploreIcon />
        </IconButton>
      );

      const itemIndex = <ListItemText className={classes.listItemIndex}>{id + 1}</ListItemText>;

      const showAcceptButton = props.acceptItemButton ? (
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
      ) : null;

      const showRemoveButton = props.removeItemButton ? (
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
      ) : null;

      return (
        <Card className={classes.card}>
          <ListItem>
            {showDragHandleOrExploreButton}
            <ListItemText primary={value} secondary={description === "" ? "Description N/A" : description} />
            {areItemsRearrangable ? itemIndex : null}
            {areItemsRearrangable ? null : showAcceptButton}
            {areItemsRearrangable ? null : showRemoveButton}
          </ListItem>
        </Card>
      );
    });

    function createItems(arrayOfItems) {
      return arrayOfItems.map((value, index) => {
        console.log("ListViewer map items called");
        return (
          <SortableItem
            key={`item-${index}`}
            id={index}
            index={index}
            value={value[props.valueName]}
            description={value[props.descriptionName]}
            disabled={!areItemsRearrangable}
          />
        );
      });
    }

    const SortableContainer = sortableContainer(() => {
      let displayItems = null;

      if (props.items === null || props.items === undefined) {
        displayItems = <Typography variant="body2">{props.nullItemsMessage}</Typography>;
      } else if (props.items === 1) {
        displayItems = <Typography variant="body2">{props.customMessage}</Typography>;
      } else if (props.items.length === 0) {
        displayItems = <Typography variant="body2">{props.noItemsMessage}</Typography>;
      } else {
        displayItems = <ul className={classes.ul}>{createItems(props.items)}</ul>;
      }

      const showRearrangeConfirmationOrMenu = areItemsRearrangable ? (
        <IconButton title="Confirm Item Order" onClick={() => setItemRearrangeMode(false)}>
          <CheckMark />
        </IconButton>
      ) : (
        <Menu menuOptions={props.menuOptions} />
      );

      return (
        <List dense={true} className={classes.root}>
          <ThemeProvider theme={theme}>
            <ListSubheader className={classes.listTitle} disableSticky={false}>
              <span>{showRearrangeConfirmationOrMenu}</span>
              <span>{props.title}</span>
            </ListSubheader>
            {displayItems}
          </ThemeProvider>
        </List>
      );
    });

    return <SortableContainer onSortEnd={onSortEnd} lockAxis="y" useDragHandle />;
  },
  (prevProps, nextProps) => {
    return nextProps.items === prevProps.items;
  }
);
