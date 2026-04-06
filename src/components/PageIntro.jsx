export function PageIntro({ kicker, title, description, accent, note }) {
  return (
    <div className="container page-intro">
      <div className="page-intro-main">
        <p className="section-kicker">{kicker}</p>
        <h1>{title}</h1>
      </div>
      <aside className="page-intro-aside">
        <strong>{accent}</strong>
        <p>{description}</p>
        {note ? <span>{note}</span> : null}
      </aside>
    </div>
  );
}
