import React from "react";
import InputBoxes from "../../Containers/InputBoxes/InputBoxes";
import SelectedCodes from "../../Containers/SelectedCodes/SelectedCodes";
import RecommendedCodes from "../../Containers/RecommendedCodes/RecommendedCodes";
import DaggerAsterisks from "../../Containers/DaggerAsterisks/DaggerAsterisks";

const Home = () => {
  return (
    <div>
      <InputBoxes />
      <SelectedCodes />
      <RecommendedCodes />
      <DaggerAsterisks />
    </div>
  );
};

export default Home;
