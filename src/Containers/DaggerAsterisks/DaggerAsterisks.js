import React from "react";
import ListViewer from "../../Components/ListViewer/ListViewer";
import { connect } from "react-redux";
import * as APIUtility from "../../Util/API";

import * as actions from "../../Store/Actions/index";

const daggerAsterisksViewer = props => {
  const addSelectedDaggerAsterisk = newCodeObj => {
    const selectedCodes = 0;
    props.addSelectedCode(newCodeObj);
  };

  const removeDaggerAsteriskCode = codeIndex => {};

  const handleAcceptDaggerAsteriskCode = event => {
    const acceptedCodeIndex = parseInt(event.currentTarget.id, 10);
    const acceptedCodeObject = this.state.suggestedDaggerAsterisks[acceptedCodeIndex];
    const codes = Array.from(this.state.selectedCodes);

    let daggerObject = {};
    daggerObject.code = acceptedCodeObject.dagger;
    let asteriskObject = {};
    asteriskObject.code = acceptedCodeObject.asterisk;
    const urlDagger = APIUtility.getAPIURL(APIUtility.CODE_DESCRIPTION) + daggerObject.code + "/?format=json";
    fetch(urlDagger)
      .then(response => response.json())
      .then(result => {
        daggerObject.description = result.description;
        const urlAsterisk = APIUtility.getAPIURL(APIUtility.CODE_DESCRIPTION) + asteriskObject.code + "/?format=json";
        fetch(urlAsterisk)
          .then(response => response.json())
          .then(result => {
            asteriskObject.description = result.description;
          })
          .then(() => {
            if (codes.find(codeObj => codeObj.code === daggerObject.code) === undefined) {
              this.addSelectedDaggerAsterisk(daggerObject);
            } else {
              this.addSelectedDaggerAsterisk(asteriskObject);
            }
            this.removeDaggerAsteriskCode(acceptedCodeIndex);
          });
      });
  };

  const handleRemoveDaggerAsteriskCode = event => {};

  const handleExploreDaggerAsterisk = event => {};

  const componentMenuItems = [];
  return (
    <ListViewer
      title="Dagger/Asterisks"
      items={props.suggestedDaggerAsterisks}
      noItemsMessage="No dagger or asterisks suggested"
      nullItemsMessage="Add codes to see dagger/asterisks"
      valueName="combo"
      descriptionName="description"
      //   acceptItemButton={this.handleAcceptDaggerAsteriskCode}
      //   removeItemButton={this.handleRemoveDaggerAsteriskCode}
      //   exploreButton={this.handleExploreDaggerAsterisk}
      allowRearrage={false}
      menuOptions={componentMenuItems}
    />
  );
};

const mapStateToProps = state => {
  return {
    suggestedDaggerAsterisks: state.daggerAsterisks.suggestedDaggerAsterisks
  };
};

//TODO: map correct actions correspoding to the dagger asterisks viewer
const mapDispatchToProps = dispatch => {
  return {
    addSelectedCode: codeObj => dispatch(actions.addSelectedCode(codeObj)),
    removeSelectedCode: removeCodeIndex => dispatch(actions.removeSelectedCode(removeCodeIndex)),
    setSelectedCodes: valueToSet => dispatch(actions.setSelectedCodes(valueToSet)),
    getRecommendedCodes: (codeObjArray, age, gender) =>
      dispatch(actions.fetchRecommendations(codeObjArray, age, gender)),
    getDaggerAsterisks: codeObjArray => dispatch(actions.fetchDaggerAsterisks(codeObjArray))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(daggerAsterisksViewer);
