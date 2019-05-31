import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";

class TreeViewer extends Component {
  constructor(props) {
    super(props);
    this.duration = 750;
    this.padding = 0.1;

    this.fontType = "sans-serif";
    this.treeClass = "treeVis" + this.props.id;
    this.selectedColor = "blue";
    this.otherColor = "red";
    this.textColor = "blue";
    this.linkColor = "lightgrey";
    this.linkWidth = 3;

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
    this.getDataFromAPI("A053").then(() => {
      this.drawInitialTree();
    });
  }

  /** Called upon by parent, when the parent container is resized or moved */
  handleResize(e) {
    if (this.data === undefined) {
      // variable is undefined
    } else {
      this.recalculateSizes();
      this.drawInitialTree();
    }
  }

  recalculateSizes() {
    let elem = ReactDOM.findDOMNode(this).parentNode;
    this.width = elem.offsetWidth;
    this.height = elem.offsetHeight;
    const minSize = Math.min(this.width, this.height);
    this.vPadding = this.height * this.padding;
    this.hPadding = this.width * this.padding;
    this.cRadius = minSize / 50;
    this.textSize = minSize / 50;
  }

  addInfoText() {
    let infoG = this.svg.append("g").attr("class", "infoG");
    this.infoText = infoG
      .append("text")
      .attr("y", this.height - this.vPadding * 0.25)
      .attr("x", this.hPadding * 0.25)
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .text("")
      .style("text-anchor", "left");
  }

  setInfoText(tier, index) {
    let codeDesc = "";
    if (tier === 0) {
      codeDesc = this.data.parent.code + ": " + this.data.parent.description;
    } else if (tier === 1) {
      codeDesc = this.data.siblings[index].code + ": " + this.data.siblings[index].description;
    } else if (tier === 2) {
      codeDesc = this.data.children[index].code + ": " + this.data.children[index].description;
    }

    this.infoText.text(codeDesc);
  }

  clearInfoText() {
    this.infoText.text("");
  }

  drawInitialTree() {
    this.recalculateSizes();
    console.log("HEIGHT", this.height);
    console.log("WIDTH", this.width);
    d3.select("svg").remove();

    this.svg = d3
      .select("div." + this.treeClass)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.addInfoText();
    this.linkG = this.svg.append("g");
    this.rightG = this.svg.append("g");
    this.middleG = this.svg.append("g");
    this.leftG = this.svg.append("g");

    //////////// PARENT NODE ////////////
    /////////////////////////////////////
    let parentg = this.leftG
      .append("g")
      .attr("transform", d => {
        return "translate(" + this.hPadding + "," + this.height / 2 + ")";
      })
      .attr("class", "parentG");
    parentg
      .on("mouseover", (d, i) => {
        this.setInfoText(0, 0);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .append("text")
      .text(this.codeTrunc(this.data.parent))
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", this.cRadius - 2.1 * this.textSize)
      .attr("x", 2 * this.cRadius)
      .attr("class", "parentText")
      .style("text-anchor", "middle");

    parentg
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", this.otherColor)
      .attr("class", "parentCircle")
      .on("click", (d, i) => {
        this.handleParentClick(d, i);
      });

    //////////// SIBLING NODES ////////////
    ///////////////////////////////////////
    this.selfIndex = 0;
    this.findIndex();
    this.calcSiblingHeights();
    this.calcSiblingColours();

    let siblingGs = this.middleG
      .selectAll("g.siblingG")
      .data(this.siblingHeights)
      .enter()
      .append("g")
      .on("mouseover", (d, i) => {
        this.setInfoText(1, i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .attr("transform", d => {
        return "translate(" + this.width / 2 + "," + d + ")";
      })
      .attr("class", "siblingG");

    siblingGs
      .data(this.data.siblings)
      .append("text")
      .text(d => this.codeTrunc(d))
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", this.cRadius - 2.1 * this.textSize)
      .attr("x", 2 * this.cRadius)
      .attr("class", "siblingText")
      .style("text-anchor", "middle");

    siblingGs
      .data(this.siblingColours)
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", d => {
        return d;
      })
      .attr("class", "siblingCircle")
      .on("click", (d, i) => {
        this.handleSiblingClick(d, i);
      });

    //////////// CHILDREN NODES ////////////
    ////////////////////////////////////////
    this.calcChildrenHeights();
    let childrenGs = this.rightG
      .selectAll("g.childrenG")
      .data(this.childrenHeights)
      .enter()
      .append("g")
      .on("mouseover", (d, i) => {
        this.setInfoText(2, i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .attr("transform", d => {
        return "translate(" + (this.width - this.hPadding) + "," + d + ")";
      })
      .attr("class", "childrenG");

    childrenGs
      .data(this.data.children)
      .append("text")
      .text(d => this.codeTrunc(d))
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", this.cRadius - 2.1 * this.textSize)
      .attr("x", -1.5 * this.cRadius)
      .attr("class", "childrenText")
      .style("text-anchor", "middle");

    childrenGs
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", this.otherColor)
      .attr("class", "childrenCircle")
      .on("click", (d, i) => {
        this.handleChildrenClick(d, i);
      });

    // LINKS //////////////////////////////
    ///////////////////////////////////////
    this.createParentLinks();
    this.linkG
      .selectAll("siblingG")
      .data(this.parentLinks)
      .enter()
      .append("path")
      .attr("d", d => this.link(d))
      .attr("class", "parentLink")
      .style("fill", "none")
      .style("stroke", this.linkColor)
      .style("stroke-width", this.linkWidth);

    this.createChildrenLinks();
    this.linkG
      .selectAll("childrenG") // might need to change this
      .data(this.childrenLinks)
      .enter()
      .append("path")
      .attr("d", d => this.link(d))
      .attr("class", "childrenLink")
      .style("fill", "none")
      .style("stroke", this.linkColor)
      .style("stroke-width", this.linkWidth);
  }
  // END OF DRAW INITIAL TREE /////////////////
  /////////////////////////////////////////////

  // HANDLE CLICKS ////////////////////////////
  /////////////////////////////////////////////
  handleParentClick() {
    this.getDataFromAPI(this.data.parent.code).then(async () => {
      this.removeChildren();
      this.moveSiblingsToChildren();
      this.moveParentToSibling();
      this.transitionParentLinks();
      await this.sleep(2 * this.duration);
      this.spawnParentAndSiblings();
    });
  }

  handleSiblingClick() {
    console.log("sibling clicked");
  }

  handleChildrenClick() {
    console.log("CHILD CLICKED");
  }
  // END OF HANDLE CLICKS //////////////////////
  //////////////////////////////////////////////

  moveSiblingsToChildren() {
    this.svg
      .selectAll("g.siblingG")
      .data(this.siblingHeights)
      .on("mouseover", (d, i) => {
        this.setInfoText(2, i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .transition()
      .delay(this.duration)
      .duration(this.duration)
      .attr("transform", d => {
        return "translate(" + (this.width - this.hPadding) + "," + d + ")";
      })
      .attr("class", "childrenG");

    this.svg
      .selectAll("circle.siblingCircle")
      .attr("class", "childrenCircle")
      .on("click", (d, i) => {
        this.handleChildrenClick(d, i);
      })
      .transition()
      .duration(this.duration)
      .attr("fill", this.otherColor);

    this.svg
      .selectAll("text.siblingText")
      .transition()
      .duration(this.duration)
      .delay(this.duration)
      .attr("y", this.cRadius - 2.1 * this.textSize)
      .attr("x", -1.5 * this.cRadius)
      .attr("class", "childrenText")
      .style("text-anchor", "middle");
  }

  moveParentToSibling() {
    this.calcSiblingHeights();
    this.findIndex();
    this.calcSiblingColours();
    this.svg
      .selectAll("g.parentG")
      .transition()
      .duration(this.duration)
      .delay(this.duration)
      .attr("transform", d => {
        return "translate(" + this.width / 2 + "," + this.siblingHeights[this.selfIndex] + ")";
      })
      .attr("class", "oldParentG");

    this.svg
      .selectAll("circle.parentCircle")
      .transition()
      .duration(this.duration)
      .attr("class", "siblingCircle")
      .attr("fill", this.selectedColor);

    this.svg.selectAll("circle.siblingCircle").on("click", (d, i) => {
      this.handleSiblingClick(d, i);
    });
    this.svg.selectAll("g.oldParentG").remove();
  }

  spawnParentAndSiblings() {
    // creating invisible parent at self
    let parentG = this.svg
      .append("g")
      .attr("class", "parentG")
      .on("mouseover", (d, i) => {
        this.setInfoText(0, 0);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .attr("transform", d => {
        return "translate(" + this.width / 2 + "," + this.siblingHeights[this.selfIndex] + ")";
      });
    parentG
      .append("text")
      .text(this.codeTrunc(this.data.parent))
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", this.cRadius - 2.1 * this.textSize)
      .attr("x", 2 * this.cRadius)
      .attr("class", "parentText")
      .style("text-anchor", "middle")
      .style("fill-opacity", 1e-6);
    parentG
      .append("circle")
      .attr("r", 1e-6)
      .attr("fill", this.otherColor)
      .attr("class", "parentCircle")
      .on("click", (d, i) => {
        this.handleParentClick(d, i);
      });

    // create invisible siblings at self
    let siblingG = this.middleG
      .selectAll("g.siblingG")
      .data(this.siblingHeights)
      .enter()
      .append("g")
      .attr("class", "siblingG")
      .on("mouseover", (d, i) => {
        this.setInfoText(1, i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .attr("transform", d => {
        return "translate(" + this.width / 2 + "," + this.siblingHeights[this.selfIndex] + ")";
      });
    siblingG
      .data(this.data.siblings)
      .append("text")
      .text(d => this.codeTrunc(d))
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", this.cRadius - 2.1 * this.textSize)
      .attr("x", 2 * this.cRadius)
      .attr("class", "siblingText")
      .style("text-anchor", "middle")
      .style("fill-opacity", 1);

    this.calcSiblingColours();
    siblingG
      .data(this.siblingColours)
      .append("circle")
      .attr("r", 1e-6)
      .attr("fill", d => {
        return d;
      })
      .attr("class", "siblingCircle")
      .on("click", (d, i) => {
        this.handleSiblingClick(d, i);
      });

    // transition new parent
    parentG
      .transition()
      .duration(this.duration)
      .attr("transform", () => {
        return "translate(" + this.hPadding + "," + this.height / 2 + ")";
      });
    parentG
      .selectAll("text.parentText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1);
    parentG
      .selectAll("circle.parentCircle")
      .transition()
      .duration(this.duration)
      .attr("r", this.cRadius);

    // transition new siblings
    this.svg
      .selectAll("g.siblingG")
      .data(this.siblingHeights)
      .transition()
      .duration(this.duration)
      .attr("transform", d => {
        return "translate(" + this.width / 2 + "," + d + ")";
      });
    siblingG
      .selectAll("text.siblingText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1);
    siblingG
      .selectAll("circle.siblingCircle")
      .transition()
      .duration(this.duration)
      .attr("r", this.cRadius);

    // create links
    this.parentLinks = [];
    for (let i = 0; i < this.data.siblings.length; i++) {
      this.parentLinks[i] = {
        source: {
          x: this.width / 2 - this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        },
        target: {
          x: this.width / 2 - this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        }
      };
    }

    this.linkG
      .selectAll("siblingG")
      .data(this.parentLinks)
      .enter()
      .append("path")
      .attr("d", d => this.link(d))
      .attr("class", "parentLink")
      .style("fill", "none")
      .style("stroke", this.linkColor)
      .style("stroke-width", this.linkWidth);

    this.createParentLinks();

    this.svg
      .selectAll("path.parentLink")
      .data(this.parentLinks)
      .transition()
      .duration(this.duration)
      .attr("d", d => this.link(d));
  }

  async removeChildren() {
    this.svg
      .selectAll("g.childrenG")
      .attr("class", "oldChildren")
      .transition()
      .attr("transform", () => {
        return "translate(" + this.width / 2 + "," + this.siblingHeights[this.selfIndex] + ")";
      })
      .duration(this.duration);
    this.svg
      .selectAll("g.oldChildren")
      .selectAll("circle.childrenCircle")
      .transition()
      .duration(this.duration)
      .attr("r", 1e-6);
    this.svg
      .selectAll("g.oldChildren")
      .selectAll("text")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1e-6);
    this.undoChildrenLinks();
    this.svg
      .selectAll("path.childrenLink")
      .data(this.childrenLinks)
      .transition()
      .duration(this.duration)
      .attr("d", d => this.link(d));
    await this.sleep(this.duration);
    this.svg.selectAll("g.oldChildren").remove();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  createParentLinks() {
    this.parentLinks = [];
    for (let i = 0; i < this.data.siblings.length; i++) {
      this.parentLinks[i] = {
        source: {
          x: this.hPadding + this.cRadius,
          y: this.height / 2
        },
        target: {
          x: this.width / 2 - this.cRadius,
          y: this.siblingHeights[i]
        }
      };
    }
  }

  codeTrunc = d => {
    const codeDesc = d.code + ": " + d.description;
    if (codeDesc.length < 26) {
      return codeDesc;
    } else {
      return codeDesc.substring(0, 25) + "...";
    }
  };

  createChildrenLinks() {
    this.childrenLinks = [];
    for (let i = 0; i < this.data.children.length; i++) {
      this.childrenLinks[i] = {
        source: {
          x: this.width / 2 + this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        },
        target: {
          x: this.width - this.hPadding - this.cRadius,
          y: this.childrenHeights[i]
        }
      };
    }
  }

  undoChildrenLinks() {
    this.childrenLinks = [];
    for (let i = 0; i < this.data.children.length; i++) {
      this.childrenLinks[i] = {
        source: {
          x: this.width / 2 + this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        },
        target: {
          x: this.width / 2 + this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        }
      };
    }
  }

  transitionParentLinks() {
    this.parentLinks = [];
    this.calcChildrenHeights();
    for (let i = 0; i < this.data.children.length; i++) {
      this.parentLinks[i] = {
        source: {
          x: this.width / 2 + this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        },
        target: {
          x: this.width - this.hPadding - this.cRadius,
          y: this.childrenHeights[i]
        }
      };
    }
    this.svg
      .selectAll("path.parentLink")
      .data(this.parentLinks)
      .transition()
      .duration(this.duration)
      .delay(this.duration)
      .attr("d", d => this.link(d))
      .attr("class", "childrenLink");
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

  calcSiblingHeights() {
    this.siblingHeights = [];
    if (this.data.siblings.length === 1) {
      this.siblingHeights.push(this.height / 2);
    } else {
      const totalSpace = this.height - 2 * this.vPadding;
      let gap = totalSpace / (this.data.siblings.length - 1);
      for (let i = 0; i < this.data.siblings.length; i++) {
        this.siblingHeights.push(i * gap + this.vPadding);
      }
    }
  }

  calcChildrenHeights() {
    this.childrenHeights = [];
    if (this.data.children.length === 1) {
      this.childrenHeights.push(this.height / 2);
    } else if (this.data.children.length > 1) {
      const totalSpace = this.height - 2 * this.vPadding;
      let gap = totalSpace / (this.data.children.length - 1);
      for (let i = 0; i < this.data.children.length; i++) {
        this.childrenHeights.push(i * gap + this.vPadding);
      }
    }
  }

  calcSiblingColours() {
    this.siblingColours = [];
    for (let i = 0; i < this.data.siblings.length; i++) {
      if (this.selfIndex === i) {
        this.siblingColours.push(this.selectedColor);
      } else {
        this.siblingColours.push(this.otherColor);
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
    return <div id={"tree" + this.props.id} className={this.treeClass} />;
  }
}

export default TreeViewer;
