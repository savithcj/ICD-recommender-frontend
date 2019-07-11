import React from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";
import { connect } from "react-redux";
import * as actions from "../../Store/Actions/index";
import { getStringFromListOfCodes } from "../../Util/utility";
import * as APIUtility from "../../Util/API";

const selectedCodesViewer = props => {
  const handleRemoveSelectedCode = event => {
    const selectedCodes = Array.from(props.selectedCodes);
    const removeCodeIndex = parseInt(event.currentTarget.id, 10);
    selectedCodes.splice(removeCodeIndex, 1);
    props.removeSelectedCode(removeCodeIndex);
    props.getRecommendedCodes(selectedCodes);
    props.getDaggerAsterisks(selectedCodes);

    if (selectedCodes.length === 0) {
      resetSelectedCodes();
      props.resetSession();
    }
  };

  const handleExploreSelectedCodeButton = event => {
    const exploreCodeIndex = parseInt(event.currentTarget.id, 10);
    props.treeRef.current.changeTree(props.selectedCodes[exploreCodeIndex].code);
  };

  const resetSelectedCodes = () => {
    props.setSelectedCodes([]);
    props.setRecommendedCodes(null);
    props.setDaggerAsterisk(null);
    props.setAge(null);
    props.setGender(null);
  };

  const sendSessionInfoToDB = () => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const url = APIUtility.API.getAPIURL(APIUtility.ENTER_LOG);

    //extracting the used codes from the code objects
    const selectedCodesToSendBack = props.selectedCodes.map(ruleObj => ruleObj.code);

    const dataToSend = { rule_actions: props.rulesToSendBack, entered: selectedCodesToSendBack };

    console.log(dataToSend);

    const options = {
      method: "PUT",
      headers,
      body: JSON.stringify(dataToSend)
    };

    const request = new Request(url, options);

    fetch(request).then(response => {
      console.log("[sendSessionInfoToDB function] response from backend", response.status);
    });
  };

  const copyToClipboard = () => {
    const codeSelection = getStringFromListOfCodes(props.selectedCodes);
    navigator.clipboard.writeText(codeSelection);
    props.setAlertMessage({ message: "Selected codes copied to clipboard", messageType: "success" });
  };

  const acceptSelectedCodes = () => {
    //TODO:Make API call to update code usage during a session
    resetSelectedCodes();
    copyToClipboard();
    sendSessionInfoToDB();
    props.resetSession();
  };

  const selectedCodesComponentMenuItems = [
    {
      menuItemOnClick: props.selectedCodes.length < 2 ? null : resetSelectedCodes,
      menuItemText: "Remove All Items"
    }
  ];

  const acceptSelectedCodesButton = {
    text: "Accept",
    onClick: acceptSelectedCodes,
    title: "Accept all selected codes"
  };

  return (
    <ListViewer
      title="Selected Codes"
      items={props.selectedCodes}
      noItemsMessage="No codes selected"
      valueName="code"
      descriptionName="description"
      exploreButton={{ title: "Explore on tree", onClick: handleExploreSelectedCodeButton }}
      removeItemButton={{ title: "Remove code", onClick: handleRemoveSelectedCode }}
      onSortEndCallback={updatedListOfSelectedCodes => {
        props.setSelectedCodes(updatedListOfSelectedCodes);
      }}
      allowRearrage={props.selectedCodes.length > 1}
      menuOptions={selectedCodesComponentMenuItems}
      button={props.selectedCodes.length > 0 ? acceptSelectedCodesButton : null}
    />
  );
};

const mapStateToProps = state => {
  return {
    selectedCodes: state.selected.selectedCodes,
    rulesToSendBack: state.session.rulesToSendBack
  };
};

const mapDispatchToProps = dispatch => {
  return {
    removeSelectedCode: removeCodeIndex => dispatch(actions.removeSelectedCode(removeCodeIndex)),
    setSelectedCodes: valueToSet => dispatch(actions.setSelectedCodes(valueToSet)),
    getRecommendedCodes: (codeObjArray, age, gender) =>
      dispatch(actions.fetchRecommendationsAndUpdateCache(codeObjArray, age, gender)),
    getDaggerAsterisks: codeObjArray => dispatch(actions.fetchDaggerAsterisksAndUpdateCache(codeObjArray)),
    setRecommendedCodes: valueToSet => dispatch(actions.setRecommendedCodes(valueToSet)),
    setDaggerAsterisk: valueToSet => dispatch(actions.setDaggerAsterisk(valueToSet)),
    setAge: valueToSet => dispatch(actions.setAge(valueToSet)),
    setGender: valueToSet => dispatch(actions.setGender(valueToSet)),
    setAlertMessage: newValue => dispatch(actions.setAlertMessage(newValue)),
    resetSession: () => dispatch(actions.resetSession())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(selectedCodesViewer);
