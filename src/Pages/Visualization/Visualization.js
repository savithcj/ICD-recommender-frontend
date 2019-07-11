import React, { useState } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import MenuBar from "../../Containers/MenuBar/MenuBar";
import ChordDiagram from "../../Containers/ChordDiagram/ChordDiagram";
// import BarChart from "../../Containers/BarChart/BarChart";
import SankeyDiagram from "../../Containers/SankeyDiagram/SankeyDiagram";
import RulesTable from "../../Containers/RulesTable/RulesTable";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { defaultLayouts } from "./layouts";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("visualLayouts", "layouts") || defaultLayouts;
const chordDiagramDiv = React.createRef();
// const barChartDiv = React.createRef();
const SankeyDiagramDiv = React.createRef();

function Visualization(props) {
  const [layouts, setLayouts] = useState(JSON.parse(JSON.stringify(originalLayouts)));
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    saveToLS("visualLayouts", "layouts", defaultLayouts);
  };

  function handleChordChange() {
    if (chordDiagramDiv.current !== null) {
      chordDiagramDiv.current.handleResize();
    }
  }

  function handleSankeyChange() {
    if (SankeyDiagramDiv.current !== null) {
      SankeyDiagramDiv.current.handleResize();
    }
  }

  function handleLayoutModifierButton() {
    const layoutModifiable = !isLayoutModifiable;
    setLayoutModifiable(layoutModifiable);
  }

  function onLayoutChange(layouts) {
    setLayouts(layouts);
    saveToLS("visualLayouts", "layouts", layouts);
  }

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
      <ResponsiveReactGridLayout
        rowHeight={30}
        layouts={layouts}
        draggableCancel="input,textarea"
        isDraggable={isLayoutModifiable}
        isResizable={isLayoutModifiable}
        onLayoutChange={(layout, layouts) => onLayoutChange(layouts)}
      >
        <div key="0" className={highlightEditDiv}>
          <ChordDiagram id="101" ref={chordDiagramDiv} onChange={handleChordChange()} />{" "}
        </div>
        <div key="1" className={highlightEditDiv}>
          <SankeyDiagram id="100" ref={SankeyDiagramDiv} onChange={handleSankeyChange()} />{" "}
        </div>

        <div key="2" id="barDiv" className={highlightEditDiv}>
          <RulesTable />{" "}
        </div>
        {/* <div key="3" id="barDiv" className={highlightEditDiv}>
          <BarChart id="100" ref={barChartDiv} />{" "}
        </div> */}
      </ResponsiveReactGridLayout>
    </div>
  );
}

export default Visualization;
