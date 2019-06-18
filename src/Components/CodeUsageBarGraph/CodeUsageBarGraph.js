import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";
import "./CodeUsageBarGraph.css";

class CodeUsageBarGraph extends Component {
  constructor(props) {
    super(props);

    this.data = [10, 20, 30];
    this.svgWidth = 1000;
    this.svgHeight = 500;
    this.barPadding = 5;
    this.barWidth = this.svgWidth / this.data.length;
    this.barGraphClass = "bargraphVis" + this.props.id;
    this.selectedAttribute = "num_suggested";
  }

  componentDidMount() {
    // this.getDataFromAPI().then(() => {
    //   this.drawBarChart();
    //   console.log(this.data);
    // });
  }

  getDataFromAPI = () => {
    const url = "http://localhost:8000/api/rules/?format=json";
    return fetch(url)
      .then(response => response.json())
      .then(parsedJson => {
        this.data = parsedJson;
      });
  };

  drawBarChart = () => {
    d3.select("div." + this.barGraphClass)
      .select("svg")
      .remove();

    this.svg = d3
      .select("div." + this.barGraphClass)
      .append("svg")
      .attr("width", this.svgWidth)
      .attr("height", this.svgHeight);

    // const yScale = d3
    //   .scaleLinear()
    //   .domain([0, d3.max(this.data)])
    //   .range([0, this.svgHeight]);

    let barChart = this.svg
      .selectAll("rect")
      .data(this.data.data.num_suggested)
      .enter()
      .append("rect")

      .attr("x", (d, i) => {
        return i * this.barWidth;
      })
      .attr("y", function(d) {
        return this.svgHeight - d;
      })
      .attr("fill", "black")
      .style("fill-opacity", 0.5)
      .attr("height", function(d) {
        return d;
      })
      .attr("width", this.barWidth - this.barPadding);

    this.drawTextLabels();
  };

  drawTextLabels = () => {
    let text = this.svg
      .selectAll("text")
      .data(this.data.num_suggested)
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
      })
      .attr("fill", "black");
  };

  render() {
    return <div id={"codeUsageBarGraph" + this.props.id} className={this.barGraphClass} />;
  }
}

export default CodeUsageBarGraph;
