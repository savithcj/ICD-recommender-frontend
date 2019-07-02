import React from "react";
import InputBoxes from "../../Containers/InputBoxes/InputBoxes";
import SelectedCodes from "../../Containers/SelectedCodes/SelectedCodes";
import RecommendedCodes from "../../Containers/RecommendedCodes/RecommendedCodes";

const Home = () => {
  return (
    <div>
      <InputBoxes />
      <SelectedCodes />
      <RecommendedCodes />
    </div>
  );
};

export default Home;
