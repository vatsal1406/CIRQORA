import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { formatEmissions } from '../utils/formatters';

const MaterialEmissionChart = ({ materialEmissions = [] }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 360;

    // Determine bottom margin based on label length & rotation requirements
    const maxLabelLen = d3.max(materialEmissions, (d) => (d.material || '').length) || 8;
    const isRotated = maxLabelLen > 7 || materialEmissions.length > 4;
    const marginBottom = isRotated ? Math.min(90, Math.max(65, maxLabelLen * 5.5 + 20)) : 45;

    const margin = { top: 25, right: 25, bottom: marginBottom, left: 50 };
    const width = Math.max(200, containerWidth - margin.left - margin.right);
    const height = 240 - margin.top - margin.bottom;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Handle empty state
    if (!materialEmissions || materialEmissions.length === 0) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('fill', '#9CA3AF')
        .style('font-size', '12px')
        .text('No material emissions recorded');
      return;
    }

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(materialEmissions.map((d) => d.material))
      .padding(0.35);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(materialEmissions, (d) => d.emissions) * 1.2 || 10])
      .range([height, 0]);

    // Color palette for materials
    const palette = ['#34D399', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#06B6D4', '#10B981', '#F97316', '#6366F1'];
    const colorScale = d3.scaleOrdinal().domain(materialEmissions.map(d => d.material)).range(palette);

    // Tooltip setup
    const tooltip = d3
      .select(containerRef.current)
      .selectAll('.chart-tooltip')
      .data([0])
      .join('div')
      .attr(
        'class',
        'chart-tooltip absolute hidden p-3 rounded-card bg-carbon-surface/95 backdrop-blur-md border border-carbon-border text-xs text-text-primary shadow-xl pointer-events-none z-30 font-sans min-w-[140px]'
      );

    // X Axis with optional label rotation to prevent overlap
    const xAxisG = svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0));

    const xLabels = xAxisG.selectAll('text')
      .style('fill', '#F9FAFB')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('font-family', 'sans-serif');

    if (isRotated) {
      xLabels
        .attr('transform', 'rotate(-35)')
        .style('text-anchor', 'end')
        .attr('dx', '-0.6em')
        .attr('dy', '0.2em');
    } else {
      xLabels
        .style('text-anchor', 'middle')
        .attr('dy', '1em');
    }

    xLabels.append('title').text((d) => d);

    // Y Axis
    svg
      .append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-width))
      .selectAll('text')
      .style('fill', '#9CA3AF')
      .style('font-size', '10px');

    svg.selectAll('.domain').remove();
    svg.selectAll('.tick line').style('stroke', '#232C3D').style('stroke-dasharray', '2,2');

    // State for pinned tooltip on click/tap
    let pinnedDatum = null;

    const updateTooltipPosition = (event) => {
      const [posX, posY] = d3.pointer(event, containerRef.current);
      const tooltipWidth = 150;
      const leftPos = Math.max(10, Math.min(posX + 12, containerWidth - tooltipWidth - 10));
      const topPos = Math.max(10, posY - 55);

      tooltip
        .style('left', `${leftPos}px`)
        .style('top', `${topPos}px`);
    };

    const showTooltip = (d) => {
      tooltip
        .style('display', 'block')
        .html(
          `<div class="border-b border-carbon-border/60 pb-1 mb-1">` +
          `<span class="text-[10px] font-mono uppercase text-text-muted block">Material</span>` +
          `<strong class="text-xs font-bold text-text-primary block">${d.material}</strong>` +
          `</div>` +
          `<div>` +
          `<span class="text-[10px] font-mono uppercase text-text-muted block">Emissions</span>` +
          `<span class="text-xs font-extrabold font-mono text-primary">${formatEmissions(d.emissions)}</span>` +
          `</div>`
        );
    };

    // Bars with tooltips (No permanent text labels above bars)
    const barGroups = svg
      .selectAll('.bar-group')
      .data(materialEmissions)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

    barGroups
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.material))
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('rx', 4)
      .style('fill', (d) => colorScale(d.material))
      .style('cursor', 'pointer')
      .transition()
      .duration(750)
      .attr('y', (d) => y(d.emissions))
      .attr('height', (d) => height - y(d.emissions));

    barGroups
      .selectAll('rect')
      .on('mouseover', function (event, d) {
        if (pinnedDatum) return;
        d3.select(this).style('opacity', 0.85).style('filter', 'brightness(1.15)');
        showTooltip(d);
        updateTooltipPosition(event);
      })
      .on('mousemove', function (event) {
        if (pinnedDatum) return;
        updateTooltipPosition(event);
      })
      .on('mouseout', function () {
        if (pinnedDatum) return;
        d3.select(this).style('opacity', 1).style('filter', 'none');
        tooltip.style('display', 'none');
      })
      .on('click', function (event, d) {
        event.stopPropagation();
        if (pinnedDatum === d) {
          pinnedDatum = null;
          svg.selectAll('.bar').style('opacity', 1).style('filter', 'none');
          tooltip.style('display', 'none');
        } else {
          pinnedDatum = d;
          svg.selectAll('.bar').style('opacity', 0.45).style('filter', 'none');
          d3.select(this).style('opacity', 1).style('filter', 'brightness(1.2)');
          showTooltip(d);
          updateTooltipPosition(event);
        }
      });

    // Dismiss pinned tooltip on outer container click
    const handleOuterClick = () => {
      pinnedDatum = null;
      svg.selectAll('.bar').style('opacity', 1).style('filter', 'none');
      tooltip.style('display', 'none');
    };
    d3.select(containerRef.current).on('click', handleOuterClick);

    // ResizeObserver for responsive resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth || 360;
      const computedW = Math.max(200, newWidth - margin.left - margin.right);
      x.range([0, computedW]);

      d3.select(svgRef.current)
        .attr('width', computedW + margin.left + margin.right);

      svg.selectAll('.bar')
        .attr('x', (d) => x(d.material))
        .attr('width', x.bandwidth());

      xAxisG.call(d3.axisBottom(x).tickSize(0));
      const updatedLabels = xAxisG.selectAll('text')
        .style('fill', '#F9FAFB')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('font-family', 'sans-serif');

      if (isRotated) {
        updatedLabels
          .attr('transform', 'rotate(-35)')
          .style('text-anchor', 'end')
          .attr('dx', '-0.6em')
          .attr('dy', '0.2em');
      } else {
        updatedLabels
          .style('text-anchor', 'middle')
          .attr('dy', '1em');
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };

  }, [materialEmissions]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-auto">
      <svg ref={svgRef} className="overflow-visible" />
    </div>
  );
};

export default MaterialEmissionChart;

