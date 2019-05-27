import React, { Component } from "react";
import * as d3 from "d3";

class TreeViewer2 extends Component {
  constructor() {
    super();
    this.duration = 500;
    this.height = 700;
    this.width = 700;
    this.cRadius = 20;
    this.padding = 0.1;
    this.vPadding = this.height * this.padding;
    this.hPadding = this.width * this.padding;
    this.data = {};
  }

  componentDidMount() {
    const url = "http://localhost:8000/api/family/" + "8070" + "/?format=json";
    const response = fetch(url).then(response => {
      return response.json().then(parsedJson => {
        this.data = {
          parent: parsedJson.parent,
          siblings: parsedJson.siblings,
          self: parsedJson.self,
          children: parsedJson.children
        };
        this.drawInitialTree();
      });
    });
  }

  drawInitialTree() {
    console.log("SIBLINGS: ", this.data.siblings);
    this.svg = d3
      .select("div.treeVis2")
      .append("svg")
      .attr("width", this.height)
      .attr("height", this.width);

    //draw parent node
    this.svg
      .append("circle")
      .attr("cx", () => this.hPadding)
      .attr("cy", () => this.height / 2)
      .attr("r", this.cRadius)
      .attr("fill", "red")
      .attr("class", "parentCircle");

    //get position of self node within the siblings
    let selfIndex = 0;
    const numSiblings = this.data.siblings.length;
    let i = 0;
    for (i = 0; i < numSiblings; i++) {
      if (this.data.self.code == this.data.siblings[i].code) {
        console.log("FOUND INDEX", i);
        selfIndex = i;
      }
    }

    //determine heights of sibling nodes
    this.calcSiblingHeights(selfIndex);

    console.log(this.siblingHeights);
    //add sibling circles (self is centered)
    this.svg
      .selectAll("circle.siblingCircle")
      .data(this.siblingHeights)
      .enter()
      .append("circle")
      .attr("cx", d => this.width * 0.5)
      .attr("cy", d => d)
      .attr("r", this.cRadius)
      .attr("fill", "red")
      .attr("class", "siblingCircle")
      .on("click", (d, i) => {
        this.handleSiblingClick(d, i); // my react method
      });

    // determine children heights
    this.calcChildrenHeights();

    // add children circles
    this.svg
      .selectAll("circle.childrenCircle")
      .data(this.childrenHeights)
      .enter()
      .append("circle")
      .attr("cx", d => this.width - this.hPadding)
      .attr("cy", d => d)
      .attr("r", this.cRadius)
      .attr("fill", "red")
      .attr("class", "childrenCircle");
  }

  handleSiblingClick(d, i) {
    console.log("d.code: ", d.code);
    const url =
      "http://localhost:8000/api/family/" +
      this.data.siblings[i].code +
      "/?format=json";
    const response = fetch(url).then(response => {
      return response.json().then(parsedJson => {
        this.data = {
          parent: parsedJson.parent,
          siblings: parsedJson.siblings,
          self: parsedJson.self,
          children: parsedJson.children
        };
        console.log("Children: ", this.data.children);
      });
    });

    console.log("Selected", i);
    this.calcSiblingHeights(i);
    this.svg
      .selectAll("circle.siblingCircle")
      .data(this.siblingHeights)
      .transition()
      .duration(this.duration)
      .attr("cy", d => d);
  }

  calcSiblingHeights(selfIndex) {
    const numSiblings = this.data.siblings.length;
    console.log("numSiblings", numSiblings);
    this.siblingHeights = [];
    console.log(this.siblingHeights.length);
    const numAbove = selfIndex;
    if (numAbove > 0) {
      const aboveGap = (this.height / 2.0 - this.vPadding) / numAbove;
      let i;
      for (i = 0; i < numAbove; i++) {
        this.siblingHeights.push(aboveGap * i + this.vPadding);
      }
    }
    console.log(this.siblingHeights.length);
    this.siblingHeights.push(this.height * 0.5);
    console.log(this.siblingHeights.length);
    const numBelow = numSiblings - selfIndex - 1;
    if (numBelow > 0) {
      const belowGap = (this.height / 2.0 - this.vPadding) / numBelow;
      let i;
      for (i = 0; i < numBelow; i++) {
        this.siblingHeights.push(
          this.height - belowGap * (numBelow - 1 - i) - this.vPadding
        );
      }
    }
    console.log(this.siblingHeights.length, "numBelow:", numBelow);
    console.log(this.siblingHeights);
  }

  calcChildrenHeights() {
    const heightUsed = this.height - 4 * this.vPadding;
    console.log("CHILDREN", this.data.children);
    const gap = heightUsed / (this.data.children.length - 1);
    console.log("gap:", gap);
    this.childrenHeights = [];
    if (this.data.children.length > 1) {
      let currentHeight = 2 * this.vPadding;
      for (let i = 0; i < this.data.children.length; i++) {
        this.childrenHeights.push(currentHeight);
        currentHeight += gap;
      }
    } else if (this.data.children.length == 1) {
      this.childrenHeights.push(this.height / 2);
    }
    console.log("children heights", this.childrenHeights);
  }

  render() {
    return (
      <div id={"tree" + this.props.id} className="treeVis2">
        <h1>TREE</h1>
      </div>
    );
  }
}

export default TreeViewer2;
