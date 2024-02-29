class Histogram {

  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 500,
      margin: { top: 10, bottom: 50, right: 10, left: 50 }
    }

    this.data = _data;
    this.initVis();
  }

  initVis() {
    let vis = this;   // saves reference to the class to a locally-scoped variable

    // Filter out data points with values of -1
    let filteredDisplayData = vis.data.filter(d => d[selectedXAxis] !== -1 && d[selectedYAxis] !== -1);
    
    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales
    vis.xScale = d3.scaleLinear()
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    // append the svg object to the body of the page
    const svg = d3.select("#histogram")
      .append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height)
      .append("g")
        .attr("transform", `translate(${vis.config.margin.left},${0 - vis.config.margin.bottom})`);

    // X axis: scale and draw:
    const x = d3.scaleLinear()
      .domain([0, d3.max(filteredDisplayData, function(d) {return +d[selectedXAxis]})])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, vis.width]);
    svg.append("g")
      .attr("transform", `translate(0, ${vis.height})`)
      .call(d3.axisBottom(x));
    svg.append("text")
      .attr("class", "axis-title")
      .attr("text-anchor", "middle")
      .attr("x", vis.width / 2)
      .attr("y", vis.height + vis.config.margin.bottom)
      .text(selectedXAxis.replaceAll("_", " ").toUpperCase());
      
    // set the parameters for the histogram
    vis.histogram = d3.histogram()
      .value(function(d) { return +d[selectedXAxis]; })
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(200)); // then the numbers of bins

    // And apply this function to data to get the bins
    vis.bins = vis.histogram(filteredDisplayData);

    // Y axis: scale and draw:
    const y = d3.scaleLinear()
      .range([vis.height, 0]);
      y.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
      .call(d3.axisLeft(y));
    svg.append("text")
      .attr("class", "axis-title")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.height / 2)
      .attr("y", -vis.config.margin.left + 20)
      .text("Frequency");

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
      .data(vis.bins)
      .join("rect")
      .attr("x", 1)
      .attr("transform", function(d) { return `translate(${x(d.x0)} , ${y(d.length)})`})
      //.attr("width", function(d) { return x(d.x1) - x(d.x0) - 1})
      .attr("width", function(d) { return x(d.x1) - x(d.x0)})
      .attr("height", function(d) { return vis.height - y(d.length); })
      .style("fill", "#69b3a2")
  }

  updateVis() { 
    // This method was originally planned to update the visualization (as the others do), but development was abandoned fairly early on.

    /*
    // Clear existing visualization
    d3.selectAll("#histogram svg").remove();

    // Reinitialize the visualization
    vis.initVis();
    */

    /*
    // set the parameters for the histogram
    vis.histogram = d3.histogram()
      .value(function(d) { return +d[selectedXAxis]; })
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(100)); // then the numbers of bins

    // And apply this function to data to get the bins
    vis.bins = vis.histogram(filteredDisplayData);

    // Y axis: scale and draw:
    const y = d3.scaleLinear()
      .range([vis.height, 0]);
      y.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
      .call(d3.axisLeft(y));
    svg.append("text")
      .attr("class", "axis-title")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.height / 2)
      .attr("y", -vis.config.margin.left)
      .text("Frequency");

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
      .data(vis.bins)
      .join("rect")
        .attr("x", 1)
    .attr("transform", function(d) { return `translate(${x(d.x0)} , ${y(d.length)})`})
      //.attr("width", function(d) { return x(d.x1) - x(d.x0) - 1})
      .attr("width", function(d) { return x(d.x1) - x(d.x0)})
      .attr("height", function(d) { return vis.height - y(d.length); })
      .style("fill", "#69b3a2")
    */
   
    this.renderVis(); 

  }

  renderVis() { 
    //leave this empty for now...
  }
}