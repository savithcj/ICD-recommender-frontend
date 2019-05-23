import React from "react";
import "./ListViewer.css";

/**
 * This component takes a list of items and returns
 * a JSX element containing the list of items. When an
 * item is clicked, it is removed from the original list
 */
const listViewer = props => {
  let displayItems = null;

  if (props.items === null || props.items === undefined) {
    displayItems = <p>{props.nullItemsMessage}</p>;
  } else if (props.items === 1) {
    displayItems = <p>{props.customMessage}</p>;
  } else if (props.items.length === 0) {
    displayItems = <p>{props.noItemsMessage}</p>;
  } else {
    displayItems = props.items.map(item => {
      let displayValue =
        props.valueName === undefined ? "" : item[props.valueName];
      let descriptionValue =
        props.descriptionName === undefined
          ? ""
          : ": " + item[props.descriptionName];
      let tooltip =
        props.tooltipValueName === undefined ? (
          ""
        ) : (
          <span className="tooltiptext">{item[props.tooltipValueName]}</span>
        );
      let removeItemButton =
        props.removeItemButton === undefined ? (
          ""
        ) : (
          <span>
            <button id={item[props.keyName]} onClick={props.removeItemButton}>
              remove
            </button>
          </span>
        );

      return (
        <div className="listItem" key={item[props.keyName]}>
          <div className="tooltip">
            {displayValue + descriptionValue}
            {removeItemButton}
            {tooltip}
          </div>

          <hr />
        </div>
      );
    });
  }

  let removeAllItemsButton =
    props.removeAllItemsButton === undefined ||
    props.removeAllItemsButton === null ? (
      ""
    ) : (
      <span>
        <button onClick={props.removeAllItemsButton}>remove all</button>
      </span>
    );

  return (
    <div className="itemContainer">
      <h3 className="containerTitle">
        {props.title}
        {removeAllItemsButton}
      </h3>
      {displayItems}
    </div>
  );
};

export default listViewer;
