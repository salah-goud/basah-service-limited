/**
 * Export and Print Utilities for BASAH SERVICE LIMITED
 */

/**
 * Exports data to a CSV file (compatible with Excel).
 * @param {string} filename 
 * @param {Array<string>} headers Column headers
 * @param {Array<Array>} dataRows Row values
 */
export function exportToCSV(filename, headers, dataRows) {
  const sanitize = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(sanitize).join(',');
  const rowLines = dataRows.map((row) => row.map(sanitize).join(','));
  const csvContent = [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers standard browser print dialog for the current page or print modal.
 */
export function triggerPrint() {
  window.print();
}
