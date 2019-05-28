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
            <object id={item[props.keyName]} onClick={props.removeItemButton}>
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.597 17.954l-4.591-4.55-4.555 4.596-1.405-1.405 4.547-4.592-4.593-4.552 1.405-1.405 4.588 4.543 4.545-4.589 1.416 1.403-4.546 4.587 4.592 4.548-1.403 1.416z" />
              </svg>
            </object>
          </span>
        );

      let acceptItemButton =
        props.acceptItemButton === undefined ? (
          ""
        ) : (
          <span>
            <object id={item[props.keyName]} onClick={props.removeItemButton}>
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1 17l-5-5.299 1.399-1.43 3.574 3.736 6.572-7.007 1.455 1.403-8 8.597z" />
              </svg>
            </object>
          </span>
        );

      return (
        <div className="listItem" key={item[props.keyName]}>
          <div className="tooltip">
            {displayValue + descriptionValue}
            {acceptItemButton}
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
