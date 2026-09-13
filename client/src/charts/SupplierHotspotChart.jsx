import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { formatEmissions } from '../utils/formatters';

const SupplierHotspotChart = ({ supplierEmissions = [] }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 400;

    // Calculate dynamic left margin based on the longest supplier name
    const maxNameLen = d3.max(supplierEmissions, (d) => (d.name || '').length) || 12;
    const dynamicLeft = Math.max(160, Math.min(260, maxNameLen * 8.5 + 20));

    // Reserve 80px on the right for emission value text (e.g. "12.5075 tCO2e")
    const margin = { top: 25, right: 80, bottom: 30, left: dynamicLeft };
    const width = Math.max(200, containerWidth - margin.left - margin.right);
    const rowHeight = 40;
    const height = Math.max(160, supplierEmissions.length * rowHeight);

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Handle empty data state
    if (!supplierEmissions || supplierEmissions.length === 0) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('fill', '#9CA3AF')
        .style('font-size', '12px')
        .text('No supplier activity recorded yet');
      return;
    }

    const y = d3
      .scaleBand()
      .range([0, height])
      .domain(supplierEmissions.map((d) => d.name))
      .padding(0.3);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(supplierEmissions, (d) => d.totalEmissions) * 1.15 || 10])
      .range([0, width]);

    // Create container tooltip
    const tooltip = d3
      .select(containerRef.current)
      .selectAll('.chart-tooltip')
      .data([0])
      .join('div')
      .attr(
        'class',
        'chart-tooltip absolute hidden p-2.5 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary shadow-lg pointer-events-none z-20 font-mono space-y-1'
      );

    // Render Y Axis (Supplier Names)
    const yAxis = svg
      .append('g')
      .call(d3.axisLeft(y).tickSize(0));

    yAxis
      .selectAll('text')
      .style('fill', '#F9FAFB')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('font-family', 'sans-serif')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .text((d) => (d.length > 30 ? d.slice(0, 27) + '...' : d))
      .append('title')
      .text((d) => d);

    svg.selectAll('.domain').remove();

    // Render Horizontal Bars
    const bars = svg
      .selectAll('.bar-group')
      .data(supplierEmissions)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

    bars
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.name))
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('rx', 4)
      .style('fill', (d, i) => (i === 0 ? '#F59E0B' : '#06B6D4'))
      .style('cursor', 'pointer')
      .attr('width', 0)
      .transition()
      .duration(750)
      .attr('width', (d) => x(d.totalEmissions));

    // Interactive Bar Tooltip Handlers
    bars
      .selectAll('rect')
      .on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 0.85);
        tooltip
          .style('display', 'block')
          .html(
            `<div><strong className="text-text-primary">${d.name}</strong></div>` +
            `<div className="text-text-secondary">Footprint: <span className="text-primary font-bold">${formatEmissions(d.totalEmissions)}</span></div>` +
            (d.materials && d.materials.length > 0
              ? `<div className="text-[11px] text-text-muted mt-1">Materials: ${d.materials.map(m => `${m.material} (${formatEmissions(m.emissions)})`).join(', ')}</div>`
              : '')
          );
      })
      .on('mousemove', function (event) {
        const [posX, posY] = d3.pointer(event, containerRef.current);
        tooltip
          .style('left', `${Math.min(posX + 15, containerWidth - 180)}px`)
          .style('top', `${posY - 10}px`);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);
        tooltip.style('display', 'none');
      });

    // Render Value Labels at Bar Ends
    svg
      .selectAll('.label')
      .data(supplierEmissions)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('y', (d) => y(d.name) + y.bandwidth() / 2 + 4)
      .attr('x', (d) => x(d.totalEmissions) + 8)
      .style('fill', '#34D399')
      .style('font-size', '11px')
      .style('font-family', 'monospace')
      .style('font-weight', '700')
      .text((d) => formatEmissions(d.totalEmissions));

    // ResizeObserver for dynamic responsiveness
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth || 400;
      const computedW = Math.max(200, newWidth - margin.left - margin.right);
      x.range([0, computedW]);

      d3.select(svgRef.current)
        .attr('width', computedW + margin.left + margin.right);

      svg.selectAll('.bar')
        .attr('width', (d) => x(d.totalEmissions));

      svg.selectAll('.label')
        .attr('x', (d) => x(d.totalEmissions) + 8);
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };

  }, [supplierEmissions]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-auto">
      <svg ref={svgRef} className="overflow-visible" />
    </div>
  );
};

export default SupplierHotspotChart;
