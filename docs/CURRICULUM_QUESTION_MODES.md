# Curriculum question modes

The course intentionally mixes recognition, reading, construction, production,
diagnosis, evaluation, improvement, and application. Question modes are not
distributed as a strict mathematical quota; each chapter receives one of every
new modality while the strongest existing questions stay in place.

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
17. Mini-project checkpoint
18. AI conversation review

Tutorial examples teach the interaction before testing difficult material.

## Chapter balance

The five active chapters keep their original number of learning steps. Selected
repetitive code-writing and open-response prompts are presented through the nine
new modalities instead. Every new modality appears once per chapter.

Current English chapter distribution:

| Type                           | Count |
| ------------------------------ | ----: |
| Multiple choice                |     8 |
| Multiple answer                |     9 |
| Select order                   |     5 |
| Code completion                |     7 |
| Code writing                   |     5 |
| Terminal practice              |     5 |
| Short answer                   |     7 |
| Open response                  |     6 |
| Code tracing                   |     5 |
| Fill in the code blanks        |     5 |
| Parsons problem                |     5 |
| Match the pairs                |     5 |
| Find the relevant line         |     5 |
| Choose the best implementation |     5 |
| Fix the bug                    |     5 |
| Refactoring challenge          |     5 |
| Mini-project checkpoint        |     5 |
| AI conversation review         |     5 |

Run `npm run validate:curriculum` after editing the curriculum. The validator
checks tutorial coverage, bilingual balance, and chapter-length stability.

## Content contracts

Each question keeps the standard `group`, `title`, `description`, and
`question.questionText` fields. A single `is...` flag selects its interface.

- Exact-response modes store `question.answer`.
- Parsons problems store `question.lines` and an ordered answer array.
- Matching stores `question.pairs`, choices, and a keyed answer object.
- Relevant-line questions store line numbers in the answer array.
- Editing modes store `question.starterCode`.
- Refactoring and project checkpoints store human-readable `question.tests`.
- Project checkpoints also store stable `projectId` and `checkpointId` values.
  Draft code is restored locally when a learner returns to that checkpoint.

Exact modes compare against a defined answer. Refactoring and project work use
their success checks as a grading rubric.
