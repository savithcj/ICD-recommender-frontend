import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";
import "./VerticalBarGraphs.css";

import APIClass from "../../Assets/Util/API";

const DIV = "verticalBarGraph";

class VerticalBarGraphs extends Component {
  constructor(props) {
    super(props);
    this.divID = "div#" + DIV + this.props.id;
  }

  componentDidMount() {
    this.getDataFromAPI().then(() => {
      this.drawBarChart();
    });
  }

  getDataFromAPI = () => {
    const url = APIClass.getAPIURL("RULES") + "?format=json";
    return fetch(url)
      .then(response => response.json())
      .then(parsedJson => {
        this.data = parsedJson;
      });
  };

  updateSizes = () => {
    this.svgWidth = this.data.length * 35;
    this.svgHeight = 500;
    this.barPadding = 5;
    this.barWidth = this.svgWidth / this.data.length / 3;
    this.maxConfSupp = 0;
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].confidence > this.maxConfSupp) {
        this.maxConfSupp = this.data[i].confidence;
      }
      if (this.data[i].support > this.maxConfSupp) {
        this.maxConfSupp = this.data[i].support;
      }
    }
    // console.log("height=" + this.svgHeight);
    // console.log("barWidth=" + this.barWidth);
    // console.log("maxConfSupp=" + this.maxConfSupp);
  };

  drawBarChart = () => {
    this.data.sort((a, b) => (a.num_suggested < b.num_suggested ? 1 : -1));
    this.updateSizes();

    d3.select(this.divID)
      .selectAll("svg")
      .remove();

    this.svg = d3
      .select(this.divID)
      .append("svg")
      .attr("width", this.svgWidth)
      .attr("height", this.svgHeight);

    console.log(this.data);
    this.drawConfidenceBars();
    this.drawSupportBars();
    // this.drawTextLabels();
  };

  drawConfidenceBars = () => {
    this.svg
      .selectAll("rect.barRect")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("fill", "black")
      .attr("x", (d, i) => {
        return i * this.barWidth * 3;
      })
      .attr("y", d => {
        return this.svgHeight - (this.svgHeight / this.maxConfSupp) * d.confidence;
      })
      .style("fill-opacity", 0.5)
      .attr("height", d => {
        return (this.svgHeight / this.maxConfSupp) * d.confidence;
      })
      .attr("width", this.barWidth)
      .attr("class", "barRect");
  };

  drawSupportBars = () => {
    this.svg
      .selectAll("rect.supportRect")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("fill", "red")
      .attr("x", (d, i) => {
        return i * this.barWidth * 3 + this.barWidth;
      })
      .attr("y", d => {
        return this.svgHeight - (this.svgHeight / this.maxConfSupp) * d.support;
      })
      .style("fill-opacity", 0.5)
      .attr("height", d => {
        return (this.svgHeight / this.maxConfSupp) * d.support;
      })
      .attr("width", this.barWidth)
      .attr("class", "supportRect");
  };

  drawAcceptRejectRatioBars = () => {};

  //   drawTextLabels = () => {
  //     let text = this.svg
  //       .selectAll("text")
  //       .data(this.data.num_suggested)
  //       .enter()
  //       .append("text")
  //       .text(function(d) {
  //         return d;
  //       })
  //       .attr("y", function(d, i) {
  //         return this.svgHeight - d - 2;
  //       })
  //       .attr("x", function(d, i) {
  //         return this.barWidth * i;
  //       })
  //       .attr("fill", "black");
  //   };

  render() {
    return <div id={DIV + this.props.id} />;
  }
}

export default VerticalBarGraphs;
