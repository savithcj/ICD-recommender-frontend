import React from "react";
import MenuBar from "../../Containers/MenuBar/MenuBar";
import LoadingIndicator from "../../Components/LoadingIndicator/LoadingIndicator";

export default function Loading() {
  return (
    // TODO: possibly add a custom stylesheet; just using home css class for now
    <div className="Home">
      <MenuBar hideDropDown />
      <LoadingIndicator />
    </div>
  );
}
