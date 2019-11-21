import React, { useState } from "react";
import { defaultLayouts } from "./layouts";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { WidthProvider, Responsive } from "react-grid-layout";
import MenuBar from "../../Containers/MenuBar/MenuBar";
import FileViewer from "../../Containers/FileViewer/FileViewer";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("sandboxLayouts", "layouts") || defaultLayouts;

function Sandbox(props) {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    saveToLS("sandboxLayouts", "layouts", defaultLayouts);
  };

  function handleLayoutModifierButton() {
    const layoutModifiable = !isLayoutModifiable;
    setLayoutModifiable(layoutModifiable);
  }

  function onLayoutChange(layouts) {
    setLayouts(layouts);
    saveToLS("sandboxLayouts", "layouts", layouts);
  }

  const highlightEditDiv = isLayoutModifiable ? "grid-border edit-border" : "grid-border";

  return (
    <div>
      <div>
        <MenuBar
          title="Sandbox"
          homeLink
          adminLink
          visualizationLink
          aboutLink
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
          <div className="cardContainer">
            <FileViewer />
          </div>
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
}

export default Sandbox;
