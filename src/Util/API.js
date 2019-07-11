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

/**
 * API class used to connect to the backend--------------------------------------------
 */
export class API {
  static serverAdress = window.location.hostname; //Only if API on same server as React
  static portAdress = ":8000";
  static urlBeginning = "http://" + this.serverAdress + this.portAdress + "/api/";

  static getAPIURL(endpoint) {
    switch (endpoint) {
      case RULES:
        return this.urlBeginning + "rules/";
      case CHILDREN:
        return this.urlBeginning + "children/";
      case FAMILY:
        return this.urlBeginning + "family/";
      case CODE_DESCRIPTION:
        return this.urlBeginning + "codeDescription/";
      case REQUEST_RULES:
        return this.urlBeginning + "requestRules/";
      case REQUEST_ACTIVE_RULES:
        return this.urlBeginning + "requestRulesActive/";
      case MATCH_DESCRIPTION:
        return this.urlBeginning + "matchDescription/";
      case ANCESTORS:
        return this.urlBeginning + "ancestors/";
      case CODE_AUTO_SUGGESTIONS:
        return this.urlBeginning + "codeAutosuggestions/";
      case CODE_BLOCK_USAGE:
        return this.urlBeginning + "codeBlockUsage/";
      case CREATE_RULE:
        return this.urlBeginning + "createRule/";
      case RULE_SEARCH:
        return this.urlBeginning + "ruleSearch/";
      case FLAG_RULE_FOR_REVIEW:
        return this.urlBeginning + "flagRuleForReview/";
      case FLAGGED_RULES:
        return this.urlBeginning + "flaggedRules/";
      case UPDATE_FLAGGED_RULE:
        return this.urlBeginning + "updateFlaggedRule/";
      case DAGGER_ASTERISK:
        return this.urlBeginning + "daggerAsterisk/";
      case ENTER_LOG:
        return this.urlBeginning + "enterLog/";
      case RULE_STATUS:
        return this.urlBeginning + "changeRuleStatus/";
      case INACTIVE_RULES:
        return this.urlBeginning + "inactiveRules/";
      case STATS:
        return this.urlBeginning + "stats/";
      default:
        return null;
    }
  }
}
