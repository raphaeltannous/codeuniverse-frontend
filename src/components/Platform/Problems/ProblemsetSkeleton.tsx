export function ProblemTableSkeleton() {
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  return (
    <>
      {skeletonRows.map((i) => (
        <tr key={i}>
          <td>
            <div className="mb-2">
              <div className="skeleton-line" style={{ width: '150px' }} />
            </div>
            <div className="skeleton-line skeleton-line-short" style={{ width: '100px' }} />
          </td>
          <td>
            <div className="skeleton-badge" style={{ width: '80px', height: '24px' }} />
          </td>
          <td>
            <div className="skeleton-badge" style={{ width: '70px', height: '24px' }} />
          </td>
          <td>
            <div className="skeleton-badge" style={{ width: '80px', height: '24px' }} />
          </td>
          <td>
            <div className="skeleton-line skeleton-line-short" style={{ width: '100px' }} />
          </td>
        </tr>
      ))}
    </>
  );
}
