export function PageIntro({ kicker, title, description }) {
  return (
    <div className="container page-intro">
      <p className="section-kicker">{kicker}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
