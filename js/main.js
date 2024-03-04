/* Script-level (global) variables */
let geoData, healthData;
let scatterplot, linechart, histogram1, histogram2, choropleth1, choropleth2;
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
function createScatterplot(gData) {
  scatterplot = new Scatterplot({
    'parentElement': '#scatterplot',
  }, gData);

  scatterplot.updateVis();
}

// Function for creating a D3 line chart
function createLinechart(gData) {
  linechart = new LineChart({
    'parentElement': '#linechart',
  }, gData);

  linechart.updateVis();
}

// Function for creating D3 histograms
function createHistograms(gData) {
  // dependent variable
  histogram1 = new Histogram1({
    'parentElement': '#histogram1',
  }, gData);

  // independent variable
  histogram2 = new Histogram2({
    'parentElement': '#histogram2',
  }, gData);
}

// Function for creating D3 choropleth maps
function createChoroplethMaps(cData) {
  // dependent variable
  const deepCopySelectedYAxis = JSON.parse(JSON.stringify(selectedYAxis));
  choropleth1 = new ChoroplethMap({
    'parentElement': '#choropleth1',
  }, cData, deepCopySelectedYAxis);

  // independent variable
  const deepCopySelectedXAxis = JSON.parse(JSON.stringify(selectedXAxis));
  choropleth2 = new ChoroplethMap({
    'parentElement': '#choropleth2',
  }, cData, deepCopySelectedXAxis);
}

function createCurrVisButtonCallback() {
  const scatterplotDiv = document.getElementById("scatterplot-container");
  const histogramDiv = document.getElementById("histogram-container");
  const choroplethDiv = document.getElementById("choropleth-container");
  const linechartDiv = document.getElementById("linechart-container");

  toggleVisualizationButton.addEventListener("click", function() {
    // Toggle the display of scatterplot and line chart based on dataVisualizationNumber
    if (currVisNumber === 1) {
      scatterplotDiv.style.display = "block"; // enabled
      linechartDiv.style.display = "none";    // disabled
      histogramDiv.style.display = "none";    // disabled
      choroplethDiv.style.display = "none";   // disabled
      currVisNumber = 2;
    }
    else if (currVisNumber == 2) {
      scatterplotDiv.style.display = "none";  // disabled
      linechartDiv.style.display = "none";    // disabled
      histogramDiv.style.display = "block";   // enabled
      choroplethDiv.style.display = "none";   // disabled
      currVisNumber = 3;
    }
    else if (currVisNumber == 3) {
      scatterplotDiv.style.display = "none";  // disabled
      linechartDiv.style.display = "none";    // disabled
      histogramDiv.style.display = "none";    // enabled
      choroplethDiv.style.display = "block";  // disabled
      currVisNumber = 4;
    }
    else if (currVisNumber == 4) {
      scatterplotDiv.style.display = "none";  // disabled
      linechartDiv.style.display = "block";   // enabled
      histogramDiv.style.display = "none";    // disabled
      choroplethDiv.style.display = "none";   // disabled
      currVisNumber = 1;
    }
    else {
      // should never enter this state. If it does, we simply log message and reset currVisNumber
      currVisNumber = 1;
      console.lot("Error! Received invalid value of currVisNumber: ", currVisNumber);
    }

    updateVisualizations();
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
  switch (currVisNumber - 1) {
    case 1:
      scatterplot.updateVis();
      break;
    case 2:
      histogram1.updateVis();
      histogram2.updateVis();
      break;
    case 3:
      const deepCopySelectedYAxis = JSON.parse(JSON.stringify(selectedYAxis));
      const deepCopySelectedXAxis = JSON.parse(JSON.stringify(selectedXAxis));
      choropleth1.updateVis(deepCopySelectedYAxis);
      choropleth2.updateVis(deepCopySelectedXAxis);
      break;
    case 0: // need to handle the "wrap-around" case
    case 4:
      linechart.updateVis();
      break;
    default:
      console.log("No data visualizations updated. currVisNumber = ", currVisNumber)
      return;
  }
}

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
  scatterplot.data = healthData.filter(d => selectedUrbanRuralStatus.includes(d.urban_rural_status));
  scatterplot.updateVis();
});

/*
Script execution 'starts' here.
Technically, it starts at the top by creating the variables, and then instantiating the various function definitions.
But after 'discovering' all of the functions within this .js script, actual execution begins below.
*/
// load data from .csv file asynchronously and render the various data visualizations
Promise.all([
  d3.json("data/counties-10m.json"),
  d3.csv("data/national_health_data.csv"),
])
.then(_data => {
    console.log('Data loading complete. Working with the following dataset:', _data);
    geoData = _data[0];
    healthData = _data[1];

    // this dataset is used for the scatter plot, line chart, histograms, etc.
    healthData.forEach(d => {
      Object.keys(d).forEach(key => {
        const NUMERIC_VALUE = +d[key];
        if (isNaN(NUMERIC_VALUE)) {
          return;   // if the attribute in question can't be converted into a numeric representation (i.e. a string name)
        }

        d[key] = +d[key];   // Convert the value of each attribute to numeric
      });
    });

    // this dataset is used for the choropleth
    geoData.objects.counties.geometries.forEach(d => {
      for (let i = 0; i < healthData.length; i++) {
        if (d.id == healthData[i].cnty_fips) {
          d.properties.display_name = healthData[i].display_name.trim().replace(/"/g, '');
          d.properties.poverty_perc = +healthData[i].poverty_perc;
          d.properties.median_household_income = +healthData[i].median_household_income;
          d.properties.education_less_than_high_school_percent = +healthData[i].education_less_than_high_school_percent;
          d.properties.air_quality = +healthData[i].air_quality;
          d.properties.park_access = +healthData[i].park_access;
          d.properties.percent_inactive = +healthData[i].percent_inactive;
          d.properties.percent_smoking = +healthData[i].percent_smoking;
          d.properties.urban_rural_status = healthData[i].urban_rural_status;
          d.properties.elderly_percentage = +healthData[i].elderly_percentage;
          d.properties.number_of_hospitals = +healthData[i].number_of_hospitals;
          d.properties.number_of_primary_care_physicians = +healthData[i].number_of_primary_care_physicians;
          d.properties.percent_no_health_insurance = healthData[i].percent_no_health_insurance;
          d.properties.percent_high_blood_pressure = +healthData[i].percent_high_blood_pressure;
          d.properties.percent_coronary_heart_disease = +healthData[i].percent_coronary_heart_disease;
          d.properties.percent_stroke = +healthData[i].percent_stroke;
          d.properties.percent_high_cholesterol = +healthData[i].percent_high_cholesterol;
        }
      }
    });

    // after data has finished being loaded, we now begin execution & data visualization generation
    populateComboBoxes(healthData); // calls function to populate the axis combo boxes with data attributes

    // call functions to create instances of the various data visualization classes (histogram, scatterplot, etc)
    createScatterplot(healthData);
    createLinechart(healthData);
    createHistograms(healthData);
    createChoroplethMaps(geoData);  // choropleth maps use different dataset

    createAccordionMenu(healthData);      // calls function which creates the accordion menu and populates values

    createCurrVisButtonCallback();  // calls function to register the button callback for toggling which data visualization is currently displayed
    toggleCurrentVisualization();   // call function which initially toggles which data visualization is currently displayed
})
.catch(error => {
    console.error('Error parsing data files:\n', error);
});