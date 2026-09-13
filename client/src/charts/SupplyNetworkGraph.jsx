import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { formatEmissions } from '../utils/formatters';

const SupplyNetworkGraph = ({
  company = null,
  suppliers = [],
  activities = [],
  width = 900,
  height = 600,
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const actualWidth = containerRef.current.clientWidth || width;
    const actualHeight = height;

    d3.select(svgRef.current).selectAll('*').remove();

    // 1. Build Nodes and Links strictly from actual props data
    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    // Root Company Node
    const companyId = company?.id || 'company-root';
    const companyNode = {
      id: companyId,
      name: company?.name || 'Company',
      type: 'company',
      emissions: 0,
      radius: 28,
      color: '#10B981',
    };
    nodes.push(companyNode);
    nodeMap.set(companyId, companyNode);

    // Process Suppliers & Activities
    let totalCompanyEmissions = 0;

    suppliers.forEach((sup) => {
      const supId = `supplier-${sup._id || sup.supplierId || sup.name}`;
      const supEmissions = sup.totalEmissions || 0;
      totalCompanyEmissions += supEmissions;

      // Find activities for this supplier
      const supActivities = activities.filter((a) => {
        const aSupId = a.supplierId?._id || a.supplierId;
        return aSupId === (sup._id || sup.supplierId);
      });

      const supNode = {
        id: supId,
        name: sup.name,
        type: 'supplier',
        emissions: supEmissions,
        location: sup.location || 'N/A',
        activityCount: supActivities.length,
        radius: Math.max(14, Math.min(26, 14 + Math.sqrt(supEmissions))),
        color: '#06B6D4',
      };

      nodes.push(supNode);
      nodeMap.set(supId, supNode);

      // Link Company -> Supplier
      links.push({
        source: companyId,
        target: supId,
        value: Math.max(1, supEmissions),
      });

      // Materials linked to Supplier
      if (sup.materials && Array.isArray(sup.materials)) {
        sup.materials.forEach((mat) => {
          const matName = typeof mat === 'string' ? mat : mat.material;
          const matEmissions = typeof mat === 'object' ? mat.emissions || 0 : 0;
          const matId = `mat-${supId}-${matName}`;

          if (!nodeMap.has(matId)) {
            const matNode = {
              id: matId,
              name: matName,
              type: 'material',
              emissions: matEmissions,
              supplierName: sup.name,
              radius: Math.max(8, Math.min(18, 8 + Math.sqrt(matEmissions))),
              color: matName === 'Aluminium' ? '#34D399' : matName === 'Copper' ? '#F59E0B' : '#3B82F6',
            };
            nodes.push(matNode);
            nodeMap.set(matId, matNode);

            links.push({
              source: supId,
              target: matId,
              value: Math.max(1, matEmissions),
            });
          }
        });
      }
    });

    // Update company node total
    companyNode.emissions = totalCompanyEmissions;

    // SVG Container
    const svg = d3
      .select(svgRef.current)
      .attr('width', actualWidth)
      .attr('height', actualHeight)
      .attr('viewBox', [0, 0, actualWidth, actualHeight]);

    // Zoom container
    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Tooltip
    const tooltip = d3
      .select(containerRef.current)
      .selectAll('.network-tooltip')
      .data([0])
      .join('div')
      .attr('class', 'network-tooltip absolute hidden p-3 rounded-card bg-carbon-card border border-carbon-border text-xs text-text-primary shadow-2xl pointer-events-none z-20 font-mono');

    // Force Simulation setup
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id).distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(actualWidth / 2, actualHeight / 2))
      .force('collision', d3.forceCollide().radius((d) => d.radius + 15));

    // Render Links
    const link = g
      .append('g')
      .attr('stroke', '#232C3D')
      .attr('stroke-opacity', 0.8)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.max(1.5, Math.min(4, Math.sqrt(d.value))));

    // Render Nodes Group
    const node = g
      .append('g')
      .selectAll('.node-group')
      .data(nodes)
      .join('g')
      .attr('class', 'node-group')
      .style('cursor', 'grab')
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    // Circles
    node
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#0F131A')
      .attr('stroke-width', 2)
      .style('filter', (d) => d.type === 'company' ? 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' : 'none');

    // Node Labels
    node
      .append('text')
      .text((d) => d.name)
      .attr('x', 0)
      .attr('y', (d) => d.radius + 14)
      .attr('text-anchor', 'middle')
      .style('fill', '#F9FAFB')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('pointer-events', 'none');

    // Hover & Tooltip Events
    node
      .on('mouseover', function (event, d) {
        d3.select(this).select('circle').attr('stroke', '#F9FAFB').attr('stroke-width', 3);

        // Highlight connected links
        link
          .attr('stroke', (l) => (l.source.id === d.id || l.target.id === d.id ? '#10B981' : '#232C3D'))
          .attr('stroke-opacity', (l) => (l.source.id === d.id || l.target.id === d.id ? 1 : 0.2));

        let html = `<strong>${d.name}</strong> (${d.type.toUpperCase()})<br/>`;
        if (d.emissions > 0) {
          html += `Emissions: <span style="color:#10B981;font-weight:bold;">${formatEmissions(d.emissions)}</span><br/>`;
        }
        if (d.location) html += `Location: ${d.location}<br/>`;
        if (d.activityCount !== undefined) html += `Activities: ${d.activityCount}<br/>`;
        if (d.supplierName) html += `Supplier: ${d.supplierName}<br/>`;

        tooltip.style('display', 'block').html(html);
      })
      .on('mousemove', function (event) {
        const [x, y] = d3.pointer(event, containerRef.current);
        tooltip.style('left', `${x + 15}px`).style('top', `${y - 15}px`);
      })
      .on('mouseout', function () {
        d3.select(this).select('circle').attr('stroke', '#0F131A').attr('stroke-width', 2);
        link.attr('stroke', '#232C3D').attr('stroke-opacity', 0.8);
        tooltip.style('display', 'none');
      });

    // Simulation Ticks
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Drag handlers
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, [company, suppliers, activities, width, height]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px] bg-carbon-surface/60 rounded-card border border-carbon-border overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 text-xs font-mono bg-carbon-card/90 px-3 py-2 rounded-btn border border-carbon-border backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-text-secondary">Company Node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-text-secondary">Supplier Node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-status-warning" />
          <span className="text-text-secondary">Material Node</span>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full cursor-move" />
    </div>
  );
};

export default SupplyNetworkGraph;
