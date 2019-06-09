import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import CustomListItem from "../CustomListItem/CustomListItem";

import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import IconButton from "@material-ui/core/IconButton";
import ExploreIcon from "@material-ui/icons/ExploreOutlined";
import CheckIcon from "@material-ui/icons/CheckCircleOutlined";
import RejectIcon from "@material-ui/icons/HighlightOff";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    maxWidth: "100%"
  },
  demo: {
    backgroundColor: theme.palette.background.paper
  },
  title: {
    margin: theme.spacing(4, 0, 2)
  }
}));

/**
 * This layout demonstrates how to use a grid with a dynamic number of elements.
 */
class SelectedCodesGrid extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    cols: { lg: 1, md: 1, sm: 1, xs: 1, xxs: 1 },
    rowHeight: 40
  };

  constructor(props) {
    super(props);
  }

  /**
   * Handles displaying of each element
   * @param {*} el
   */

  createElement(el) {
    console.log("Creating element: " + el);
    const code = el.add ? "+" : el.code;
    return (
      <div key={code} data-grid={el}>
        <ListItem>
          <IconButton aria-label="Explore" title="Explore on Tree">
            <ExploreIcon />
          </IconButton>
          <ListItemText primary={code} secondary={el.description} />
          <IconButton edge="end" aria-label="Reject" title="Reject" onClick={this.onRemoveItem.bind(this, code)}>
            <RejectIcon />
          </IconButton>
        </ListItem>
      </div>
    );
  }

  onAddItem = code => {
    /*eslint no-console: 0*/

    this.props.addItem(code);
  };

  // We're using the cols coming back from this to calculate where to add new items.
  onBreakpointChange = (breakpoint, cols) => {
    this.setState({
      breakpoint: breakpoint,
      cols: cols
    });
  };

  onLayoutChange = layout => {
    // this.props.onLayoutChange(layout);
    this.setState({ layout: layout });
  };

  onRemoveItem = code => {
    console.log("removing", code);
    this.props.removeItemButton(code);
  };

  render() {
    // const classes = useStyles();

    return (
      <div>
        <List
          dense={true}
          subheader={
            <ListSubheader disableSticky={true} id="nested-list-subheader">
              Selected Codes
            </ListSubheader>
          }
        >
          <ResponsiveReactGridLayout
            onLayoutChange={this.onLayoutChange}
            onBreakpointChange={this.onBreakpointChange}
            isDraggable={true}
            isResizable={false}
            {...this.props}
          >
            {this.props.items.map(el => this.createElement(el))}
          </ResponsiveReactGridLayout>
        </List>
      </div>
    );
  }
}

export default SelectedCodesGrid;
