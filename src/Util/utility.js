/**
 * Helper method to convert the code objects within the passed array
 * to a single string with comma separated codes.
 * @param {*} codeObjArray Array of code objects
 * @returns A comma separated string version of the array of codes
 */
export const getStringFromListOfCodes = codeObjArray => {
  let stringOfCodes = "";
  codeObjArray.forEach(codeObj => {
    stringOfCodes += codeObj.code + ",";
  });

  //slice method used to remove the last comma
  return stringOfCodes.slice(0, -1);
};

/**
 * add a dot after the third digit of an ICD code
 * @param {*} code string version of an ICD code
 */
export const addDotToCode = code => {
  if (checkIfDagAst(code)) {
    return addDotToDagAst(code);
  } else {
    return addDotToRegularCode(code);
  }
};

function checkIfDagAst(code) {
  return code.includes("\u271D");
}

function addDotToRegularCode(code) {
  if (code.length > 3) {
    return code.slice(0, 3) + "." + code.slice(3);
  }
  return code;
}

function addDotToDagAst(code) {
  const [dagger, asterisk] = code.split("\u271D");
  const dagWithDot = addDotToRegularCode(dagger.trim());
  const astWithDot = addDotToRegularCode(asterisk.trim().slice(0, -1));
  return dagWithDot + "\u271D " + astWithDot + "*";
}

/**
 * Helper function to check recommended codes and rules against the rejected RHS codes in current session.
 * If RHS codes has been rejected prior, remove and do not show again in recommendations.
 * Secondly, using random rolling, check rule's recommendation score against a randomly rolled threshold,
 * and only display the rule if the score is above the threshold.
 * Thirdly, if the rhs has been shown after rolling, repeated rules with same RHS would not be rolled again.
 * Finally returns a set of cleaned rules.
 */
export const cleanResults = (ruleObjs, rhsExclusions, rollResults) => {
  //TODO: Rules have a gender attribute now, same rule would be shown twice when input has no gender
  const cleanedResults = [];

  for (let i = 0; i < ruleObjs.length; i++) {
    let cursor = ruleObjs[i];
    // console.log("cleanResults, checking: " + cursor.rhs);

    //////check if the rhs is in the rejected exclusion list
    if (rhsExclusions.includes(cursor.rhs)) {
      // console.log("cleanResults, skipping " + cursor.rhs + " due to in exclusion list");
      continue;
    }

    ////// Check for duplicate RHS
    let duplicateIndex = cleanedResults.findIndex(item => item.rhs === cursor.rhs);
    // console.log(cursor.rhs + ": duplicated RHS index=" + duplicateIndex);
    if (duplicateIndex >= 0) {
      // if duplicate is found
      // console.log("cleanResults, found duplicate RHS " + cursor.rhs + " for rule#" + cursor.id);
      if (cleanedResults[duplicateIndex].score < ruleObjs[i].score) {
        // keep the duplicate with higher score by overwritting
        cleanedResults[duplicateIndex] = ruleObjs[i];
      }
      continue;
    }

    ////// Check rule score against randomly rolled score threshold
    ////// Check to see if the rule has been previously rolled
    const threshold = Math.random();
    let previousRollIndex = rollResults.findIndex(item => item.id === cursor.id);
    let previousRoll = rollResults[previousRollIndex];
    if (previousRollIndex >= 0 && previousRoll.rollOutcome != null) {
      // rule has previously been rolled
      // console.log("cleanResults, found previous roll result for ", cursor.id, ": " + previousRoll.rollOutcome);
      if (previousRoll.rollOutcome === true) {
        cleanedResults.push(cursor);
      }
      continue;
    } else {
      // rule has not been rolled before

      if (cursor.score < threshold) {
        // console.log("cleanResults, rolled #" + cursor.id + ": NO PASS");
        cursor.rollOutcome = false;
      } else {
        // console.log("cleanResults, rolled #" + cursor.id + ": PASS");
        cursor.rollOutcome = true;
      }
      rollResults.push(cursor);
    }

    if (cursor.rollOutcome === true) {
      cleanedResults.push(cursor);
    }
  }

  let i = 0;
  while (cleanedResults.length < Math.min(ruleObjs.length, 5) && i < ruleObjs.length) {
    if (ruleObjs[i].rollOutcome !== true && !rhsExclusions.includes(ruleObjs[i].rhs)) {
      console.log("i: ", i);
      console.log(ruleObjs[i]);
      let addRule = true;
      for (let j = 0; j < cleanedResults.length; j++) {
        if (ruleObjs[i].rhs === cleanedResults[j].rhs) {
          addRule = false;
        }
      }
      if (addRule) {
        ruleObjs[i].rollOutcome = true;
        cleanedResults.push(ruleObjs[i]);
      }
    }
    i++;
  }

  return [cleanedResults, rollResults];
};

/**
 * Helper method that creates a list of rules with user feedback (action) to be sent back to server.
 * Loops through every rule currently being recommended, append to list of rules to be sent back.
 * Each rule will have "action" attribute set to default "I" (for ignored)
 */
export const createRulesToSendBack = (recommendedRules, rulesToSendBack) => {
  for (let i = 0; i < recommendedRules.length; i++) {
    let cursor = recommendedRules[i];
    let duplicatedRule = rulesToSendBack.find(rule => rule.id === cursor.id);
    if (duplicatedRule === undefined) {
      cursor.action = "I"; // default action flag "I" (Ignore)
      rulesToSendBack.push(cursor);
    }
  }
  return rulesToSendBack;
};
