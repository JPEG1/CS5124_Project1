class ChoroplethMap {

    /**
     * Class constructor with basic configuration
     * @param {Object}
     * @param {Array}
     * @param {String}
     */
    constructor(_config, _data, _selectedProperty) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 700,
        containerHeight: _config.containerHeight || 550,
        margin: _config.margin || {top: 0, right: 0, bottom: 0, left: 0},
        tooltipPadding: _config.tooltipPadding || 15,
        legendBottom: 30,
        legendLeft: 50,
        legendRectHeight: 12, 
        legendRectWidth: 150
      }
      this.data = _data;
      this.selectedProperty = _selectedProperty;
      this.initVis();
    }
    
    /**
     * We initialize scales/axes and append static elements, such as axis titles.
     */
    initVis() {
        let vis = this;
    
        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
    
        // Append group element that will contain our actual chart and position it according to the given margin config
        vis.chart = vis.svg.append('g').attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top - 50})`);
    
        // Initialize projection and path generator
        vis.projection = d3.geoAlbersUsa();
        vis.geoPath = d3.geoPath().projection(vis.projection);
    
        vis.colorScale = d3.scaleLinear()
          //.range(['#cfe2f2', '#0d306b'])  // blue
          .range(['#d9ead3', '#005827'])    // green
          .interpolate(d3.interpolateHcl);
    
        // Initialize gradient that we will later use for the legend
        vis.linearGradient = vis.svg.append('defs').append('linearGradient')
          .attr("id", "legend-gradient");
    
        // Append legend
        vis.legend = vis.chart.append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${vis.config.legendLeft},${vis.height - vis.config.legendBottom})`);
        
        vis.legendRect = vis.legend.append('rect')
          .attr('width', vis.config.legendRectWidth)
          .attr('height', vis.config.legendRectHeight);
    
        vis.legendTitle = vis.legend.append('text')
          .attr('class', 'legend-title')
          .attr('dy', '.35em')
          .attr('y', -10)
          .text(vis.selectedProperty.replaceAll("_", " ").toUpperCase());
    
        vis.updateVis(vis.selectedProperty);  // not needed?
    }
  
    updateVis(_selectedProperty) {
        let vis = this;

        vis.selectedProperty = _selectedProperty;

        // Filter out data points with values of -1
        let filteredDisplayData = vis.data.objects.counties.geometries.filter(d => d.properties[selectedXAxis] !== -1 && d.properties[selectedYAxis] !== -1);

        // Update the data extent
        const dataExtent = d3.extent(filteredDisplayData, d => d.properties[vis.selectedProperty]);

        // Update color scale
        vis.colorScale.domain(dataExtent);
    
        // Define begin and end of the color gradient (legend)
        vis.legendStops = [
            //{ color: '#cfe2f2', value: dataExtent[0], offset: 0},     // blue
            //{ color: '#0d306b', value: dataExtent[1], offset: 100},   // blue
            { color: '#d9ead3', value: dataExtent[0], offset: 0},       // green
            { color: '#005827', value: dataExtent[1], offset: 100},     // green
        ];
    
        vis.renderVis();
    }
  
    renderVis() {
      let vis = this;
  
      // Convert compressed TopoJSON to GeoJSON format
      const countries = topojson.feature(vis.data, vis.data.objects.counties);
  
      // Defines the scale of the projection so that the geometry fits within the SVG area
      vis.projection.fitSize([vis.width - 100, vis.height - 50], countries);
  
      // Append world map
      const countryPath = vis.chart.selectAll('.country')
          .data(countries.features)
        .join('path')
          .attr('class', 'country')
          .attr('d', vis.geoPath)
          .attr('fill', d => {
            if (d.properties[vis.selectedProperty]) {
              return vis.colorScale(d.properties[vis.selectedProperty]);
            } else {
              return 'url(#lightstripe)';
            }
          });
  
      countryPath
          .on('mousemove', (event,d) => {
            const selectedData = d.properties[vis.selectedProperty] ? `<strong>${TooltipData.pre_y_unit}${d.properties[vis.selectedProperty]}${TooltipData.post_y_unit}</strong>` : 'No data available'; 
            d3.select('#choropleth-tooltip')
              .style('display', 'block')
              .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
              .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
              .html(`
                <div class="tooltip-title">${d.properties.name}</div>
                <div>${selectedData}</div>
              `);
          })
          .on('mouseleave', () => {
            d3.select('#choropleth-tooltip').style('display', 'none')
          })
          .on('mouseover', function(event, d) {
            // Highlight the county being hovered over
            d3.select(this).attr('fill', 'orange');
          })
          .on('mouseout', function(event, d) {
            // Restore the original fill color when the mouse leaves
            d3.select(this).attr('fill', d => {
              if (d.properties[vis.selectedProperty]) {
                return vis.colorScale(d.properties[vis.selectedProperty]);
              } else {
                return 'url(#lightstripe)';
              }
            })
          });
  
      // Add legend labels
      vis.legend.selectAll('.legend-label')
          .data(vis.legendStops)
        .join('text')
          .attr('class', 'legend-label')
          .attr('text-anchor', 'middle')
          .attr('dy', '.35em')
          .attr('y', 20)
          .attr('x', (d, index) => {
            return index == 0 ? 0 : vis.config.legendRectWidth;
          })
          .text(d => {
            var val = Math.round(d.value * 10 ) / 10;
            return `${TooltipData.pre_x_unit}${val}${TooltipData.post_x_unit}`;
          });
            
      // Clear existing legend title
      vis.legend.selectAll(".legend-title").remove();

      vis.legendTitle = vis.legend.append('text')
        .attr('class', 'legend-title')
        .attr('dy', '.35em')
        .attr('y', -10)
        .text(vis.selectedProperty.replaceAll("_", " ").toUpperCase());
  
      // Update gradient for legend
      vis.linearGradient.selectAll('stop')
          .data(vis.legendStops)
        .join('stop')
          .attr('offset', d => d.offset)
          .attr('stop-color', d => d.color);
  
      vis.legendRect.attr('fill', 'url(#legend-gradient)');
    }
  }