import React, { useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import MenuBar from "../../Containers/MenuBar/MenuBar";
import { Redirect } from "react-router";
import { connect } from "react-redux";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { defaultLayouts } from "./layouts";
import VerifyAccounts from "../../Containers/VerifyAccounts/VerifyAccounts";
import * as APIUtility from "../../Util/API";
import Loading from "../Loading/Loading";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("manageLayouts", "layouts") || defaultLayouts;

function ManageAccounts(props) {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // equivalent to componentDidUpdate. used to verify that the token is valid
  useEffect(() => {
    APIUtility.API.verifyLSToken(() => setIsLoading(false));
  }, []);

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

  if (isLoading) {
    return <Loading />;
  }

  if (!props.isAuthorized) {
    return <Redirect to="/sign-in" />;
  }

  if (props.userRole !== "admin") {
    return <Redirect to="/forbidden" />;
  }

  return (
    <div>
      <div>
        <MenuBar
          title="Manage Accounts"
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
            <VerifyAccounts />
          </div>
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    alertMessage: state.alert.alertMessage,
    isAuthorized: state.authentication.isAuthorized,
    userRole: state.authentication.userRole,
    isServerDown: state.authentication.isServerDown
  };
};

export default connect(
  mapStateToProps,
  null
)(ManageAccounts);
