export default class API {
  static serverAdress = "localhost";
  static portAdress = ":8000";
  static urlBegnining = "http://" + this.serverAdress + this.portAdress + "/api/";

  static getAPIURL(endpoint) {
    console.log();
    switch (endpoint) {
      case "RULES":
        return this.urlBegnining + "rules/";
      case "CHILDREN":
        return this.urlBegnining + "children/";
      case "FAMILY":
        return this.urlBegnining + "family/";
      case "CODE_DESCRIPTION":
        return this.urlBegnining + "codeDescription/";
      case "REQUEST_RULES":
        return this.urlBegnining + "requestRules/";
      case "MATCH_DESCRIPTION":
        return this.urlBegnining + "matchDescription/";
      case "ANCESTORS":
        return this.urlBegnining + "ancestors/";
      case "CODE_AUTO_SUGGESTIONS":
        return this.urlBegnining + "codeAutosuggestions/";
      case "CODE_USED":
        return this.urlBegnining + "codeUsed/";
      case "CODE_BLOCK_USAGE":
        return this.urlBegnining + "codeBlockUsage/";
      case "MODIFY_RULE":
        return this.urlBegnining + "modifyRule/";
      case "RULE_SEARCH":
        return this.urlBegnining + "ruleSearch/";
      case "FLAG_RULE_FOR_REVIEW":
        return this.urlBegnining + "flagRuleForReview/";
      case "FLAGGED_RULES":
        return this.urlBegnining + "flaggedRules/";
      case "UPDATE_FLAGGED_RULE":
        return this.urlBegnining + "updateFlaggedRule/";
    }
  }
}
