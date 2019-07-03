import React from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as APIUtility from "../../Util/API";

const recommendedCodesViewer = props => {
  const handleAcceptRecommendedCode = event => {
    const acceptedCodeIndex = parseInt(event.currentTarget.id, 10);
    const acceptedCodeObject = props.recommendedCodes[acceptedCodeIndex];
    const acceptedCode = acceptedCodeObject.rhs;

    const selectedCodes = Array.from(props.selectedCodes);
    const codeDescriptions = Array.from(props.cachedCodeWithDescription);

    // check if the code already exist in the selection
    const getDuplicate = selectedCodes.find(codeObj => codeObj.code === acceptedCode);

    if (getDuplicate === undefined) {
      const cachedCode = codeDescriptions.find(codeObj => codeObj.code === acceptedCode);
      // construct new code object
      const newCode = {
        code: cachedCode.code,
        description: cachedCode.description
      };

      selectedCodes.push(newCode);
      props.addSelectedCode(newCode);

      props.getRecommendedCodes(selectedCodes, props.selectedAge);
      props.getDaggerAsterisks(selectedCodes);
    } else {
      console.log("[RecommendedCodes Container] Error: trying to add duplicate code =>", acceptedCode);
    }
  };

  const handleRemoveRecommendedCode = event => {
    const removedCodeIndex = parseInt(event.currentTarget.id, 10);
    props.removeRecommendedCode(removedCodeIndex);
  };

  const userFlagRuleForReview = event => {
    const flaggedCodeIndex = parseInt(event.currentTarget.id, 10);
    const flaggedCode = props.recommendedCodes[flaggedCodeIndex];
    const ruleId = flaggedCode.id;

    const url = APIUtility.API.getAPIURL(APIUtility.FLAG_RULE_FOR_REVIEW) + ruleId + "/?format=json";
    fetch(url, { method: "PUT" })
      .then(response => response.json())
      .then(results => {
        console.log("[RecommendedCodes Container] API response from FlagRuleForReview: ", results);
      });

    props.removeRecommendedCode(flaggedCodeIndex);
  };

  const handleExploreButton = event => {
    const exploreCodeIndex = parseInt(event.currentTarget.id, 10);
    props.treeRef.current.changeTree(props.recommendedCodes[exploreCodeIndex].rhs);
  };

  const componentMenuItems = [];

  return (
    <ListViewer
      className="recommendedCodes"
      title="Recommended Codes"
      items={props.recommendedCodes}
      noItemsMessage="No recommendations for the selected codes and age"
      nullItemsMessage="Select codes to get recommendations"
      valueName="rhs"
      descriptionName="descriptionWithScore"
      acceptItemButton={handleAcceptRecommendedCode}
      removeItemButton={handleRemoveRecommendedCode}
      dislikeButton={userFlagRuleForReview}
      exploreButton={handleExploreButton}
      allowRearrage={false}
      menuOptions={componentMenuItems}
      disableDislikeButtonField="shouldDisableDislikeButton"
      disableTitleGutters={false}
    />
  );
};

const mapStateToProps = state => {
  return {
    selectedCodes: state.selected.selectedCodes,
    cachedCodeWithDescription: state.cached.cachedCodeWithDescription,
    recommendedCodes: state.recommended.recommendedCodes
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addSelectedCode: codeObjToAdd => dispatch(actions.addSelectedCode(codeObjToAdd)),
    removeSelectedCode: removeCodeIndex => dispatch(actions.removeSelectedCode(removeCodeIndex)),
    setSelectedCodes: valueToSet => dispatch(actions.setSelectedCodes(valueToSet)),
    removeRecommendedCode: removeCodeIndex => dispatch(actions.removeRecommendedCode(removeCodeIndex)),
    getRecommendedCodes: (codeObjArray, age, gender) =>
      dispatch(actions.fetchRecommendationsAndUpdateCache(codeObjArray, age, gender)),
    getDaggerAsterisks: codeObjArray => dispatch(actions.fetchDaggerAsterisksAndUpdateCache(codeObjArray))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(recommendedCodesViewer);
