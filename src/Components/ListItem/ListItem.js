import React from 'react'

function buildList(props) {
    return (
      <div>
        {props.items.map((item, index) => (
          <Item key={index} item={item} />
        ))}
      </div>
    );
  }

class ListItem extends React.Component {

    constructor(props) {
        super(props)
        
    }


    render () {

    }

}