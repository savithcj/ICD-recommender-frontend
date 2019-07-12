import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
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
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import DragHandle from "@material-ui/icons/DragHandle";
import { ReactComponent as CheckMark } from "../../Assets/Icons/baseline-done-24px.svg";
import { sortableContainer, sortableElement, sortableHandle } from "react-sortable-hoc";
import arrayMove from "array-move";
import Menu from "../ComponentMenu/ComponentMenu";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";

//theme used by the accept and reject buttons
const theme = createMuiTheme({
  palette: {
    primary: green,
    secondary: red
  }
});

//Styles used by the different components used by the ListViewer
const useStyles = makeStyles(() => ({
  root: {
    height: "100%",
    width: "100%",
    flexGrow: 1,
    borderRadius: "5px",
    overflow: "auto",
    backgroundColor: "inherit",
    padding: 0
  },
  listSection: {
    backgroundColor: "inherit",
    padding: 0
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
    width: "100%",
    textTransform: "uppercase"
  },
  drag: {
    cursor: "row-resize",
    padding: 12
  },
  listItemIndex: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    float: "right",
    margin: "6px 6px 0px 0px",
    fontSize: "0.875rem",
    color: "#767676"
  }
}));

/**
 * Component used to display the contents of an array of objects.
 * Displays the objects as a sortable list of cards
 */
// ListViewer Documentation
//--------------------------------------------------------------------------------------------------------------------
//
// This component utilizes the React HOC concept multiple times; https://reactjs.org/docs/higher-order-components.html
// HOC is a function that takes a component and returns a new component.
//
// Main 3rd party components used:
//--------------------------------
//
// -> https://github.com/clauderic/react-sortable-hoc
// -> https://material-ui.com/components/lists/
// -> https://material-ui.com/components/cards/
//
// Props:
//-------
//
// -> title || string : used to specify a title to be displayed on the top left of the component.
// -> disableTitleGutters || boolean : passed down to the MaterialUI List component composed in this component.
//                                     Removes additional padding around the title; refer to the MaterialUI List
//                                     API docs for a detailed explanation.
// -> nullItemsMessage || string : message to display if the items prop is null.
// -> noItemsMessage || string : message to display if the items prop is an array of length 0
// -> items || multiple values : the component accepts any of the following values
//                               -> undefined: displays the following message: "No items to display"
//                               -> null: displays the nullItemsMessage
//                               -> "LOADING": shows a loading indicator
//                               -> array of length 0: displays the noItemsMessage
//                               -> array of objects: display a list of sortable cards with each card representing an
//                                  object in the array
// -> valueName || string : the property of the item object that contains the name to be displayed on the card
// -> descriptionName || string : the property of the item object that contains the description displayed on the card
// -> exploreButton || object : if this prop is defined, adds a button to the card which when clicked performs an
//                              action specified within the passed object. Has a explore icon
//                              The passed object should have the following properties:
//                              -> title || string: html title of the button
//                              -> onClick || function: action to perform when the button is pressed
//                              -> shouldDisable || function: a function that returns true or false; used to
//                                                            grey out the button
// -> acceptButton || object : if this prop is defined, adds a button to the card which when clicked performs an
//                              action specified within the passed object. Has a check icon
//                              The passed object has the same properties as the explore button
// -> rejectButton || object : if this prop is defined, adds a button to the card which when clicked performs an
//                              action specified within the passed object. Has a X icon
//                              The passed object has the same properties as the explore and accept buttons
// -> button || object : Adds a button to the top right of the component with the text specified by the passed object.
//                       The passed object should have the following properties:
//                       -> menuItemOnClick: action to perform when the button is clicked
//                       -> menuItemText: text to display on button
// -> menuOptions || array : this prop is passed down to the the Menu component composed within this component.
//                           Needs to be an array of objects with each object containing two properties:
//                           -> menuItemOnClick: action to perform when the menu item is clicked
//                           -> menuItemText: text to display for the menu
// -> allowRearrage || boolean : if true, adds an item to the menuOptions prop to allow enabling sortable mode
// -> onSortEndCallback || function : this prop is required if allowRearrage is true. This function is called
//                                    the SortableContainer when a user has finished rearranging items in the
//                                    container
//
//--------------------------------------------------------------------------------------------------------------------
function ListViewer(props) {
  //Binding the styles defined earlier
  const classes = useStyles();
  //The component uses a state to switch back and forth between sortable and locked modes
  const [areItemsSortable, setSortMode] = useState(false);

  //function that gets called after ListViewer cards are rearranged
  //used to reassign the indices of the passed array of objects after the user has rearranged the order of the cards
  const onSortEnd = ({ oldIndex, newIndex }) => {
    props.onSortEndCallback(arrayMove(props.items, oldIndex, newIndex));
  };

  //HOC that returns a draggable handle
  //Used by the SortableContainer to only allow dragging when clicked on this
  const DragHandleIcon = sortableHandle(() => (
    <span>
      <DragHandle className={classes.drag} />
    </span>
  ));

  //When SortableItem component gets used within the SortableContainer, it first creates a component as described
  //within the arrow function passed to the sortableElement function below. Once this component is created,
  //the sortable functionality is added and returned as a new sortable component by the HOC .
  const SortableItem = sortableElement(({ id, value, description }) => {
    //Each of the following buttons are conditionally rendered only if the corresponding prop has been
    //passed down to the ListViewer
    //The titles and the onClick actions are also conditionally rendered depending on whether or not
    //the corresponding properties of the button objects are defined; if they're not defined, default
    //values are provided.
    const showExploreButton = props.exploreButton ? (
      <IconButton
        id={id}
        aria-label={props.exploreButton.title ? props.exploreButton.title : "Explore"}
        title={props.exploreButton.title ? props.exploreButton.title : "Explore"}
        //The default value for the onClick action is a function that does nothing
        onClick={props.exploreButton.onClick ? props.exploreButton.onClick : () => {}}
        disabled={props.exploreButton.shouldDisable ? props.exploreButton.shouldDisable(id) : false}
      >
        <ExploreIcon />
      </IconButton>
    ) : null;

    const showAcceptButton = props.acceptItemButton ? (
      <IconButton
        id={id}
        edge="end"
        aria-label={props.acceptItemButton.title ? props.acceptItemButton.title : "Accept"}
        title={props.acceptItemButton.title ? props.acceptItemButton.title : "Accept"}
        color="primary"
        onClick={props.acceptItemButton.onClick ? props.acceptItemButton.onClick : () => {}}
        disabled={props.shouldHideAcceptButton ? props.shouldHideAcceptButton(id) : false}
      >
        <CheckIcon />
      </IconButton>
    ) : null;

    const showRemoveButton = props.removeItemButton ? (
      <IconButton
        id={id}
        edge="end"
        aria-label={props.removeItemButton.title ? props.removeItemButton.title : "Remove"}
        title={props.removeItemButton.title ? props.removeItemButton.title : "Remove"}
        color="secondary"
        onClick={props.removeItemButton.onClick}
        disabled={props.shouldHideRemoveButton ? props.shouldHideRemoveButton(id) : false}
      >
        <RejectIcon />
      </IconButton>
    ) : null;

    const showDislikeButton = props.dislikeButton ? (
      <IconButton
        id={id}
        edge="end"
        aria-label={props.dislikeButton.title ? props.dislikeButton.title : "Dislike"}
        title={props.dislikeButton.title ? props.dislikeButton.title : "Dislike"}
        color="secondary"
        onClick={props.dislikeButton.onClick ? props.dislikeButton.onClick : () => {}}
        disabled={props.dislikeButton.shouldDisable ? props.dislikeButton.shouldDisable(id) : false}
      >
        <ThumbDownIcon />
      </IconButton>
    ) : null;

    //conditionally show either the explore button or the draggable handle depending on whether the
    //ListViewer is in the sortable mode or not
    const showDragHandleOrExploreButton = areItemsSortable ? <DragHandleIcon /> : showExploreButton;

    //the itemIndex is used to show index of the corresponding array object when the ListViewer is in
    //the sortable mode
    const ShowItemIndex = <ListItemText className={classes.listItemIndex}>{id + 1}</ListItemText>;

    return (
      //This is the final element which the SortableElement HOC wraps around.
      //The element is a Card containing all the details and interaction buttons corresponding to a
      //particular object in the objects array passed down to the ListViewer
      <Card className={classes.card}>
        <ListItem>
          {showDragHandleOrExploreButton}
          <ListItemText primary={value} secondary={description === "" ? "Description N/A" : description} />
          {areItemsSortable ? ShowItemIndex : null}
          {areItemsSortable ? null : showAcceptButton}
          {areItemsSortable ? null : showRemoveButton}
          {areItemsSortable ? null : showDislikeButton}
        </ListItem>
      </Card>
    );
  });

  //Function that returns a array containing multiple instances of the SortableItem component.
  //it is used later on by the SortableContainer to create a SortableItem for each object in the
  //array of objects to be displayed
  function createItems(arrayOfItems) {
    return arrayOfItems.map((value, index) => {
      return (
        <SortableItem
          key={`item-${index}`}
          index={index}
          id={index}
          value={value[props.valueName]}
          description={value[props.descriptionName]}
          disabled={!areItemsSortable}
        />
      );
    });
  }

  //When the SortableContainer gets used in the return of the ListViewer, it first creates a
  //list of SortableItems as described within the arrow function passed to the SortableContainer
  //function below. Once this list is created, the sortableContainer HOC takes the list, adds
  //the sortable functionality, then returns a new SortableContainer component
  const SortableContainer = sortableContainer(() => {
    let displayItems = null;

    //Depending on the value of the items prop passed to the ListViewer, five different
    //options are available to be displayed by the component
    if (props.items === undefined) {
      displayItems = <Typography variant="body2">No items to display</Typography>;
    } else if (props.items === null) {
      displayItems = <Typography variant="body2">{props.nullItemsMessage}</Typography>;
    } else if (props.items === "LOADING") {
      displayItems = <LoadingIndicator />;
    } else if (props.items.length === 0) {
      displayItems = <Typography variant="body2">{props.noItemsMessage}</Typography>;
    } else {
      displayItems = <ul className={classes.ul}>{createItems(props.items)}</ul>;
    }

    //If the allowRearrage prop is true, add an item to the menuOptions prop allowing
    //an user to enable the sortable mode
    if (props.allowRearrage) {
      const matchingOptions = props.menuOptions.filter(option => option.menuItemText === "Rearrange Items");
      if (matchingOptions.length === 0) {
        const rearrangeItems = () => setSortMode(true);
        props.menuOptions.push({
          menuItemOnClick: rearrangeItems,
          menuItemText: "Rearrange Items"
        });
      }
    }

    //A customizable button shown at the top right of the component allowing the user to
    //perform an action as specified by the onClick property of the passed button prop
    const showButton =
      props.button && !areItemsSortable ? (
        <Button className={classes.button} onClick={props.button.onClick} title={props.button.title}>
          {props.button.text}
        </Button>
      ) : null;

    //if in sortable mode, the dropdown menu hides and a confirmation icon is shown on the top right, instead of the
    //button, which when clicked exits the sortable mode
    const showRearrangeConfirmationOrMenu = areItemsSortable ? (
      <IconButton className={classes.button} title="Confirm Item Order" onClick={() => setSortMode(false)}>
        <CheckMark />
      </IconButton>
    ) : (
      <Menu menuOptions={props.menuOptions} />
    );

    return (
      //This is the final list of SortableElements which the SortableContainer wraps around.
      //If the items prop is a list of objects, this will be a list of SortableElements which
      //were created by the createItems function. Otherwise, this will be a list with a single
      //item corresponding to a message determined by the value of the items prop
      <List dense={true} className={classes.root}>
        <ListSubheader className={classes.listTitle} disableGutters={props.disableTitleGutters}>
          {props.title}
          {showRearrangeConfirmationOrMenu}
          {showButton}
        </ListSubheader>
        {displayItems}
      </List>
    );
  });

  //This is the actual return of the ListViewer
  return (
    //This theme provider sets the colors of the accept and remove buttons according to the
    //theme defined earlier
    <ThemeProvider theme={theme}>
      <SortableContainer onSortEnd={onSortEnd} lockAxis="y" useDragHandle />
    </ThemeProvider>
  );
}

//Exporting the memoized ListViewer; used to limit redundant re-renders
export default React.memo(ListViewer, (prevProps, nextProps) => {
  // Component will only re-render if the array of objects to be displayed (i.e., props.items) changes
  return nextProps.items === prevProps.items;
});
