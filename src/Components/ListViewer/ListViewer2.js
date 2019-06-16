import React, { Component } from "react";

class ListViewer extends Component {
  createItems(arrayOfItems) {
    return arrayOfItems.map((value, index) => {
      console.log("ListViewer map items called");
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
