import React, { Component } from "react";
import * as d3 from "d3";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as APIUtility from "../../Util/API";

class TreeViewer extends Component {
  constructor(props) {
    super(props);
    this.duration = 500; // Duration of all transitions
    this.oldWidth = 0;
    this.oldHeight = 0;
    this.fontType = "sans-serif"; // Font type
    this.treeClass = "treeVis" + this.props.id; // Class name
    this.selectedColor = "#3748ac"; // Colour of selected node
    this.otherColor = "pink"; // Colour of other nodes
    this.textColor = "#0019a8"; // Colour of text
    this.linkColor = "#f0f0f0"; // Colour of links
    this.linkWidth = 7; // Width of links
    this.handlingClick = false; // Initializing handlingClick to false, used to prevent two clicks from happening at the same time
    this.isMountedFlag = false;
    this.dblclick_timer = false;
  }

  // Function to create links
  link = d3
    .linkHorizontal()
    .x(function(d) {
      return d.x;
    })
    .y(function(d) {
      return d.y;
    });

  // Handles resizing of the tree in the main page. Is called by App
  handleResize(e) {
    this.redrawTree();
  }

  // Recalculates all sizes based upon the size of the window passed by App
  recalculateSizes() {
    if (!this.isMountedFlag) {
      return false;
    }
    let elem = ReactDOM.findDOMNode(this).parentNode;
    this.width = elem.offsetWidth;
    this.height = elem.offsetHeight;
    const minSize = Math.min(this.width, this.height); // Minimum of width and height
    this.vPadding = this.height * 0.1; // Vertical padding
    this.leftPadding = this.width * 0.05; // Left padding
    this.rightPadding = this.width * 0.3; // Right padding
    this.cRadius = minSize / 60; // Circle radius
    this.textSize = minSize / 50; // Font size
    this.middle = (this.width - this.leftPadding - this.rightPadding) / 2 + this.leftPadding; // Middle of the non-padded space
    this.buttonWidth = this.rightPadding / 2; // Width of "add code" button
    this.buttonHeight = this.vPadding / 2; // Height of "add code" button

    //check if dimensions changed
    if (this.width !== this.oldWidth || this.height !== this.oldHeight) {
      this.oldHeight = this.height;
      this.oldWidth = this.width;
      return true;
    } else {
      return false;
    }
  }

  // Adds the text element to the top left corner to display what is being hovered over
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

  // Sets the text in the top left corner
  // Tiers: 0 for parent, 1 for sibling, 2 for children
  // Index is for sibling or children, the index of the sibling or child to display the text of
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

  // Sets the text in the top left corner if one of the ancestor circles is hovered over
  setInfoTextChain(index) {
    let codeDesc = "";
    codeDesc = this.codeFormat(this.ancestors[index], 0);
    this.infoText.text(codeDesc);
  }

  // Clears the text in the top left corner
  clearInfoText() {
    this.infoText.text("");
  }

  updateDimensions = () => {
    this.redrawTree();
  };

  redrawTree() {
    if (this.data !== undefined) {
      const sizeChanged = this.recalculateSizes();
      if (sizeChanged) {
        this.drawInitialTree(); // Draw tree
      }
    }
  }

  componentDidMount() {
    this.isMountedFlag = true;
    window.addEventListener("resize", this.updateDimensions);
    this.getDataFromAPI("Chapter 01").then(() => {
      this.redrawTree();
    });
  }

  componentWillUnmount() {
    this.isMountedFlag = false;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.codeToDisplay !== this.props.codeToDisplay) {
      this.changeTree(this.props.codeToDisplay);
    }
  }

  /**
   * Changes the tree to the specified code.
   * Used by App when a user clicks on the explore button from a code in a ListViewer
   * @param {*} code string ie 'A000'
   */
  async changeTree(code) {
    if (code[code.length - 1] === "-") {
      code = code.slice(0, -1);
    }

    // Transitions the current tree out
    d3.select("div." + this.treeClass)
      .transition()
      .duration(0.5 * this.duration)
      .style("opacity", 1e-6);

    await this.sleep(0.5 * this.duration); // Wait for current to disappear
    // Transition new tree in
    this.getDataFromAPI(code).then(() => {
      this.drawInitialTree();
      d3.select("div." + this.treeClass)
        .transition()
        .duration(0.5 * this.duration)
        .style("opacity", 1);
    });
  }

  drawInitialTree() {
    // Remove any existing tree svg
    d3.select("div." + this.treeClass)
      .select("svg")
      .remove();

    // Create the svg to draw the tree
    this.svg = d3
      .select("div." + this.treeClass)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.addChain(); // Adds the ancestry chain at the bottom

    this.addInfoText(); // Adds the info text
    // Creating g elements here in a specified order to set what is drawn on top
    this.linkG = this.svg.append("g").attr("class", "pathG");
    this.rightG = this.svg.append("g").attr("class", "rightG");
    this.middleG = this.svg.append("g").attr("class", "middleG");
    this.leftG = this.svg.append("g").attr("class", "leftG");

    //////////// PARENT NODE ///////////////
    ////////////////////////////////////////
    if (this.data.parent) {
      // Can only draw the parent node if the self node has a parent
      let parentg = this.leftG // Attach parent g to the left g
        .append("g")
        .attr("transform", () => {
          return "translate(" + this.leftPadding + "," + this.height / 2 + ")";
        })
        .attr("class", "parentG");
      parentg
        .on("mouseover", (d, i) => {
          // Set info text
          this.setInfoText(0, 0);
        })
        .on("mouseout", () => {
          // Clear info text
          this.clearInfoText();
        })
        .on("click", (d, i) => {
          // if double click timer is active, this click is the double click
          if (this.dblclick_timer) {
            clearTimeout(this.dblclick_timer);
            this.dblclick_timer = false;
            this.props.addSelectedCode(this.data.parent);
          }
          // otherwise, what to do after single click (double click has timed out)
          else {
            this.dblclick_timer = setTimeout(() => {
              this.dblclick_timer = false;
              this.handleParentClick(d, i); // Handles the parent click
            }, 300);
          }
        });

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

      // Add parent circle to the parent g
      parentg
        .append("circle")
        .attr("r", this.cRadius)
        .attr("fill", this.otherColor)
        .attr("class", "parentCircle");
    }
    ////////////////////////////////////////
    ////////////////////////////////////////

    //////////// SIBLING NODES ////////////
    ///////////////////////////////////////
    this.selfIndex = 0; // Initialize selfIndex to 0
    this.findIndex(); // Find index of self node
    this.calcSiblingHeights(); // Calculate heights of sibling circles
    this.calcSiblingColours(); // Calculate colours of sibling circles (self index is different then the rest)

    // Attach sibling g to the middle g
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
      .on("click", (d, i) => {
        // if double click timer is active, this click is the double click
        if (this.dblclick_timer) {
          clearTimeout(this.dblclick_timer);
          this.dblclick_timer = false;
          this.props.addSelectedCode(this.data.siblings[i]);
        }
        // otherwise, what to do after single click (double click has timed out)
        else {
          this.dblclick_timer = setTimeout(() => {
            this.dblclick_timer = false;
            this.handleSiblingClick(d, i);
          }, 300);
        }
      })
      .attr("class", "siblingG");

    // Attach the text for each sibling
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

    // Attach the circles for each sibling
    siblingGs
      .data(this.siblingColours)
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", d => {
        return d;
      })
      .attr("class", "siblingCircle");

    ////////////////////////////////////////
    ////////////////////////////////////////

    //////////// CHILDREN NODES ////////////
    ////////////////////////////////////////
    this.calcChildrenHeights(); // Calculate the height of the children

    // Attach children g to the right g
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
      .on("click", (d, i) => {
        // if double click timer is active, this click is the double click
        if (this.dblclick_timer) {
          clearTimeout(this.dblclick_timer);
          this.dblclick_timer = false;
          this.props.addSelectedCode(this.data.children[i]);
        }
        // otherwise, what to do after single click (double click has timed out)
        else {
          this.dblclick_timer = setTimeout(() => {
            this.dblclick_timer = false;
            this.handleChildrenClick(d, i);
          }, 300);
        }
      })
      .attr("class", "childrenG");

    // Attach the text for each child
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

    // Attach the circles for each child
    childrenGs
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", this.otherColor)
      .attr("class", "childrenCircle");

    ////////////////////////////////////////
    ////////////////////////////////////////

    // LINKS //////////////////////////////
    ///////////////////////////////////////
    // If there is a parent, need to draw links from parent to self and siblings
    if (this.data.parent) {
      this.createParentLinks(); // Creates the parent links
      // Attachs the created parent links
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

    this.createChildrenLinks(); // Creates the children links
    // Attachs the created children links
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
    ////////////////////////////////////////
    ////////////////////////////////////////

    this.createButton(); // Creates the "Add Code" button
  }
  // END OF DRAW INITIAL TREE /////////////////
  /////////////////////////////////////////////

  // HANDLE CLICKS ////////////////////////////
  /////////////////////////////////////////////

  // Handles the user clicking on the parent node
  handleParentClick() {
    // Checks to ensure that it isn't already handling a click
    if (!this.handlingClick) {
      this.handlingClick = true; // Sets handling click to true
      this.prevAncestors = this.ancestors; // Saves current ancestors in another variable
      this.getDataFromAPI(this.data.parent.code) // Gets data for parent node
        .then(() => this.getAncestorsFromAPI(this.data.self.code)) // Gets new ancestors
        .then(async () => {
          this.removeChildren(); // Removes children
          this.moveSiblingsToChildren(); // Transitions the siblings to children spots
          this.moveParentToSibling(); // Moves the parent to sibling spot
          this.transitionParentLinks(); // Transitions the links
          await this.sleep(this.duration);
          this.parentChain(); // Handles the chain
          await this.sleep(this.duration);
          this.spawnParentAndSiblings(); // Spawns parents and siblings from the new self (previously parent) node
          // Removes old g's
          this.svg.selectAll("g.oldChainG").remove();
          this.svg.selectAll("g.oldChildren").remove();
          await this.sleep(this.duration);
          this.svg.selectAll("g.oldParentG").remove();
          this.svg.selectAll("g.tempG").remove();
        })
        .then(() => {
          this.handlingClick = false; // Sets handling click to false to enable clicking on a node again
        });
    }
  }

  // Handles the parent clicking on a sibling node
  handleSiblingClick(d, i) {
    // Checks to ensure that it isn't already handling a click
    if (!this.handlingClick) {
      this.handlingClick = true; // Sets handling click to true
      this.getDataFromAPI(this.data.siblings[i].code) // Gets data from API for clicked sibling
        .then(async () => {
          // No need to do anything if they clicked on the already selected circle
          if (i !== this.selfIndex) {
            this.removeChildren(); // Remove the children
            this.findIndex(); // Find the self index
            this.calcSiblingColours(); // Calculate the colours (self node different)
            // Transition to the new colours
            this.svg
              .selectAll("circle.siblingCircle")
              .data(this.siblingColours)
              .transition()
              .duration(this.duration)
              .attr("fill", d => {
                return d;
              });
            this.svg
              .selectAll("text.siblingText")
              .data(this.data.siblings)
              .transition()
              .duration(this.duration)
              .text(d => this.codeFormat(d, 1))
              .attr("y", 0.3 * this.textSize)
              .attr("x", 1.5 * this.cRadius)
              .attr("class", "siblingText")
              .style("text-anchor", "right");
            this.changeSelfAncestor(); // Changes the self node on the ancestor chain
            await this.sleep(this.duration);
            this.spawnChildren(); // Creates children for the new self
          }
        })
        .then(() => {
          this.handlingClick = false; // Sets handling click to false to enable clicking on a node again
        });
    }
  }

  // Handles the user clicking on a child node
  handleChildrenClick(d, i) {
    // Checks to ensure that it isn't already handling a click
    if (!this.handlingClick) {
      this.handlingClick = true; // Sets handling click to true
      this.prevAncestors = this.ancestors; // Saves current ancestors in another variable
      this.getDataFromAPI(this.data.children[i].code) // Gets data for the clicked child
        .then(() => this.getAncestorsFromAPI(this.data.self.code)) // Gets ancestor data
        .then(async () => {
          this.createNewParent(); // Creates new parent
          this.removeParentAndSiblings(); // Transitions parent and siblings to the current self
          await this.sleep(this.duration);
          // Removes old elements
          this.linkG.selectAll("path.parentLink").remove();
          this.svg.selectAll("g.siblingG").remove();
          this.svg.selectAll("g.oldParentG").remove();
          this.moveSelfToParent(); // Moves the old self to the parent spot
          this.moveChildrenToSiblings(); // Move children to siblings
          this.transitionChildrenLinks(); // Transition the links
          this.childrenChain(); // Handles the chain
          await this.sleep(this.duration);
          this.spawnChildren(); // Spawns children for the new selected node
        })
        .then(() => {
          this.handlingClick = false; // Sets handling click to false to enable clicking on a node again
        });
    }
  }

  // Redraws the tree if one of the ancestor circles is clicked
  handleChainClick(d, i) {
    // Only change if the circle clicked isn't self
    if (this.ancestors[i].code !== this.data.self.code) {
      this.changeTree(this.ancestors[i].code);
    }
  }

  // END OF HANDLE CLICKS //////////////////////
  //////////////////////////////////////////////

  // Creates the "Add Code" button
  createButton() {
    // Creating g for the button rectangles and text
    let buttonG = this.svg
      .append("g")
      .attr("transform", d => {
        return "translate(" + (this.width - 0.75 * this.rightPadding) + "," + (this.height - 0.7 * this.vPadding) + ")";
      })
      .attr("class", "buttonG")
      .on("click", () => {
        this.props.addSelectedCode(this.data.self);
      });

    // Create rectangle for colour
    buttonG
      .append("rect")
      .attr("width", this.buttonWidth)
      .attr("height", this.buttonHeight)
      .attr("fill", "lightgrey")
      .attr("class", "buttonRect")
      .attr("rx", this.cRadius)
      .attr("ry", this.cRadius);

    // Create text on the button
    buttonG
      .append("text")
      .text("Add Code")
      .attr("font-family", this.fontType)
      .attr("font-weight", "bold")
      .attr("font-size", this.textSize)
      .attr("fill", this.textColor)
      .attr("y", this.buttonHeight / 1.5)
      .attr("x", this.buttonWidth / 2)
      .attr("class", "buttonText")
      .style("text-anchor", "middle");

    // Create a new rectangle for flashing effect when clicked
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
      })
      .attr("rx", this.cRadius)
      .attr("ry", this.cRadius);
  }

  // Transitions chain when a parent is clicked
  async parentChain() {
    // Removing old elements
    this.svg.selectAll("g.chainG").attr("class", "oldChainG");
    this.svg.selectAll("text.chainText").attr("class", "oldChainText");
    this.svg.selectAll("circle.chainCircle").attr("class", "oldChainCircle");
    this.svg.selectAll("path.chainLink").attr("class", "oldChainLink");

    // Create all nodes except for the last in the same position
    //////////////////////////////////////////////////
    this.chainPositions.shift();
    // Creating svgs for chain circles/text
    let chainGs = this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .enter()
      .append("g")
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      })
      .attr("class", "chainG")
      .on("click", (d, i) => {
        this.handleChainClick(d, i);
      })
      .on("mouseover", (d, i) => {
        this.setInfoTextChain(i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      });

    // Adding text to the g's
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

    // Calculating ancestor colours (last is self colour)
    this.calcAncestorColours();

    // Adding circles
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
      .attr("class", "chainCircle");

    this.calcChainSpacing(); // Calculating spacing
    this.addChainLinks(); // Adds the links
    // Transition the new circles/text to new position
    this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .transition()
      .duration(this.duration)
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      });
    // Fade the old text out
    this.svg
      .selectAll("text.oldChainText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1e-6);

    // Fade the old circles out
    this.svg
      .selectAll("circle.oldChainCircle")
      .transition()
      .duration(this.duration)
      .attr("r", 1e-6);

    if (this.ancestors.length > 1) {
      // Creating temp g to add new self node
      let tempG = this.svg
        .append("g")
        .attr("transform", () => {
          return "translate(" + this.chainPositions[0] + "," + (this.height - this.vPadding / 2) + ")";
        })
        .attr("class", "tempG");

      // Adding circle
      tempG
        .append("circle")
        .attr("r", this.cRadius)
        .attr("fill", this.selectedColor)
        .attr("class", "TempCircle");

      // Adding text
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

      // Fading out the tempText
      this.svg
        .selectAll("text.TempText")
        .transition()
        .duration(this.duration)
        .style("fill-opacity", 1e-6);

      // Fading out the tempCircle
      this.svg
        .selectAll("circle.TempCircle")
        .transition()
        .duration(this.duration)
        .attr("r", 1e-6);
      this.svg.selectAll("g.oldChainG").remove(); // Removing old g
    } else {
      // If lenght of ancestors == 1
      this.ancestorLinks = [];
      // Creating new ancestor links
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

      // Appending the links to the chain on the same spots as they were
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

      // Transition the newly created links to the correct positions
      this.svg
        .selectAll("path.chainLink")
        .data(this.ancestorLinks)
        .transition()
        .duration(this.duration)
        .attr("d", d => this.link(d));

      // Adding svg for selected code
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

      // Transition the selected one to the new position
      tempG
        .transition()
        .duration(this.duration)
        .attr("transform", () => {
          return "translate(" + this.leftPadding + "," + (this.height - this.vPadding / 2) + ")";
        });

      // Fading out the text
      this.svg
        .selectAll("text.TempText")
        .transition()
        .duration(this.duration)
        .style("fill-opacity", 1e-6);

      // Fading out the circle
      this.svg
        .selectAll("circle.TempCircle")
        .transition()
        .duration(this.duration)
        .attr("r", 1e-6);
      this.svg.selectAll("g.oldChainG").remove(); // Removing old g
    }
  }

  // Handles the chain when a child is selected
  childrenChain() {
    // Sets all current chain elements to old
    this.svg.selectAll("g.chainG").attr("class", "oldChainG");
    this.svg.selectAll("text.chainText").attr("class", "oldChainText");
    this.svg.selectAll("circle.chainCircle").attr("class", "oldChainCircle");
    this.svg.selectAll("path.chainLink").attr("class", "oldChainLink");

    // Create new on same spots, last one invisible at end
    this.chainPositions.unshift(this.chainPositions[0]);
    // Creating new chain g
    let chainGs = this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .enter()
      .append("g")
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      })
      .on("click", (d, i) => {
        this.handleChainClick(d, i);
      })
      .on("mouseover", (d, i) => {
        this.setInfoTextChain(i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .attr("class", "chainG");
    // Adding text
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
          // Invisible text for last one
          return 1e-6;
        } else {
          return 1;
        }
      })
      .style("text-anchor", "middle");
    this.calcAncestorColours(); // Calculate chain colours
    // Adding circles on top of other ones
    chainGs
      .data(this.ancestorColours)
      .append("circle")
      .attr("r", i => {
        if (i === 0) {
          return 1e-6; // Last one is invisible again
        } else {
          return this.cRadius;
        }
      })
      .attr("fill", d => d)
      .attr("class", "chainCircle");

    // Remove old (no transition necessary)
    this.svg.selectAll("g.oldChainG").remove();
    // Transition new to new spots
    this.calcChainSpacing();
    this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .transition()
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      })
      .duration(this.duration);

    // Transition invisible one in
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

    // Creating new links
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

      // Transitioning new links
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

      // Link for the last circle (first in array)
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

      // Transition
      this.svg
        .selectAll("path.chainLink")
        .data(this.ancestorLinks)
        .transition()
        .duration(this.duration)
        .attr("d", d => this.link(d));
    }
  }

  // If a sibling is clicked, the ancestry chain remains the same, except for the selected code
  changeSelfAncestor() {
    // Changing elements to old
    this.svg.selectAll("g.chainG").attr("class", "oldChainG");
    this.svg.selectAll("text.chainText").attr("class", "oldChainText");

    // Creating new g's
    let chainGs = this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .enter()
      .append("g")
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      })
      .on("click", (d, i) => {
        this.handleChainClick(d, i);
      })
      .on("mouseover", (d, i) => {
        this.setInfoTextChain(i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .attr("class", "chainG");

    // Adding text
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
          return 1e-6; // new one is invisible to start
        } else {
          return 1;
        }
      })
      .style("text-anchor", "middle");

    // Adding circles
    chainGs
      .data(this.ancestorColours)
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", d => {
        return d;
      })
      .attr("class", "chainCircle");

    // Fading out old text
    this.svg
      .selectAll("text.oldChainText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1e-6);

    // Fading in next text
    this.svg
      .selectAll("text.chainText")
      .transition()
      .duration(this.duration)
      .delay(this.duration)
      .style("fill-opacity", 1);

    this.svg.selectAll("g.oldChainG").remove(); // Removing old g
  }

  // Adds the ancestry chain at the bottom
  addChain() {
    this.getAncestorsFromAPI(this.data.self.code).then(() => {
      // Gets ancestors from API
      this.numCircles = this.ancestors.length; // Determines the number of circles
      this.calcChainSpacing(); // Caclulates circle spacing
      this.addChainGs(); // Adds "g" elements and circles for the chain
      this.addChainLinks(); // Adds the chain links
    });
  }

  // Adds chain links
  addChainLinks() {
    this.ancestorLinks = []; // Sets list to empty
    // Adds the links to the list
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

    // Adds the paths to the "g"
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

    // Removes old chain links
    this.svg.selectAll("path.oldChainLink").remove();
  }

  // Calculates the locations of the ancestry chain circles
  calcChainSpacing() {
    const totalSpace = this.width - this.leftPadding - this.rightPadding; // Calculates total available space
    this.chainPositions = []; // Initalizes to empty list
    let gap = 0; // Initialize before so it can be used later
    if (this.ancestors.length > 1) {
      // If only 1 circle in ancestors, gap remains 0 and circle is made at the very left
      gap = totalSpace / (this.ancestors.length - 1);
    }
    for (let i = 0; i < this.ancestors.length; i++) {
      this.chainPositions.push(i * gap + this.leftPadding);
    }
    this.chainPositions.reverse();
  }

  // Adds chain g's
  addChainGs() {
    // Creates the g's
    let chainGs = this.svg
      .selectAll("g.chainG")
      .data(this.chainPositions)
      .enter()
      .append("g")
      .attr("transform", d => {
        return "translate(" + d + "," + (this.height - this.vPadding / 2) + ")";
      })
      .on("click", (d, i) => {
        this.handleChainClick(d, i);
      })
      .on("mouseover", (d, i) => {
        this.setInfoTextChain(i);
      })
      .on("mouseout", () => {
        this.clearInfoText();
      })
      .attr("class", "chainG");

    // Adds text
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
    // Adds circles
    chainGs
      .data(this.ancestorColours)
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", d => {
        return d;
      })
      .attr("class", "chainCircle");
  }

  // Calculates the colour of the ancestor chain
  // Self node (last on chain, first in array) is different than the last
  calcAncestorColours() {
    this.ancestorColours = [];
    this.ancestorColours.push(this.selectedColor);
    for (let i = 0; i < this.ancestors.length - 1; i++) {
      this.ancestorColours.push(this.otherColor);
    }
  }

  // Gets the ancestors from API
  // Parameter: code to get ancestors for
  // Puts the array of ancestors into a member variable
  getAncestorsFromAPI = code => {
    const url = APIUtility.API.getAPIURL(APIUtility.ANCESTORS) + code + "/?format=json";
    return fetch(url)
      .then(response => response.json())
      .then(parsedJson => {
        this.ancestors = parsedJson;
      });
  };

  // Creates new parent circle/text
  createNewParent() {
    // Set current parent elements to old
    this.svg.selectAll("g.parentG").attr("class", "oldParentG");
    this.svg.selectAll("circle.parentCircle").attr("class", "oldParentCircle");
    this.svg.selectAll("text.parentText").attr("class", "oldParentText");
    // Make new parent circle on top of current self
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
      .on("click", (d, i) => {
        // if double click timer is active, this click is the double click
        if (this.dblclick_timer) {
          clearTimeout(this.dblclick_timer);
          this.dblclick_timer = false;
          this.props.addSelectedCode(this.data.parent);
        }
        // otherwise, what to do after single click (double click has timed out)
        else {
          this.dblclick_timer = setTimeout(() => {
            this.dblclick_timer = false;
            this.handleParentClick(d, i);
          }, 300);
        }
      })
      .attr("class", "parentG");
    // Adding text
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
    // Adding circle
    parentg
      .append("circle")
      .attr("r", this.cRadius)
      .attr("fill", this.selectedColor)
      .attr("class", "parentCircle");
  }

  // Transitions the parent and siblings to self node and removes them
  removeParentAndSiblings() {
    // Moving parent to self and fading out
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

    // Moving siblings to self and fading out
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

    // Creating new parent links
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
    // Transitioning links
    this.svg
      .selectAll("path.parentLink")
      .data(this.parentLinks)
      .transition()
      .duration(this.duration)
      .attr("d", d => this.link(d));
  }

  // Moving newly created parent from self position to parent position
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

  // Moving the children to sibling spots
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

    // Calculating colours to colour new self node
    this.calcSiblingColours();
    // Transitioning circles to sibling spots and giving new class
    this.svg
      .selectAll("circle.childrenCircle")
      .data(this.siblingColours)
      .attr("class", "siblingCircle")
      .on("click", (d, i) => {
        // if double click timer is active, this click is the double click
        if (this.dblclick_timer) {
          clearTimeout(this.dblclick_timer);
          this.dblclick_timer = false;
          this.props.addSelectedCode(this.data.siblings[i]);
        }
        // otherwise, what to do after single click (double click has timed out)
        else {
          this.dblclick_timer = setTimeout(() => {
            this.dblclick_timer = false;
            this.handleSiblingClick(d, i);
          }, 300);
        }
      })
      .transition()
      .duration(this.duration)
      .attr("fill", d => {
        return d;
      });

    // Transitioning text to sibling text
    this.svg
      .selectAll("text.childrenText")
      .data(this.data.siblings)
      .transition()
      .duration(this.duration)
      .text(d => this.codeFormat(d, 1))
      .attr("y", 0.3 * this.textSize)
      .attr("x", 1.5 * this.cRadius)
      .attr("class", "siblingText")
      .style("text-anchor", "right");
  }

  // Transition the links when a child is clicked
  transitionChildrenLinks() {
    this.childrenLinks = [];
    this.calcSiblingHeights();
    // Creating links
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
    // Transitioning links to new positions
    this.svg
      .selectAll("path.childrenLink")
      .data(this.childrenLinks)
      .transition()
      .duration(this.duration)
      .attr("d", d => this.link(d))
      .attr("class", "parentLink");
  }

  // Spawning children from new self node
  spawnChildren() {
    this.calcChildrenHeights(); // Getting children heights
    // Adding children g's to attach circles and text
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
      })
      .on("click", (d, i) => {
        // if double click timer is active, this click is the double click
        if (this.dblclick_timer) {
          clearTimeout(this.dblclick_timer);
          this.dblclick_timer = false;
          this.props.addSelectedCode(this.data.children[i]);
        }
        // otherwise, what to do after single click (double click has timed out)
        else {
          this.dblclick_timer = setTimeout(() => {
            this.dblclick_timer = false;
            this.handleChildrenClick(d, i);
          }, 300);
        }
      });

    // Adding invisible text, to transition in later
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

    // Adding invisible circles, to transition in later
    childrenGs
      .data(this.childrenHeights)
      .append("circle")
      .attr("r", 1e-6)
      .attr("fill", this.otherColor)
      .attr("class", "childrenCircle");

    // Transition g to the current positions
    this.svg
      .selectAll("g.childrenG")
      .data(this.childrenHeights)
      .transition()
      .duration(this.duration)
      .attr("transform", d => {
        return "translate(" + (this.width - this.rightPadding) + "," + d + ")";
      });
    // Fade text in
    childrenGs
      .selectAll("text.childrenText")
      .transition()
      .duration(this.duration)
      .style("fill-opacity", 1);
    // Fade circles in
    this.svg
      .selectAll("circle.childrenCircle")
      .transition()
      .duration(this.duration)
      .attr("r", this.cRadius);

    // Creating new children links
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

    // Appending links
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
    // Transitioning links
    this.svg
      .selectAll("path.childrenLink")
      .data(this.childrenLinks)
      .transition()
      .duration(this.duration)
      .attr("d", d => this.link(d));
  }

  // Moves the siblings to children positions (on handle parent click)
  moveSiblingsToChildren() {
    // Change sibling g's to children g's and transition
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

    // Adds children class and colours self as the non-selected colour
    this.svg
      .selectAll("circle.siblingCircle")
      .attr("class", "childrenCircle")
      .on("click", (d, i) => {
        // if double click timer is active, this click is the double click
        if (this.dblclick_timer) {
          clearTimeout(this.dblclick_timer);
          this.dblclick_timer = false;
          this.props.addSelectedCode(this.data.children[i]);
        }
        // otherwise, what to do after single click (double click has timed out)
        else {
          this.dblclick_timer = setTimeout(() => {
            this.dblclick_timer = false;
            this.handleChildrenClick(d, i);
          }, 300);
        }
      })
      .transition()
      .duration(this.duration)
      .attr("fill", this.otherColor);

    // Changes class of text
    this.svg
      .selectAll("text.siblingText")
      .data(this.data.children)
      .transition()
      .duration(this.duration)
      .delay(this.duration)
      .text(d => this.codeFormat(d, 1))
      .attr("y", 0.3 * this.textSize)
      .attr("x", 1.5 * this.cRadius)
      .attr("class", "childrenText")
      .style("text-anchor", "right");
  }

  // Moves the parent to the sibling spot
  moveParentToSibling() {
    // Calculates heights and finds index and colours appropriately
    this.calcSiblingHeights();
    this.findIndex();
    this.calcSiblingColours();
    // Transition the parent g to self spot
    this.svg
      .selectAll("g.parentG")
      .transition()
      .duration(this.duration)
      .delay(this.duration)
      .attr("transform", d => {
        return "translate(" + this.middle + "," + this.siblingHeights[this.selfIndex] + ")";
      })
      .attr("class", "oldParentG");

    // Transitions circle
    this.svg
      .selectAll("circle.parentCircle")
      .transition()
      .duration(this.duration)
      .attr("class", "siblingCircle")
      .attr("fill", this.selectedColor);

    this.svg.selectAll("circle.siblingCircle").on("click", (d, i) => {
      // if double click timer is active, this click is the double click
      if (this.dblclick_timer) {
        clearTimeout(this.dblclick_timer);
        this.dblclick_timer = false;
        this.props.addSelectedCode(this.data.siblings[i]);
      }
      // otherwise, what to do after single click (double click has timed out)
      else {
        this.dblclick_timer = setTimeout(() => {
          this.dblclick_timer = false;
          this.handleSiblingClick(d, i);
        }, 300);
      }
    });
    this.svg.selectAll("g.oldParentG").remove(); // Removes old parent g because sibling g is created
  }

  // Spawns the parent and siblings
  spawnParentAndSiblings() {
    // Creating invisible parent at self
    if (this.data.parent) {
      // Creating parent g
      let parentG = this.svg
        .append("g")
        .on("mouseover", (d, i) => {
          this.setInfoText(0, 0);
        })
        .on("mouseout", () => {
          this.clearInfoText();
        })
        .on("click", (d, i) => {
          // if double click timer is active, this click is the double click
          if (this.dblclick_timer) {
            clearTimeout(this.dblclick_timer);
            this.dblclick_timer = false;
            this.props.addSelectedCode(this.data.parent);
          }
          // otherwise, what to do after single click (double click has timed out)
          else {
            this.dblclick_timer = setTimeout(() => {
              this.dblclick_timer = false;
              this.handleParentClick(d, i);
            }, 300);
          }
        })
        .attr("class", "parentG")
        .attr("transform", d => {
          return "translate(" + this.middle + "," + this.siblingHeights[this.selfIndex] + ")";
        });

      // Adding invisible text
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
      // Adding invisible circle
      parentG
        .append("circle")
        .attr("r", 1e-6)
        .attr("fill", this.otherColor)
        .attr("class", "parentCircle");

      // Transition new parent
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

      // Create links
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

      // Add the links
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

      // Transition the link
      this.svg
        .selectAll("path.parentLink")
        .data(this.parentLinks)
        .transition()
        .duration(this.duration)
        .attr("d", d => this.link(d));
    }

    // Create invisible siblings at self
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
      .on("click", (d, i) => {
        // if double click timer is active, this click is the double click
        if (this.dblclick_timer) {
          clearTimeout(this.dblclick_timer);
          this.dblclick_timer = false;
          this.props.addSelectedCode(this.data.siblings[i]);
        }
        // otherwise, what to do after single click (double click has timed out)
        else {
          this.dblclick_timer = setTimeout(() => {
            this.dblclick_timer = false;
            this.handleSiblingClick(d, i);
          }, 300);
        }
      })
      .attr("class", "siblingG")
      .attr("transform", d => {
        return "translate(" + this.middle + "," + this.siblingHeights[this.selfIndex] + ")";
      });
    // Add invisible text
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

    // Add invisible circles
    this.calcSiblingColours();
    siblingG
      .data(this.siblingColours)
      .append("circle")
      .attr("r", 1e-6)
      .attr("fill", d => {
        return d;
      })
      .attr("class", "siblingCircle");

    // Transition new siblings
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

  // Removes children nodes by transitioning them to self and invisible
  async removeChildren() {
    // Transition children g to self and fade elements
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
    // Remove children links
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

  // Sleep, used to wait between transitions
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Creates parent links
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

  // Formats the code and description to display as much as possible in the given space
  // Truncates if not enough room for the whole thing, adds "..." to the end if truncated
  codeFormat = (d, truncFlag) => {
    let room; // Total room available, initialized
    // If the code is a sibling
    if (this.data.siblings.includes(d)) {
      // If the sibling has no children, it has more room to use
      if (this.data.children.length > 0) {
        room = this.width - this.rightPadding - this.middle - 3 * this.cRadius;
      } else {
        room = this.width - this.middle - 3 * this.cRadius;
      }
    } // If the code is a child
    else if (this.data.children.includes(d)) {
      room = this.rightPadding - 3 * this.cRadius;
    } // If the code is the parent
    else if (this.data.parent === d) {
      room = this.middle - this.leftPadding - 3 * this.cRadius;
    }

    // Appending description to the code
    let codeDesc;
    if (d.description) {
      codeDesc = d.code + ": " + d.description;
    } else {
      codeDesc = d.code;
    }

    // Truncation flag === 1, truncate code if not enough room
    if (truncFlag === 1) {
      // Making sample string off screen to check the width
      this.svg
        .append("text")
        .text(codeDesc)
        .attr("font-family", this.fontType)
        .attr("font-size", this.textSize)
        .attr("y", -999999)
        .attr("x", -999999)
        .attr("class", "truncText");

      // Getting values of the text off screen
      let values = this.svg
        .selectAll("text.truncText")
        .node()
        .getBBox();
      this.svg.selectAll("text.truncText").remove(); // Removing off screen text

      // While the text is larger than the room
      while (values.width > room) {
        // Create text off screen and check width
        this.svg
          .append("text")
          .text(codeDesc + "...")
          .attr("font-family", this.fontType)
          .attr("font-size", this.textSize)
          .attr("y", -999999)
          .attr("x", -999999)
          .attr("class", "truncText");

        // Get values
        values = this.svg
          .selectAll("text.truncText")
          .node()
          .getBBox();
        this.svg.selectAll("text.truncText").remove();
        codeDesc = codeDesc.slice(0, codeDesc.length - 1); // Slice code description to remove 1 character from the end
      }
      if (d.description) {
        if (codeDesc !== d.code + ": " + d.description) {
          codeDesc = codeDesc + "...";
        }
      }
    }
    return codeDesc;
  };

  // Creates the children links
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

  // Transitions children links to self node
  // Used for removing children nodes
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

  // Transitions the parent links to new locations
  transitionParentLinks() {
    this.parentLinks = [];
    this.calcChildrenHeights();
    // Creates new links
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
    // Transitions the links
    this.svg
      .selectAll("path.parentLink")
      .data(this.parentLinks)
      .transition()
      .duration(this.duration)
      .delay(this.duration)
      .attr("d", d => this.link(d))
      .attr("class", "childrenLink");
  }

  // Finds the index of the self node
  findIndex() {
    const numSiblings = this.data.siblings.length;
    let i = 0;
    for (i = 0; i < numSiblings; i++) {
      if (this.data.self.code === this.data.siblings[i].code) {
        this.selfIndex = i;
      }
    }
  }

  // Calculates the height of the sibling nodes
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

  // Calculates the height of the children nodes
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

  // Calculates the colours of the sibling nodes (all the same except self)
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

  // Gets the data from API for the specified code and stores it in a member variable
  getDataFromAPI = code => {
    const url = APIUtility.API.getAPIURL(APIUtility.FAMILY) + code + "/?format=json";
    return fetch(url)
      .then(response => response.json())
      .then(parsedJson => {
        this.data = parsedJson;
      });
  };

  // Renders the tree
  render() {
    return <div id={"tree" + this.props.id} className={this.treeClass} />;
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addSelectedCode: codeObjectToAdd => dispatch(actions.addSelectedCodeObjectAndUpdateRecommendations(codeObjectToAdd))
  };
};

const mapStateToProps = state => {
  return {
    codeToDisplay: state.tree.selectedCodeInTree
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true }
)(TreeViewer);
