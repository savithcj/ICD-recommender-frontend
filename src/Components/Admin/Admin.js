import React, { useState } from "react";
import MenuBar from "../../Components/MenuBar/MenuBar";
import { WidthProvider, Responsive } from "react-grid-layout";
import RuleCreator from "../../Components/RuleCreator/RuleCreator";
import RuleReviewer from "../../Components/RuleReviewer/RuleReviewer";
import RuleSearch from "../../Components/RuleSearch/RuleSearch";

import "./Admin.css";

const defaultLayoutLg = [
  { w: 7, h: 16, x: 0, y: 2, i: "0" },
  { w: 5, h: 9, x: 7, y: 0, i: "1" },
  { w: 10, h: 10, x: 7, y: 11, i: "2" },
  { w: 7, h: 2, x: 0, y: 0, i: "3" }
];
const defaultLayoutMd = [
  { w: 6, h: 17, x: 0, y: 2, i: "0" },
  { w: 4, h: 10, x: 6, y: 0, i: "1" },
  { w: 4, h: 9, x: 6, y: 10, i: "2" },
  { w: 6, h: 2, x: 0, y: 0, i: "3" }
];
const defaultLayoutSm = [
  { w: 6, h: 14, x: 0, y: 20, i: "0" },
  { w: 6, h: 9, x: 0, y: 2, i: "1" },
  { w: 6, h: 9, x: 0, y: 11, i: "2" },
  { w: 6, h: 2, x: 0, y: 0, i: "3" }
];
const defaultLayoutXs = [
  { w: 4, h: 14, x: 0, y: 19, i: "0" },
  { w: 4, h: 9, x: 0, y: 2, i: "1" },
  { w: 4, h: 8, x: 0, y: 11, i: "2" },
  { w: 4, h: 2, x: 0, y: 0, i: "3" }
];
const defaultLayoutXxs = [
  { w: 2, h: 12, x: 0, y: 19, i: "0" },
  { w: 2, h: 9, x: 0, y: 2, i: "1" },
  { w: 2, h: 8, x: 0, y: 11, i: "2" },
  { w: 2, h: 2, x: 0, y: 0, i: "3" }
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

function Admin(props) {
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
  }

  const shakeDiv = isLayoutModifiable ? "shake" : "";
  const highlightEditDiv = isLayoutModifiable ? "grid-border edit-border" : "grid-border";

  return (
    <div>
      <div>
        <MenuBar
          title="Admin Page"
          firstLinkName="Home"
          firstLinkRoute="/"
          secondLinkName="Visualization"
          secondLinkRoute="/visualization"
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
              <h3>Search for Rule</h3>
              <RuleSearch />
            </div>
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
      ls = JSON.parse(global.localStorage.getItem("rgl-7")) || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key];
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
      "rgl-7",
      JSON.stringify({
        [key]: value
      })
    );
  }
}

export default Admin;
