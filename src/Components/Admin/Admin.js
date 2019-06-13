import React from "react";
import MenuBar from "../../Components/MenuBar/MenuBar";

import "./Admin.css";

function Admin(props) {
  return (
    <div>
      <MenuBar
        firstLinkName="Home"
        firstLinkRoute="/"
        title="Admin Page"
        handleLayoutConfirm={() => {}}
        handleResetLayout={() => {}}
        inModifyMode={false}
      />
    </div>
  );
}

export default Admin;
