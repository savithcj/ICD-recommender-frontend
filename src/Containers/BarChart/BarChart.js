import React, { Component } from "react";
import * as d3 from "d3";
import "./BarChart.css";
import ReactDOM from "react-dom";

import * as APIUtility from "../../Util/API";

class BarChart extends Component {
  constructor(props) {
    super(props);

    this.fontType = "sans-serif"; // Font type to be used throughout the chart
    this.textColor = "black"; // Font colour to be used throughout the chart
    this.barClass = "barVis" + this.props.id; // Class name
  }

  componentDidMount() {
    this.getDataFromAPI().then(() => {
      this.drawBarChart(); // Draws bar chart
      this.forceUpdate(); // Forces re-render so that it takes up the appropriate space
    });
  }

  // Recalculates svg and element sizes when the chart is resized
  recalculateSizes() {
    let elem = ReactDOM.findDOMNode(this).parentNode;
    this.width = elem.offsetWidth - 30;
    this.divHeight = elem.offsetHeight;
    this.height = this.data.length * 60;
    this.barHeight = (this.height - 50) / this.data.length / 2;
    const minSize = Math.min(this.width, this.divHeight);
    this.textSize = minSize / 30;
  }

  // Called from the visualization page
  handleResize() {
    if (this.data === undefined) {
      // do nothing
    } else {
      this.drawBarChart(); // Draw bar chart
      this.forceUpdate(); // Forces re-render so that it takes up the appropriate space
    }
  }

  // Creates the bar chart
  drawBarChart() {
    this.recalculateSizes(); // calculate sizes before drawing

    // Remove existing bar chart svg
    d3.select("div." + this.barClass)
      .select("svg")
      .remove();

    // Create new svg for the bar chart
    this.svg = d3
      .select("div." + this.barClass)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height); // alter this dynamically

    // Finding the maximum number of times a rule has been suggested.
    // Used to calculate bar width later
    this.maxSuggested = 0;
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].num_suggested > this.maxSuggested) {
        this.maxSuggested = this.data[i].num_suggested;
      }
    }

    // Sorting data to display it in descending order
    this.data.sort((a, b) => (a.num_suggested < b.num_suggested ? 1 : -1));

    // Drawing the rectangles based on times the rule has been suggested
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
        // Shows more statistics when mousing over
        this.popUp(d, i);
      })
      .on("mouseout", (d, i) => {
        // Removes the popup from mouseover
        this.clearPopUp(d, i);
      });

    // Drawing the rectanbles for number of times the rule has been accepted
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
        // Shows more statistics when mousing over
        this.popUp(d, i);
      })
      .on("mouseout", (d, i) => {
        // Removes the popup from mouseover
        this.clearPopUp(d, i);
      });

    // Drawing the rectangles for number of times the rule has been rejected
    this.svg
      .selectAll("rect.rejectedRect")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("fill", "red")
      .attr("stroke", "black")
      .attr("x", d => {
        // Starting where the accepted rectangle ends
        return this.width * 0.1 + (d.num_accepted / this.maxSuggested) * 0.8 * this.width;
      })
      .attr("y", (d, i) => {
        return i * this.barHeight * 2 + 50;
      })
      .attr("height", this.barHeight)
      .attr("width", d => (d.num_rejected / this.maxSuggested) * 0.8 * this.width)
      .attr("class", "rejectedRect")
      .on("mouseover", (d, i) => {
        // Shows more statistics when mousing over
        this.popUp(d, i);
      })
      .on("mouseout", (d, i) => {
        // Removes the popup from mouseover
        this.clearPopUp(d, i);
      });

    // Displaying information about the rule above each bar
    this.svg
      .selectAll("text.ruleText")
      .data(this.data)
      .enter()
      .append("text")
      .text(d => {
        // LHS -> RHS - confidence: 0.xx (2 decimal places)
        return d.lhs + " \u2192 " + d.rhs + " - confidence: " + d.confidence.toFixed(2);
      })
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("y", (d, i) => {
        return i * this.barHeight * 2 + 45;
      })
      .attr("x", this.width * 0.1)
      .attr("class", "ruleText");

    // Displaying the number of times the rule has been suggested to the right of the bar
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

  // Creates the popup when hovering over a bar
  popUp(d, i) {
    let popG = this.svg
      .append("g") // Appending "g" element for both text and rectangle
      .attr("transform", () => {
        let height = i * this.barHeight * 2 + 50 + this.barHeight;
        return "translate(" + this.width * 0.1 + "," + height + ")";
      })
      .attr("class", "popUpG");

    // Adding the white background to display text on
    popG
      .append("rect")
      .attr("fill", "white")
      .attr("width", this.width * 0.4)
      .attr("height", this.barHeight * 1.5)
      .attr("class", "popUpRect");

    // Adding the text showing the acceptance rate
    popG
      .append("text")
      .text("Accepted: " + d.num_accepted + " (" + ((d.num_accepted / d.num_suggested) * 100).toFixed(0) + "%)") // Shows in percent with 0 decimals
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("y", this.barHeight / 2 + 5)
      .attr("x", 10);

    // Adding the text showing the rejection rate
    popG
      .append("text")
      .text("Rejected: " + d.num_rejected + " (" + ((d.num_rejected / d.num_suggested) * 100).toFixed(0) + "%)") // Shows in percent with 0 decimals
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("y", this.barHeight + 10)
      .attr("x", 10);
  }

  // Removes the popup when removing the mouse from a bar
  clearPopUp(d, i) {
    this.svg.selectAll("g.popUpG").remove();
  }

  // Retrieves data from Django via API call
  getDataFromAPI = () => {
    return APIUtility.API.makeAPICall(APIUtility.RULES)
      .then(response => response.json())
      .then(parsedJson => {
        this.data = parsedJson;
      });
  };

  // Renders the bar chart
  render() {
    const style = {
      height: this.divHeight, // Takes up this much space on the screen
      overflowY: "scroll" // The rest of the chart can be seen by scrolling
    };
    return <div id={"bar" + this.props.id} className={this.barClass} style={style} />;
  }
}

export default BarChart;
