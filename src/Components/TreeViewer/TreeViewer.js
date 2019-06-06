import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";

class TreeViewer extends Component {
  constructor(props) {
    super(props);
    this.duration = 1500;

    this.fontType = "sans-serif";
    this.treeClass = "treeVis" + this.props.id;
    this.selectedColor = "#3748ac";
    this.otherColor = "pink";
    this.textColor = "#0019a8";
    this.fontWeight = 2;
    this.linkColor = "#f0f0f0";
    this.linkWidth = 7;
    this.handlingClick = false;

    this.link = d3
      .linkHorizontal()
      .x(function(d) {
        return d.x;
      })
      .y(function(d) {
        return d.y;
      });
  }

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
    this.vPadding = this.height * 0.1;
    this.leftPadding = this.width * 0.05;
    this.rightPadding = this.width * 0.3;
    this.cRadius = minSize / 60;
    this.textSize = minSize / 50;
    this.middle = (this.width - this.leftPadding - this.rightPadding) / 2 + this.leftPadding;
    this.maxChar = Math.floor(this.width / 25);
    this.buttonWidth = this.rightPadding / 2;
    this.buttonHeight = this.vPadding / 2;
  }

  addInfoText() {
    let infoG = this.svg.append("g").attr("class", "infoG");
    this.infoText = infoG
      .append("text")
      .attr("y", this.textSize + 5)
      .attr("x", this.leftPadding * 0.25)
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .text("")
      .style("text-anchor", "left");
  }

  setInfoText(tier, index) {
    let codeDesc = "";
    if (tier === 0) {
      if (this.data.parent) {
        codeDesc = this.codeFormat(this.data.parent, 0);
      }
    } else if (tier === 1) {
      if (this.data.siblings[index]) {
        codeDesc = this.codeFormat(this.data.siblings[index], 0);
      }
    } else if (tier === 2) {
      if (this.data.children[index]) {
        codeDesc = this.codeFormat(this.data.children[index], 0);
      }
    }
    this.infoText.text(codeDesc);
  }

  setInfoTextChain(index) {
    let codeDesc = "";
    codeDesc = this.codeFormat(this.ancestors[index], 0);
    this.infoText.text(codeDesc);
  }

  clearInfoText() {
    this.infoText.text("");
  }

  componentDidMount() {
    this.getDataFromAPI("Chapter 01").then(() => {
      this.drawInitialTree();
    });
  }

  async changeTree(code) {
    d3.select("div." + this.treeClass)
      .transition()
      .duration(0.5 * this.duration)
      .style("opacity", 1e-6);

    await this.sleep(0.5 * this.duration);
    this.getDataFromAPI(code).then(() => {
      this.drawInitialTree();
      d3.select("div." + this.treeClass)
        .transition()
        .duration(0.5 * this.duration)
        .style("opacity", 1);
    });
  }

  drawInitialTree() {
    this.recalculateSizes();

    d3.select("div." + this.treeClass)
      .select("svg")
      .remove();

    this.svg = d3
      .select("div." + this.treeClass)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.addChain();

    this.addInfoText();
    this.linkG = this.svg.append("g").attr("class", "pathG");
    this.rightG = this.svg.append("g").attr("class", "rightG");
    this.middleG = this.svg.append("g").attr("class", "middleG");
    this.leftG = this.svg.append("g").attr("class", "leftG");

    //////////// PARENT NODE ////////////
    /////////////////////////////////////
    if (this.data.parent) {
      let parentg = this.leftG
        .append("g")
        .attr("transform", () => {
          return "translate(" + this.leftPadding + "," + this.height / 2 + ")";
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
        .text(this.codeFormat(this.data.parent, 1))
        .attr("font-family", this.fontType)
        .attr("font-size", this.textSize)
        .attr("fill", this.textColor)
        .attr("y", 0.3 * this.textSize)
        .attr("x", 1.5 * this.cRadius)
        .attr("class", "parentText")
        .style("text-anchor", "right");

      parentg
        .append("circle")
        .attr("r", this.cRadius)
        .attr("fill", this.otherColor)
        .attr("class", "parentCircle")
        .on("click", (d, i) => {
          this.handleParentClick(d, i);
        });
    }

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
        return "translate(" + this.middle + "," + d + ")";
      })
      .attr("class", "siblingG");

    siblingGs
      .data(this.data.siblings)
      .append("text")
      .text(d => this.codeFormat(d, 1))
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", 0.3 * this.textSize)
      .attr("x", 1.5 * this.cRadius)
      .attr("class", "siblingText")
      .style("text-anchor", "right");

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
        return "translate(" + (this.width - this.rightPadding) + "," + d + ")";
      })
      .attr("class", "childrenG");

    childrenGs
      .data(this.data.children)
      .append("text")
      .text(d => this.codeFormat(d, 1))
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", 0.3 * this.textSize)
      .attr("x", 1.5 * this.cRadius)
      .attr("class", "childrenText")
      .style("text-anchor", "right");

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
    if (this.data.parent) {
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
    }

    this.createChildrenLinks();
    this.linkG
      .selectAll("childrenG")
      .data(this.childrenLinks)
      .enter()
      .append("path")
      .attr("d", d => this.link(d))
      .attr("class", "childrenLink")
      .style("fill", "none")
      .style("stroke", this.linkColor)
      .style("stroke-width", this.linkWidth);

    this.createButton();
  }
  // END OF DRAW INITIAL TREE /////////////////
  /////////////////////////////////////////////

  // HANDLE CLICKS ////////////////////////////
  /////////////////////////////////////////////
  handleParentClick() {
    if (!this.handlingClick) {
      this.handlingClick = true;
      this.prevAncestors = this.ancestors;
      this.getDataFromAPI(this.data.parent.code)
        .then(() => this.getAncestorsFromAPI(this.data.self.code))
        .then(async () => {
          this.removeChildren();
          this.moveSiblingsToChildren();
          this.moveParentToSibling();
          this.transitionParentLinks();
          await this.sleep(this.duration);
          this.parentChain();
          await this.sleep(this.duration);
          this.spawnParentAndSiblings();
          this.svg.selectAll("g.oldChainG").remove();
          this.svg.selectAll("g.oldChildren").remove();
          await this.sleep(this.duration);
          this.svg.selectAll("g.oldParentG").remove();
          this.svg.selectAll("g.tempG").remove();
        })
        .then(() => {
          this.handlingClick = false;
        });
    }
  }

  handleSiblingClick(d, i) {
    if (!this.handlingClick) {
      this.handlingClick = true;
      this.getDataFromAPI(this.data.siblings[i].code)
        .then(async () => {
          if (i !== this.selfIndex) {
            this.removeChildren();
            this.findIndex();
            this.calcSiblingColours();
            this.svg
              .selectAll("circle.siblingCircle")
              .data(this.siblingColours)
              .transition()
              .duration(this.duration)
              .attr("fill", d => {
                return d;
              });
            this.changeSelfAncestor();
            await this.sleep(this.duration);
            this.spawnChildren();
          }
        })
        .then(() => {
          this.handlingClick = false;
        });
    }
  }

  handleChildrenClick(d, i) {
    if (!this.handlingClick) {
      this.handlingClick = true;
      this.prevAncestors = this.ancestors;
      this.getDataFromAPI(this.data.children[i].code)
        .then(() => this.getAncestorsFromAPI(this.data.self.code))
        .then(async () => {
          this.createNewParent();
          this.removeParentAndSiblings();
          await this.sleep(this.duration);
          this.linkG.selectAll("path.parentLink").remove();
          this.svg.selectAll("g.siblingG").remove();
          this.svg.selectAll("g.oldParentG").remove();
          this.moveSelfToParent();
          this.moveChildrenToSiblings();
          this.transitionChildrenLinks();
          this.childrenChain();
          await this.sleep(this.duration);
          this.spawnChildren();
        })
        .then(() => {
          this.handlingClick = false;
        });
    }
  }

  handleChainClick(d, i) {
    if (this.ancestors[i].code !== this.data.self.code) {
      this.changeTree(this.ancestors[i].code);
    }
  }

  // END OF HANDLE CLICKS //////////////////////
  //////////////////////////////////////////////

  createButton() {
    let buttonG = this.svg
      .append("g")
      .attr("transform", d => {
        return "translate(" + (this.width - 0.75 * this.rightPadding) + "," + (this.height - 0.7 * this.vPadding) + ")";
      })
      .attr("class", "buttonG")
      .on("click", () => {
        this.props.addCodeFromTree(this.data.self);
      });

    buttonG
      .append("rect")
      .attr("width", this.buttonWidth)
      .attr("height", this.buttonHeight)
      .attr("fill", "lightgrey")
      .attr("class", "buttonRect");

    buttonG
      .append("text")
      .text("Add Code")
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", this.buttonHeight / 1.5)
      .attr("x", this.buttonWidth / 2)
      .attr("class", "buttonText")
      .style("text-anchor", "middle");

    let overButton = buttonG
      .append("rect")
      .attr("width", this.buttonWidth)
      .attr("height", this.buttonHeight)
      .attr("fill", "green")
      .attr("class", "buttonRect")
      .style("fill-opacity", 1e-6)
      .on("click", async () => {
        overButton
          .transition()
          .duration(200)
          .style("fill-opacity", 0.5);
        await this.sleep(200);
        overButton
          .transition()
          .duration(200)
          .style("fill-opacity", 1e-6);
      });
  }

  async parentChain() {
    this.svg.selectAll("g.chainG").attr("class", "oldChainG");
    this.svg.selectAll("text.chainText").attr("class", "oldChainText");
    this.svg.selectAll("circle.chainCircle").attr("class", "oldChainCircle");
    this.svg.selectAll("path.chainLink").attr("class", "oldChainLink");

    // create all except last on same spots
    this.chainPositions.shift();
    let chainGs = this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .enter()
      .append("g")
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      })
      .attr("class", "chainG");
    chainGs
      .data(this.ancestors)
      .append("text")
      .text(d => d.code)
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", 2 * this.textSize)
      .attr("class", "chainText")
      .style("fill-opacity", 1)
      .style("text-anchor", "middle");
    this.calcAncestorColours();
    chainGs
      .data(this.ancestorColours)
      .append("circle")
      .attr("r", i => {
        if (i === 0) {
          return 1e-6;
        } else {
          return this.cRadius;
        }
      })
      .attr("fill", d => d)
      .attr("class", "chainCircle")
      .on("click", (d, i) => {
        this.handleChainClick(d, i);
      })
      .on("mouseover", (d, i) => {
        this.setInfoTextChain(i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      });

    this.calcChainSpacing();
    this.addChainLinks();
    this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .transition()
      .duration(this.duration)
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      });
    this.svg
      .selectAll("text.oldChainText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1e-6);
    this.svg
      .selectAll("circle.oldChainCircle")
      .transition()
      .duration(this.duration)
      .attr("r", 1e-6);

    if (this.ancestors.length > 1) {
      let tempG = this.svg
        .append("g")
        .attr("transform", () => {
          return "translate(" + this.chainPositions[0] + "," + (this.height - this.vPadding / 2) + ")";
        })
        .attr("class", "tempG");

      tempG
        .append("circle")
        .attr("r", this.cRadius)
        .attr("fill", this.selectedColor)
        .attr("class", "TempCircle");

      tempG
        .append("text")
        .text(this.prevAncestors[0].code)
        .attr("font-family", this.fontType)
        .attr("font-size", this.textSize)
        .attr("fill", this.textColor)
        .attr("y", 2 * this.textSize)
        .attr("class", "TempText")
        .style("fill-opacity", 1)
        .style("text-anchor", "middle");

      this.svg
        .selectAll("text.TempText")
        .transition()
        .duration(this.duration)
        .style("fill-opacity", 1e-6);

      this.svg
        .selectAll("circle.TempCircle")
        .transition()
        .duration(this.duration)
        .attr("r", 1e-6);
      this.svg.selectAll("g.oldChainG").remove();
    } else {
      this.ancestorLinks = [];
      this.ancestorLinks[0] = {
        source: {
          x: this.leftPadding + this.cRadius,
          y: this.height - this.vPadding / 2
        },
        target: {
          x: this.width - this.rightPadding - this.cRadius,
          y: this.height - this.vPadding / 2
        }
      };

      this.linkG
        .selectAll("g.chainG")
        .data(this.ancestorLinks)
        .enter()
        .append("path")
        .attr("d", d => this.link(d))
        .attr("class", "chainLink")
        .style("fill", "none")
        .style("stroke", this.linkColor)
        .style("stroke-width", this.linkWidth);

      this.ancestorLinks = [];
      this.ancestorLinks[0] = {
        source: {
          x: this.leftPadding + this.cRadius,
          y: this.height - this.vPadding / 2
        },
        target: {
          x: this.leftPadding + this.cRadius,
          y: this.height - this.vPadding / 2
        }
      };

      this.svg
        .selectAll("path.chainLink")
        .data(this.ancestorLinks)
        .transition()
        .duration(this.duration)
        .attr("d", d => this.link(d));

      let tempG = this.svg
        .append("g")
        .attr("transform", () => {
          return "translate(" + (this.width - this.rightPadding) + "," + (this.height - this.vPadding / 2) + ")";
        })
        .attr("class", "tempG");

      tempG
        .append("circle")
        .attr("r", this.cRadius)
        .attr("fill", this.selectedColor)
        .attr("class", "TempCircle");

      tempG
        .append("text")
        .text(this.prevAncestors[0].code)
        .attr("font-family", this.fontType)
        .attr("font-size", this.textSize)
        .attr("fill", this.textColor)
        .attr("y", 2 * this.textSize)
        .attr("class", "TempText")
        .style("fill-opacity", 1)
        .style("text-anchor", "middle");

      tempG
        .transition()
        .duration(this.duration)
        .attr("transform", () => {
          return "translate(" + this.leftPadding + "," + (this.height - this.vPadding / 2) + ")";
        });

      this.svg
        .selectAll("text.TempText")
        .transition()
        .duration(this.duration)
        .style("fill-opacity", 1e-6);

      this.svg
        .selectAll("circle.TempCircle")
        .transition()
        .duration(this.duration)
        .attr("r", 1e-6);
      this.svg.selectAll("g.oldChainG").remove();
    }
  }

  childrenChain() {
    this.svg.selectAll("g.chainG").attr("class", "oldChainG");
    this.svg.selectAll("text.chainText").attr("class", "oldChainText");
    this.svg.selectAll("circle.chainCircle").attr("class", "oldChainCircle");
    this.svg.selectAll("path.chainLink").attr("class", "oldChainLink");

    // create new on same spots, last one invisible at end
    this.chainPositions.unshift(this.chainPositions[0]);
    let chainGs = this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .enter()
      .append("g")
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      })
      .attr("class", "chainG");
    chainGs
      .data(this.ancestors)
      .append("text")
      .text(d => d.code)
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", 2 * this.textSize)
      .attr("class", "chainText")
      .style("fill-opacity", (d, i) => {
        if (i === 0) {
          return 1e-6;
        } else {
          return 1;
        }
      })
      .style("text-anchor", "middle");
    this.calcAncestorColours();
    chainGs
      .data(this.ancestorColours)
      .append("circle")
      .attr("r", i => {
        if (i === 0) {
          return 1e-6;
        } else {
          return this.cRadius;
        }
      })
      .attr("fill", d => d)
      .attr("class", "chainCircle")
      .on("click", (d, i) => {
        this.handleChainClick(d, i);
      })
      .on("mouseover", (d, i) => {
        this.setInfoTextChain(i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      });

    // remove old (no transition necessary)
    this.svg.selectAll("g.oldChainG").remove();
    // transition new to new spots
    this.calcChainSpacing();
    this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .transition()
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      })
      .duration(this.duration);

    // transition invisible one in
    this.svg
      .selectAll("circle.chainCircle")
      .transition()
      .duration(this.duration)
      .attr("r", this.cRadius);
    this.svg
      .selectAll("text.chainText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1);

    // create new links and transition
    if (this.prevAncestors.length !== 1) {
      this.addChainLinks();
    } else {
      this.ancestorLinks = [];
      this.ancestorLinks[0] = {
        source: {
          x: this.leftPadding + this.cRadius,
          y: this.height - this.vPadding / 2
        },
        target: {
          x: this.leftPadding + this.cRadius,
          y: this.height - this.vPadding / 2
        }
      };

      this.linkG
        .selectAll("g.chainG")
        .data(this.ancestorLinks)
        .enter()
        .append("path")
        .attr("d", d => this.link(d))
        .attr("class", "chainLink")
        .style("fill", "none")
        .style("stroke", this.linkColor)
        .style("stroke-width", this.linkWidth);

      this.ancestorLinks = [];
      this.ancestorLinks[0] = {
        source: {
          x: this.leftPadding + this.cRadius,
          y: this.height - this.vPadding / 2
        },
        target: {
          x: this.width - this.rightPadding - this.cRadius,
          y: this.height - this.vPadding / 2
        }
      };

      this.svg
        .selectAll("path.chainLink")
        .data(this.ancestorLinks)
        .transition()
        .duration(this.duration)
        .attr("d", d => this.link(d));
    }
  }

  changeSelfAncestor() {
    this.svg.selectAll("g.chainG").attr("class", "oldChainG");
    this.svg.selectAll("text.chainText").attr("class", "oldChainText");

    let chainGs = this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .enter()
      .append("g")
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      })
      .attr("class", "chainG");

    chainGs
      .data(this.ancestors)
      .append("text")
      .text((d, i) => {
        if (i === 0) {
          return this.data.self.code;
        } else {
          return d.code;
        }
      })
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", 2 * this.textSize)
      .attr("class", "chainText")
      .style("fill-opacity", (d, i) => {
        if (i === 0) {
          return 1e-6;
        } else {
          return 1;
        }
      })
      .style("text-anchor", "middle");

    chainGs
      .data(this.ancestorColours)
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", d => {
        return d;
      })
      .attr("class", "chainCircle")
      .on("click", (d, i) => {
        this.handleChainClick(d, i);
      })
      .on("mouseover", (d, i) => {
        this.setInfoTextChain(i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      });

    this.svg
      .selectAll("text.oldChainText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1e-6);

    this.svg
      .selectAll("text.chainText")
      .transition()
      .duration(this.duration)
      .delay(this.duration)
      .style("fill-opacity", 1);

    this.svg.selectAll("g.oldChainG").remove();
  }

  addChain() {
    this.getAncestorsFromAPI(this.data.self.code).then(() => {
      this.numCircles = this.ancestors.length;
      this.calcChainSpacing();
      this.addChainGs();
      this.addChainLinks();
    });
  }

  removeChainLinks() {
    this.svg.selectAll("path.oldChainLink");
  }

  addChainLinks() {
    this.ancestorLinks = [];
    for (let i = 0; i < this.chainPositions.length - 1; i++) {
      this.ancestorLinks[i] = {
        source: {
          x: this.chainPositions[i] + this.cRadius,
          y: this.height - this.vPadding / 2
        },
        target: {
          x: this.chainPositions[i + 1] - this.cRadius,
          y: this.height - this.vPadding / 2
        }
      };
    }

    this.linkG
      .selectAll("g.chainG")
      .data(this.ancestorLinks)
      .enter()
      .append("path")
      .attr("d", d => this.link(d))
      .attr("class", "chainLink")
      .style("fill", "none")
      .style("stroke", this.linkColor)
      .style("stroke-width", this.linkWidth);

    this.svg.selectAll("path.oldChainLink").remove();
  }

  calcChainSpacing() {
    const totalSpace = this.width - this.leftPadding - this.rightPadding;
    this.chainPositions = [];
    let gap = 0;
    if (this.ancestors.length > 1) {
      gap = totalSpace / (this.ancestors.length - 1);
    }
    for (let i = 0; i < this.ancestors.length; i++) {
      this.chainPositions.push(i * gap + this.leftPadding);
    }
    this.chainPositions.reverse();
  }

  addChainGs() {
    let chainGs = this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .enter()
      .append("g")
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      })
      .attr("class", "chainG");

    chainGs
      .data(this.ancestors)
      .append("text")
      .text(d => d.code)
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", 2 * this.textSize)
      .attr("class", "chainText")
      .style("text-anchor", "middle");

    this.calcAncestorColours();
    chainGs
      .data(this.ancestorColours)
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", d => {
        return d;
      })
      .attr("class", "chainCircle")
      .on("click", (d, i) => {
        this.handleChainClick(d, i);
      })
      .on("mouseover", (d, i) => {
        this.setInfoTextChain(i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      });
  }

  calcAncestorColours() {
    this.ancestorColours = [];
    this.ancestorColours.push(this.selectedColor);
    for (let i = 0; i < this.ancestors.length - 1; i++) {
      this.ancestorColours.push(this.otherColor);
    }
  }

  getAncestorsFromAPI = code => {
    const url = "http://localhost:8000/api/ancestors/" + code + "/?format=json";
    return fetch(url)
      .then(response => response.json())
      .then(parsedJson => {
        this.ancestors = parsedJson;
      });
  };

  createNewParent() {
    this.svg.selectAll("g.parentG").attr("class", "oldParentG");
    this.svg.selectAll("circle.parentCircle").attr("class", "oldParentCircle");
    this.svg.selectAll("text.parentText").attr("class", "oldParentText");
    // make new parent circle on top of current self
    let parentg = this.leftG
      .append("g")
      .attr("transform", () => {
        return "translate(" + this.middle + "," + this.siblingHeights[this.selfIndex] + ")";
      })
      .on("mouseover", (d, i) => {
        this.setInfoText(0, 0);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .attr("class", "parentG");
    parentg
      .append("text")
      .text(this.codeFormat(this.data.parent, 1))
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", 0.3 * this.textSize)
      .attr("x", 1.5 * this.cRadius)
      .attr("class", "parentText")
      .style("text-anchor", "right");
    parentg
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", this.selectedColor)
      .attr("class", "parentCircle")
      .on("click", (d, i) => {
        this.handleParentClick(d, i);
      });
  }

  removeParentAndSiblings() {
    this.svg
      .selectAll("g.oldParentG")
      .transition()
      .attr("transform", () => {
        return "translate(" + this.middle + "," + this.siblingHeights[this.selfIndex] + ")";
      })
      .duration(this.duration);
    this.svg
      .selectAll("circle.oldParentCircle")
      .transition()
      .duration(this.duration)
      .attr("r", 1e-6);
    this.svg
      .selectAll("text.oldParentText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1e-6);

    this.svg
      .selectAll("g.siblingG")
      .transition()
      .attr("transform", () => {
        return "translate(" + this.middle + "," + this.siblingHeights[this.selfIndex] + ")";
      })
      .duration(this.duration);
    this.svg
      .selectAll("circle.siblingCircle")
      .transition()
      .duration(this.duration)
      .attr("r", 1e-6);
    this.svg
      .selectAll("text.siblingText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1e-6);

    this.parentLinks = [];
    for (let i = 0; i < this.siblingHeights.length; i++) {
      this.parentLinks[i] = {
        source: {
          x: this.middle - this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        },
        target: {
          x: this.middle - this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        }
      };
    }
    this.svg
      .selectAll("path.parentLink")
      .data(this.parentLinks)
      .transition()
      .duration(this.duration)
      .attr("d", d => this.link(d));
  }

  moveSelfToParent() {
    this.findIndex();
    this.svg
      .selectAll("g.parentG")
      .transition()
      .attr("transform", d => {
        return "translate(" + this.leftPadding + "," + this.height / 2 + ")";
      })
      .duration(this.duration);

    this.svg
      .selectAll("circle.parentCircle")
      .transition()
      .duration(this.duration)
      .attr("fill", this.otherColor);
  }

  moveChildrenToSiblings() {
    this.svg
      .selectAll("g.childrenG")
      .on("mouseover", (d, i) => {
        this.setInfoText(1, i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .data(this.childrenHeights)
      .transition()
      .duration(this.duration)
      .attr("transform", d => {
        return "translate(" + this.middle + "," + d + ")";
      })
      .attr("class", "siblingG");

    this.calcSiblingColours();
    this.svg
      .selectAll("circle.childrenCircle")
      .data(this.siblingColours)
      .attr("class", "siblingCircle")
      .on("click", (d, i) => {
        this.handleSiblingClick(d, i);
      })
      .transition()
      .duration(this.duration)
      .attr("fill", d => {
        return d;
      });

    this.svg
      .selectAll("text.childrenText")
      .transition()
      .duration(this.duration)
      .attr("y", 0.3 * this.textSize)
      .attr("x", 1.5 * this.cRadius)
      .attr("class", "siblingText")
      .style("text-anchor", "right");
  }

  transitionChildrenLinks() {
    this.childrenLinks = [];
    this.calcSiblingHeights();
    for (let i = 0; i < this.data.siblings.length; i++) {
      this.childrenLinks[i] = {
        source: {
          x: this.leftPadding + this.cRadius,
          y: this.height / 2
        },
        target: {
          x: this.middle - this.cRadius,
          y: this.siblingHeights[i]
        }
      };
    }
    this.svg
      .selectAll("path.childrenLink")
      .data(this.childrenLinks)
      .transition()
      .duration(this.duration)
      //.delay(this.duration)
      .attr("d", d => this.link(d))
      .attr("class", "parentLink");
  }

  spawnChildren() {
    this.calcChildrenHeights();
    let childrenGs = this.svg
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
      .attr("class", "childrenG")
      .attr("transform", d => {
        return "translate(" + this.middle + "," + this.siblingHeights[this.selfIndex] + ")";
      });

    childrenGs
      .data(this.data.children)
      .append("text")
      .text(d => this.codeFormat(d, 1))
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", 0.3 * this.textSize)
      .attr("x", 1.5 * this.cRadius)
      .attr("class", "childrenText")
      .style("text-anchor", "right")
      .style("fill-opacity", 1e-6);

    childrenGs
      .data(this.childrenHeights)
      .append("circle")
      .attr("r", 1e-6)
      .attr("fill", this.otherColor)
      .attr("class", "childrenCircle")
      .on("click", (d, i) => {
        this.handleChildrenClick(d, i);
      });

    this.svg
      .selectAll("g.childrenG")
      .data(this.childrenHeights)
      .transition()
      .duration(this.duration)
      .attr("transform", d => {
        return "translate(" + (this.width - this.rightPadding) + "," + d + ")";
      });
    childrenGs
      .selectAll("text.childrenText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1);
    this.svg
      .selectAll("circle.childrenCircle")
      .transition()
      .duration(this.duration)
      .attr("r", this.cRadius);

    this.childrenLinks = [];
    for (let i = 0; i < this.data.children.length; i++) {
      this.childrenLinks[i] = {
        source: {
          x: this.middle + this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        },
        target: {
          x: this.middle + this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        }
      };
    }

    this.linkG
      .selectAll("childrenG")
      .data(this.childrenLinks)
      .enter()
      .append("path")
      .attr("d", d => this.link(d))
      .attr("class", "childrenLink")
      .style("fill", "none")
      .style("stroke", this.linkColor)
      .style("stroke-width", this.linkWidth);

    this.createChildrenLinks();
    this.svg
      .selectAll("path.childrenLink")
      .data(this.childrenLinks)
      .transition()
      .duration(this.duration)
      .attr("d", d => this.link(d));
  }

  moveSiblingsToChildren() {
    this.svg
      .selectAll("g.siblingG")
      .on("mouseover", (d, i) => {
        this.setInfoText(2, i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .data(this.siblingHeights)
      .transition()
      .delay(this.duration)
      .duration(this.duration)
      .attr("transform", d => {
        return "translate(" + (this.width - this.rightPadding) + "," + d + ")";
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
      .attr("y", 0.3 * this.textSize)
      .attr("x", 1.5 * this.cRadius)
      .attr("class", "childrenText")
      .style("text-anchor", "right");
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
        return "translate(" + this.middle + "," + this.siblingHeights[this.selfIndex] + ")";
      })
      .attr("class", "oldParentG");

    this.svg
      .selectAll("circle.parentCircle")
      .transition()
      .duration(this.duration)
      .attr("class", "siblingCircle") //**HERE**
      .attr("fill", this.selectedColor);

    this.svg.selectAll("circle.siblingCircle").on("click", (d, i) => {
      this.handleSiblingClick(d, i);
    });
    this.svg.selectAll("g.oldParentG").remove();
  }

  spawnParentAndSiblings() {
    // creating invisible parent at self
    if (this.data.parent) {
      let parentG = this.svg
        .append("g")
        .on("mouseover", (d, i) => {
          this.setInfoText(0, 0);
        })
        .on("mouseout", () => {
          this.clearInfoText();
        })
        .attr("class", "parentG")
        .attr("transform", d => {
          return "translate(" + this.middle + "," + this.siblingHeights[this.selfIndex] + ")";
        });
      parentG
        .append("text")
        .text(this.codeFormat(this.data.parent, 1))
        .attr("font-family", this.fontType)
        .attr("font-size", this.textSize)
        .attr("fill", this.textColor)
        .attr("y", 0.3 * this.textSize)
        .attr("x", 1.5 * this.cRadius)
        .attr("class", "parentText")
        .style("text-anchor", "right")
        .style("fill-opacity", 1e-6);
      parentG
        .append("circle")
        .attr("r", 1e-6)
        .attr("fill", this.otherColor)
        .attr("class", "parentCircle")
        .on("click", (d, i) => {
          this.handleParentClick(d, i);
        });

      // transition new parent
      parentG
        .transition()
        .duration(this.duration)
        .attr("transform", () => {
          return "translate(" + this.leftPadding + "," + this.height / 2 + ")";
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

      // create links
      this.parentLinks = [];
      for (let i = 0; i < this.data.siblings.length; i++) {
        this.parentLinks[i] = {
          source: {
            x: this.middle - this.cRadius,
            y: this.siblingHeights[this.selfIndex]
          },
          target: {
            x: this.middle - this.cRadius,
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

    // create invisible siblings at self
    let siblingG = this.middleG
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
      .attr("class", "siblingG")
      .attr("transform", d => {
        return "translate(" + this.middle + "," + this.siblingHeights[this.selfIndex] + ")";
      });
    siblingG
      .data(this.data.siblings)
      .append("text")
      .text(d => this.codeFormat(d, 1))
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", 0.3 * this.textSize)
      .attr("x", 1.5 * this.cRadius)
      .attr("class", "siblingText")
      .style("text-anchor", "right")
      .style("fill-opacity", 1e-6);

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

    // transition new siblings
    this.svg
      .selectAll("g.siblingG")
      .data(this.siblingHeights)
      .transition()
      .duration(this.duration)
      .attr("transform", d => {
        return "translate(" + this.middle + "," + d + ")";
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
  }

  async removeChildren() {
    this.svg
      .selectAll("g.childrenG")
      .transition()
      .attr("transform", () => {
        return "translate(" + this.middle + "," + this.siblingHeights[this.selfIndex] + ")";
      })
      .attr("class", "oldChildrenG")
      .duration(this.duration);
    this.svg
      .selectAll("circle.childrenCircle")
      .transition()
      .duration(this.duration)
      .attr("r", 1e-6);
    this.svg
      .selectAll("text.childrenText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1e-6);
    this.undoChildrenLinks();
    this.svg
      .selectAll("path.childrenLink")
      .attr("class", "oldChildrenLink")
      .data(this.childrenLinks)
      .transition()
      .duration(this.duration)
      .attr("d", d => this.link(d));
    await this.sleep(this.duration);
    this.svg.selectAll("g.oldChildrenG").remove();
    this.linkG.selectAll("path.oldChildrenLink").remove();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  createParentLinks() {
    this.parentLinks = [];
    for (let i = 0; i < this.data.siblings.length; i++) {
      this.parentLinks[i] = {
        source: {
          x: this.leftPadding + this.cRadius,
          y: this.height / 2
        },
        target: {
          x: this.middle - this.cRadius,
          y: this.siblingHeights[i]
        }
      };
    }
  }

  codeFormat = (d, truncFlag) => {
    let room;
    if (this.data.siblings.includes(d)) {
      if (this.data.children) {
        room = this.width - this.rightPadding - this.middle - 3 * this.cRadius;
      } else {
        room = this.width - this.middle - 3 * this.cRadius;
      }
    } else if (this.data.children.includes(d)) {
      room = this.rightPadding - 3 * this.cRadius;
    } else if (this.data.parent === d) {
      room = this.middle - this.leftPadding - 3 * this.cRadius;
    }

    let codeDesc;
    if (d.description) {
      codeDesc = d.code + ": " + d.description;
    } else {
      codeDesc = d.code;
    }

    if (truncFlag === 1) {
      this.svg
        .append("text")
        .text(codeDesc)
        .attr("font-family", this.fontType)
        .attr("font-size", this.textSize)
        .attr("y", -999999)
        .attr("x", -999999)
        .attr("class", "truncText");

      let values = this.svg
        .selectAll("text.truncText")
        .node()
        .getBBox();
      this.svg.selectAll("text.truncText").remove();

      while (values.width > room) {
        this.svg
          .append("text")
          .text(codeDesc + "...")
          .attr("font-family", this.fontType)
          .attr("font-size", this.textSize)
          .attr("y", -999999)
          .attr("x", -999999)
          .attr("class", "truncText");

        values = this.svg
          .selectAll("text.truncText")
          .node()
          .getBBox();
        this.svg.selectAll("text.truncText").remove();
        codeDesc = codeDesc.slice(0, codeDesc.length - 1);
      }
      if (d.description) {
        if (codeDesc !== d.code + ": " + d.description) {
          codeDesc = codeDesc + "...";
        }
      }
    }

    // if (truncFlag === 1) {
    //   if (codeDesc.length < this.maxChar + 1) {
    //     return codeDesc;
    //   } else {
    //     return codeDesc.substring(0, this.maxChar) + "...";
    //   }
    // }
    return codeDesc;
  };

  createChildrenLinks() {
    this.childrenLinks = [];
    for (let i = 0; i < this.data.children.length; i++) {
      this.childrenLinks[i] = {
        source: {
          x: this.middle + this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        },
        target: {
          x: this.width - this.rightPadding - this.cRadius,
          y: this.childrenHeights[i]
        }
      };
    }
  }

  undoChildrenLinks() {
    this.childrenLinks = [];
    for (let i = 0; i < this.childrenHeights.length; i++) {
      this.childrenLinks[i] = {
        source: {
          x: this.middle + this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        },
        target: {
          x: this.middle + this.cRadius,
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
          x: this.middle + this.cRadius,
          y: this.siblingHeights[this.selfIndex]
        },
        target: {
          x: this.width - this.rightPadding - this.cRadius,
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
