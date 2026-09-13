import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

const DataTable = ({
  columns,
  data,
  keyExtractor = (item) => item._id || item.id,
  emptyMessage = 'No records found',
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortField, sortDirection]);

  return (
    <div className="w-full overflow-x-auto rounded-card border border-carbon-border bg-carbon-card shadow-card">
      <table className="w-full text-left text-sm text-text-secondary border-collapse">
        <thead className="bg-carbon-surface text-xs uppercase text-text-muted border-b border-carbon-border font-semibold">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-4 py-3.5 font-medium select-none ${col.sortable ? 'cursor-pointer hover:text-text-primary' : ''} ${col.headerClassName || ''}`}
                onClick={() => col.sortable && handleSort(col.accessor)}
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.header}</span>
                  {col.sortable && (
                    <span className="shrink-0 text-text-muted">
                      {sortField === col.accessor ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-primary" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-carbon-border">
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row) || rowIndex}
                className="hover:bg-carbon-hover/50 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-4 py-3.5 text-text-primary ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-text-muted font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
