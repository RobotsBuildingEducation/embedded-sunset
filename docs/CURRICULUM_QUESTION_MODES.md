# Curriculum question modes

The 149-question course intentionally mixes recognition, reading, construction,
production, diagnosis, evaluation, improvement, and application. Its authored
question modes are the same modes learners receive; validation must never
rewrite the curriculum before counting or checking it.

## Tutorial contract

The tutorial is the interaction onboarding layer. It demonstrates every live
question type exactly once, from low-friction selection to applied work:

1. Multiple choice
2. Multiple answer
3. Match the pairs
4. Select order
5. Find the relevant line
6. Code tracing
7. Fill in the code blanks
8. Code completion
9. Parsons problem
10. Short answer
11. Open response
12. Code writing
13. Terminal practice
14. Choose the best implementation
15. Fix the bug
16. Refactoring challenge
17. Build Your App conversation

Tutorial examples teach the interaction before testing difficult material.

## Chapter balance

Chapter 0 contains 17 interaction-onboarding questions. The five numbered
chapters contain 21, 18, 50, 22, and 21 questions respectively. Chapter 3 is
intentionally larger because it contains an HTML/CSS phase followed by a React
phase. The overall distribution is balanced with a few deliberate exceptions
for extra diagnosis and application practice.

Current English chapter distribution:

| Type                           | Count |
| ------------------------------ | ----: |
| Multiple choice                |     8 |
| Multiple answer                |     8 |
| Select order                   |     9 |
| Code completion                |     8 |
| Code writing                   |     8 |
| Terminal practice              |     8 |
| Short answer                   |     8 |
| Open response                  |     8 |
| Code tracing                   |    10 |
| Fill in the code blanks        |    10 |
| Parsons problem                |     9 |
| Match the pairs                |     9 |
| Find the relevant line         |     9 |
| Choose the best implementation |    10 |
| Fix the bug                    |    11 |
| Refactoring challenge          |    10 |
| Build Your App conversation    |     6 |

Run `npm run validate:curriculum` after editing the curriculum. The validator
checks all 149 learner-facing questions, exact mode counts, tutorial coverage,
chapter lengths, question schemas, unfinished code-writing starters, and
English/Spanish order and mode parity.

## Content contracts

Each question keeps the standard `group`, `title`, `description`, and
`question.questionText` fields. A single `is...` flag selects its interface.

- Exact-response modes store `question.answer`.
- Parsons problems store `question.lines` and an ordered answer array.
- Matching stores `question.pairs`, choices, and a keyed answer object.
- Relevant-line questions store one-based line numbers as a number or array.
- Editing modes store `question.starterCode`.
- Code-writing starters provide scaffolding but never contain the completed
  reference answer.
- Fixing and refactoring modes store human-readable `question.tests`.
- Build Your App conversations are frictionless project-progress moments, not
  capstone assessments.

Exact modes compare against a defined answer. Refactoring and project work use
their success checks as a grading rubric.
