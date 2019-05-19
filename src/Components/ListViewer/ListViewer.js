import React from 'react';
import "./ListViewer.css"

/**
 * This component takes a list of items and returns
 * an element containing the list of items. When an 
 * item is clicked, it is removed from the original list
 */
const listViewer = props => {

    return (
        <div className="itemContainer">
            <h3 className="containerTitle">
                {props.title}
            </h3>
            {props.items.map(item => {
                let displayValue = props.valueName === undefined
                    ? item
                    : item[props.valueName];
                let descriptionValue = props.descriptionName === undefined
                    ? ""
                    : ": " + item[props.descriptionName]
                return (
                    <div
                        className="listItem"
                        key={item[props.keyName]}>
                        {displayValue + descriptionValue}
                        <span>
                            <button
                                id = {item[props.keyName]}
                                onClick={props.onItemClick}>
                                remove
                            </button>
                        </span>
                    </div>
                )
            })}
        </div>
    );

};

export default listViewer;