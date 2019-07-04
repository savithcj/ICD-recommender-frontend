import React from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";
import { connect } from "react-redux";
import * as APIUtility from "../../Util/API";
import * as actions from "../../Store/Actions/index";

const daggerAsterisksViewer = props => {
  const addSelectedDaggerAsterisk = newCodeObj => {
    const selectedCodes = Array.from(props.selectedCodes);
    selectedCodes.push(newCodeObj);
    props.setSelectedCodes(selectedCodes);
    props.getRecommendedCodes(selectedCodes);
    props.getDaggerAsterisks(selectedCodes);
  };

  const handleAcceptDaggerAsteriskCode = event => {
    const acceptedCodeIndex = parseInt(event.currentTarget.id, 10);
    const acceptedCodeObject = props.suggestedDaggerAsterisks[acceptedCodeIndex];
    const codes = Array.from(props.selectedCodes);
    let daggerObject = {};
    daggerObject.code = acceptedCodeObject.dagger;
    let asteriskObject = {};
    asteriskObject.code = acceptedCodeObject.asterisk;
    const urlDagger = APIUtility.API.getAPIURL(APIUtility.CODE_DESCRIPTION) + daggerObject.code + "/?format=json";
    fetch(urlDagger)
      .then(response => response.json())
      .then(result => {
        daggerObject.description = result.description;
        const urlAsterisk =
          APIUtility.API.getAPIURL(APIUtility.CODE_DESCRIPTION) + asteriskObject.code + "/?format=json";
        fetch(urlAsterisk)
          .then(response => response.json())
          .then(result => {
            asteriskObject.description = result.description;
          })
          .then(() => {
            if (codes.find(codeObj => codeObj.code === daggerObject.code) === undefined) {
              addSelectedDaggerAsterisk(daggerObject);
            } else {
              addSelectedDaggerAsterisk(asteriskObject);
            }
            props.removeDaggerAsteriskCode(acceptedCodeIndex);
          });
      });
  };

  const handleRemoveDaggerAsteriskCode = event => {
    const removedCodeIndex = parseInt(event.currentTarget.id, 10);
    props.removeDaggerAsteriskCode(removedCodeIndex);
  };

  const handleExploreDaggerAsterisk = event => {
    const codeIndex = parseInt(event.currentTarget.id, 10);
    const dagAstObj = props.suggestedDaggerAsterisks[codeIndex];
    const daggerCode = dagAstObj.dagger;
    const asteriskCode = dagAstObj.asterisk;

    if (props.selectedCodes.find(codeObj => codeObj.code === daggerCode) === undefined) {
      props.treeRef.current.changeTree(daggerCode);
    } else {
      props.treeRef.current.changeTree(asteriskCode);
    }
  };

  const componentMenuItems = [];
  return (
    <ListViewer
      title="Dagger/Asterisks"
      items={props.suggestedDaggerAsterisks}
      noItemsMessage="No dagger or asterisks suggested"
      nullItemsMessage="Add codes to see dagger/asterisks"
      valueName="combo"
      descriptionName="description"
      acceptItemButton={handleAcceptDaggerAsteriskCode}
      removeItemButton={handleRemoveDaggerAsteriskCode}
      exploreButton={handleExploreDaggerAsterisk}
      allowRearrage={false}
      menuOptions={componentMenuItems}
    />
  );
};

const mapStateToProps = state => {
  return {
    suggestedDaggerAsterisks: state.daggerAsterisks.suggestedDaggerAsterisks,
    selectedCodes: state.selected.selectedCodes
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setSelectedCodes: valueToSet => dispatch(actions.setSelectedCodes(valueToSet)),
    setDaggerAsterisk: valueToSet => dispatch(actions.setDaggerAsterisk(valueToSet)),
    removeDaggerAsteriskCode: removeCodeIndex => dispatch(actions.removeDaggerAsterisk(removeCodeIndex)),
    getRecommendedCodes: (codeObjArray, age, gender) =>
      dispatch(actions.fetchRecommendationsAndUpdateCache(codeObjArray, age, gender)),
    getDaggerAsterisks: codeObjArray => dispatch(actions.fetchDaggerAsterisksAndUpdateCache(codeObjArray))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(daggerAsterisksViewer);
