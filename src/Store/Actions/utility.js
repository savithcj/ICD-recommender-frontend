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
