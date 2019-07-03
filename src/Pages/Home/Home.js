import React, { useRef } from "react";
import InputBoxes from "../../Containers/InputBoxes/InputBoxes";
import SelectedCodes from "../../Containers/SelectedCodes/SelectedCodes";
import RecommendedCodes from "../../Containers/RecommendedCodes/RecommendedCodes";
import DaggerAsterisks from "../../Containers/DaggerAsterisks/DaggerAsterisks";
import TreeViewer from "../../Components/TreeViewer/TreeViewer";

const Home = () => {
  const treeViewDiv = useRef();
  return (
    <div>
      <TreeViewer ref={treeViewDiv} />
      <InputBoxes />
      <SelectedCodes treeRef={treeViewDiv} />
      <RecommendedCodes treeRef={treeViewDiv} />
      <DaggerAsterisks treeRef={treeViewDiv} />
    </div>
  );
};

export default Home;
