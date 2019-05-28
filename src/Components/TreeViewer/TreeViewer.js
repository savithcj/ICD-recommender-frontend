import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";

class TreeViewer extends Component {
  constructor(props) {
    super(props);
    this.duration = 500;
    this.cRadius = 20;
    this.padding = 0.1;
    this.data = {};
    this.treeClass = "treeVis" + this.props.id;
  }

  componentDidMount() {
    this.getDataFromAPI("G308").then(() => {
      this.drawInitialTree();
    });
  }

  recalculateSizes() {
    let elem = ReactDOM.findDOMNode(this).parentNode;
    this.width = elem.offsetWidth;
    this.height = elem.offsetHeight;
    this.vPadding = this.height * this.padding;
    this.hPadding = this.width * this.padding;
  }

  drawInitialTree() {
    this.recalculateSizes();
    console.log("HEIGHT:", this.height);
    console.log("WIDTH:", this.width);

    d3.select("svg").remove();

    this.svg = d3
      .select("div." + this.treeClass)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

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
    this.selfIndex = this.findIndex();

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
      .attr("class", "childrenCircle")
      .on("click", (d, i) => {
        this.handleChildrenClick(d, i); // my react method
      });
  }

  handleSiblingClick(d, i) {
    if (i !== this.selfIndex) {
      this.selfIndex = i;
      this.getDataFromAPI(this.data.siblings[i].code).then(() => {
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
      });
    }
  }

  handleParentClick(d, i) {
    this.getDataFromAPI(this.data.parent.code).then(async () => {
      if (this.data.parent.code) {
        this.removeChildren();

        this.calcChildrenHeights();

        this.svg
          .selectAll("childrenCircle")
          .data(this.siblingHeights)
          .enter()
          .append("circle")
          .attr("cx", () => this.width / 2)
          .attr("cy", d => d)
          .attr("r", this.cRadius)
          .attr("fill", "red")
          .attr("class", "childrenCircle")
          .on("click", (d, i) => {
            this.handleChildrenClick(d, i); // my react method
          });

        this.svg.selectAll("circle.siblingCircle").remove();

        await this.sleep(1.1 * this.duration);
        this.svg
          .selectAll("circle.childrenCircle")
          .data(this.childrenHeights)
          .transition()
          .duration(this.duration)
          .attr("cx", () => this.width - this.hPadding)
          .attr("cy", d => d);

        this.svg
          .selectAll("circle.parentCircle")
          .transition()
          .attr("cx", this.width / 2);

        await this.sleep(1.1 * this.duration);

        this.svg
          .append("circle")
          .attr("cx", () => this.width / 2)
          .attr("cy", () => this.height / 2)
          .attr("r", this.cRadius)
          .attr("fill", "red")
          .attr("class", "tempCircle");

        this.selfIndex = this.findIndex();
        this.svg.selectAll("circle.parentCircle").remove();
        this.calcSiblingHeights(this.selfIndex);
        this.svg
          .selectAll("circle.siblingCircle")
          .data(this.siblingHeights)
          .enter()
          .append("circle")
          .attr("cx", this.width / 2)
          .attr("cy", this.height / 2)
          .attr("r", this.cRadius)
          .attr("fill", "red")
          .attr("class", "siblingCircle")
          .on("click", (d, i) => {
            this.handleSiblingClick(d, i);
          })
          .transition()
          .duration(this.duration)
          .attr("cy", d => d);

        this.svg.selectAll("circle.tempCircle").remove();

        this.svg
          .append("circle")
          .attr("cx", this.width / 2)
          .attr("cy", this.height / 2)
          .attr("r", this.cRadius)
          .attr("fill", "red")
          .attr("class", "siblingCircle")
          .on("click", (d, i) => {
            this.handleParentClick(d, i);
          })
          .transition()
          .duration(this.duration)
          .attr("cx", this.hPadding);
      }
    });
  }

  handleChildrenClick(d, i) {
    console.log("child clicked on");
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
      .on("click", (d, i) => {
        this.handleChildrenClick(d, i); // my react method
      })
      .transition()
      .duration(this.duration)
      .attr("cx", this.width - this.hPadding)
      .attr("cy", d => d);
  }

  calcChildrenHeights() {
    this.childrenHeights = [];
    if (this.data.children.length > 1) {
      const heightUsed = this.height - 4 * this.vPadding;
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

  findIndex() {
    const numSiblings = this.data.siblings.length;
    let i = 0;
    for (i = 0; i < numSiblings; i++) {
      if (this.data.self.code === this.data.siblings[i].code) {
        console.log("FOUND INDEX", i);
        return i;
      }
    }
  }

  getDataFromAPI = code => {
    const url = "http://localhost:8000/api/family/" + code + "/?format=json";
    return fetch(url)
      .then(response => response.json())
      .then(parsedJson => {
        this.data = parsedJson;
      });
  };

  /** Called upon by parent, when the parent container is resized or moved */
  handleResize(e) {
    console.log("HANDLE RESIZE CALLED");
    this.recalculateSizes();
    this.drawInitialTree();
    // Re-draw tree with new dimensions
  }

  render() {
    return <div id={"tree" + this.props.id} className={this.treeClass} />;
  }
}

export default TreeViewer;
