import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { formatEmissions } from '../utils/formatters';

const ScopeDonut = ({ totals = { total: 0, scope1: 0, scope2: 0, scope3: 0 } }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 320;
    const height = 280;
    const radius = Math.min(width, height) / 2 - 20;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const data = [
      { label: 'Scope 1', value: totals.scope1 || 0, color: '#F59E0B', scope: 1 },
      { label: 'Scope 2', value: totals.scope2 || 0, color: '#06B6D4', scope: 2 },
      { label: 'Scope 3', value: totals.scope3 || 0, color: '#10B981', scope: 3 },
    ].filter((d) => d.value > 0);

    // If zero total, render placeholder ring
    if (data.length === 0 || totals.total === 0) {
      const arc = d3.arc().innerRadius(radius - 28).outerRadius(radius);
      svg.append('path')
        .datum({ startAngle: 0, endAngle: 2 * Math.PI })
        .style('fill', '#232C3D')
        .attr('d', arc);

      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.2em')
        .style('fill', '#9CA3AF')
        .style('font-size', '12px')
        .text('No Emissions');

      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .style('fill', '#6B7280')
        .style('font-size', '14px')
        .style('font-family', 'monospace')
        .text('0.00 tCO2e');
      return;
    }

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc()
      .innerRadius(radius - 32)
      .outerRadius(radius)
      .cornerRadius(4);

    const hoverArc = d3
      .arc()
      .innerRadius(radius - 36)
      .outerRadius(radius + 4)
      .cornerRadius(4);

    const tooltip = d3
      .select(containerRef.current)
      .selectAll('.donut-tooltip')
      .data([0])
      .join('div')
      .attr('class', 'donut-tooltip absolute hidden p-2 rounded bg-carbon-surface border border-carbon-border text-xs text-text-primary shadow-lg pointer-events-none z-10 font-mono');

    // Draw Slices
    const arcs = svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#0F131A')
      .style('stroke-width', '2px')
      .style('cursor', 'pointer')
      .transition()
      .duration(750)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t));
        };
      });

    arcs.selectAll('path')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc);

        const pct = ((d.data.value / totals.total) * 100).toFixed(1);
        tooltip
          .style('display', 'block')
          .html(`<strong>${d.data.label}</strong><br/>${formatEmissions(d.data.value)} (${pct}%)`);
      })
      .on('mousemove', function (event) {
        const [x, y] = d3.pointer(event, containerRef.current);
        tooltip
          .style('left', `${x + 12}px`)
          .style('top', `${y - 20}px`);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);

        tooltip.style('display', 'none');
      });

    // Center Text: Total Emissions
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.4em')
      .style('fill', '#9CA3AF')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .text('TOTAL FOOTPRINT');

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.9em')
      .style('fill', '#F9FAFB')
      .style('font-size', '16px')
      .style('font-weight', '800')
      .style('font-family', 'monospace')
      .text(formatEmissions(totals.total));

  }, [totals]);

  return (
    <div ref={containerRef} className="relative w-full flex flex-col items-center">
      <svg ref={svgRef} className="overflow-visible" />
      {/* Scope Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-scope-1" />
          <span className="text-text-secondary">Scope 1 ({formatEmissions(totals.scope1)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-scope-2" />
          <span className="text-text-secondary">Scope 2 ({formatEmissions(totals.scope2)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-scope-3" />
          <span className="text-text-secondary">Scope 3 ({formatEmissions(totals.scope3)})</span>
        </div>
      </div>
    </div>
  );
};

export default ScopeDonut;
