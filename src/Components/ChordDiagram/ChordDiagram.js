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
    //let elem = ReactDOM.findDOMNode(this).parentNode;
    this.width = 500; //elem.offsetWidth;
    this.height = 500; //elem.offsetHeight;
    const minSize = Math.min(this.width, this.height);
    this.cRadius = minSize / 3;
    this.barHeight = 0.15 * minSize;
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

    // this.svg
    //   .append("circle")
    //   .attr("r", this.cRadius)
    //   .attr("cx", this.width / 2)
    //   .attr("cy", this.height / 2)
    //   .style("fill", "red");

    this.getDataFromAPI().then(() => {
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
      console.log(this.colours);
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
          parent: this.data[i].parent
        });
        //console.log(this.bars[i]);
      }

      console.log(this.bars);

      this.svg
        .selectAll("rect.testRect")
        .data(this.bars)
        .enter()
        .append("rect")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("fill", d => this.calcColour(d.parent))
        .attr("width", d => {
          return this.barHeight * d.normTimes;
        })
        .attr("height", this.barWidth)
        .attr("transform", d => {
          let angle = (Math.atan2(d.y - d.nextY, d.x - d.nextX) * 180) / Math.PI + 90;
          return "rotate(" + angle + "," + d.x + "," + d.y + ")";
        });

      //generate startpoints and endpoints for the rule curves
      //start points are a little offset from the endpoints
      let centerX = this.width / 2;
      let centerY = this.height / 2;
      let startPoints = [];
      let endPoints = [];
      for (let i = 0; i < this.data.length; i++) {
        let angle = (((i * 360) / this.numBars - 90) * Math.PI) / 180;
        let offset = ((360 / this.numBars) * Math.PI) / 180 / 3;
        startPoints.push({
          x: this.cRadius * Math.cos(angle + offset) + this.width / 2,
          y: this.cRadius * Math.sin(angle + offset) + this.height / 2,
          parent: this.data[i].parent
        });
        endPoints.push({
          x: this.cRadius * Math.cos(angle + 2 * offset) + this.width / 2,
          y: this.cRadius * Math.sin(angle + 2 * offset) + this.height / 2
        });
      }

      //this is the cutoff for the minimum number of rules
      this.minRules = 1;

      //draw rule curves
      for (let i = 0; i < this.data.length; i++) {
        let destinations = this.data[i].destination_counts.split(",").map(Number);
        console.log(destinations);
        for (let j = 0; j < destinations.length; j++) {
          if (i !== j && destinations[j] >= this.minRules) {
            let bezierString =
              "M" +
              startPoints[i].x +
              "," +
              startPoints[i].y +
              " Q" +
              centerX +
              "," +
              centerY +
              " " +
              endPoints[j].x +
              "," +
              endPoints[j].y;
            console.log(bezierString);
            this.svg
              .append("svg:path")
              .attr("d", bezierString)
              // .attr("fill", "blue")
              .style("stroke", this.calcColour(startPoints[i].parent))
              .attr("stroke-width", 0.25)
              // .attr("marker-end", "url(#arrow)")
              .attr("fill", "none")
              .append("text");
          }
        }
      }
    });

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
