import { Header } from '../components/Header';

export function ExperimentsPage() {
  return (
    <div className="container">
      <Header activeTab="assorted" />
      <div id="sorted-section" className="content-section">
        <div className="sorted-section-content">
          <div className="sorted-breadcrumb">
            <a href="/assorted">Assorted</a> / Experiments
          </div>
          <div>
            <p className="text-[0.85rem] leading-[1.7] text-[#777]">
              Experiments I'm running to test ideas and assumptions in the open.
            </p>
          </div>

          <section className="mt-6 rounded-[20px] border border-[rgba(145,118,90,0.22)] bg-[linear-gradient(135deg,rgba(255,250,242,0.95),rgba(247,238,227,0.9))] p-6 shadow-[0_20px_50px_rgba(89,61,36,0.08)] sm:p-8">
            <p className="font-display text-[0.75rem] uppercase tracking-[0.28em] text-[#9c7a5d]">Experiment #1</p>
            <h2 className="mt-2 font-display text-[1.5rem] leading-[1.15] text-[#2f2216] sm:text-[1.75rem]">
              Can open-source models with structured orchestration match frontier model performance on real software engineering tasks?
            </h2>
            <p className="mt-3 text-[0.88rem] leading-[1.8] text-[#6a5a4d]">
              This experiment pairs open-weight models with a multi-phase pipeline — planning, critique, execution, and review — to tackle{' '}
              <a
                href="https://www.swebench.com/"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-[rgba(145,118,90,0.4)] underline-offset-4 transition hover:decoration-[rgba(145,118,90,0.8)]"
              >
                SWE-bench Verified
              </a>
              , a benchmark of 500 authentic GitHub issues requiring code changes.
            </p>
            <p className="mt-3 text-[0.88rem] leading-[1.8] text-[#6a5a4d]">
              My goal is to see if open models can beat closed models with robust orchestration — a general-purpose planning harness that manages multi-phase workflows with explicit critique-and-gate patterns.
            </p>
            <a
              href="https://peteromallet.github.io/swe-bench-challenge/"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-fit items-center justify-center rounded-full bg-[#2f2216] px-5 py-2.5 font-display text-[0.95rem] text-[#fff6ea] no-underline transition hover:bg-[#1f140d]"
            >
              View methodology + results &rarr;
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
