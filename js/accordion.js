/* This Javascript file contains JS for accordion-menu functionality */

// Function that creates the accordion menu dynamically, displaying entries sorted by state
function  createAccordionMenu(data) {
  var allStateCountyDict = {}   // dictionary to hold all state & county names
  data.forEach(d => {
    var county_state_names = parseCountyAndState(d.display_name);

    // if the state doesn't yet exist, we need to add it. Otherwise we simply add the entry to list of counties under that state
    if (allStateCountyDict[county_state_names.state] == undefined) {
      allStateCountyDict[county_state_names.state] = [ county_state_names.county ];
    }
    else {
      allStateCountyDict[county_state_names.state].push(county_state_names.county);
    }
  });

  // after parsing all of the data, create the accordion menu
  for (const [state, county] of Object.entries(allStateCountyDict)) {
    var strSubContent = "";
    county.forEach(cnty => {
      strSubContent = strSubContent.concat("- ", cnty, "\n");
    });

    createAccordionSection(state, strSubContent);   // creates accordion section with the state name, and list of all counties in state
  }

  // Register callback functions for the expand/collapse all accordion menu sections buttons
  document.getElementById("expandAllButton").addEventListener("click", expandAllSections);
  document.getElementById("collapseAllButton").addEventListener("click", collapseAllSections);
}

// Helper function to parse the county & state names from the input data
function parseCountyAndState(inputString) {
  // Remove extra commas, parenthesis, and quotes
  var cleanString = inputString.replace(/['"()]/g, '');
  
  // Split the string into county name and state
  var parts = cleanString.split(',');
  
  // Return an object with county name and state
  return { county: parts[0].trim(), state: parts[1].trim() };
}

// Helper function which actually creates the HTML structure for each accordion menu section
function createAccordionSection(sectionText, subContent) {
  // Create button for the accordion section
  var button = document.createElement("button");
  button.classList.add("accordion");
  button.textContent = sectionText;

  // Create div for the panel containing subcontent
  var panel = document.createElement("div");
  panel.classList.add("panel");
  var paragraph = document.createElement("p");
  paragraph.textContent = subContent;
  panel.appendChild(paragraph);

  // Append button and panel to the parent element
  var accordionContainer = document.getElementById("accordion-container");
  accordionContainer.appendChild(button);
  accordionContainer.appendChild(panel);

  // Add event listener to toggle panel visibility
  button.addEventListener("click", function() {
      // Toggle between adding and removing the "active" class
      this.classList.toggle("active");

      // Toggle between hiding and showing the panel
      if (panel.style.display === "block") {
          panel.style.display = "none";
          
          const index = lstActiveStates.indexOf(button.textContent);  // get the index of the current state in list of active states
          if (index > -1) { // only splice list when item is found
            lstActiveStates.splice(index, 1); // 2nd parameter means remove one item only
          }
      }
      else {
          panel.style.display = "block";
          lstActiveStates.push(button.textContent);  // adds current state to globally-stored list of all active states
      }

      // calls the updateVisualizations() function to update the display for various visualizations
      updateVisualizations();
  });

  // by default, we open the 'OH' accordion menu section, as it's our home state and thus a good dataset to start with
  if (button.textContent == "OH") {
    var event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    button.dispatchEvent(event);
  }
}

// Function to handle expanding all accordion sections
function expandAllSections() {
  var acc = document.getElementsByClassName("accordion");
  for (var i = 0; i < acc.length; i++) {
      // Check if the section is not already active
      if (!acc[i].classList.contains("active")) {
          // Trigger click event to expand the section
          acc[i].click();
      }
  }
}

// Function to handle collapsing all accordion sections
function collapseAllSections() {
  var acc = document.getElementsByClassName("accordion");
  for (var i = 0; i < acc.length; i++) {
      // Check if the section is active
      if (acc[i].classList.contains("active")) {
          // Trigger click event to collapse the section
          acc[i].click();
      }
  }
}