import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import _ from "lodash";
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
    this.state = {
      items: []
    };
  }

  createElement(el) {
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
    console.log("adding" + code);

    this.setState({
      // Add a new item. It must have an unique key!
      items: this.state.items.concat({
        i: code,
        x: (this.state.items.length * 2) % (this.state.cols || 1),
        y: Infinity, // puts it at the bottom
        w: 3,
        h: 1
      })
    });
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
    this.setState({ items: _.reject(this.state.items, { i: i }) });
  };

  render() {
    // if (this.props.items.length > 0) {
    //   const codeObj = this.props.items;
    //   const codeObjList = codeObj.map(item => {
    //     return {
    //       i: item.code,
    //       x: 0,
    //       y: Infinity,
    //       w: 3,
    //       h: 1
    //     };
    //   });
    //   console.log(codeObjList);
    //   this.setState({ items: codeObjList });
    // }

    return (
      <div>
        <ResponsiveReactGridLayout
          onLayoutChange={this.onLayoutChange}
          onBreakpointChange={this.onBreakpointChange}
          isDraggable={true}
          isResizable={false}
          {...this.props}
        >
          {_.map(this.state.items, el => this.createElement(el))}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

export default SelectedCodesGrid;
