import React, { useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import MenuBar from "../../Containers/MenuBar/MenuBar";
import ChordDiagram from "../../Containers/ChordDiagram/ChordDiagram";
import SankeyDiagram from "../../Containers/SankeyDiagram/SankeyDiagram";
import RulesTable from "../../Containers/RulesTable/RulesTable";
import DADStats from "../../Containers/DADStats/DADStats";
import { getFromLS, saveToLS } from "../../Util/layoutFunctions";
import { defaultLayouts } from "./layouts";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import * as APIUtility from "../../Util/API";
import Loading from "../Loading/Loading";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("visualLayouts", "layouts") || defaultLayouts;
const chordDiagramDiv = React.createRef();
const SankeyDiagramDiv = React.createRef();

function Visualization(props) {
  const [layouts, setLayouts] = useState(originalLayouts);
  const [isLayoutModifiable, setLayoutModifiable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // equivalent to componentDidUpdate. used to verify that the token is valid
  useEffect(() => {
    APIUtility.API.verifyLSToken(() => setIsLoading(false));
  }, []);

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

  if (isLoading) {
    return <Loading />;
  }

  if (props.isServerDown) {
    return <Redirect to="/server-down" />;
  }

  if (!props.isAuthorized) {
    return <Redirect to="/sign-in" />;
  }

  return (
    <div>
      <div>
        <MenuBar
          title="Visualization Page"
          homeLink
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
        <div key="chord" className={highlightEditDiv}>
          <ChordDiagram id="101" ref={chordDiagramDiv} onChange={handleChordChange()} />{" "}
        </div>
        <div key="sankey" className={highlightEditDiv}>
          <SankeyDiagram id="100" ref={SankeyDiagramDiv} onChange={handleSankeyChange()} />{" "}
        </div>

        <div key="rules" className={highlightEditDiv}>
          <RulesTable />{" "}
        </div>
        <div key="dad" className={highlightEditDiv}>
          <DADStats />{" "}
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
)(Visualization);
