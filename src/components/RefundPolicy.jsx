import { refundPolicy } from "../siteData";

const rowKeys = ["timing", "refund", "deferred"];

export function RefundPolicy() {
  return (
    <article className="refund-policy-panel">
      <div className="refund-policy-hero">
        <div>
          <p className="section-kicker">Withdrawal and refund policies</p>
          <h2>{refundPolicy.title}</h2>
        </div>
        <p>{refundPolicy.registrationFee}</p>
      </div>

      <div className="refund-policy-body">
        <div className="refund-policy-intro">
          <h3>{refundPolicy.programTitle}</h3>
          <p>{refundPolicy.description}</p>
        </div>

        <div className="refund-table-wrap">
          <table className="refund-policy-table">
            <thead>
              <tr>
                {refundPolicy.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {refundPolicy.rows.map((row) => (
                <tr key={row.timing}>
                  {rowKeys.map((key, index) => (
                    <td key={key} data-label={refundPolicy.columns[index]}>
                      {row[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="refund-note-list">
          {refundPolicy.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
