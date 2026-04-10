import { ReactNode, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortKey?: keyof T;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  density?: 'compact' | 'normal' | 'comfortable';
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  stickyHeader?: boolean;
}

type SortDir = 'asc' | 'desc' | null;

const densityPadding = {
  compact: 'py-1.5',
  normal: 'py-2.5',
  comfortable: 'py-3.5',
};

export function DataTable<T>({
  columns,
  data,
  keyField,
  emptyMessage = 'Sin datos',
  density = 'normal',
  onRowClick,
  rowClassName,
  stickyHeader = false,
}: DataTableProps<T>) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (col: DataTableColumn<T>) => {
    if (!col.sortKey) return;
    if (sortCol === col.id) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortCol(null);
    } else {
      setSortCol(col.id);
      setSortDir('asc');
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortCol || !sortDir) return 0;
    const col = columns.find((c) => c.id === sortCol);
    if (!col?.sortKey) return 0;
    const av = a[col.sortKey];
    const bv = b[col.sortKey];
    if (av === bv) return 0;
    const mul = sortDir === 'asc' ? 1 : -1;
    return String(av) < String(bv) ? -mul : mul;
  });

  const px = densityPadding[density];

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className={`border-b border-border ${stickyHeader ? 'sticky top-0 bg-card z-10' : 'bg-card'}`}>
            {columns.map((col) => {
              const isSorted = sortCol === col.id;
              return (
                <th
                  key={col.id}
                  className={`${px} px-3 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px] whitespace-nowrap ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''
                  } ${col.sortKey ? 'cursor-pointer hover:text-foreground select-none' : ''} ${
                    col.width ? `w-[${col.width}]` : ''
                  }`}
                  onClick={() => col.sortKey && handleSort(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortKey && (
                      <span className="text-muted-foreground/50">
                        {isSorted && sortDir === 'asc' ? (
                          <ChevronUp className="w-3 h-3 text-primary" />
                        ) : isSorted && sortDir === 'desc' ? (
                          <ChevronDown className="w-3 h-3 text-primary" />
                        ) : (
                          <ChevronsUpDown className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-muted-foreground text-[12px]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-border last:border-0 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-accent/40' : 'hover:bg-accent/20'
                } ${rowClassName ? rowClassName(row) : ''}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`${px} px-3 text-foreground ${
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
