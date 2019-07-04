import React, { useState } from "react";
import "./Home.css";
import InputBoxes from "../../Containers/InputBoxes/InputBoxes";
import SelectedCodes from "../../Containers/SelectedCodes/SelectedCodes";
import RecommendedCodes from "../../Containers/RecommendedCodes/RecommendedCodes";
import DaggerAsterisks from "../../Containers/DaggerAsterisks/DaggerAsterisks";
import TreeViewer from "../../Containers/TreeViewer/TreeViewer";
import MenuBar from "../../Components/MenuBar/MenuBar";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { defaultLayouts } from "./layouts";
import { WidthProvider, Responsive } from "react-grid-layout";
import { __esModule } from "d3-random"; //TODO: Verify why this import is needed

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || defaultLayouts;

const treeViewDiv = React.createRef();

const Home = () => {
  //Local state of the Home page
  const [layouts, setLayouts] = useState(JSON.parse(JSON.stringify(originalLayouts)));
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);

  const handleLayoutModifierButton = () => {
    const layoutModifiable = isLayoutModifiable;
    setLayoutModifiable(!layoutModifiable);
  };

  const resetLayout = () => {
    setLayouts({ layouts: defaultLayouts });
    saveToLS("layouts", defaultLayouts);
  };

  const onLayoutChange = layouts => {
    setLayouts({ layouts: layouts });
    treeViewDiv.current.handleResize();
    saveToLS("layouts", layouts);
  };

  const highlightEditDiv = isLayoutModifiable ? "grid-border edit-border" : "grid-border";
  return (
    <div className="Home">
      <MenuBar
        title="ICD-10 Code Suggestion and Usage Insight"
        firstLinkName="Admin"
        firstLinkRoute="/admin"
        secondLinkName="Visualization"
        secondLinkRoute="/visualization"
        handleLayoutConfirm={handleLayoutModifierButton}
        handleResetLayout={resetLayout}
        inModifyMode={isLayoutModifiable}
      />
      <ResponsiveReactGridLayout
        className="layout"
        rowHeight={10}
        cols={{ lg: 48, md: 40, sm: 24, xs: 16, xxs: 8 }}
        layouts={JSON.parse(JSON.stringify(originalLayouts))} //FIXME: error with the layouts in the state
        draggableCancel="input,textarea"
        isDraggable={isLayoutModifiable} //used to dynamically allow editing
        isResizable={isLayoutModifiable} //if a button is pressed
        onLayoutChange={(layout, layouts) => onLayoutChange(layouts)}
      >
        <div key="tree" className={highlightEditDiv}>
          <TreeViewer ref={treeViewDiv} />
        </div>

        <div key="selectedCodes" className={highlightEditDiv}>
          <SelectedCodes treeRef={treeViewDiv} />
        </div>

        <div key="recommendedCodes" className={highlightEditDiv}>
          <RecommendedCodes treeRef={treeViewDiv} />
        </div>

        <div key="daggerCodes" className={highlightEditDiv}>
          <DaggerAsterisks treeRef={treeViewDiv} />
        </div>

        <div key="inputBoxes" className={highlightEditDiv}>
          <InputBoxes />
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
};

export default Home;
