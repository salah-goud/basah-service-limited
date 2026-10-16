import React from 'react';

export default function LoadingSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="table-responsive">
      <table className="table table-modern align-middle mb-0">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div className="placeholder-glow">
                  <span className="placeholder col-8 rounded" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div className="placeholder-glow">
                    <span className="placeholder col-10 rounded" />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
