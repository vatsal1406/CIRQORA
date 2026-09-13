import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { formatEmissions } from '../utils/formatters';

const Scope3BarChart = ({ categories = [] }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const margin = { top: 10, right: 30, bottom: 30, left: 160 };
    const width = (containerRef.current.clientWidth || 400) - margin.left - margin.right;
    const height = Math.max(160, categories.length * 36) - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (!categories || categories.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('fill', '#9CA3AF')
        .style('font-size', '12px')
        .text('No Scope 3 category data recorded');
      return;
    }

    const y = d3
      .scaleBand()
      .range([0, height])
      .domain(categories.map((d) => d.name))
      .padding(0.25);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(categories, (d) => d.emissions) * 1.15 || 10])
      .range([0, width]);

    // Y Axis
    svg
      .append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll('text')
      .style('fill', '#9CA3AF')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .style('font-family', 'sans-serif');

    svg.selectAll('.domain').remove();

    // Bars
    svg
      .selectAll('.bar')
      .data(categories)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.name))
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('rx', 4)
      .style('fill', '#10B981')
      .attr('width', 0)
      .transition()
      .duration(750)
      .attr('width', (d) => x(d.emissions));

    // Value Labels
    svg
      .selectAll('.label')
      .data(categories)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('y', (d) => y(d.name) + y.bandwidth() / 2 + 4)
      .attr('x', (d) => x(d.emissions) + 8)
      .style('fill', '#F9FAFB')
      .style('font-size', '11px')
      .style('font-family', 'monospace')
      .style('font-weight', '600')
      .text((d) => formatEmissions(d.emissions));

  }, [categories]);

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <svg ref={svgRef} className="overflow-visible" />
    </div>
  );
};

export default Scope3BarChart;
