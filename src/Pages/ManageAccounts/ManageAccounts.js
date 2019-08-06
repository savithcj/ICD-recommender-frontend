import React, { useState } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import MenuBar from "../../Containers/MenuBar/MenuBar";
import { Redirect } from "react-router";
import { connect } from "react-redux";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { defaultLayouts } from "./layouts";
import VerifyAccounts from "../../Containers/VerifyAccounts/VerifyAccounts";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("manageLayouts", "layouts") || defaultLayouts;

function ManageAccounts(props) {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);

  const resetLayout = () => {
    setLayouts(defaultLayouts);
    saveToLS("manageLayouts", "layouts", defaultLayouts);
  };

  function handleLayoutModifierButton() {
    const layoutModifiable = !isLayoutModifiable;
    setLayoutModifiable(layoutModifiable);
  }

  function onLayoutChange(layouts) {
    setLayouts(layouts);
    saveToLS("manageLayouts", "layouts", layouts);
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
          thirdLinkName="Admin"
          thirdLinkRoute="/admin"
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

const mapStateToProps = state => {
  return {
    oAuthToken: state.authentication.oAuthToken
  };
};

export default connect(
  mapStateToProps,
  null
)(ManageAccounts);
