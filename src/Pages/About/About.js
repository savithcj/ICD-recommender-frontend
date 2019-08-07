import React from "react";
import MenuBar from "../../Containers/MenuBar/MenuBar";
import { connect } from "react-redux";

function About(props) {
  return (
    <div>
      <div>
        <MenuBar title="About" homeLink visualizationLink />
      </div>

      <div className="cardContainer">
        <h3>Background</h3>
        <p>
          The main purpose of this application is to help coders create more complete discharge abstracts. Time is a
          large constraint for coders which limits the level of completeness the discharge abstracts reach. Typically
          the important codes (the reason for the hospital visit, or codes that Alberta Health Services deem mandatory
          to code) are coded, but the less important codes are often neglected due to the time constraints. The
          uncomplete coding leads to various problems when trying to make meaningful conclusions from the discharge
          abstract database.
        </p>
        <p>
          This application recommends codes to coders with the goal of both speeding up the coding process, and creating
          more complete discharge abstracts. The recommendations are based upon codes that have commonly occurred
          together in the discharge abstract database (2004-2015). The application learns from user input;
          recommendations that are rejected often will be shown less frequently, and recommendations that are accepted
          often will be shown more frequently.
        </p>
      </div>
      <div className="cardContainer">
        <h3>The Home Page</h3>
        <p>
          The home page is the first page you will see when you login to the site. It is where most of the time is
          spent, and contains most of the functionality of the site.
        </p>
        <p>There are a few different components, and each has it's own functionality and purpose.</p>
        <br />
        <h4>Input Boxes</h4>
        <p>
          This is where you enter data. The first thing you should do when you start a discharge abstract is to enter
          the age and gender of the patient into the application. This will improve the recommendations provided, as
          many are age or gender specific.
        </p>
        <p>
          The other part of the input boxes is used to select codes. You can search for codes by typing, and matches
          will be displayed as you type. The search will match codes, descriptions, or keywords associated with the
          code. When the right code appears, you can select it by navigating down to it and hitting enter, or by
          left-clicking on the code. When a code is selected, it is displayed in the code browser.
        </p>
        <br />
        <h4>Code Browser</h4>
        <p>
          The code browser is a visual representation of the ICD-10-CA hierarchal structure. At the top (left), it
          starts with ICD-10-CA, then goes down into the individual chapters, then blocks of codes, general codes, and
          more specific version of the codes. When a code is selected in the input box, the code browser will center on
          that code, showing the code one level up, all of the codes on the same level, and all of the codes that are
          more specific versions of it.
        </p>
        <p>
          To navigate through the code browser, simply click on any of the codes (circle or text) and the code browser
          will be generated at the new code. The small green circle on some of the codes is an indicator that that code
          has more codes deeper down the hierarchy.
        </p>
        <p>
          If you wish to add a code from the browser to the selected codes component, you can click the "Add Code"
          button, and it will add the currently selected code (distinguishable by it's blue colour) to the selected code
          box. To add any currently displayed code, simply double click and it will be added to the selected code box.
        </p>
        <p>
          As you navigate further down the hierarchy, there will be more circles on the chain at the bottom of the
          browser. At any point, you can click on one of those circles to jump to that code in the browser. The chain
          shows all of the codes that come before the current code.
        </p>
        <br />
        <h4>Selected Codes</h4>
        <p>
          All codes added will appear in this box. The codes here will be the codes that you are intending to put in the
          discharge abstract. When a code is in this box, it can be removed by clicking the red x on the right side of
          the code. You can also jump to that code in the browser by clicking on the compass button to the left of the
          code.
        </p>
        <p>
          When there is more than one code in the box, a drop-down menu will appear, with the options to remove all
          codes, or rearrange the codes.
        </p>
        <p>
          When you are finished entering codes for the current discharge abstract, you can press the "Accept" button in
          the top right corner. This will clear the box, and send all usage data back to the server in order to optimize
          the application to provide better recommendations.
        </p>
        <p>
          The recommendations that are provided are created based upon the codes that are currently in the selected code
          box. The best way to get recommendations is by entering a few codes that you know are applicable for sure, and
          then browse through the recommendations that appear.
        </p>
        <br />
        <h4>Recommended Codes</h4>
        <p>
          When codes appear in the recommended code box, there are a few options. The compass button (same as selected
          codes) to the left of the code will navigate to that code in the browser. The green checkmark "accepts" the
          recommendation and moves that code to the selected code box. Recommendations are then regenerated based on the
          new addition. The red x will "reject" the recommendation. This should be used if the rule can make sense in
          certain situations, but not for the current discharge abstract. The red thumbs down should be used if the rule
          will never be useful. This flags the rule for admin review, and potential removal from the application.
        </p>
        <p>
          Each recommendation has a score associated with it. This is based upon the frequency which the codes appeared
          together in the discharge abstract database, as well as the number of times the recommendation has been
          accepted or rejected.
        </p>
        <br />
        <h4>Dagger/Asterisks</h4>
        <p>
          When a code that is a part of a dagger/asterisk pair is entered in the selected codes box, all of the possible
          pairs for that code will appear in the dagger/asterisk box. Recommendations can be removed with the red x.
          When one of the recommendations is accepted, that code will be moved to the selected codes box, and all of the
          others will be removed from the list.
        </p>
      </div>
      <div className="cardContainer">
        <h3>Visualization</h3>
        <p>
          The visualization page allows users to see the connections between all of the rules, and gain an insight as to
          how the application is being used.
        </p>
        <br />
        <h4>Chord Diagram</h4>
        <p>
          The bars around the outside of the circle are the blocks of codes in each chapter of ICD-10-CA. The length of
          the bars are representative of how often codes in those blocks appeared in the DAD from 2004-2015.
        </p>
        <p>
          For every rule, there is a line drawn starting from the block that the left hand side code belongs to, and
          ending at the block that the code in right hand side of the rule belongs to. The colour of the line matches
          the colour of the originating block, which correpsonds to the chapter the block is in. When a user hovers over
          one of the blocks, all of the rules originating from that block will become thicker, allowing the user to
          easily see all of the rules from that block. Additionally, the user can hover the mouse over the chapters in
          the legend, and it will highlight all of the rules from all of the blocks in that chapter.
        </p>
        <p>
          There is a slider at the bottom that can filter the minimum number of rules that must exist between two blocks
          for the line to show up on the diagram. This allows the user to see which blocks have a large amount of rules
          between them, and gives an understanding of which blocks are highly related to each other.
        </p>
        <p>
          Chapters can also be added or removed from the diagram, if a user wishes to see the relations between specific
          chapters only. Clicking on any of the chapters on the legend will toggle that chapter in and out of the
          diagram. The box to the right of the colour is indicative of whether the chapter is currently being shown. If
          the box is filled in, the chapter is shown. If it is empty, the chapter is not being displayed.
        </p>
        <br />
        <h4>Sankey Diagram</h4>
        <p>
          This diagram is similar to the Chord Diagram, but it shows the relationships between two chapters only. The
          sliders can be adjusted to choose which chapters to show rules for. If both sliders are on the same chapter,
          it will display rules within that chapter. The width of the lines indicates how many rules there are between
          the blocks. Thicker lines means many rules, while thin lines indicate only a few rules.
        </p>
        <p>
          Hovering the mouse over a line will highlight that line and dim the others, allowing the user to get a better
          view of that line and the blocks associated with it. This will also add text at the top of the diagram,
          showing the code blocks and the number of rules between them.
        </p>
        <br />
        <h4>Rule Table</h4>
        <p>
          The table shows details of all of the rules in the application. It displays the rule, gender, age range, times
          suggested, accepted and rejected, as well as the support and confidence from rule mining. All of the columns
          can be clicked on in order to sort the rules by that column, either ascending or descending. The number of
          results per page can be altered, and the user can jump to a specific page.
        </p>
        <br />
        <h4>DAD Statistics</h4>
        <p>
          This displays the total number of codes entered in the discharge abstract database from the years 2004-2015,
          as well as the total number of unique codes. It also displays the top 10 codes and the number of times that
          they were each coded.
        </p>
      </div>
      <div className="cardContainer">
        <h3>Customization</h3>
        <p>
          All of the pages allow for the user to customize the layout of the page however they wish. To do so, simply
          open the menu and select "Customize Layout". The different components will now have blue borders around them,
          indicating that customization mode is currently active. The components can be resized and moved around to
          create the ideal layout for each specific person. When satisfied with the layout, click the checkmark button
          to confirm. In order to save the layout for future visits, the page must be refreshed before navigating to
          other pages on the site. There is also a "Reset Layout" button in the menu, which sets the layout to the
          default layout.
        </p>
      </div>

      {/* Put all the admin specific information here */}
      {props.userRole === "admin" ? (
        <>
          <div className="cardContainer">
            <h3>Admin</h3>
            <p>
              The admin page is where all of the admin functions related to the functionality of the application are.
              This page allows admins to review rules that have been flagged by users, create new rules, or search for
              rules.
            </p>
            <br />
            <h4>Review Flagged Rules</h4>
            <p>
              When a coder flags a rule for review (red thumbs down), it will show up in this section. The left and
              right hand sides of the rule are displayed, along with the number of times it has been suggested,
              accepted, and rejected. If the rule makes sense, and it should stay in the system, click on the green
              checkmark. This will keep the rule and it will disallow other users to flag it, as it has already been
              reviewed. The red x will disable the rule and prevent it from being recommended. It is possible to reverse
              this later.
            </p>
            <br />
            <h4>Create Rules</h4>
            <p>
              This is where a custom rule can be created and added to the system. Multiple codes can be added to the
              left hand side (LHS) of the rule, but only one code can be added to the right hand side (RHS). If the LHS
              has multiple codes, the RHS will only be recommended if all of the LHS codes are added to the selected
              codes box.
            </p>
            <p>
              There is also the option to add an age range and specific gender to the rule. If the age boxes are left
              empty, the rule will be applicable for all age ranges. If the start is entered, but not the end, it will
              be applicable from the start age and every age after. If only the end is entered, it will be from 0 to the
              end age. The rule will be applicable for the gender entered, or both, if the box is left empty.
            </p>
            <p>Rules created with this tool will have a starting score of 90.</p>
            <br />
            <h4>Search for Rules</h4>
            <p>
              This allows admins to search for specific rules by entering codes into the LHS and/or RHS and selecting
              search. It will return a list of rules with their confidence, support, (confidence and support are from
              rule mining) number of times suggested, accepted, and rejected, as well as the applicable age range and
              gender.
            </p>
            <p>
              The rules have checkmark and x buttons. Only one will be available at a time, depending on the current
              status of the rule. If the rule is currently active, the red x will be available, which makes the rule
              inactive. If the rule is inactive, the green checkmark will be available, and this makes the rule active
              again.
            </p>
            <p>
              There is also a "Display Inactive Rules" button, which will show all of the rules that have are inactive.
            </p>
          </div>
          <div className="cardContainer">
            <h3>Manage Accounts</h3>
            <p>This page is where an admin can manage the accounts of the users registered on the site.</p>
            <br />
            <h4>Unverified Accounts</h4>
            <p>
              When a user creates an account, the status of the account will be unverified. This component displays all
              of the currently unverified accounts. Admins can click the green checkmark to verify the account, or the
              red x to delete the account permanently.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}

const mapStateToProps = state => {
  return {
    userRole: state.authentication.userRole
  };
};

export default connect(
  mapStateToProps,
  null
)(About);
