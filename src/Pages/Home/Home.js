import React from "react";
import "./Home.css";
import InputBoxes from "../../Containers/InputBoxes/InputBoxes";
import SelectedCodes from "../../Containers/SelectedCodes/SelectedCodes";
import RecommendedCodes from "../../Containers/RecommendedCodes/RecommendedCodes";
import DaggerAsterisks from "../../Containers/DaggerAsterisks/DaggerAsterisks";
import TreeViewer from "../../Components/TreeViewer/TreeViewer";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { defaultLayouts } from "./layouts";
import { WidthProvider, Responsive } from "react-grid-layout";
import { __esModule } from "d3-random"; //TODO: Verify why this import is needed

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || defaultLayouts;

const treeViewDiv = React.createRef();

const Home = () => {
  const highlightEditDiv = "grid-border";
  return (
    <ResponsiveReactGridLayout
      className="layout"
      rowHeight={10}
      cols={{ lg: 48, md: 40, sm: 24, xs: 16, xxs: 8 }}
      // layouts={this.state.layouts}
      layouts={originalLayouts}
      draggableCancel="input,textarea"
      // isDraggable={this.state.isLayoutModifiable} //used to dynamically allow editing
      // isResizable={this.state.isLayoutModifiable} //if a button is pressed
      // onLayoutChange={(layout, layouts) => this.onLayoutChange(layouts)}
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
  );
};

export default Home;
