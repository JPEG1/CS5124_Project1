class Scatterplot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {top: 30, right: 20, bottom: 20, left: 55},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;   // saves reference to the class to a locally-scoped variable

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales
    vis.colorScale = d3.scaleOrdinal()
        .range([RURAL_COLOR, SUBURBAN_COLOR, SMALL_CITY_COLOR, URBAN_COLOR])  // grabs colors from the 'globals.js' script
        .domain(['Rural','Suburban','Small City', 'Urban']);

    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

    // Initialize axes
    // X axis
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(8)
        .tickSize(-vis.height - 10)
        .tickPadding(10)
        .tickFormat(d => TooltipData.pre_x_unit + d + TooltipData.post_x_unit);

    // Y axis
    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(8)
        .tickSize(-vis.width - 10)
        .tickPadding(10)
        .tickFormat(d => TooltipData.pre_y_unit + d + TooltipData.post_y_unit);
    
    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis')

    // Append both axis titles
    vis.chart.append('text')
        .attr('class', 'x-axis-title')
        .attr('y', vis.height - 15)
        .attr('x', vis.width + 10)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(selectedXAxis.replaceAll("_", " ").toUpperCase());

    vis.svg.append('text')
        .attr('class', 'y-axis-title')
        .attr('x', 0)
        .attr('y', 5)
        .attr('dy', '.71em')
        .text(selectedYAxis.replaceAll("_", " ").toUpperCase());
        
    // Specificy accessor functions
    vis.colorValue = d => d.urban_rural_status;
    vis.xValue = d => d[selectedXAxis];
    vis.yValue = d => d[selectedYAxis];
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    
    // Filter out data points with values of -1
    let filteredDisplayData = vis.data.filter(d => d[selectedXAxis] !== -1 && d[selectedYAxis] !== -1);

    // Filter data based on active states (accordion menu)
    filteredDisplayData = filteredDisplayData.filter(d => {

      // Extract state abbreviation from the 'display_name' attribute
      let index = d.display_name.indexOf("(");
      let stateAbbreviation = d.display_name.substring(index + 1, index + 3);

      // Check if the state abbreviation exists in the global list of state abbreviations
      return lstActiveStates.includes(stateAbbreviation);
    });

    this.createTooltipContent(vis.data[0], TooltipData);  // we can simply pass the first entry as they're all going to be the same type

    // Add some data padding to the scales, so that the data is more centered
    const PADDING_PERCENTAGE = 0.1    // currently, set to 10% padding (so both X & Y axes are extended 10% past the largest data point)
    let xScalePaddingPerc = d3.max(filteredDisplayData, vis.xValue) * PADDING_PERCENTAGE
    let yScalePaddingPerc = d3.max(filteredDisplayData, vis.yValue) * PADDING_PERCENTAGE
    let xScaleMaxWithPadding = Number(d3.max(filteredDisplayData, vis.xValue)) + xScalePaddingPerc
    let yScaleMaxWithPadding = Number(d3.max(filteredDisplayData, vis.yValue)) + yScalePaddingPerc

    // Set the scale input domains based on filtered data and adjusted data padding
    vis.xScale.domain([0, xScaleMaxWithPadding]);
    vis.yScale.domain([0, yScaleMaxWithPadding]);

    // Update axis titles
    vis.chart.select('.x-axis-title').text(selectedXAxis.replaceAll("_", " ").toUpperCase());
    vis.svg.select('.y-axis-title').text(selectedYAxis.replaceAll("_", " ").toUpperCase());

    // Add circles
    vis.circles = vis.chart.selectAll('.point')
        .data(filteredDisplayData, d => d.display_name)
      .join('circle')
        .attr('class', 'point')
        .attr('r', 4)
        .attr('cy', d => vis.yScale(vis.yValue(d)))
        .attr('cx', d => vis.xScale(vis.xValue(d)))
        .attr('fill', d => vis.colorScale(vis.colorValue(d)));

    // Tooltip event listeners
    vis.circles
        .on('mouseover', (event,d) => {

          // now attach the actual creation of the tooltip
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-title">${d.display_name}</div>
              <div><i>${+d.cnty_fips}</i></div>
              <ul>
                <li>${TooltipData.xName}: ${TooltipData.pre_x_unit}${d[selectedXAxis]}${TooltipData.post_x_unit}</li>
                <li>${TooltipData.yName}: ${TooltipData.pre_y_unit}${d[selectedYAxis]}${TooltipData.post_y_unit}</li>
              </ul>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });
    
    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
        .call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG
        .call(vis.yAxis)
        .call(g => g.select('.domain').remove())
  }

  // Helper function that gets all data required for dynamically creating the tooltips.
  //  The whole 'TooltipData' class implementation took FOREVER to draw up... but I quite like how dynamic and robust it is.
  createTooltipContent(d) {  
    if (d == undefined) {
      return; // this way, we don't attempt to create a tooltip with no data present
    }

    TooltipData.clear() // reset or clear TooltipData's values
    
    let lst = Object.keys(d);
    let xInd = lst.indexOf(selectedXAxis)
    let yInd = lst.indexOf(selectedYAxis)
    TooltipData.xName = lst[xInd];
    TooltipData.yName = lst[yInd];

    // xName
    if (TooltipData.xName.includes("perc")) { TooltipData.post_x_unit = "%"; }
    else if (TooltipData.xName.includes("income")) { TooltipData.pre_x_unit = "$"; }

    // yName
    if (TooltipData.yName.includes("perc")) { TooltipData.post_y_unit = "%"; }
    else if (TooltipData.yName.includes("income")) { TooltipData.pre_y_unit = "$"; }
  }
}