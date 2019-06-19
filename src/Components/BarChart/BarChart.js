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
    this.getDataFromAPI().then(() => {
      this.drawBarChart();
    });
  }

  recalculateSizes() {
    //let elem = ReactDOM.findDOMNode(this).parentNode;
    this.width = 500; //elem.offsetWidth;
    this.height = this.data.length * 60; //elem.offsetHeight;
    this.barHeight = (this.height - 50) / this.data.length / 2;
    //const minSize = Math.min(this.width, this.height);
    //this.textSize = minSize / 40;
    console.log(this.data.length);
  }

  drawBarChart() {
    this.recalculateSizes();

    d3.select("div." + this.barClass)
      .select("svg")
      .remove();

    this.svg = d3
      .select("div." + this.barClass)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height); // alter this dynamically

    this.maxSuggested = 0;
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].num_suggested > this.maxSuggested) {
        this.maxSuggested = this.data[i].num_suggested;
      }
    }

    this.data.sort((a, b) => (a.num_suggested < b.num_suggested ? 1 : -1));

    this.svg
      .selectAll("rect.totalRect")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("fill", "white")
      .style("fill-opacity", 1e-6)
      .attr("stroke", "black")
      .attr("x", this.width * 0.1)
      .attr("y", (d, i) => {
        return i * this.barHeight * 2 + 50;
      })
      .attr("height", this.barHeight)
      .attr("width", d => (d.num_suggested / this.maxSuggested) * 0.8 * this.width)
      .attr("class", "totalRect")
      .on("mouseover", (d, i) => {
        this.popUp(d, i);
      })
      .on("mouseout", (d, i) => {
        this.clearPopUp(d, i);
      });

    this.svg
      .selectAll("rect.acceptedRect")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("fill", "green")
      .attr("stroke", "black")
      .attr("x", this.width * 0.1)
      .attr("y", (d, i) => {
        return i * this.barHeight * 2 + 50;
      })
      .attr("height", this.barHeight)
      .attr("width", d => (d.num_accepted / this.maxSuggested) * 0.8 * this.width)
      .attr("class", "acceptedRect")
      .on("mouseover", (d, i) => {
        this.popUp(d, i);
      })
      .on("mouseout", (d, i) => {
        this.clearPopUp(d, i);
      });

    this.svg
      .selectAll("rect.rejectedRect")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("fill", "red")
      .attr("stroke", "black")
      .attr("x", d => {
        return this.width * 0.1 + (d.num_accepted / this.maxSuggested) * 0.8 * this.width;
      })
      .attr("y", (d, i) => {
        return i * this.barHeight * 2 + 50;
      })
      .attr("height", this.barHeight)
      .attr("width", d => (d.num_rejected / this.maxSuggested) * 0.8 * this.width)
      .attr("class", "rejectedRect")
      .on("mouseover", (d, i) => {
        this.popUp(d, i);
      })
      .on("mouseout", (d, i) => {
        this.clearPopUp(d, i);
      });

    this.svg
      .selectAll("text.ruleText")
      .data(this.data)
      .enter()
      .append("text")
      .text(d => {
        return d.lhs + " >> " + d.rhs + " - confidence: " + d.confidence.toFixed(2);
      })
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("y", (d, i) => {
        return i * this.barHeight * 2 + 45;
      })
      .attr("x", this.width * 0.1)
      .attr("class", "ruleText");

    this.svg
      .selectAll("text.numText")
      .data(this.data)
      .enter()
      .append("text")
      .text(d => d.num_suggested)
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("y", (d, i) => {
        return i * this.barHeight * 2 + 50 + (this.barHeight * 3) / 4;
      })
      .attr("x", d => {
        return this.width * 0.1 + (d.num_suggested / this.maxSuggested) * 0.8 * this.width + 5;
      })
      .attr("class", "numText");
  }

  popUp(d, i) {
    let popG = this.svg
      .append("g")
      .attr("transform", () => {
        let height = i * this.barHeight * 2 + 50 + this.barHeight;
        return "translate(" + this.width * 0.1 + "," + height + ")";
      })
      .attr("class", "popUpG");

    popG
      .append("rect")
      .attr("fill", "white")
      .attr("width", this.width * 0.4)
      .attr("height", this.barHeight * 1.5)
      .attr("class", "popUpRect");

    popG
      .append("text")
      .text("Accepted: " + d.num_accepted + " (" + ((d.num_accepted / d.num_suggested) * 100).toFixed(0) + "%)")
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("y", this.barHeight / 2 + 5)
      .attr("x", 10);

    popG
      .append("text")
      .text("Rejected: " + d.num_rejected + " (" + ((d.num_rejected / d.num_suggested) * 100).toFixed(0) + "%)")
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("y", this.barHeight + 10)
      .attr("x", 10);
  }

  clearPopUp(d, i) {
    this.svg.selectAll("g.popUpG").remove();
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
