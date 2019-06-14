import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";

class ChordDiagram extends Component {
  constructor(props) {
    super(props);

    this.chordClass = "chordVis" + this.props.id;
  }

  componentDidMount() {
    // this.getDataFromAPI("Chapter 01").then(() => {
    //   this.drawInitialTree();
    // });
    this.drawChordDiagram();
  }

  recalculateSizes() {
    let elem = ReactDOM.findDOMNode(this).parentNode;
    this.width = 500; //elem.offsetWidth;
    this.height = 500; //elem.offsetHeight;
    const minSize = Math.min(this.width, this.height);
  }

  drawChordDiagram() {
    this.recalculateSizes();

    d3.select("div." + this.chordClass)
      .select("svg")
      .remove();

    this.svg = d3
      .select("div." + this.chordClass)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.svg
      .append("circle")
      .attr("r", 50)
      .attr("cx", this.width / 2)
      .attr("cy", this.height / 2)
      .style("fill", "red");

    // drawing border around - delete later
    this.svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", this.width)
      .attr("y2", 0)
      .attr("stroke-width", 10)
      .attr("stroke", "black");
    this.svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", this.height)
      .attr("stroke-width", 10)
      .attr("stroke", "black");
    this.svg
      .append("line")
      .attr("x1", this.width)
      .attr("y1", 0)
      .attr("x2", this.width)
      .attr("y2", this.height)
      .attr("stroke-width", 10)
      .attr("stroke", "black");
    this.svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", this.height)
      .attr("x2", this.width)
      .attr("y2", this.height)
      .attr("stroke-width", 10)
      .attr("stroke", "black");
  }

  render() {
    return <div id={"chord" + this.props.id} className={this.chordClass} />;
  }
}

export default ChordDiagram;
