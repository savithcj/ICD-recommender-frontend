import React, { Component } from "react";
import * as d3 from "d3";
import "./BarChart.css";
import ReactDOM from "react-dom";

class BarChart extends Component {
  constructor(props) {
    super(props);

    this.fontType = "sans-serif";
    this.textColor = "black";
    this.barClass = "barVis" + this.props.id;
  }

  componentDidMount() {
    this.drawBarChart();
  }

  recalculateSizes() {
    //let elem = ReactDOM.findDOMNode(this).parentNode;
    this.width = 500; //elem.offsetWidth;
    this.height = this.data.length * 60; //elem.offsetHeight;
    //const minSize = Math.min(this.width, this.height);
    //this.textSize = minSize / 40;
    console.log(this.data.length);
  }

  drawBarChart() {
    this.getDataFromAPI().then(() => {
      this.recalculateSizes();

      d3.select("div." + this.barClass)
        .select("svg")
        .remove();

      this.svg = d3
        .select("div." + this.barClass)
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height); // alter this dynamically

      this.svg
        .append("rect")
        .attr("x", 20)
        .attr("y", 50)
        .attr("height", 300)
        .attr("width", 100)
        .attr("fill", "blue");

      this.svg
        .append("rect")
        .attr("x", 20)
        .attr("y", 490)
        .attr("height", 300)
        .attr("width", 100)
        .attr("fill", "red");

      // drawing border around - delete later
      ///////////////////////////////////////
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
      ///////////////////////////////////////
      ///////////////////////////////////////
    });
  }

  getDataFromAPI = () => {
    const url = "http://localhost:8000/api/rules/?format=json";
    return fetch(url)
      .then(response => response.json())
      .then(parsedJson => {
        this.data = parsedJson;
      });
  };

  render() {
    return <div id={"bar" + this.props.id} className={this.barClass} />;
  }
}

export default BarChart;
