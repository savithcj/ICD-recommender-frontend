import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";

import APIClass from "../../Assets/Util/API";

class NetworkDiagram extends Component {
  constructor(props) {
    super(props);
    this.fontType = "sans-serif";
    this.textColor = "black";
    this.networkClass = "networkVis" + this.props.id;
    this.data = null;
    this.nodes = d3.range(211, 261).map(function(i) {
      return {
        userID: i,
        in: 0,
        out: 0
      };
    });
  }

  componentDidMount() {
    this.links = [
      { source: 27, target: 28 },
      { source: 28, target: 27 },
      { source: 28, target: 12 },
      { source: 47, target: 46 },
      { source: 41, target: 37 },
      { source: 41, target: 25 },
      { source: 27, target: 11 },
      { source: 38, target: 2 },
      { source: 28, target: 41 },
      { source: 28, target: 0 },
      { source: 13, target: 21 },
      { source: 46, target: 25 },
      { source: 39, target: 41 },
      { source: 21, target: 1 },
      { source: 1, target: 28 },
      { source: 14, target: 16 },
      { source: 28, target: 1 },
      { source: 28, target: 23 },
      { source: 21, target: 20 },
      { source: 32, target: 5 },
      { source: 28, target: 21 },
      { source: 38, target: 43 },
      { source: 2, target: 35 },
      { source: 31, target: 38 },
      { source: 22, target: 45 },
      { source: 37, target: 41 },
      { source: 20, target: 21 },
      { source: 0, target: 11 },
      { source: 13, target: 2 },
      { source: 25, target: 46 },
      { source: 1, target: 21 },
      { source: 27, target: 0 },
      { source: 23, target: 28 },
      { source: 21, target: 13 },
      { source: 1, target: 41 },
      { source: 25, target: 13 },
      { source: 12, target: 35 },
      { source: 35, target: 12 },
      { source: 12, target: 28 },
      { source: 31, target: 43 },
      { source: 0, target: 27 },
      { source: 16, target: 14 },
      { source: 0, target: 28 },
      { source: 43, target: 38 },
      { source: 41, target: 12 },
      { source: 0, target: 12 },
      { source: 35, target: 2 },
      { source: 34, target: 48 },
      { source: 11, target: 27 },
      { source: 25, target: 2 },
      { source: 20, target: 2 },
      { source: 28, target: 2 },
      { source: 38, target: 31 },
      { source: 45, target: 22 },
      { source: 19, target: 42 },
      { source: 2, target: 38 },
      { source: 13, target: 25 },
      { source: 41, target: 39 },
      { source: 2, target: 13 },
      { source: 41, target: 1 },
      { source: 3, target: 19 },
      { source: 46, target: 47 },
      { source: 25, target: 41 },
      { source: 2, target: 31 },
      { source: 21, target: 28 },
      { source: 11, target: 29 },
      { source: 12, target: 41 },
      { source: 48, target: 34 },
      { source: 37, target: 25 },
      { source: 43, target: 31 },
      { source: 29, target: 11 },
      { source: 31, target: 2 },
      { source: 2, target: 28 },
      { source: 28, target: 20 },
      { source: 5, target: 32 },
      { source: 2, target: 20 },
      { source: 27, target: 41 },
      { source: 41, target: 27 },
      { source: 2, target: 25 },
      { source: 42, target: 19 },
      { source: 20, target: 28 },
      { source: 12, target: 0 },
      { source: 41, target: 28 },
      { source: 25, target: 37 },
      { source: 19, target: 3 },
      { source: 11, target: 0 }
    ];
    this.drawNetworkDiagram();
  }

  drawNetworkDiagram() {
    d3.select("div." + this.networkClass)
      .select("svg")
      .remove();

    this.fbBlue = d3.rgb("#3b5998");
    this.fill = [this.fbBlue.brighter(2), this.fbBlue.brighter(), this.fbBlue, this.fbBlue.darker()];

    this.svg = d3
      .select("div." + this.networkClass)
      .append("svg")
      .attr("width", 1280)
      .attr("height", 600);

    this.links.forEach(function(d, i) {
      this.nodes[d.source].out++;
      this.nodes[d.target].in++;
    });

    // var force = d3.layout
    //   .force()
    //   .charge(-80)
    //   .linkDistance(25)
    //   .linkStrength(0.2)
    //   .size([w, h])
    //   .nodes(nodes)
    //   .links(links)
    //   .start();

    var link = this.svg
      .selectAll(".link")
      .data(this.links)
      .enter()
      .append("line")
      .attr("class", "link");

    var node = this.svg
      .selectAll("circle.node")
      .data(this.nodes)
      .enter()
      .append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) {
        return d.x;
      }) //x
      .attr("cy", function(d) {
        return d.y;
      }) //y
      .attr("r", 8)
      .style("fill", function(d, i) {
        return this.fill[parseInt((d.in + 1) / 3)];
      });
  }

  render() {
    return <div id={"network" + this.props.id} className={this.networkClass} />;
  }
}

export default NetworkDiagram;
