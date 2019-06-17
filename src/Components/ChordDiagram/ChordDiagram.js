import React, { Component } from "react";
import * as d3 from "d3";
import { sliderBottom } from "d3-simple-slider";
import ReactDOM from "react-dom";

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
    // this.getDataFromAPI("Chapter 01").then(() => {
    //   this.drawInitialTree();
    // });
    this.getDataFromAPI().then(() => {
      this.drawChordDiagram();
    });
  }

  recalculateSizes() {
    //let elem = ReactDOM.findDOMNode(this).parentNode;
    this.width = 500; //elem.offsetWidth;
    this.height = 500; //elem.offsetHeight;
    const minSize = Math.min(this.width, this.height);
    this.cRadius = minSize / 3;
    this.textSize = minSize / 40;
    this.barHeight = 0.15 * minSize;
  }

  addInfoText() {
    let infoG = this.svg.append("g").attr("class", "infoG");
    this.infoText = infoG
      .append("text")
      .attr("y", this.height * 0.05)
      .attr("x", this.width * 0.05)
      // .attr("font-family", this.fontType)
      // .attr("font-size", this.textSize)
      // .attr("fill", this.textColor)
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

    this.chapterNames = new Set();
    for (let i = 0; i < this.data.length; i++) {
      this.chapterNames.add(this.data[i].parent);
    }
    this.chapterNames = Array.from(this.chapterNames);
    let colormap = require("colormap");
    this.colours = colormap({
      colormap: "rainbow-soft",
      nshades: this.chapterNames.length, // number of chapters
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
    for (let i = 0; i < this.numBars; i++) {
      let angle = (((i * 360) / this.numBars - 90) * Math.PI) / 180;
      let nextAngle;
      if (i !== this.numBars - 1) {
        nextAngle = ((((i + 1) * 360) / this.numBars - 90) * Math.PI) / 180;
      } else {
        nextAngle = Math.PI / -2;
      }
      this.bars.push({
        x: this.cRadius * Math.cos(angle) + this.width / 2,
        y: this.cRadius * Math.sin(angle) + this.height / 2,
        nextX: this.cRadius * Math.cos(nextAngle) + this.width / 2,
        nextY: this.cRadius * Math.sin(nextAngle) + this.width / 2,
        block: this.data[i].block,
        normTimes: this.data[i].times_coded / this.maxCoded,
        parent: this.data[i].parent,
        description: this.data[i].description
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
        let angle = (Math.atan2(d.y - d.nextY, d.x - d.nextX) * 180) / Math.PI + 90;
        return "rotate(" + angle + "," + d.x + "," + d.y + ")";
      })
      .on("mouseover", (d, i) => {
        this.infoText.text(d.block + ":" + d.description);
        this.drawOverlayCurves(i);
      })
      .on("mouseout", (d, i) => {
        this.infoText.text("");
        this.deleteOverlayCurves(i);
      });

    var slider = sliderBottom()
      .min(this.sliderMin)
      .max(this.sliderMax)
      .width(this.width / 2)
      .ticks(this.numTicks)
      .default(this.defaultSliderValue)
      .on("onchange", val => {
        this.minRules = val;
        this.generateCurves();
      });

    this.svg
      .append("g")
      .attr("transform", "translate(" + this.width * 0.25 + "," + this.height * 0.9 + ")")
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
      .attr("y", 0.9 * this.height)
      .attr("x", 0.2 * this.width)
      .attr("class", "minRuleText")
      .style("text-anchor", "end");

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
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.startPoints = [];
    this.endPoints = [];
    for (let i = 0; i < this.data.length; i++) {
      let angle = (((i * 360) / this.numBars - 90) * Math.PI) / 180;
      let offset = ((360 / this.numBars) * Math.PI) / 180 / 3;
      this.startPoints.push({
        x: this.cRadius * Math.cos(angle + offset) + this.width / 2,
        y: this.cRadius * Math.sin(angle + offset) + this.height / 2,
        parent: this.data[i].parent
      });
      this.endPoints.push({
        x: this.cRadius * Math.cos(angle + 2 * offset) + this.width / 2,
        y: this.cRadius * Math.sin(angle + 2 * offset) + this.height / 2
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
    return this.colours[this.chapterNames.indexOf(parent)];
  }

  getDataFromAPI = () => {
    const url = "http://localhost:8000/api/codeBlockUsage/?format=json";
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
