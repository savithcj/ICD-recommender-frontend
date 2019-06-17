import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import SwipeableViews from "react-swipeable-views";

const styles = {
  panel: {
    position: "relative"
  },
  tabs: {
    padding: "0",
    margin: "0 0 -3px -3px",
    width: "100%",
    position: "absolute",
    background: "#e0e0e0",
    bottom: "0px"
  },

  slide: {
    width: "100%",
    height: "100%"
    // justifyContent: "center"
  }
};

class SwipablePanel extends React.Component {
  state = {
    index: 0
  };

  handleChange = (event, value) => {
    this.setState({
      index: value
    });
  };

  handleChangeIndex = index => {
    this.setState({
      index
    });
  };

  render() {
    const { index } = this.state;

    return (
      <div className={styles.panel}>
        <SwipeableViews index={index} onChangeIndex={this.handleChangeIndex}>
          <div style={Object.assign({}, styles.slide)}>{this.props.tree}</div>
          <div style={Object.assign({}, styles.slide)}>{this.props.chord}</div>
        </SwipeableViews>
        <Tabs value={index} variant="fullWidth" onChange={this.handleChange} style={styles.tabs}>
          <Tab label="Code Tree Explorer" />
          <Tab label="Chord Diagram" />
        </Tabs>
      </div>
    );
  }
}

export default SwipablePanel;
