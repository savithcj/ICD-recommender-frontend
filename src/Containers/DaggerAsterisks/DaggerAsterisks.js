import React from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";
import { connect } from "react-redux";
import * as APIUtility from "../../Util/API";
import * as actions from "../../Store/Actions/index";

const daggerAsterisksViewer = props => {
  const addSelectedDaggerAsterisk = (newCodeObj, codeObjToAlter) => {
    let selectedCodes = Array.from(props.selectedCodes);
    newCodeObj.paired = codeObjToAlter.code;
    selectedCodes.forEach(codeObj => {
      if (codeObj.code === codeObjToAlter.code) {
        codeObj.paired = newCodeObj.code;
      }
    });
    selectedCodes.push(newCodeObj);
    props.setSelectedCodes(selectedCodes);
    props.getRecommendedCodes(selectedCodes);
    props.getDaggerAsterisks(selectedCodes);
  };

  const handleAcceptDaggerAsteriskCode = event => {
    const acceptedCodeIndex = parseInt(event.currentTarget.id, 10);
    const acceptedCodeObject = props.suggestedDaggerAsterisks[acceptedCodeIndex];
    if (acceptedCodeObject.combo.indexOf("-") >= 0) {
      props.setAlertMessage({ message: "Select a sub-code", messageType: "error" });
    } else {
      const codes = Array.from(props.selectedCodes);
      let daggerObject = {};
      daggerObject.code = acceptedCodeObject.dagger;
      let asteriskObject = {};
      asteriskObject.code = acceptedCodeObject.asterisk;
      APIUtility.API.makeAPICall(APIUtility.CODE_DESCRIPTION, daggerObject.code)
        .then(response => response.json())
        .then(result => {
          daggerObject.description = result.description;
          APIUtility.API.makeAPICall(APIUtility.CODE_DESCRIPTION, asteriskObject.code)
            .then(response => response.json())
            .then(result => {
              asteriskObject.description = result.description;
            })
            .then(() => {
              if (codes.find(codeObj => codeObj.code === daggerObject.code) === undefined) {
                addSelectedDaggerAsterisk(daggerObject, asteriskObject);
              } else {
                addSelectedDaggerAsterisk(asteriskObject, daggerObject);
              }
            });
        })
        .catch(error => {
          console.log("ERROR:", error);
        });
    }
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
      props.setCodeInTree(daggerCode);
    } else {
      props.setCodeInTree(asteriskCode);
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
      exploreButton={{ title: "Explore on tree", onClick: handleExploreDaggerAsterisk }}
      acceptItemButton={{ title: "Accept dagger/asterisk", onClick: handleAcceptDaggerAsteriskCode }}
      removeItemButton={{ title: "Reject dagger/asterisk", onClick: handleRemoveDaggerAsteriskCode }}
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
    setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue)),
    setSelectedCodes: valueToSet => dispatch(actions.setSelectedCodes(valueToSet)),
    setDaggerAsterisk: valueToSet => dispatch(actions.setDaggerAsterisk(valueToSet)),
    removeDaggerAsteriskCode: removeCodeIndex => dispatch(actions.removeDaggerAsterisk(removeCodeIndex)),
    getRecommendedCodes: (codeObjArray, age, gender) =>
      dispatch(actions.fetchRecommendationsAndUpdateCache(codeObjArray, age, gender)),
    getDaggerAsterisks: codeObjArray => dispatch(actions.fetchDaggerAsterisksAndUpdateCache(codeObjArray)),
    setCodeInTree: code => dispatch(actions.setCodeInTree(code))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(daggerAsterisksViewer);
