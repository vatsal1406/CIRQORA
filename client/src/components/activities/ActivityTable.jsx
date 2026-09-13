import React from 'react';
import DataTable from '../common/DataTable';
import Badge from '../common/Badge';
import { formatDate, formatEmissions, formatNumber } from '../../utils/formatters';

const ActivityTable = ({ activities = [], onSelectActivity }) => {
  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-text-secondary">
          {formatDate(row.date)}
        </span>
      ),
    },
    {
      header: 'Activity Type',
      accessor: 'activityType',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-text-primary capitalize">
          {row.activityType?.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Material',
      accessor: 'material',
      sortable: true,
      render: (row) => (
        row.material ? (
          <Badge variant="outline" size="sm">
            {row.material}
          </Badge>
        ) : (
          <span className="text-text-muted text-xs">—</span>
        )
      ),
    },
    {
      header: 'Supplier',
      accessor: 'supplier',
      render: (row) => (
        row.supplierId ? (
          <span className="font-medium text-secondary">
            {row.supplierId.name || row.supplierId}
          </span>
        ) : (
          <span className="text-text-muted text-xs">No Supplier</span>
        )
      ),
    },
    {
      header: 'Scope',
      accessor: 'scope',
      sortable: true,
      render: (row) => (
        <Badge scope={row.scope} size="sm">
          Scope {row.scope}
        </Badge>
      ),
    },
    {
      header: 'Scope 3 Category',
      accessor: 'scope3Category',
      render: (row) => (
        row.scope === 3 && row.scope3Category ? (
          <span className="text-xs text-text-secondary font-mono">
            Cat {row.scope3Category}
          </span>
        ) : (
          <span className="text-text-muted text-xs">—</span>
        )
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-text-primary">
          {formatNumber(row.quantity)} {row.unit}
        </span>
      ),
    },
    {
      header: 'Calculated Emissions',
      accessor: 'emissions',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-primary">
          {formatEmissions(row.emissions)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={activities}
      emptyMessage="No activity records match your query."
    />
  );
};

export default ActivityTable;
