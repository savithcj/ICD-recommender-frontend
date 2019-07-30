/**
 * Endpoints---------------------------------------------------------------------------
 * Defined as constants here mainly to avoid possible bugs as a result of misspellings
 */
export const RULES = "RULES";
export const CHILDREN = "CHILDREN";
export const FAMILY = "FAMILY";
export const CODE_DESCRIPTION = "CODE_DESCRIPTION";
export const REQUEST_RULES = "REQUEST_RULES";
export const REQUEST_ACTIVE_RULES = "REQUEST_ACTIVE_RULES";
export const MATCH_DESCRIPTION = "MATCH_DESCRIPTION";
export const ANCESTORS = "ANCESTORS";
export const CODE_AUTO_SUGGESTIONS = "CODE_AUTO_SUGGESTIONS";
export const CODE_BLOCK_USAGE = "CODE_BLOCK_USAGE";
export const CREATE_RULE = "CREATE_RULE";
export const RULE_SEARCH = "RULE_SEARCH";
export const FLAG_RULE_FOR_REVIEW = "FLAG_RULE_FOR_REVIEW";
export const FLAGGED_RULES = "FLAGGED_RULES";
export const UPDATE_FLAGGED_RULE = "UPDATE_FLAGGED_RULE";
export const DAGGER_ASTERISK = "DAGGER_ASTERISK";
export const ENTER_LOG = "ENTER_LOG";
export const RULE_STATUS = "RULE_STATUS";
export const INACTIVE_RULES = "INACTIVE_RULES";
export const STATS = "STATS";
export const CHECK_CODE = "CHECK_CODE";

/**
 * API class used to connect to the backend--------------------------------------------
 */
export class API {
  static serverAdress = window.location.hostname; //Only if API on same server as React
  static portAdress = ":8000";
  static urlBeginning = "http://" + this.serverAdress + this.portAdress + "/api/";
  static json = "/?format=json";

  static makeAPICall(endpoint, input) {
    let request = null;
    switch (endpoint) {
      case RULES:
        return fetch(this.urlBeginning + "rules" + this.json);
      // case CHILDREN:
      //   return this.urlBeginning + "children/";
      case FAMILY:
        return fetch(this.urlBeginning + "family/" + input + this.json);
      case CODE_DESCRIPTION:
        return fetch(this.urlBeginning + "codeDescription/" + input + this.json);
      // case REQUEST_RULES:
      //   return this.urlBeginning + "requestRules/";
      case REQUEST_ACTIVE_RULES:
        return fetch(this.urlBeginning + "requestRulesActive/" + input.codes + this.json + input.age + input.gender);
      // case MATCH_DESCRIPTION:
      //   return this.urlBeginning + "matchDescription/";
      case ANCESTORS:
        return fetch(this.urlBeginning + "ancestors/" + input + this.json);
      case CODE_AUTO_SUGGESTIONS:
        return fetch(this.urlBeginning + "codeAutosuggestions/" + input + this.json);
      case CODE_BLOCK_USAGE:
        return fetch(this.urlBeginning + "codeBlockUsage" + this.json);
      case CREATE_RULE:
        request = new Request(this.urlBeginning + "createRule/", input);
        return fetch(request);
      case RULE_SEARCH:
        request = new Request(this.urlBeginning + "ruleSearch/", input);
        return fetch(request);
      case FLAG_RULE_FOR_REVIEW:
        return fetch(this.urlBeginning + "flagRuleForReview/" + input + this.json, { method: "PUT" });
      case FLAGGED_RULES:
        return fetch(this.urlBeginning + "flaggedRules" + this.json);
      case UPDATE_FLAGGED_RULE:
        return fetch(this.urlBeginning + "updateFlaggedRule/" + input.id + input.action, { method: "PUT" });
      case DAGGER_ASTERISK:
        return fetch(this.urlBeginning + "daggerAsterisk/" + input + this.json);
      case ENTER_LOG:
        request = new Request(this.urlBeginning + "enterLog/", input);
        return fetch(request);
      case RULE_STATUS:
        request = new Request(this.urlBeginning + "changeRuleStatus/", input);
        return fetch(request);
      case INACTIVE_RULES:
        return fetch(this.urlBeginning + "inactiveRules" + this.json);
      case STATS:
        return fetch(this.urlBeginning + "stats" + this.json);
      case CHECK_CODE:
        return fetch(this.urlBeginning + "checkCode/" + input + this.json);
      default:
        return null;
    }
  }
}
