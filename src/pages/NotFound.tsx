export function NotFoundPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-letters">
        <div className="not-found-letter not-found-animated-p">
          P
          <div className="not-found-face">
            <div className="not-found-eye not-found-left-eye"></div>
            <div className="not-found-eye not-found-right-eye"></div>
            <div className="not-found-mouth"></div>
          </div>
        </div>
        <div className="not-found-letter">O</div>
        <div className="not-found-letter">M</div>
      </div>
      <h2>Oops! Looks like this page went missing...</h2>
      <a href="/" className="not-found-home-link">
        Go back home
      </a>
    </div>
  );
}
