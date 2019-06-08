import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import CustomListItem from "../CustomListItem/CustomListItem";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

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
    const removeStyle = {
      position: "absolute",
      right: "2px",
      top: 0,
      cursor: "pointer"
    };
    const i = el.add ? "+" : el.i;
    return (
      <div key={i} data-grid={el}>
        <span className="text">{i}</span>
        <span className="remove" style={removeStyle} onClick={this.onRemoveItem.bind(this, i)}>
          Remove me!
        </span>
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

  onRemoveItem = i => {
    console.log("removing", i);
    this.props.removeItemButton(i);
  };

  render() {
    return (
      <div>
        <ResponsiveReactGridLayout
          onLayoutChange={this.onLayoutChange}
          onBreakpointChange={this.onBreakpointChange}
          isDraggable={true}
          isResizable={false}
          {...this.props}
        >
          {this.props.itemsGrid.map(el => this.createElement(el))}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

export default SelectedCodesGrid;
