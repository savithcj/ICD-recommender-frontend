import React, { Component } from "react";
import IconButton from "@material-ui/core/IconButton";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
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

import "./ClassBasedListViewer.css";

//theme to specify accept and reject button colors
const theme = createMuiTheme({
  palette: {
    primary: green,
    secondary: red
  }
});

class ListViewer extends Component {
  state = {
    areItemsRearrangable: false
  };

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.items !== nextProps.items || this.state.areItemsRearrangable !== nextState.areItemsRearrangable;
  }

  componentDidUpdate(prevProps) {
    if (this.props.menuOptions !== prevProps.menuOptions) {
      if (this.props.allowRearrage) {
        const rearrangeItems = () => this.setState({ areItemsRearrangable: true });
        this.props.menuOptions.push({
          menuItemOnClick: rearrangeItems,
          menuItemText: "Rearrange Items"
        });
      }
    }
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.props.onSortEndCallback(arrayMove(this.props.items, oldIndex, newIndex));
  };

  //sortableElement returns a Component
  SortableItem = sortableElement(({ value, description, id }) => {
    const DragHandleButton = sortableHandle(() => (
      <span>
        <DragHandle className="drag" />
      </span>
    ));

    const showDragHandleOrExploreButton = this.state.areItemsRearrangable ? (
      <DragHandleButton />
    ) : (
      <IconButton id={id} aria-label="Explore" title="Explore on Tree" onClick={this.props.exploreButton}>
        <ExploreIcon />
      </IconButton>
    );

    const itemIndex = <ListItemText className="listItemIndex">{id + 1}</ListItemText>;

    const showAcceptButton = this.props.acceptItemButton ? (
      <IconButton
        id={id}
        edge="end"
        aria-label="Accept"
        title="Accept"
        color="primary"
        onClick={this.props.acceptItemButton}
      >
        <CheckIcon />
      </IconButton>
    ) : null;

    const showRemoveButton = this.props.removeItemButton ? (
      <IconButton
        id={id}
        edge="end"
        aria-label="Reject"
        title="Reject"
        color="secondary"
        onClick={this.props.removeItemButton}
      >
        <RejectIcon />
      </IconButton>
    ) : null;

    return (
      <Card className="card">
        <ListItem>
          {showDragHandleOrExploreButton}
          <ListItemText primary={value} secondary={description === "" ? "Description N/A" : description} />
          {this.state.areItemsRearrangable ? itemIndex : null}
          {this.state.areItemsRearrangable ? null : showAcceptButton}
          {this.state.areItemsRearrangable ? null : showRemoveButton}
        </ListItem>
      </Card>
    );
  });

  createItems(arrayOfItems) {
    return arrayOfItems.map((value, index) => {
      return (
        <this.SortableItem
          key={`item-${index}`}
          id={index}
          index={index}
          value={value[this.props.valueName]}
          description={value[this.props.descriptionName]}
          disabled={!this.state.areItemsRearrangable}
        />
      );
    });
  }

  //sortableContainer also returns a Component
  SortableContainer = sortableContainer(() => {
    let displayItems = null;

    if (this.props.items === null || this.props.items === undefined) {
      displayItems = <Typography variant="body2">{this.props.nullItemsMessage}</Typography>;
    } else if (this.props.items === 1) {
      displayItems = <Typography variant="body2">{this.props.customMessage}</Typography>;
    } else if (this.props.items.length === 0) {
      displayItems = <Typography variant="body2">{this.props.noItemsMessage}</Typography>;
    } else {
      displayItems = <ul className="customUl">{this.createItems(this.props.items)}</ul>;
    }

    const showRearrangeConfirmationOrMenu = this.state.areItemsRearrangable ? (
      <IconButton title="Confirm Item Order" onClick={() => this.setState({ areItemsRearrangable: false })}>
        <CheckMark />
      </IconButton>
    ) : (
      <Menu menuOptions={this.props.menuOptions} />
    );

    return (
      <List dense={true} className="root">
        <ThemeProvider theme={theme}>
          <ListSubheader className="listTitle" disableSticky={false}>
            <span>{showRearrangeConfirmationOrMenu}</span>
            <span>{this.props.title}</span>
          </ListSubheader>
          {displayItems}
        </ThemeProvider>
      </List>
    );
  });

  render() {
    return <this.SortableContainer onSortEnd={this.onSortEnd} lockAxis="y" useDragHandle />;
  }
}

export default ListViewer;
