import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";

class CodeUsageBarGraph extends Component {
  constructor(props) {
    super(props);

    this.dataset = [80, 500, 50, 60, 40, 30, 20];
    this.svgWidth = 500;
    this.svgHeight = 500;
    this.barPadding = 5;
    this.barWidth = this.svgWidth / this.dataset.length;
    this.barGraphClass = "bargraphVis" + this.props.id;
  }

  componentDidMount() {
    this.drawBarChart();
  }

  drawBarChart = () => {
    d3.select("div." + this.barGraphClass)
      .select("svg")
      .remove();

    this.svg = d3
      .select("div." + this.barGraphClass)
      .append("svg")
      .attr("width", this.svgWidth)
      .attr("height", this.svgHeight);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.dataset)])
      .range([0, this.svgHeight]);

    let barChart = this.svg
      .selectAll("rect")
      .data(this.dataset)
      .enter()
      .append("rect")

      .attr("x", (d, i) => {
        return i * this.barWidth;
      })
      .attr("y", function(d) {
        return this.svgHeight - d;
      })
      .attr("fill", "black")
      .attr("height", function(d) {
        return d;
      })
      .attr("width", this.barWidth - this.barPadding);

    this.drawTextLabels();
  };

  drawTextLabels = () => {
    let text = this.svg
      .selectAll("text")
      .data(this.dataset)
      .enter()
      .append("text")
      .text(function(d) {
        return d;
      })
      .attr("y", function(d, i) {
        return this.svgHeight - d - 2;
      })
      .attr("x", function(d, i) {
        return this.barWidth * i;
      });
  };

  render() {
    return <div id={"codeUsageBarGraph" + this.props.id} className={this.barGraphClass} />;
  }
}

export default CodeUsageBarGraph;
