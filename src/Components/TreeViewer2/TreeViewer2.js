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
    //const url = "http://localhost:8000/api/family/" + "8070" + "/?format=json";
    /*const response = fetch(url).then(response => {
      return response.json().then(parsedJson => {
        this.data = parsedJson;
        this.drawInitialTree();
      });
    });*/
    this.getDataFromAPI("8070").then(() => {
      this.drawInitialTree();
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
      .attr("class", "parentCircle")
      .on("click", (d, i) => {
        this.handleParentClick(d, i);
      });

    //get position of self node within the siblings
    this.selfIndex = 0;
    const numSiblings = this.data.siblings.length;
    let i = 0;
    for (i = 0; i < numSiblings; i++) {
      if (this.data.self.code == this.data.siblings[i].code) {
        console.log("FOUND INDEX", i);
        this.selfIndex = i;
      }
    }

    //determine heights of sibling nodes
    this.calcSiblingHeights(this.selfIndex);

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
    if (i != this.selfIndex) {
      this.selfIndex = i;
      this.getDataFromAPI(this.data.siblings[i].code);

      this.removeChildren();

      console.log("Selected", i);
      this.calcSiblingHeights(i);
      this.svg
        .selectAll("circle.siblingCircle")
        .data(this.siblingHeights)
        .transition()
        .delay(this.duration)
        .duration(this.duration)
        .attr("cy", d => d);

      this.addChildren();
    }
  }

  handleParentClick(d, i) {
    const url =
      "http://localhost:8000/api/family/" +
      this.data.parent.code +
      "/?format=json";

    this.removeChildren();

    this.svg.selectAll("siblingCircle").attr("class", "childrenCircle");

    this.calcChildrenHeights();
    this.svg
      .selectAll("childrenCircle")
      .data(this.childrenHeights)
      .enter()
      .transition()
      .duration(this.duration)
      .attr("cx", this.width - this.hPadding)
      .attr("cy", d => d);

    /*this.svg
        .selectAll("parentCircle")
        .transition()
        .attr("cx")*/
  }

  calcSiblingHeights(selfIndex) {
    const numSiblings = this.data.siblings.length;

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

  removeChildren() {
    this.svg
      .selectAll("circle.childrenCircle")
      .transition()
      .duration(this.duration)
      .attr("cx", this.width / 2)
      .attr("cy", this.height / 2)
      .remove();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async addChildren() {
    await this.sleep(2 * this.duration);
    this.calcChildrenHeights();
    this.svg
      .selectAll("circle.childrenCircle")
      .data(this.childrenHeights)
      .enter()
      .append("circle")
      .attr("cx", this.width / 2)
      .attr("cy", this.height / 2)
      .attr("r", this.cRadius)
      .attr("fill", "red")
      .attr("class", "childrenCircle")
      .transition()
      .duration(this.duration)
      .attr("cx", this.width - this.hPadding)
      .attr("cy", d => d);
  }

  calcChildrenHeights() {
    this.childrenHeights = [];
    if (this.data.children.length > 1) {
      const heightUsed = this.height - 4 * this.vPadding;
      console.log("CHILDREN", this.data.children);
      const gap = heightUsed / (this.data.children.length - 1);
      console.log("gap:", gap);
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

  getDataFromAPI = code => {
    const url = "http://localhost:8000/api/family/" + code + "/?format=json";
    return fetch(url)
      .then(response => response.json())
      .then(parsedJson => {
        this.data = parsedJson;
        console.log("DATA: ", this.data);
      });
  };

  render() {
    return (
      <div id={"tree" + this.props.id} className="treeVis2">
        <h1>TREE</h1>
      </div>
    );
  }
}

export default TreeViewer2;
