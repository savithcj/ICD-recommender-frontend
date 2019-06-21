import React, { Component } from "react";
import * as d3 from "d3";
import { sliderBottom } from "d3-simple-slider";
import ReactDOM from "react-dom";

import APIClass from "./../../Model/API";

class ChordDiagram extends Component {
  constructor(props) {
    super(props);

    this.sliderMin = 1;
    this.sliderMax = 35;
    this.numTicks = 10;
    this.fontType = "sans-serif";
    this.textColor = "black";
    this.defaultSliderValue = 1;
    this.chordClass = "chordVis" + this.props.id;
  }

  componentDidMount() {
    this.getDataFromAPI().then(() => {
      this.drawChordDiagram();
    });
  }

  handleResize() {
    if (this.data === undefined) {
      // console.log("No data");
    } else {
      this.recalculateSizes();
      this.drawChordDiagram();
    }
  }

  recalculateSizes() {
    let elem = ReactDOM.findDOMNode(this).parentNode;
    this.width = elem.offsetWidth;
    this.height = elem.offsetHeight;
    const minSize = Math.min(this.width, this.height);
    this.cRadius = minSize / 3.5;
    this.textSize = minSize / 45;
    this.barHeight = 0.08 * minSize;
    this.centerX = this.width * 0.4;
    this.centerY = this.height / 2;
  }

  addInfoText() {
    let infoG = this.svg.append("g").attr("class", "infoG");
    this.infoText = infoG
      .append("text")
      .attr("y", this.height * 0.05)
      .attr("x", this.width * 0.02)
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .text("")
      .style("text-anchor", "left");
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

    this.addInfoText();

    this.parentNames = new Set();
    this.parentDescriptions = new Set();
    for (let i = 0; i < this.data.length; i++) {
      this.parentNames.add(this.data[i].parent);
      this.parentDescriptions.add(this.data[i].parent + ": " + this.data[i].parent_description);
    }
    this.parentNames = Array.from(this.parentNames);
    let colormap = require("colormap");
    this.colours = colormap({
      colormap: "rainbow-soft",
      nshades: this.parentNames.length, // number of chapters
      format: "hex",
      alpha: 1
    });

    this.numBars = this.data.length;
    this.barWidth = 2 * this.cRadius * Math.sin(Math.PI / this.numBars);
    this.maxCoded = 0;
    for (let i = 0; i < this.numBars; i++) {
      if (this.data[i].times_coded > this.maxCoded) {
        this.maxCoded = this.data[i].times_coded;
      }
    }
    this.bars = [];
    this.sliceAngle = 360 / this.data.length;
    for (let i = 0; i < this.numBars; i++) {
      let angle = (((i * 360) / this.numBars - 90) * Math.PI) / 180;
      let nextAngle;
      if (i !== this.numBars - 1) {
        nextAngle = ((((i + 1) * 360) / this.numBars - 90) * Math.PI) / 180;
      } else {
        nextAngle = Math.PI / -2;
      }
      this.bars.push({
        x: this.cRadius * Math.cos(angle) + this.centerX,
        y: this.cRadius * Math.sin(angle) + this.centerY,
        nextX: this.cRadius * Math.cos(nextAngle) + this.centerX,
        nextY: this.cRadius * Math.sin(nextAngle) + this.centerX,
        block: this.data[i].block,
        normTimes: this.data[i].times_coded / this.maxCoded,
        parent: this.data[i].parent,
        description: this.data[i].description,
        angle: angle
      });
    }

    this.svg
      .selectAll("rect.barRect")
      .data(this.bars)
      .enter()
      .append("rect")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("fill", d => this.calcColour(d.parent))
      .attr("class", "barRect")
      .attr("width", d => {
        return this.barHeight * d.normTimes;
      })
      .attr("height", this.barWidth)
      .attr("transform", d => {
        let angle = (d.angle * 180) / Math.PI + this.sliceAngle / 2;
        return "rotate(" + angle + "," + d.x + "," + d.y + ")";
      });

    this.svg
      .selectAll("rect.invisibleRect")
      .data(this.bars)
      .enter()
      .append("rect")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("class", "invisibleRect")
      .attr("width", this.barHeight)
      .style("fill-opacity", 1e-6)
      .style("stroke", "black")
      .style("stroke-opacity", 1e-6)
      .attr("height", this.barWidth)
      .attr("id", (d, i) => {
        return "rect" + i;
      })
      .attr("transform", d => {
        let angle = (d.angle * 180) / Math.PI + this.sliceAngle / 2;
        return "rotate(" + angle + "," + d.x + "," + d.y + ")";
      })
      .on("mouseover", (d, i) => {
        this.infoText.text(d.block + ":" + d.description);
        this.drawOverlayCurves(i);
        console.log("#rect" + i);
        this.svg
          .select("#rect" + i)
          //.style("fill-opacity", 1)
          //.attr("fill", "black")
          .style("stroke-opacity", 1);
      })
      .on("mouseout", (d, i) => {
        this.infoText.text("");
        this.deleteOverlayCurves(i);
        this.svg.select("#rect" + i).style("stroke-opacity", 1e-6);
      });

    var slider = sliderBottom()
      .min(this.sliderMin)
      .max(this.sliderMax)
      .width(1.5 * this.cRadius)
      .ticks(this.numTicks)
      .default(this.defaultSliderValue)
      .step(1)
      .on("onchange", val => {
        this.minRules = val;
        this.generateCurves();
      });

    this.svg
      .append("g")
      .attr(
        "transform",
        "translate(" +
          (this.centerX - 0.5 * this.cRadius) +
          "," +
          (this.centerY + this.cRadius + 1.2 * this.barHeight) +
          ")"
      )
      .call(slider);

    // rectangle to make it so cursor isn't shown when hovering over ticks
    this.svg
      .append("rect")
      .attr("x", 0)
      .attr("y", this.height * 0.95)
      .attr("width", this.width)
      .attr("height", this.height * 0.05)
      .style("fill-opacity", 1e-6);

    //this is the cutoff for the minimum number of rules
    this.minRules = 1;

    this.generateCurves();

    this.svg
      .append("text")
      .text("Minimum rules:")
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", this.centerY + this.cRadius + 1.2 * this.barHeight)
      .attr("x", this.centerX - 0.5 * this.cRadius - 0.02 * this.width)
      .attr("class", "minRuleText")
      .style("text-anchor", "end");

    let sorted = [...this.parentNames];
    let sortedDescriptions = [...this.parentDescriptions];
    sorted.sort();
    sortedDescriptions.sort();
    this.svg
      .selectAll("text.legendText")
      .data(sorted)
      .enter()
      .append("text")
      .text(d => d)
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", (d, i) => {
        return i * this.textSize * 1.5 + (this.centerY - 0.75 * this.textSize * sorted.length);
      })
      .attr("x", () => {
        return this.centerX + this.cRadius + 2.5 * this.barHeight;
      })
      .attr("class", "legendText")
      .style("text-anchor", "end")
      .on("mouseover", (d, i) => {
        this.infoText.text(sortedDescriptions[i]);
      })
      .on("mouseout", (d, i) => {
        this.infoText.text("");
      });

    this.svg
      .selectAll("rect.legendRect")
      .data(sorted)
      .enter()
      .append("rect")
      .attr("fill", d => {
        return this.calcColour(d);
      })
      .attr("y", (d, i) => {
        return i * this.textSize * 1.5 + (this.centerY - 0.75 * this.textSize * sorted.length - 0.01 * this.height);
        //return i * this.textSize * 1.5 + 0.137 * this.height;
      })
      .attr("x", () => {
        return this.centerX + this.cRadius + 2.5 * this.barHeight + 5;
      })
      .attr("class", "legendRect")
      .attr("width", this.width * 0.05)
      .attr("height", this.height * 0.01)
      .on("mouseover", (d, i) => {
        this.infoText.text(sortedDescriptions[i]);
      })
      .on("mouseout", (d, i) => {
        this.infoText.text("");
      });
  }

  drawOverlayCurves(row) {
    this.drawCurves(row, row, 4);
  }

  deleteOverlayCurves(row) {
    this.svg.selectAll("path.curve" + row).remove();
  }

  generateCurves() {
    this.svg.selectAll("path.curve").remove();

    //generate startpoints and endpoints for the rule curves
    //start points are a little offset from the endpoints
    this.startPoints = [];
    this.endPoints = [];
    for (let i = 0; i < this.data.length; i++) {
      let angle = (((i * 360) / this.numBars - 90) * Math.PI) / 180;
      let offset = ((360 / this.numBars) * Math.PI) / 180 / 3;
      this.startPoints.push({
        x: this.cRadius * Math.cos(angle + offset) + this.centerX,
        y: this.cRadius * Math.sin(angle + offset) + this.centerY,
        parent: this.data[i].parent
      });
      this.endPoints.push({
        x: this.cRadius * Math.cos(angle + 2 * offset) + this.centerX,
        y: this.cRadius * Math.sin(angle + 2 * offset) + this.centerY
      });
    }

    //draw rule curves
    for (let i = 0; i < this.data.length; i++) {
      this.drawCurves(i, "", 0.25);
    }
  }

  drawCurves(row, className, strokeWidth) {
    let destinations = this.data[row].destination_counts.split(",").map(Number);
    for (let col = 0; col < destinations.length; col++) {
      if (row !== col && destinations[col] >= this.minRules) {
        let bezierString =
          "M" +
          this.startPoints[row].x +
          "," +
          this.startPoints[row].y +
          " Q" +
          this.centerX +
          "," +
          this.centerY +
          " " +
          this.endPoints[col].x +
          "," +
          this.endPoints[col].y;
        this.svg
          .append("svg:path")
          .attr("class", "curve" + className)
          .attr("d", bezierString)
          // .attr("fill", "blue")
          .style("stroke", this.calcColour(this.data[row].parent))
          .attr("stroke-width", strokeWidth)
          // .attr("marker-end", "url(#arrow)")
          .attr("fill", "none");
        // .append("text");
      }
    }
  }

  calcColour(parent) {
    return this.colours[this.parentNames.indexOf(parent)];
  }

  getDataFromAPI = () => {
    const url = APIClass.getAPIURL("CODE_BLOCK_USAGE") + "?format=json";
    return fetch(url)
      .then(response => response.json())
      .then(parsedJson => {
        this.data = parsedJson;
      });
  };

  render() {
    return <div id={"chord" + this.props.id} className={this.chordClass} />;
  }
}

export default ChordDiagram;
