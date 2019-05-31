import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";

class TreeViewer2 extends Component {
  constructor(props) {
    super(props);
    this.duration = 2000;
    this.cRadius = 20;
    this.padding = 0.1;
    this.treeClass = "treeVis" + this.props.id;

    this.link = d3
      .linkHorizontal()
      .x(function(d) {
        return d.x;
      })
      .y(function(d) {
        return d.y;
      });
  }

  componentDidMount() {
    this.height = 600;
    this.width = 600;
    this.vPadding = this.height * this.padding;
    this.hPadding = this.width * this.padding;
    this.getDataFromAPI("8070").then(() => {
      this.drawInitialTree();
    });
  }

  recalculateSizes() {
    // let elem = ReactDOM.findDOMNode(this).parentNode;
    // this.width = elem.offsetWidth;
    // this.height = elem.offsetHeight;
    // this.vPadding = this.height * this.padding;
    // this.hPadding = this.width * this.padding;
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

    // parent node ///////////////////
    var parentg = this.svg
      .append("g")
      .attr("transform", d => {
        return "translate(" + this.hPadding + "," + this.height / 2 + ")";
      })
      .attr("class", "parentG");

    parentg
      .append("text")
      .text("parent")
      .attr("font-family", "sans-serif")
      .attr("font-size", "15px")
      .attr("fill", "blue")
      .attr("y", 35)
      .style("text-anchor", "middle");

    parentg
      .append("circle")
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
    var siblingGs = this.svg
      .selectAll("g.siblingG")
      .data(this.siblingHeights)
      .enter()
      .append("g")
      .attr("transform", d => {
        return "translate(" + this.width / 2 + "," + d + ")";
      })
      .attr("class", "siblingG");

    siblingGs
      .append("text")
      .text("sibling")
      .attr("font-family", "sans-serif")
      .attr("font-size", "15px")
      .attr("fill", "blue")
      .attr("y", 35)
      .style("text-anchor", "middle");

    siblingGs
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", "red")
      .attr("class", "siblingCircle")
      .on("click", (d, i) => {
        this.handleSiblingClick(d, i);
      });

    // determine children heights
    this.calcChildrenHeights();

    // add children circles
    var childrenGs = this.svg
      .selectAll("g.childrenG")
      .data(this.childrenHeights)
      .enter()
      .append("g")
      .attr("transform", d => {
        return "translate(" + (this.width - this.hPadding) + "," + d + ")";
      })
      .attr("class", "childrenG");

    childrenGs
      .append("text")
      .text("children")
      .attr("font-family", "sans-serif")
      .attr("font-size", "15px")
      .attr("fill", "blue")
      .attr("y", 35)
      .style("text-anchor", "middle");

    childrenGs
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", "red")
      .attr("class", "childrenCircle")
      .on("click", (d, i) => {
        this.handleChildrenClick(d, i);
      });

    let links = [];
    let i;
    for (i = 0; i < this.siblingHeights.length; i++) {
      links[i] = {
        source: {
          x: this.hPadding,
          y: this.height / 2
        },
        target: {
          x: this.width * 0.5,
          y: this.siblingHeights[i]
        }
      };
    }

    console.log("LINKS:", links);

    this.svg
      .selectAll("paths")
      .data(links)
      .enter()
      .append("path")
      .attr("d", d => this.link(d))
      .style("fill", "none")
      .style("stroke", "darkslateblue")
      .style("stroke-width", "4px");

    /*this.svg
      .selectAll("line")
      .data(this.siblingHeights)
      .enter()
      .append("line")
      .attr("x1", this.hPadding)
      .attr("y1", this.height / 2)
      .attr("x2", this.width / 2)
      .attr("y2", d => d)
      .attr("stroke-width", 2)
      .attr("stroke", "black");*/
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
        console.log(this.siblingHeights);

        this.svg
          .selectAll("g.siblingG")
          .data(this.siblingHeights)
          .transition()
          .delay(this.duration)
          .attr("transform", d => {
            return "translate(" + this.width / 2 + "," + d + ")";
          })
          .duration(this.duration);

        this.svg
          .selectAll("g.siblingG")
          .selectAll("circle.siblingCircle")
          .transition()
          .duration(this.duration);

        this.svg
          .selectAll("g.siblingG")
          .selectAll("text")
          .transition()
          .duration(this.duration);

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
        console.log("sibling heights", this.siblingHeights);
        var childrenGs = this.svg
          .selectAll("g.childrenG")
          .data(this.siblingHeights)
          .enter()
          .append("g")
          .attr("transform", d => {
            return "translate(" + 200 + "," + d + ")";
          })
          .attr("class", "childrenG");

        // appending text to g
        childrenGs
          .append("text")
          .text("children")
          .attr("font-family", "sans-serif")
          .attr("font-size", "15px")
          .attr("fill", "blue")
          .attr("y", 35)
          .style("text-anchor", "middle")
          .style("fill-opacity", 1);

        // appending circles to g
        childrenGs
          .append("circle")
          .attr("r", this.cRadius)
          .attr("fill", "red")
          .attr("class", "childrenCircle")
          .on("click", (d, i) => {
            this.handleChildrenClick(d, i);
          });

        // remove sibling circles
        //this.svg.selectAll("g.siblingG").remove();

        await this.sleep(this.duration);
        // transition children circles from sibling spots to children spots
        this.svg
          .selectAll("g.childrenG")
          .data(this.childrenHeights)
          .transition()
          .attr("transform", d => {
            return "translate(" + (this.width - this.hPadding) + "," + d + ")";
          })
          .duration(this.duration);

        // transition old parent to self position **HERE**
        /* this.svg
          .selectAll("g.parentG")
          .transition()
          .attr("transform", d => {
            return "translate(" + this.width / 2 + "," + this.height / 2 + ")";
          })
          .duration(this.duration);

        await this.sleep(1.1 * this.duration);*/

        // adding temp circle at self position
        /*this.svg
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
            })r
            .transition()
            .duration(this.duration)
            .attr("cx", this.hPadding);
        }*/
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

  ////////////////////// remove children //////////////
  async removeChildren() {
    this.svg
      .selectAll("g.childrenG")
      .transition()
      .attr("transform", d => {
        return "translate(" + this.width / 2 + "," + this.height / 2 + ")";
      })
      .duration(this.duration);
    this.svg
      .selectAll("g.childrenG")
      .selectAll("circle.childrenCircle")
      .transition()
      .duration(this.duration)
      .attr("r", 1e-6);
    this.svg
      .selectAll("g.childrenG")
      .selectAll("text")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1e-6);
    await this.sleep(this.duration);
    this.svg.selectAll("g.childrenG").remove();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async addChildren() {
    await this.sleep(2 * this.duration);
    this.calcChildrenHeights();

    // creating children g
    var childrenGs = this.svg
      .selectAll("g.childrenG")
      .data(this.childrenHeights)
      .enter()
      .append("g")
      .attr("transform", d => {
        return "translate(" + this.width / 2 + "," + this.height / 2 + ")";
      })
      .attr("class", "childrenG");

    // appending text to g
    childrenGs
      .append("text")
      .text("children")
      .attr("font-family", "sans-serif")
      .attr("font-size", "15px")
      .attr("fill", "blue")
      .attr("y", 35)
      .style("text-anchor", "middle")
      .style("fill-opacity", 1e-6);

    // appending circles to g
    childrenGs
      .append("circle")
      .attr("r", 1e-6)
      .attr("fill", "red")
      .attr("class", "childrenCircle")
      .on("click", (d, i) => {
        this.handleChildrenClick(d, i);
      });

    // transitioning g/text/circles
    this.svg
      .selectAll("g.childrenG")
      .transition()
      .attr("transform", d => {
        return "translate(" + (this.width - this.hPadding) + "," + d + ")";
      })
      .duration(this.duration);
    this.svg
      .selectAll("g.childrenG")
      .selectAll("circle.childrenCircle")
      .transition()
      .duration(this.duration)
      .attr("r", this.cRadius);
    this.svg
      .selectAll("g.childrenG")
      .selectAll("text")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1);
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
        this.selfIndex = i;
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
    if (this.data == undefined) {
      console.log("Resize called but no data");
      // variable is undefined
    } else {
      this.recalculateSizes();
      this.drawInitialTree();
    }

    // Re-draw tree with new dimensions
  }

  render() {
    return <div id={"tree" + this.props.id} className={this.treeClass} />;
  }
}

export default TreeViewer2;
