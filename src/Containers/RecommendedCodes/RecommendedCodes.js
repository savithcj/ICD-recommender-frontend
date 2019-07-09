import React from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import * as APIUtility from "../../Util/API";

const recommendedCodesViewer = props => {
  /**
   * Called upon when user accepts a recommended code
   */
  const handleAcceptRecommendedCode = event => {
    const acceptedRuleIndex = parseInt(event.currentTarget.id, 10);
    const acceptedRuleObj = props.recommendedCodes[acceptedRuleIndex];
    const newCode = acceptedRuleObj.rhs;

    const rulesToSendBack = props.rulesToSendBack;
    const matchedRule = rulesToSendBack.find(obj => obj.id === acceptedRuleObj.id);
    if (matchedRule !== undefined) {
      matchedRule.action = "A";
      props.setRulesInSession(rulesToSendBack);
    }
    props.removeRecommendedCode(acceptedRuleIndex);
    props.addSelectedCode(newCode);
  };

  /**
   * Called upon when user rejects a recommended code.
   */
  const handleRemoveRecommendedCode = event => {
    const removedRuleIndex = parseInt(event.currentTarget.id, 10);
    const removedRuleObj = props.recommendedCodes[removedRuleIndex];
    const rulesToSendBack = props.rulesToSendBack;
    const matchedRule = rulesToSendBack.find(obj => obj.id === removedRuleObj.id);
    if (matchedRule !== undefined) {
      matchedRule.action = "R";
      props.addRHSToExclusion(matchedRule.rhs);
      props.setRulesInSession(rulesToSendBack);
    }
    props.removeRecommendedCode(removedRuleIndex);
  };

  /**
   * Called upon when user flags a rule for admin review
   */
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
      acceptItemButton={{ title: "Accept recommendation", onClick: handleAcceptRecommendedCode }}
      removeItemButton={{ title: "Reject recommendation", onClick: handleRemoveRecommendedCode }}
      dislikeButton={{ title: "Flag recommendation for review", onClick: userFlagRuleForReview }}
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
    recommendedCodes: state.recommended.recommendedCodes,
    rulesToSendBack: state.session.rulesToSendBack
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addSelectedCode: codeObjToAdd => dispatch(actions.addSelectedCodeAndUpdateRecommendations(codeObjToAdd)),
    removeRecommendedCode: removeCodeIndex => dispatch(actions.removeRecommendedCode(removeCodeIndex)),
    setRulesInSession: listOfRules => dispatch(actions.setRulesInSession(listOfRules)),
    addRHSToExclusion: rhsCode => dispatch(actions.addRHSToExclusion(rhsCode))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(recommendedCodesViewer);
