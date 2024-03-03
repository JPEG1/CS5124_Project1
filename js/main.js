/* Script-level (global) variables */
let data, scatterplot, linechart, histogram1, histogram2;
const toggleVisualizationButton = document.getElementById("toggleVisualization");

/* Functions */
// Function to populate combo boxes with column names
function populateComboBoxes(data) {
  // Get the column names from the data
  let columns = Object.keys(data[0]);
  let xAxisSelect = document.getElementById('xAxisSelect');
  let yAxisSelect = document.getElementById('yAxisSelect');

  // Populate the combo boxes with column names
  columns.forEach(column => {
      // firstly, we don't want to include the county information (only numerical data). So stuff like display_name and cnty_fips are ignored
      if ((column == "cnty_fips") || (column == "display_name")|| (column == "urban_rural_status")) {
        return; // immediately continue to next iteration
      }

      let optionX = document.createElement('option');
      optionX.textContent = column;
      optionX.value = column;
      xAxisSelect.appendChild(optionX);

      let optionY = document.createElement('option');
      optionY.textContent = column;
      optionY.value = column;
      yAxisSelect.appendChild(optionY);
  });

  // Event listeners for combo boxes to update selected X and Y axis variables
  xAxisSelect.addEventListener('change', function() {
      // Update the selected X axis variable
      selectedXAxis = this.value;
      updateVisualizations(); // Update visualizations when selection changes
  });

  yAxisSelect.addEventListener('change', function() {
      // Update the selected Y axis variable
      selectedYAxis = this.value;
      updateVisualizations(); // Update visualizations when selection changes
  });
  
  // Set default values for the combo boxes
  xAxisSelect.value = selectedXAxis;  // Set the first column as the default X axis (defined in "globals.js")
  yAxisSelect.value = selectedYAxis;  // Set the second column as the default Y axis (defined in "globals.js")
}

// Function for creating a D3 scatter plot
function createScatterplot(data) {
  scatterplot = new Scatterplot({
    'parentElement': '#scatterplot',
  }, data);

  scatterplot.updateVis();
}

// Function for creating a D3 line chart
function createLinechart(data) {
  linechart = new LineChart({
    'parentElement': '#linechart',
  }, data);

  linechart.updateVis();
}

// Function for creating a D3 histogram
function createHistograms(data) {
  histogram1 = new Histogram1({
    'parentElement': '#histogram1',
  }, data);

  histogram2 = new Histogram2({
    'parentElement': '#histogram2',
  }, data);
}

function createCurrVisButtonCallback() {
  const scatterplotDiv = document.getElementById("scatterplot-container");
  const linechartDiv = document.getElementById("linechart-container");
  const histogramDiv = document.getElementById("histogram-container");

  toggleVisualizationButton.addEventListener("click", function() {
    // Toggle the display of scatterplot and line chart based on dataVisualizationNumber
    if (currVisNumber === 1) {
      scatterplotDiv.style.display = "block"; // enabled
      linechartDiv.style.display = "none";    // disabled
      histogramDiv.style.display = "none";    // disabled
      currVisNumber = 2;
    }
    else if (currVisNumber == 2) {
      scatterplotDiv.style.display = "none";  // disabled
      linechartDiv.style.display = "block";   // enabled
      histogramDiv.style.display = "none";    // disabled
      currVisNumber = 3;
    }
    else if (currVisNumber == 3) {
      scatterplotDiv.style.display = "none";  // disabled
      linechartDiv.style.display = "none";    // disabled
      histogramDiv.style.display = "block";   // enabled
      currVisNumber = 1;
    }
    else {
      // should never enter this state. If it does, we simply log message and reset currVisNumber
      currVisNumber = 1;
      console.lot("Error! Received invalid value of currVisNumber: ", currVisNumber);
    }
});
}

// Function that toggles which data visualization is currently displayed (cycles through all available visualizations)
function toggleCurrentVisualization() {
  var event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  toggleVisualizationButton.dispatchEvent(event);
}

// Function that updates all data visualizations
function updateVisualizations() {
  scatterplot.updateVis();
  linechart.updateVis();
  histogram1.updateVis();
  histogram2.updateVis();

}

/*
Script execution 'starts' here.
Technically, it starts at the top by creating the variables, and then instantiating the various function definitions.
But after 'discovering' all of the functions within this .js script, actual execution begins below.
*/
// load data from .csv file asynchronously and render the various data visualizations
d3.csv('data/national_health_data.csv')
  .then(_data => {
  	console.log('Data loading complete. Working with the following dataset:', _data);
  	data = _data;

    data.forEach(d => {
      Object.keys(d).forEach(key => {
        const NUMERIC_VALUE = +d[key];
        if (isNaN(NUMERIC_VALUE)) {
          return;   // if the attribute in question can't be converted into a numeric representation (i.e. a string name)
        }

        d[key] = +d[key];   // Convert the value of each attribute to numeric
      });
    });

    populateComboBoxes(data); // calls function to populate the axis combo boxes with data attributes

    // call functions to create instances of the various data visualization classes (histogram, scatterplot, etc)
    createScatterplot(data);
    createLinechart(data);
    createHistograms(data);

    createAccordionMenu(data);      // calls function which creates the accordion menu and populates values

    createCurrVisButtonCallback();  // calls function to register the button callback for toggling which data visualization is currently displayed
    toggleCurrentVisualization();   // call function which initially toggles which data visualization is currently displayed
})
.catch(error => {
    console.error('Error initializing data visualizations:\n', error);
});

/**
 * Event listener: use color legend as filter
 */
d3.selectAll('.legend-btn').on('click', function() {
  // Toggle 'inactive' class
  d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
  
  // Check which categories are active
  let selectedUrbanRuralStatus = [];
  d3.selectAll('.legend-btn:not(.inactive)').each(function() {
    selectedUrbanRuralStatus.push(d3.select(this).attr('urban_rural_status'));
  });

  // Filter data accordingly and update vis
  scatterplot.data = data.filter(d => selectedUrbanRuralStatus.includes(d.urban_rural_status));
  scatterplot.updateVis();
});