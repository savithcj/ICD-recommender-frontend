import React, { Component } from "react";
import { sortableContainer, sortableElement, sortableHandle } from "react-sortable-hoc";
import arrayMove from "array-move";

import Card from "@material-ui/core/Card";

import "./SortableList.css";

const SortableItem = sortableElement(({ value }) => <li className="SortableItem">{value}</li>);

const SortableList = sortableContainer(({ items }) => {
  return (
    <ul className="SortableList">
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
    </ul>
  );
});

class SortableComponent extends Component {
  state = {
    items: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"]
  };
  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      items: arrayMove(this.state.items, oldIndex, newIndex)
    });
  };
  render() {
    return <SortableList items={this.state.items} onSortEnd={this.onSortEnd} helperClass="SortableHelper" />;
  }
}

export default SortableComponent;
