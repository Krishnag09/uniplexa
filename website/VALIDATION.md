# Validation plan

This site exists to test one thing before we build the product:

> **Will NYC building owners give us their email to learn their LL97 penalty
> number?**

Everything below is how we'll know.

## Metrics to watch weekly

Pull these from PostHog (event names in parentheses):

| Metric | How to compute | Healthy signal |
| --- | --- | --- |
| Calculator starts | count of `calculator_started` | rising with traffic |
| Completion rate | `calculator_completed` ÷ `calculator_started` | > 60% |
| **Report-gate conversion** | `report_gate_submitted` ÷ `calculator_completed` | **≥ 5%** (see rule) |
| Calls booked | count of `book_review_clicked` | any is a strong signal |
| Below-threshold leads | count of `below_threshold_lead` | bonus leads, still real |
| Engagement | scroll depth + time on page (PostHog autocapture) | reaches calculator |

## The decision rule

After roughly **200 visitors**:

- If **fewer than ~5%** of calculator completions convert to the report gate,
  **the offer copy is the problem before the product thesis is.** Revisit the
  gate headline, the promise, and what we ask for — not whether the product
  should exist.
- If conversion clears ~5% and calls are getting booked, the demand signal is
  real: move on to onboarding those early buildings and validating that people
  will pay.

Keep the sample honest: don't count internal traffic, and give each copy
variant its own ~200-visitor window before judging it.

## What we are *not* measuring yet

Willingness to pay, retention, data-upload friction. Those come after this gate
clears — this test is strictly about whether the penalty number is a strong
enough hook to earn an email.
