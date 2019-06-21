import React, { useState } from "react";
import MenuBar from "../../Components/MenuBar/MenuBar";
import { WidthProvider, Responsive } from "react-grid-layout";
import ChordDiagram from "../ChordDiagram/ChordDiagram";
import BarChart from "../BarChart/BarChart";
import SankeyDiagram from "../SankeyDiagram/SankeyDiagram";
import "./Visualization.css";

const defaultLayoutLg = [
  { w: 6, h: 17, x: 0, y: 0, i: "0" },
  { w: 6, h: 17, x: 6, y: 0, i: "1" },
  { w: 4, h: 18, x: 0, y: 17, i: "2" }
];
const defaultLayoutMd = [
  { w: 6, h: 17, x: 0, y: 0, i: "0" },
  { w: 6, h: 15, x: 0, y: 17, i: "1" },
  { w: 4, h: 17, x: 6, y: 0, i: "2" }
];
const defaultLayoutSm = [
  { w: 4, h: 14, x: 0, y: 0, i: "0" },
  { w: 4, h: 16, x: 0, y: 14, i: "1" },
  { w: 2, h: 14, x: 4, y: 0, i: "2" }
];
const defaultLayoutXs = [
  { w: 4, h: 14, x: 0, y: 0, i: "0" },
  { w: 4, h: 15, x: 0, y: 14, i: "1" },
  { w: 4, h: 8, x: 0, y: 29, i: "2" }
];
const defaultLayoutXxs = [
  { w: 2, h: 12, x: 0, y: 19, i: "0" },
  { w: 2, h: 9, x: 0, y: 2, i: "1" },
  { w: 2, h: 8, x: 0, y: 11, i: "2" }
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
