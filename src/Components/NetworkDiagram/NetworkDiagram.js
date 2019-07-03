// import React, { Component } from "react";
// import * as d3 from "d3";
// import ReactDOM from "react-dom";

// import * as APIUtility from "../../Util/API";

// class NetworkDiagram extends Component {
//   constructor(props) {
//     super(props);
//     this.fontType = "sans-serif";
//     this.textColor = "black";
//     this.networkClass = "networkVis" + this.props.id;
//     this.data = null;
//     this.nodes = d3.range(211, 261).map(function(i) {
//       return {
//         userID: i,
//         in: 0,
//         out: 0
//       };
//     });
//   }

//   componentDidMount() {
//     this.drawNetworkDiagram();
//   }

//   drawNetworkDiagram() {
//     d3.select("div." + this.networkClass)
//       .select("svg")
//       .remove();

//     var svg = d3.select("svg"),
//       width = +svg.attr("width"),
//       height = +svg.attr("height");

//     var simulation = d3
//       .forceSimulation()
//       .force(
//         "link",
//         d3.forceLink().id(function(d) {
//           return d.id;
//         })
//       )
//       //.force("charge", d3.forceManyBody().strength(-200))
//       .force(
//         "charge",
//         d3
//           .forceManyBody()
//           .strength(-200)
//           .theta(0.8)
//           .distanceMax(150)
//       )
//       // 		.force('collide', d3.forceCollide()
//       //       .radius(d => 40)
//       //       .iterations(2)
//       //     )
//       .force("center", d3.forceCenter(width / 2, height / 2));

//     const graph = {
//       nodes: [
//         { id: "1", group: 1 },
//         { id: "2", group: 2 },
//         { id: "4", group: 3 },
//         { id: "8", group: 4 },
//         { id: "16", group: 5 },
//         { id: "11", group: 1 },
//         { id: "12", group: 2 },
//         { id: "14", group: 3 },
//         { id: "18", group: 4 },
//         { id: "116", group: 5 }
//       ],
//       links: [
//         { source: "1", target: "2", value: 1 },
//         { source: "2", target: "4", value: 1 },
//         { source: "4", target: "8", value: 1 },
//         { source: "4", target: "8", value: 1 },
//         { source: "8", target: "16", value: 1 },
//         { source: "16", target: "1", value: 1 }
//       ]
//     };
//   }

//   run = function(graph) {

//     graph.links.forEach(function(d){
//   //     d.source = d.source_id;
//   //     d.target = d.target_id;
//     });

//     var link = svg.append("g")
//                   .style("stroke", "#aaa")
//                   .selectAll("line")
//                   .data(graph.links)
//                   .enter().append("line");

//     var node = svg.append("g")
//               .attr("class", "nodes")
//     .selectAll("circle")
//               .data(graph.nodes)
//     .enter().append("circle")
//             .attr("r", 2)
//             .call(d3.drag()
//                 .on("start", dragstarted)
//                 .on("drag", dragged)
//                 .on("end", dragended));

//     var label = svg.append("g")
//         .attr("class", "labels")
//         .selectAll("text")
//         .data(graph.nodes)
//         .enter().append("text")
//           .attr("class", "label")
//           .text(function(d) { return d.id; });

//     simulation
//         .nodes(graph.nodes)
//         .on("tick", ticked);

//     simulation.force("link")
//         .links(graph.links);

//     function ticked() {
//       link
//           .attr("x1", function(d) { return d.source.x; })
//           .attr("y1", function(d) { return d.source.y; })
//           .attr("x2", function(d) { return d.target.x; })
//           .attr("y2", function(d) { return d.target.y; });

//       node
//            .attr("r", 16)
//            .style("fill", "#efefef")
//            .style("stroke", "#424242")
//            .style("stroke-width", "1px")
//            .attr("cx", function (d) { return d.x+5; })
//            .attr("cy", function(d) { return d.y-3; });

//       label
//               .attr("x", function(d) { return d.x; })
//               .attr("y", function (d) { return d.y; })
//               .style("font-size", "10px").style("fill", "#333");
//     }
//   }

//   function dragstarted(d) {
//     if (!d3.event.active) simulation.alphaTarget(0.3).restart()
//     d.fx = d.x
//     d.fy = d.y
//   //  simulation.fix(d);
//   }

//   function dragged(d) {
//     d.fx = d3.event.x
//     d.fy = d3.event.y
//   //  simulation.fix(d, d3.event.x, d3.event.y);
//   }

//   function dragended(d) {
//     d.fx = d3.event.x
//     d.fy = d3.event.y
//     if (!d3.event.active) simulation.alphaTarget(0);
//     //simulation.unfix(d);
//   }

//   run(graph)

//   render() {
//     return <div id={"network" + this.props.id} className={this.networkClass} />;
//   }
// }

// export default NetworkDiagram;
