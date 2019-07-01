export default class API {
  static serverAdress = window.location.hostname;
  static portAdress = ":8000";
  static urlBeginning = "http://" + this.serverAdress + this.portAdress + "/api/";

  static getAPIURL(endpoint) {
    switch (endpoint) {
      case "RULES":
        return this.urlBeginning + "rules/";
      case "CHILDREN":
        return this.urlBeginning + "children/";
      case "FAMILY":
        return this.urlBeginning + "family/";
      case "CODE_DESCRIPTION":
        return this.urlBeginning + "codeDescription/";
      case "REQUEST_RULES":
        return this.urlBeginning + "requestRules/";
      case "MATCH_DESCRIPTION":
        return this.urlBeginning + "matchDescription/";
      case "ANCESTORS":
        return this.urlBeginning + "ancestors/";
      case "CODE_AUTO_SUGGESTIONS":
        return this.urlBeginning + "codeAutosuggestions/";
      case "CODE_BLOCK_USAGE":
        return this.urlBeginning + "codeBlockUsage/";
      case "MODIFY_RULE":
        return this.urlBeginning + "modifyRule/";
      case "RULE_SEARCH":
        return this.urlBeginning + "ruleSearch/";
      case "FLAG_RULE_FOR_REVIEW":
        return this.urlBeginning + "flagRuleForReview/";
      case "FLAGGED_RULES":
        return this.urlBeginning + "flaggedRules/";
      case "UPDATE_FLAGGED_RULE":
        return this.urlBeginning + "updateFlaggedRule/";
      case "DAGGER_ASTERISK":
        return this.urlBeginning + "daggerAsterisk/";
      case "ENTER_LOG":
        return this.urlBeginning + "enterLog/";
      default:
        return null;
    }
  }
}
