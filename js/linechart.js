class LineChart {

    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 500,
            margin: { top: 30, bottom: 30, right: 10, left: 30 }
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this; // saves reference to the class to a locally-scoped

        // Filter out data points with values of -1
        let filteredDisplayData = vis.data.filter(d => d.percent_inactive !== -1 && d.percent_no_health_insurance !== -1);

        // Filter data based on active states (accordion menu)
        filteredDisplayData = filteredDisplayData.filter(d => {

            // Extract state abbreviation from the 'display_name' attribute
            let index = d.display_name.indexOf("(");
            let stateAbbreviation = d.display_name.substring(index + 1, index + 3);
    
            // Check if the state abbreviation exists in the global list of state abbreviations
            return lstActiveStates.includes(stateAbbreviation);
        });

        // Width and height as the inner dimensions of the chart area- as before
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.xScale = d3.scaleLinear()
            .domain([0, d3.max(filteredDisplayData, d => d[selectedXAxis])])
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredDisplayData, d => d[selectedYAxis])])
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(8)
            .tickSize(-vis.height - 10)       // NOTE: Uncomment this to add vertical gridlines back in
            .tickPadding(10)
            .tickFormat(d => TooltipData.pre_x_unit + d + TooltipData.post_x_unit);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(8)
            .tickSize(-vis.width - 10)        // NOTE: Uncomment this to add horizontal gridlines back in
            .tickPadding(5)
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
            .attr('class', 'axis y-axis');

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

        // Add the line
        vis.chart.append("path")
            .datum(filteredDisplayData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => vis.xScale(d[selectedXAxis]))
                .y(d => vis.yScale(d[selectedYAxis]))
            );

        // Call the axes
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }

    updateVis() {
        let vis = this; 
    
        // Filter out data points with values of -1
        let filteredDisplayData = vis.data.filter(d => d[selectedXAxis] !== -1 && d[selectedYAxis] !== -1);
    
        // Filter data based on active states
        filteredDisplayData = filteredDisplayData.filter(d => {
            let index = d.display_name.indexOf("(");
            let stateAbbreviation = d.display_name.substring(index + 1, index + 3);
            return lstActiveStates.includes(stateAbbreviation);
        });
    
        // Update the domain of scales
        vis.xScale.domain([0, d3.max(filteredDisplayData, d => d[selectedXAxis])]);
        vis.yScale.domain([0, d3.max(filteredDisplayData, d => d[selectedYAxis])]);

        // Update axis titles
        vis.chart.select('.x-axis-title').text(selectedXAxis.replaceAll("_", " ").toUpperCase());
        vis.svg.select('.y-axis-title').text(selectedYAxis.replaceAll("_", " ").toUpperCase());
    
        // Select the existing line and update its data
        vis.chart.selectAll("path").remove();   // firstly, remove existing line (so it can be replaced or updated)
        vis.chart.append("path")
            .datum(filteredDisplayData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => vis.xScale(d[selectedXAxis]))
                .y(d => vis.yScale(d[selectedYAxis]))
            );
    
        // Update the axes
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);

        this.renderVis();
    }

    renderVis() {
        //leave this empty for now...
    }
}