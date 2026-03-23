import styles from './NotFound.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.letters}>
        <div className={`${styles.pomLetter} ${styles.animatedP}`}>
          P
          <div className={styles.face}>
            <div className={`${styles.eye} ${styles.leftEye}`}></div>
            <div className={`${styles.eye} ${styles.rightEye}`}></div>
            <div className={styles.mouth}></div>
          </div>
        </div>
        <div className={styles.pomLetter}>O</div>
        <div className={styles.pomLetter}>M</div>
      </div>
      <h2>Oops! Looks like this page went missing...</h2>
      <a href="/" className={styles.homeLink}>
        Go back home
      </a>
    </div>
  );
}
