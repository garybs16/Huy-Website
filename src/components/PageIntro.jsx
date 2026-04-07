export function PageIntro({ kicker, title, description, accent, note }) {
  return (
    <div className="container">
      <div className="page-intro">
        <div className="page-intro-main">
          <p className="section-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <aside className="page-intro-aside">
          <strong>{accent}</strong>
          {note ? <p>{note}</p> : null}
        </aside>
      </div>
    </div>
  );
}
