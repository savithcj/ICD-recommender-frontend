import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";

class ChordDiagram extends Component {
  constructor(props) {
    super(props);

    let colormap = require("colormap");
    this.colours = colormap({
      colormap: "rainbow-soft",
      nshades: 22, // number of chapters
      format: "hex",
      alpha: 1
    });
    console.log(this.colors);
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
    let colour;
    if (parent === "Chapter 01") {
      colour = this.colours[0];
    }
    if (parent === "Chapter 02") {
      colour = this.colours[1];
    }
    if (parent === "Chapter 03") {
      colour = this.colours[2];
    }
    if (parent === "Chapter 04") {
      colour = this.colours[3];
    }
    if (parent === "Chapter 05") {
      colour = this.colours[4];
    }
    if (parent === "Chapter 06") {
      colour = this.colours[5];
    }
    if (parent === "Chapter 07") {
      colour = this.colours[6];
    }
    if (parent === "Chapter 08") {
      colour = this.colours[7];
    }
    if (parent === "Chapter 09") {
      colour = this.colours[8];
    }
    if (parent === "Chapter 10") {
      colour = this.colours[9];
    }
    if (parent === "Chapter 11") {
      colour = this.colours[10];
    }
    if (parent === "Chapter 12") {
      colour = this.colours[11];
    }
    if (parent === "Chapter 13") {
      colour = this.colours[12];
    }
    if (parent === "Chapter 14") {
      colour = this.colours[13];
    }
    if (parent === "Chapter 15") {
      colour = this.colours[14];
    }
    if (parent === "Chapter 16") {
      colour = this.colours[15];
    }
    if (parent === "Chapter 17") {
      colour = this.colours[16];
    }
    if (parent === "Chapter 18") {
      colour = this.colours[17];
    }
    if (parent === "Chapter 19") {
      colour = this.colours[18];
    }
    if (parent === "Chapter 22") {
      colour = this.colours[19];
    }
    if (parent === "Chapter 20") {
      colour = this.colours[20];
    }
    if (parent === "Chapter 21") {
      colour = this.colours[21];
    }
    return colour;
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
