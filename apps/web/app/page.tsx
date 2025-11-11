import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>ElasticUI</h1>
          <p className={styles.description}>
            Beautiful, accessible components. Copy, paste, customize.
          </p>
        </div>

        <div className={styles.terminal}>
          <div className={styles.terminalHeader}>
            <span className={styles.terminalDot}></span>
            <span className={styles.terminalDot}></span>
            <span className={styles.terminalDot}></span>
          </div>
          <div className={styles.terminalBody}>
            <code>npx elasticui-cli add radial-menu</code>
          </div>
        </div>
      </main>
    </div>
  );
}
