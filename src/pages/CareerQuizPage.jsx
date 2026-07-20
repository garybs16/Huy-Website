import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageIntro } from "../components/PageIntro";
import { quizQuestions, quizResultCategories } from "../siteData";

const initialAnswers = {};

function buildResult(answers) {
  const scores = quizResultCategories.map((category) => ({
    ...category,
    score: 0,
  }));

  Object.values(answers).forEach((answerIndex) => {
    if (typeof answerIndex === "number" && scores[answerIndex]) {
      scores[answerIndex].score += 1;
    }
  });

  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  const primary = sortedScores[0];
  const supporting = sortedScores.find((item) => item.key !== primary.key && primary.score - item.score <= 2);

  return { primary, supporting, scores: sortedScores };
}

export function CareerQuizPage() {
  const [answers, setAnswers] = useState(initialAnswers);
  const [showResult, setShowResult] = useState(false);
  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === quizQuestions.length;
  const result = useMemo(() => (showResult && isComplete ? buildResult(answers) : null), [answers, isComplete, showResult]);

  const handleAnswer = (questionIndex, answerIndex) => {
    setAnswers((current) => ({
      ...current,
      [questionIndex]: answerIndex,
    }));
    setShowResult(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowResult(true);
  };

  const handleReset = () => {
    setAnswers(initialAnswers);
    setShowResult(false);
  };

  return (
    <section className="section section-soft">
      <PageIntro
        kicker="Career Quiz Assessment"
        title={<>Explore the future that <span className="quiz-title-emphasis">feels most like you.</span></>}
        description="This short reflection is built to feel more like future-self exploration than a traditional test. Choose the answer that feels closest, even if more than one could fit."
        accent={`${answeredCount} of ${quizQuestions.length} answered`}
        note="Results are reflective, not diagnostic, and are meant to gently connect your strengths to people-centered career paths."
      />

      <form className="container quiz-layout" onSubmit={handleSubmit}>
        <div className="quiz-question-stack">
          {quizQuestions.map(([question, options], questionIndex) => (
            <fieldset key={question} className="quiz-question-card">
              <legend>
                <span>{String(questionIndex + 1).padStart(2, "0")}</span>
                {question}
              </legend>
              <div className="quiz-option-grid">
                {options.map((option, answerIndex) => (
                  <label
                    key={option}
                    className={`quiz-option-card ${answers[questionIndex] === answerIndex ? "is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      checked={answers[questionIndex] === answerIndex}
                      onChange={() => handleAnswer(questionIndex, answerIndex)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <aside className="quiz-result-panel">
          <p className="section-kicker">Your reflection</p>
          <h2>See your primary result after all 12 questions.</h2>
          <p>
            The highest score becomes your primary result. If another category is within two points,
            it appears as a supporting energy.
          </p>
          <button type="submit" className="btn btn-primary" disabled={!isComplete}>
            View Result
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleReset}>
            Reset Quiz
          </button>

          {result ? (
            <div className="quiz-result-card" role="status" aria-live="polite">
              <span>Primary Result</span>
              <h3>{result.primary.title}</h3>
              <strong>{result.primary.core}</strong>
              <p>{result.primary.summary}</p>

              {result.supporting ? (
                <div className="supporting-result">
                  <span>Supporting Energy</span>
                  <strong>{result.supporting.title}</strong>
                  <p>{result.supporting.summary}</p>
                </div>
              ) : null}

              <Link to="/programs" className="card-action-link">
                Explore CNA training
              </Link>
            </div>
          ) : null}
        </aside>
      </form>
    </section>
  );
}
