import React, { Component } from "react";
import * as d3 from "d3";
import { sliderBottom } from "d3-simple-slider";
import ReactDOM from "react-dom";

import APIClass from "../../Assets/Util/API";

class SankeyDiagram extends Component {
  constructor(props) {
    super(props);
    this.fontType = "sans-serif";
    this.textColor = "black";
    this.sankeyClass = "sankeyVis" + this.props.id;
  }

  componentDidMount() {
    this.getDataFromAPI().then(() => {
      this.drawSankeyDiagram();
    });
  }

  recalculateSizes() {
    let elem = ReactDOM.findDOMNode(this).parentNode;
    this.width = elem.offsetWidth;
    this.height = elem.offsetHeight;
    let minSize = Math.min(this.width, this.height);
    this.textSize = minSize / 45;
  }

  handleResize() {
    if (this.data === undefined) {
    } else {
      this.drawSankeyDiagram();
    }
  }

  drawSankeyDiagram() {
    this.recalculateSizes();
    d3.select("div." + this.sankeyClass)
      .select("svg")
      .remove();

    this.svg = d3
      .select("div." + this.sankeyClass)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.pIndex1 = 3;
    this.pIndex2 = 8;
    this.infoText = this.addInfoText();

    let labelText1 = this.svg
      .append("text")
      .attr("x", this.width / 2)
      .text(this.orgData[this.pIndex1].pName)
      .attr("font-size", this.textSize * 1.5)
      .attr("font-family", this.fontType)
      .style("text-anchor", "middle");

    let labelText2 = this.svg
      .append("text")
      .attr("x", this.width / 2)
      .text(this.orgData[this.pIndex2].pName)
      .attr("font-size", this.textSize * 1.5)
      .attr("font-family", this.fontType)
      .style("text-anchor", "middle");

    let descText1 = this.svg
      .append("text")
      .attr("x", this.width / 2)
      .text(this.orgData[this.pIndex1].pDesc)
      .attr("font-size", this.textSize * 1)
      .attr("font-family", this.fontType)
      .style("text-anchor", "middle");

    let descText2 = this.svg
      .append("text")
      .attr("x", this.width / 2)
      .text(this.orgData[this.pIndex2].pDesc)
      .attr("font-size", this.textSize * 1)
      .attr("font-family", this.fontType)
      .style("text-anchor", "middle");

    let slider1 = sliderBottom()
      .min(1)
      .max(this.numParents)
      .ticks(this.numParents)
      .width((this.width * 3) / 4)
      .default(this.pIndex1 + 1)
      .step(1)
      .on("onchange", val => {
        this.pIndex1 = val - 1;
        labelText1.text(this.orgData[this.pIndex1].pName);
        descText1.text(this.orgData[this.pIndex1].pDesc);
        this.drawSankey(this.pIndex1, this.pIndex2);
      });

    let slider2 = sliderBottom()
      .min(1)
      .max(this.numParents)
      .ticks(this.numParents)
      .width((this.width * 3) / 4)
      .default(this.pIndex2 + 1)
      .step(1)
      .on("onchange", val => {
        this.pIndex2 = val - 1;
        labelText2.text(this.orgData[this.pIndex2].pName);
        descText2.text(this.orgData[this.pIndex2].pDesc);
        this.drawSankey(this.pIndex1, this.pIndex2);
      });

    let gSlider1 = this.svg.append("g");
    let gSlider2 = this.svg.append("g");

    gSlider1.call(slider1);
    gSlider2.call(slider2);

    let sliderHeight = Math.ceil(gSlider1.node().getBBox().height);
    let descHeight = Math.ceil(descText1.node().getBBox().height);
    let labelHeight = Math.ceil(labelText1.node().getBBox().height);
    this.curHeight = this.height - sliderHeight * 1.5;
    gSlider2.attr("transform", "translate(" + this.width / 8 + "," + this.curHeight + ")");
    this.curHeight -= descHeight;
    descText2.attr("y", this.curHeight);
    this.curHeight -= labelHeight;
    labelText2.attr("y", this.curHeight);
    this.curHeight -= sliderHeight * 1.5;
    gSlider1.attr("transform", "translate(" + this.width / 8 + "," + this.curHeight + ")");
    this.curHeight -= descHeight;
    descText1.attr("y", this.curHeight);
    this.curHeight -= labelHeight;
    labelText1.attr("y", this.curHeight);

    this.centerY = this.curHeight / 2;
    this.color1 = "#67a9cf";
    this.color2 = "#ef8a62";
    this.arcThickness = this.width / 1500;

    this.dimOpacity = 0.1;
    this.brightOpacity = 0.95;
    this.drawSankey(this.pIndex1, this.pIndex2);
  }

  addInfoText() {
    let infoG = this.svg.append("g").attr("class", "infoG");
    return infoG
      .append("text")
      .attr("y", this.height * 0.05)
      .attr("x", this.width * 0.02)
      .attr("font-family", this.fontType)
      .attr("font-size", this.textSize)
      .text("")
      .style("text-anchor", "left");
  }

  drawSankey() {
    let circleRadius = this.width / 100;
    //deep copy for same block
    let data1 = JSON.parse(JSON.stringify(this.orgData[this.pIndex1]));
    let data2 = JSON.parse(JSON.stringify(this.orgData[this.pIndex2]));
    data1["xArr"] = [];
    data2["xArr"] = [];

    let blocks = data1.blocks.concat(data2.blocks);
    let descriptions = data1.descriptions.concat(data2.descriptions);
    let maxDiameter = Math.min(this.width, this.curHeight);
    let cSpacing = maxDiameter / (blocks.length + 1);
    let circleData = [];
    let x = 0;
    if (this.width > this.curHeight) {
      x = (this.width - this.curHeight) / 2;
    }
    for (let i = 0; i < blocks.length; i++) {
      x += cSpacing;
      circleData.push({ x: x, block: blocks[i], description: descriptions[i] });
      if (i < data1.blocks.length) {
        circleData[i]["color"] = this.color1;
        data1["xArr"].push(x);
      } else {
        circleData[i]["color"] = this.color2;
        data2["xArr"].push(x);
      }
    }

    this.svg.selectAll("path.sankey").remove();
    this.svg.selectAll("path.sankeyInvis").remove();

    this.drawHalfArcs(data1, data2, this.color1, -1);
    this.drawHalfArcs(data2, data1, this.color2, 1);

    this.svg.selectAll("circle.sankey").remove();
    this.svg
      .selectAll("circle.sankey")
      .data(circleData)
      .enter()
      .append("circle")
      .style("stroke", "gray")
      .attr("class", "sankey")
      .attr("cx", d => {
        return d.x;
      })
      .attr("cy", this.centerY)
      .attr("r", circleRadius)
      .style("fill", d => {
        return d.color;
      })
      .on("mouseover", (d, i) => {
        this.dimArcs();
        this.svg.selectAll("path.sankey[originatorBlock=" + d.block + "]").style("opacity", this.brightOpacity);
        this.infoText.text(d.block + ": " + d.description);
      })
      .on("mouseout", (d, i) => {
        this.lightArcs();
        this.infoText.text("");
      });

    this.svg.selectAll("g.textSankey1").remove();
    this.svg.selectAll("g.textSankey2").remove();

    this.svg
      .selectAll("g.textSankey1")
      .data(circleData)
      .enter()
      .append("g")
      .attr("class", "textSankey1")
      .attr("transform", d => {
        return "translate(" + (d.x - circleRadius) + "," + (this.centerY + 5 * circleRadius) + ") rotate(-45)";
      })
      .append("text")
      .text(d => {
        return d.block.split("-")[0];
      })
      .attr("font-size", this.textSize)
      .style("text-anchor", "right");

    this.svg
      .selectAll("g.textSankey2")
      .data(circleData)
      .enter()
      .append("g")
      .attr("class", "textSankey2")
      .attr("transform", d => {
        return "translate(" + (d.x - circleRadius) + "," + (this.centerY - circleRadius) + ") rotate(-45)";
      })
      .append("text")
      .text(d => {
        let splitText = d.block.split("-");
        if (splitText.length > 1) {
          return splitText[1];
        } else {
          return "";
        }
      })
      .attr("font-size", this.textSize)
      .style("text-anchor", "left");
  }

  drawHalfArcs(d1, d2, color, direction) {
    for (let i = 0; i < d1.blocks.length; i++) {
      for (let j = 0; j < d2.blocks.length; j++) {
        let numRules = d1["destCounts"][i][j + d2.startIndex];
        if (numRules > 0) {
          let x1 = d1["xArr"][i];
          let x2 = d2["xArr"][j];
          let centerPoint = (x1 + x2) / 2;
          let radius = Math.abs(x2 - x1) / 2;
          let halfWidth = numRules * this.arcThickness;
          var arc = d3
            .arc()
            .innerRadius(radius - halfWidth)
            .outerRadius(radius + halfWidth)
            .startAngle(0)
            .endAngle(Math.PI);
          this.svg
            .append("path")
            .attr("class", "sankey")
            .attr("d", arc)
            .attr("fill", color)
            .attr("transform", "translate(" + centerPoint + "," + this.centerY + ") rotate (" + direction * 90 + ")")
            .attr("originatorBlock", d1.blocks[i])
            .attr("destinationBlock", d2.blocks[j])
            .attr("numRules", numRules)
            .style("opacity", this.brightOpacity);

          //invisible arcs to mouseover easier
          var invisArc = d3
            .arc()
            .innerRadius(radius - this.arcThickness * 4)
            .outerRadius(radius + this.arcThickness * 4)
            .startAngle(0)
            .endAngle(Math.PI);
          this.svg
            .append("path")
            .attr("class", "sankeyInvis")
            .attr("d", invisArc)
            .attr("fill", color)
            .attr("transform", "translate(" + centerPoint + "," + this.centerY + ") rotate (" + direction * 90 + ")")
            .style("opacity", 1e-6)
            .on("mouseover", d => {
              this.dimArcs();
              let matchStr =
                "path.sankey[originatorBlock='" + d1.blocks[i] + "'][destinationBlock='" + d2.blocks[j] + "']";
              this.svg.selectAll(matchStr).style("opacity", this.brightOpacity);
              let infoString =
                "(" +
                d1.blocks[i] +
                ") \u2192 (" +
                // ") >> (" +
                d2.blocks[j] +
                "): " +
                numRules +
                " Rules";
              this.infoText.text(infoString);
            })
            .on("mouseout", (d, i) => {
              this.lightArcs();
              this.infoText.text("");
            });
        }
      }
    }
  }

  dimArcs() {
    this.svg.selectAll("path.sankey").style("opacity", this.dimOpacity);
  }

  lightArc(originatorBlock, destinationBlock) {
    this.svg
      .selectAll("path.sankey[originatorBlock=" + originatorBlock + "][destinationBlock=" + destinationBlock + "]")
      .style("opacity", this.brightOpacity);
  }

  lightArcs() {
    this.svg.selectAll("path.sankey").style("opacity", this.brightOpacity);
  }

  getDataFromAPI = () => {
    const url = APIClass.getAPIURL("CODE_BLOCK_USAGE") + "?format=json";
    return fetch(url)
      .then(response => response.json())
      .then(parsedJson => {
        this.data = parsedJson;
        this.orgData = [];
        let parentName = "";
        let pIndex = -1;
        for (let i = 0; i < this.data.length; i++) {
          let curElem = this.data[i];
          if (parentName !== curElem.parent) {
            pIndex++;
            parentName = curElem.parent;
            this.orgData.push({
              pName: curElem.parent,
              pDesc: curElem.parent_description,
              startIndex: i,
              blocks: [],
              descriptions: [],
              destCounts: []
            });
          }
          this.orgData[pIndex]["endIndex"] = i;
          this.orgData[pIndex]["destCounts"].push(curElem.destination_counts.split(",").map(Number));
          this.orgData[pIndex]["blocks"].push(curElem.block);
          this.orgData[pIndex]["descriptions"].push(curElem.description);
        }
        this.orgData.sort((a, b) => {
          return ("" + a.pName).localeCompare(b.pName);
        });
        this.numParents = this.orgData.length;
      });
  };
  render() {
    return <div id={"sankey" + this.props.id} className={this.sankeyClass} />;
  }
}

export default SankeyDiagram;
