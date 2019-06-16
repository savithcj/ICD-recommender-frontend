import React, { Component, PureComponent } from "react";

class ListViewer extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    console.log("compared");
    return this.props.items !== nextProps.items;
  }

  createItems(arrayOfItems) {
    return arrayOfItems.map((value, index) => {
      console.log("item map called");
      return (
        <li key={value[this.props.keyName]} id={index}>
          {value[this.props.descriptionName]}
        </li>
      );
    });
  }

  render() {
    return Array.isArray(this.props.items) ? <ul>{this.createItems(this.props.items)}</ul> : null;
  }
}

export default ListViewer;
