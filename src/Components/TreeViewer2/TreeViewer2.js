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
    this.getDataFromAPI("807").then(() => {
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
    if (this.data.parent) {
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
    }

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
      console.log("self index = ", this.selfIndex);
      console.log("DATA ", this.data);
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
    if (this.data.parent) {
      this.getDataFromAPI(this.data.parent.code).then(async () => {
        // remove children to the current self
        this.removeChildren();

        this.calcChildrenHeights();

        // add children circles on top of where siblings currently are
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
            this.handleChildrenClick(d, i);
          });

        // remove sibling circles
        this.svg.selectAll("circle.siblingCircle").remove();

        await this.sleep(1.1 * this.duration);
        // transition children circles from sibling spots to children spots
        this.svg
          .selectAll("circle.childrenCircle")
          .data(this.childrenHeights)
          .transition()
          .duration(this.duration)
          .attr("cx", () => this.width - this.hPadding)
          .attr("cy", d => d);

        // transition old parent to self position
        this.svg
          .selectAll("circle.parentCircle")
          .transition()
          .attr("cx", this.width / 2);

        await this.sleep(1.1 * this.duration);

        // adding temp circle at self position
        this.svg
          .append("circle")
          .attr("cx", () => this.width / 2)
          .attr("cy", () => this.height / 2)
          .attr("r", this.cRadius)
          .attr("fill", "red")
          .attr("class", "tempCircle");

        this.selfIndex = this.findIndex();
        // remove parent circle
        this.svg.selectAll("circle.parentCircle").remove();
        this.calcSiblingHeights(this.selfIndex);
        // spawn sibling circles from self
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

        // remove temp circle
        this.svg.selectAll("circle.tempCircle").remove();

        // spawn parent circle from new self
        if (this.data.parent) {
          this.svg
            .append("circle")
            .attr("cx", this.width / 2)
            .attr("cy", this.height / 2)
            .attr("r", this.cRadius)
            .attr("fill", "red")
            .attr("class", "parentCircle")
            .on("click", (d, i) => {
              this.handleParentClick(d, i);
            })
            .transition()
            .duration(this.duration)
            .attr("cx", this.hPadding);
        }
      });
    }
  }

  handleChildrenClick(d, i) {
    this.getDataFromAPI(this.data.children[i].code).then(async () => {
      // add temp circle at self position
      this.svg
        .append("circle")
        .attr("cx", () => this.width / 2)
        .attr("cy", () => this.height / 2)
        .attr("r", this.cRadius)
        .attr("fill", "red")
        .attr("class", "tempCircle");

      // move all siblings to center, then remove
      this.svg
        .selectAll("circle.siblingCircle")
        .transition()
        .duration(this.duration)
        .attr("cx", this.width / 2)
        .attr("cy", this.height / 2)
        .remove();

      // move parent to center, then remove
      this.svg
        .selectAll("circle.parentCircle")
        .transition()
        .duration(this.duration)
        .attr("cx", this.width / 2)
        .attr("cy", this.height / 2)
        .remove();

      await this.sleep(1.1 * this.duration);
      // add parent circle at center and transition to parent spot
      this.svg
        .append("circle")
        .attr("cx", this.width / 2)
        .attr("cy", this.height / 2)
        .attr("r", this.cRadius)
        .attr("fill", "red")
        .attr("class", "parentCircle")
        .on("click", (d, i) => {
          this.handleParentClick(d, i);
        })
        .transition()
        .duration(this.duration)
        .attr("cx", this.hPadding);

      // remove temp circle
      this.svg.selectAll("circle.tempCircle").remove();

      console.log("data", this.data);
      this.calcSiblingHeights(i);
      // transition children to sibling spots
      console.log("sibling heights", this.siblingHeights);
      this.svg
        .selectAll("circle.childrenCircle")
        .data(this.siblingHeights)
        .transition()
        .duration(this.duration)
        .attr("cx", () => this.width / 2)
        .attr("cy", d => d);

      await this.sleep(1.1 * this.duration);

      // add sibling circles
      this.svg
        .selectAll("circle.siblingCircle")
        .data(this.siblingHeights)
        .enter()
        .append("circle")
        .attr("cx", this.width / 2)
        .attr("cy", d => d)
        .attr("r", this.cRadius)
        .attr("fill", "red")
        .attr("class", "siblingCircle")
        .on("click", (d, i) => {
          this.handleSiblingClick(d, i);
        });
      // remove children circles in sibling circle spots
      this.svg.selectAll("circle.childrenCircle").remove();

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
          this.handleChildrenClick(d, i);
        })
        .transition()
        .duration(this.duration)
        .attr("cx", () => this.width - this.hPadding)
        .attr("cy", d => d);
    });
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

  render() {
    return (
      <div id={"tree" + this.props.id} className="treeVis2">
        <h1>TREE</h1>
      </div>
    );
  }
}

export default TreeViewer2;
