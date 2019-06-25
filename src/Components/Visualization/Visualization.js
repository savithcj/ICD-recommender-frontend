import React, { useState } from "react";
import MenuBar from "../../Components/MenuBar/MenuBar";
import { WidthProvider, Responsive } from "react-grid-layout";
import ChordDiagram from "../ChordDiagram/ChordDiagram";
import BarChart from "../BarChart/BarChart";
import SankeyDiagram from "../SankeyDiagram/SankeyDiagram";
import RulesTable from "../RulesTable/RulesTable";
import "./Visualization.css";

const defaultLayoutLg = [
  { w: 7, h: 16, x: 0, y: 0, i: "0" },
  { w: 5, h: 16, x: 7, y: 0, i: "1" },
  { w: 7, h: 13, x: 0, y: 16, i: "2" },
  { w: 5, h: 13, x: 7, y: 16, i: "3" }
];
const defaultLayoutMd = [
  { w: 5, h: 15, x: 0, y: 0, i: "0" },
  { w: 5, h: 15, x: 5, y: 0, i: "1" },
  { w: 5, h: 17, x: 0, y: 15, i: "2" },
  { w: 5, h: 17, x: 5, y: 15, i: "3" }
];
const defaultLayoutSm = [
  { w: 6, h: 14, x: 0, y: 0, i: "0" },
  { w: 6, h: 16, x: 0, y: 14, i: "1" },
  { w: 6, h: 13, x: 0, y: 30, i: "2" },
  { w: 6, h: 18, x: 0, y: 43, i: "3" }
];
const defaultLayoutXs = [
  { w: 4, h: 14, x: 0, y: 0, i: "0" },
  { w: 4, h: 15, x: 0, y: 14, i: "1" },
  { w: 4, h: 8, x: 0, y: 29, i: "2" },
  { w: 4, h: 14, x: 0, y: 37, i: "3" }
];
const defaultLayoutXxs = [
  { w: 2, h: 12, x: 0, y: 0, i: "0" },
  { w: 2, h: 9, x: 0, y: 12, i: "1" },
  { w: 2, h: 12, x: 0, y: 21, i: "2" },
  { w: 2, h: 13, x: 0, y: 33, i: "3" }
];

const defaultLayouts = {
  lg: defaultLayoutLg,
  md: defaultLayoutMd,
  sm: defaultLayoutSm,
  xs: defaultLayoutXs,
  xxs: defaultLayoutXxs
};

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || defaultLayouts;
const chordDiagramDiv = React.createRef();
const barChartDiv = React.createRef();
const SankeyDiagramDiv = React.createRef();

function Visualization(props) {
  const [layouts, setLayouts] = useState(JSON.parse(JSON.stringify(originalLayouts)));
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);

  const resetLayout = () => {
    setLayouts(defaultLayouts);
  };

  function handleLayoutModifierButton() {
    const layoutModifiable = !isLayoutModifiable;
    setLayoutModifiable(layoutModifiable);
  }

  async function onLayoutChange(layouts) {
    await saveToLS("layouts", layouts);
    setLayouts(layouts);
    chordDiagramDiv.current.handleResize();
    barChartDiv.current.handleResize();
    SankeyDiagramDiv.current.handleResize();
    console.log(layouts);
  }

  const shakeDiv = isLayoutModifiable ? "shake" : "";
  const highlightEditDiv = isLayoutModifiable ? "grid-border edit-border" : "grid-border";

  return (
    <div>
      <div>
        <MenuBar
          title="Visualization Page"
          firstLinkName="Home"
          firstLinkRoute="/"
          secondLinkName="Admin"
          secondLinkRoute="/admin"
          handleLayoutConfirm={() => handleLayoutModifierButton()}
          handleResetLayout={resetLayout}
          inModifyMode={isLayoutModifiable}
        />
      </div>
      <div className={shakeDiv}>
        <ResponsiveReactGridLayout
          rowHeight={30}
          layouts={layouts}
          draggableCancel="input,textarea"
          isDraggable={isLayoutModifiable}
          isResizable={isLayoutModifiable}
          onLayoutChange={(layout, layouts) => onLayoutChange(layouts)}
        >
          <div key="0" className={highlightEditDiv}>
            <ChordDiagram id="101" ref={chordDiagramDiv} />{" "}
          </div>
          <div key="1" className={highlightEditDiv}>
            <SankeyDiagram id="100" ref={SankeyDiagramDiv} />{" "}
          </div>

          <div key="2" id="barDiv" className={highlightEditDiv}>
            <RulesTable />{" "}
          </div>
          <div key="3" id="barDiv" className={highlightEditDiv}>
            <BarChart id="100" ref={barChartDiv} />{" "}
          </div>
        </ResponsiveReactGridLayout>
      </div>
    </div>
  );
}

function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem("rgl-6")) || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
      "rgl-6",
      JSON.stringify({
        [key]: value
      })
    );
  }
}

export default Visualization;
