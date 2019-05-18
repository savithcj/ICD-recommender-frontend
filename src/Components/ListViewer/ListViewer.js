import React from 'react';
import "./ListViewer.css"

/**
 * This component takes a list of items and returns
 * an element conataing the list of items. When a 
 * item is clicked, it is removed from the orinal list
 */
const listViewer = props => {

    return (
        <div className="itemContainer">
            <h1 className="containerTitle">
                {props.title}
            </h1>
            {props.items.map(item => {
                return (
                    <div
                        className="listItem"
                        key={item.id}
                        onClick={props.onItemClick}>
                        {item.code + ": " + item.description}
                    </div>
                )
            })}
        </div>
    );

};

export default listViewer;