import React, { useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import MenuBar from "../../Containers/MenuBar/MenuBar";
import RuleCreator from "../../Containers/RuleCreator/RuleCreator";
import RuleReviewer from "../../Containers/RuleReviewer/RuleReviewer";
import RuleSearch from "../../Containers/RuleSearch/RuleSearch";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { defaultLayouts } from "./layouts";
import "./Admin.css";
import * as actions from "../../Store/Actions/index";
import { connect } from "react-redux";
import { useAlert, positions } from "react-alert";
import { Redirect } from "react-router";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("adminLayouts", "layouts") || defaultLayouts;

function Admin(props) {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);

  const alert = useAlert();

  //equivalent to componentDidUpdate. Listens to changes to the alertMessage state
  //in the store and displays messages to the user
  useEffect(() => {
    if (props.alertMessage) {
      alert.show(props.alertMessage.message, {
        timeout: 2500,
        position: positions.MIDDLE,
        type: props.alertMessage.messageType,
        onClose: () => {
          props.setAlertMessage(null);
        }
      });
    }
  }, [props.alertMessage]);

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

  if (props.userRole !== "admin") {
    return <Redirect to="/forbidden" />;
  }
  if (props.oAuthToken === null) {
    return <Redirect to="/sign-in" />;
  }

  return (
    <div>
      <div>
        <MenuBar
          title="Admin Page"
          firstLinkName="Home"
          firstLinkRoute="/"
          secondLinkName="Visualization"
          secondLinkRoute="/visualization"
          thirdLinkName="Manage Accounts"
          thirdLinkRoute="/manage-accounts"
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
            <h3>Create Rules</h3>
            <RuleCreator />
          </div>
        </div>

        <div key="1" className={highlightEditDiv}>
          <div className="cardContainer">
            <h3>Review Flagged Rules</h3>
            <RuleReviewer />
          </div>
        </div>

        <div key="2" className={highlightEditDiv}>
          <div className="cardContainer">
            <h3>Search for Rules</h3>
            <RuleSearch />
          </div>
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    alertMessage: state.alert.alertMessage,
    oAuthToken: state.authentication.oAuthToken,
    userRole: state.authentication.userRole
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Admin);
