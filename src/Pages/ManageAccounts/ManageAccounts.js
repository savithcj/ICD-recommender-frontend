import React, { useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import MenuBar from "../../Containers/MenuBar/MenuBar";
import { Redirect } from "react-router";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { defaultLayouts } from "./layouts";
import VerifyAccounts from "../../Containers/VerifyAccounts/VerifyAccounts";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("adminLayouts", "layouts") || defaultLayouts;

// Default layouts needs to be modified
function ManageAccounts(props) {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    saveToLS("adminLayouts", "layouts", defaultLayouts);
  };

  function handleLayoutModifierButton() {
    const layoutModifiable = !isLayoutModifiable;
    setLayoutModifiable(layoutModifiable);
  }

  function onLayoutChange(layouts) {
    setLayouts(layouts);
    saveToLS("adminLayouts", "layouts", layouts);
  }

  const highlightEditDiv = isLayoutModifiable ? "grid-border edit-border" : "grid-border";

  if (props.oAuthToken === null) {
    return <Redirect to="/sign-in" />;
  }

  return (
    <div>
      <div>
        <MenuBar
          title="Manage Accounts"
          firstLinkName="Home"
          firstLinkRoute="/"
          secondLinkName="Visualization"
          secondLinkRoute="/visualization"
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
            <VerifyAccounts />
          </div>
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
}

export default ManageAccounts;
