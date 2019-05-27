import React, { Component } from "react";
import * as d3 from "d3";

class TreeViewer extends Component {
  constructor() {
    super();
    this.duration = 500;
    this.height = 700;
    this.width = 700;
    this.cRadius = 20;
    this.padding = 0.1;
    this.vPadding = this.height * this.padding;
    this.hPadding = this.width * this.padding;
    this.data = {
      parent: { code: "I70", description: "Atherosclerosis" },
      siblings: {
        codes: ["I700", "I701", "I702", "I708", "I709"],
        descriptions: [
          "Atherosclerosis of aorta",
          "Atherosclerosis of arteries of extremities",
          "Atherosclerosis of renal artery",
          "Atherosclerosis of other arteries",
          "Generalized and unspecified atherosclerosis"
        ]
      },
      children: {
        codes: ["I7020", "I7021", "I702"],
        descriptions: [
          "Atherosclerosis of arteries of extremities without gangrene",
          "Atherosclerosis of arteries of extremities with gangrene",
          "Atherosclerosis of arteries of extremities"
        ]
      },
      self: {
        code: "I702",
        description: "Atherosclerosis of arteries of extremities"
      }
    };
  }

  componentDidMount() {
    this.drawInitialTree();
  }

  drawInitialTree() {
    this.svg = d3
      .select("div.treeVis" + this.props.id)
      .append("svg")
      .attr("width", this.height)
      .attr("height", this.width);

    //draw parent node
    this.svg
      .append("circle")
      .attr("cx", () => this.hPadding)
      .attr("cy", () => this.height / 2)
      .attr("r", this.cRadius)
      .attr("fill", "green")
      .attr("class", "parentCircle");

    //get position of self node within the siblings
    let selfIndex = 0;
    const numSiblings = this.data.siblings.codes.length;
    let i = 0;
    for (i = 0; i < numSiblings; i++) {
      if (this.data.self.code == this.data.siblings.codes[i]) {
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
      .attr("cx", () => this.width * 0.5)
      .attr("cy", d => d)
      .attr("r", this.cRadius)
      .attr("fill", "green")
      .attr("class", "siblingCircle")
      .on("click", (d, i) => {
        this.handleSiblingClick(d, i); // my react method
      });
  }

  handleSiblingClick(d, i) {
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
    const numSiblings = this.data.siblings.codes.length;

    //determine the smallest gap
    const numAbove = selfIndex;
    const numBelow = numSiblings - selfIndex - 1;
    let belowGap = this.height; //default to high number
    let aboveGap = this.height;
    if (numAbove > 0) {
      aboveGap = (this.height / 2.0 - this.vPadding) / numAbove;
    }
    if (numBelow > 0) {
      belowGap = (this.height / 2.0 - this.vPadding) / numBelow;
    }

    const gap = belowGap < aboveGap ? belowGap : aboveGap;
    console.log("AboveGap", aboveGap, "BelowGap", belowGap, "Gap", gap);

    //start setting heights
    this.siblingHeights = [];
    if (numAbove > 0) {
      let i;
      for (i = 0; i < numAbove; i++) {
        this.siblingHeights.push(this.height / 2.0 - gap * (numAbove - i));
      }
    }
    this.siblingHeights.push(this.height / 2.0);

    if (numBelow > 0) {
      let i;
      for (i = 0; i < numBelow; i++) {
        this.siblingHeights.push(this.height / 2.0 + gap * (i + 1));
      }
    }
  }

  render() {
    return (
      <div id={"tree" + this.props.id} className={"treeVis" + this.props.id}>
        <h1>TREE</h1>
      </div>
    );
  }
}

export default TreeViewer;
