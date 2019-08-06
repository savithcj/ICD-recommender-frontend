import React from "react";
import MenuBar from "../../Containers/MenuBar/MenuBar";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";

export default function Loading() {
  return (
    // TODO: possibly add a custom stylesheet; just using home css class for now
    <div className="Home">
      <MenuBar
        title="ICD-10 Code Suggestion and Usage Insight"
        firstLinkName="Visualization"
        firstLinkRoute="/visualization"
        secondLinkName="Admin"
        secondLinkRoute="/admin"
        thirdLinkName="Manage Accounts"
        thirdLinkRoute="/manage-accounts"
      />
      <LoadingIndicator />
    </div>
  );
}
