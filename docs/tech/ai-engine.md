# Shriram Group SIP — AI Recommendation Engine

**Technical Design Document · v2.0 · May 2026 · Status: Draft for Engineering Review**

> Supersedes the v1 (3-question) engine design. This document specifies the AI-native, persona-based, goal-driven mutual fund recommendation engine for ~1,00,000+ Shriram Group employees.

---

## 0. Scope Decision (read first)

The v2 product brief proposed recommending across the **full Indian MF universe (~2,000 schemes, 44 AMCs)** under a **SEBI RIA** licence. After review, the Group has chosen to **retain the captive MFD model**:

| | Decision |
|---|---|
| **Regulatory entity** | Shriram Finance Ltd as **AMFI-registered Mutual Fund Distributor (ARN holder)** — *not* a SEBI Registered Investment Adviser. |
| **Recommendable universe** | **Shriram AMC schemes only.** The engine recommends, sizes, and tenures funds *exclusively* from Shriram AMC's lineup. |
| **Role of the 2,000-scheme universe** | Ingested for **benchmarking and market context only** — peer percentile ranking, category drift detection, regime modelling. It is **never** surfaced as a recommendation. |
| **Compliance framing** | The engine performs **suitability assessment** (permissible for an MFD), explicitly *not* "investment advice" (which requires RIA). Every recommendation carries the related-party disclosure. |

This single decision propagates through every section below. Where the brief said "RIA", read "MFD suitability"; where it said "recommend from 44 AMCs", read "rank within Shriram AMC, benchmark against 44 AMCs".

---

## 1. Operating Constraints at Launch

### 1.1 Data available
| Source | Fields | Notes |
|---|---|---|
| **Group SSO** | employee_id, name, entity, **designation**, location, email, mobile | The only employer-side data. Designation is a coarse income proxy; salary is **not** disclosed. |
| **Aadhaar (one-time KYC)** | **age** (derived from DOB), name match, address PIN | Captured once during V-KYC. DOB is the only new attribute persisted; raw Aadhaar is never stored (DPDP minimisation). |
| **In-app questionnaire** | 13-question adaptive profile (Section 3) | Primary source of financial truth. |
| **In-app behavior** | time-to-decision, edit patterns, login timing, scroll depth, nudge response (Section 7) | Primary source of *behavioral* truth from day 1. |

### 1.2 Data NOT available at launch
HRMS / payroll · EPF / EPFO passbook · Account Aggregator (bank/MF statements) · CIBIL / credit bureau · CAMS/KFin transaction feed. The architecture assumes these are **absent on day 1** and **pluggable later** — every model that *could* consume them must degrade gracefully without them (Section 6, cold-start).

### 1.3 The hard target
**Median onboarding-to-first-SIP under 15 minutes, including KYC.** Budget (Section 11):

```
SSO login + consent        ~1.0 min
V-KYC (Aadhaar OTP/face)   ~4.5 min   ← longest, mostly third-party
13Q adaptive (9–11 shown)  ~5.0 min   ← ~25–35 s/question
Recommendation review      ~2.0 min
NACH e-mandate             ~2.0 min
                           ─────────
                           ~14.5 min median
```

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│  CLIENT  (React Native app · Web · WhatsApp bot)                     │
│  · renders adaptive question N+1 returned by the engine              │
│  · emits behavioral telemetry events                                 │
└───────────────┬──────────────────────────────────────────────────────┘
                │  REST/gRPC over TLS 1.3
┌───────────────▼──────────────────────────────────────────────────────┐
│  AI RECOMMENDATION SERVICE  (stateless, autoscaled)                  │
│                                                                      │
│  ┌─ Questionnaire Orchestrator ─┐   ┌─ Inference Pipeline ─────────┐  │
│  │  M8 Adaptive Questionnaire   │   │  M1 User Embedding           │  │
│  │  (Bayesian belief + EIG)     │   │  M2 Fund Embedding           │  │
│  └──────────────┬───────────────┘   │  M3 Two-Tower Matcher        │  │
│                 │                   │  M4 Regime Detector          │  │
│  ┌─ Profile Store (belief state) ┐  │  M5 Return-Forecast Ensemble │  │
│  │  per-user posterior + features│  │  M6 RL Portfolio Optimizer   │  │
│  └───────────────────────────────┘  │  M7 Contextual-Bandit Nudge  │  │
│                                     └──────────────┬───────────────┘  │
│  ┌─ Explainability ─────────────────────────────────▼──────────────┐  │
│  │  SHAP attribution → LLM rationale (7 Indian languages)           │  │
│  └──────────────────────────────────────────────────────────────────┘ │
└───────────────┬──────────────────────────────────────────────────────┘
                │
┌───────────────▼───────────┐  ┌──────────────────┐  ┌─────────────────┐
│  Feature Store (Feast)     │  │  Model Registry   │  │  Audit Log      │
│  online: Redis             │  │  + MLflow         │  │  (immutable,    │
│  offline: warehouse        │  │  shadow/champion  │  │   WORM, 8 yr)   │
└────────────────────────────┘  └──────────────────┘  └─────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────────────┐
│  DATA INGESTION  (batch, nightly + intraday NAV)                      │
│  AMFI bhavcopy · AMC factsheets · SEBI disclosures · premium risk feed│
└────────────────────────────────────────────────────────────────────┘
```

The service is **stateless per request**; the per-user **belief state** (questionnaire posterior + partial feature vector) lives in the Profile Store keyed by `employee_id`, so a user can resume onboarding across sessions/devices.

---

## 3. The 13-Question Adaptive Questionnaire

### 3.1 Question bank

Thirteen questions form the *full* bank. The adaptive engine (M8) renders the **9–11** that maximise information gain for a given user; the rest are imputed from priors.

| # | Code | Captures | Type | Primary models fed |
|--:|---|---|---|---|
| 1 | `FAMILY` | Marital status, dependents, dependent parents, sole earner | single + count | risk capacity, amount |
| 2 | `CASHFLOW` | Monthly take-home band, fixed expenses band, total EMI band | 3 banded sliders | **amount**, capacity |
| 3 | `WEALTH` | Existing corpus across equity / debt-FD / gold / real-estate / cash | bucketed allocation | embedding, regime exposure |
| 4 | `EMERGENCY` | Months of expenses currently liquid | single (0 / <1 / 1–3 / 3–6 / 6+) | goal sequencing, capacity |
| 5 | `SIP_STRESS` | "If income dropped 20% for 6 months, what SIP could you sustain?" | banded amount | **amount floor**, persistence risk |
| 6 | `GOALS` | Top-3 goals: type, target ₹, target year | repeatable (×3) | **tenure**, goal engine |
| 7 | `CRASH` | "Your ₹1L falls to ₹70k in a month — you…" | 4-option scenario | **loss aversion**, risk preference |
| 8 | `EXPERIENCE` | Years investing in MF/equity + self-rated confidence | single + slider | confidence calibration, nudge policy |
| 9 | `LIQUIDITY` | Any need to withdraw within 12 months? | single + amount | constrains debt allocation |
| 10 | `TAX` | Tax slab + 80C headroom used | single + single | ELSS gap handling, regime msg |
| 11 | `INSURANCE` | Term cover? Health cover? (yes/no/unsure ×2) | 2 single | protection-gap nudge |
| 12 | `RISK_SCENARIO` | Risk *capacity* vs *preference* split scenario | 4-option scenario | reconciles capacity≠preference |
| 13 | `PREFERENCES` | ESG / no-go sectors / gold appetite / lump-sum vs SIP | multi-select | embedding constraints, no-go mask |

> **Captive note:** Q10's 80C item will frequently surface that Shriram AMC has **no ELSS scheme**. The engine must say so honestly ("for an 80C deduction, consider an ELSS outside this platform") rather than mis-recommend a non-ELSS fund as tax-saving — a documented suitability obligation.

### 3.2 Why adaptive — the Bayesian core (Model M8)

The engine maintains a **posterior belief** over a low-dimensional **profile state** `θ`:

```
θ = (risk_capacity, risk_preference, savings_capacity,
     horizon_profile, behavioral_bias_index, liquidity_constraint,
     protection_gap, experience_level)
```

Each `θ` component is a Beta/Dirichlet (categorical) or truncated-Gaussian (continuous) belief, initialised from **cohort priors** (Section 6) keyed by `{age_band, designation_tier, entity, location_tier}`.

For each unasked question `q`, compute **Expected Information Gain**:

```
EIG(q) = H(θ | data)  −  E_{answer ~ P(answer|θ)} [ H(θ | data, answer) ]
```

where `H` is posterior entropy. The orchestrator loop:

```
render question  q* = argmax_q EIG(q)         # most informative next
update posterior P(θ | answers)               # conjugate / variational update
if  max_component_entropy(θ) < τ_confidence    # profile is sharp enough
   AND  questions_rendered ≥ 9                 # floor for audit defensibility
   AND  no mandatory-unasked question remains  # GOALS, CASHFLOW, CRASH always asked
then  STOP  → impute remaining from posterior mean
else  repeat
```

- **Mandatory questions** (never skipped, regulatory/material): `CASHFLOW`, `GOALS`, `CRASH`. These pin amount, tenure, and risk — the three things the recommendation *is*.
- **Hard cap 13, soft stop 9–11.** Typical render count 9–11; a high-variance user (e.g. answers contradict cohort priors) gets more.
- **Question ordering** also respects UX: emotionally easy questions early (`FAMILY`, `GOALS`), the loss-aversion scenario (`CRASH`) mid-flow once the user is engaged.
- **Resumability:** posterior is persisted after every answer; drop-off recovery resumes at `q*`.

### 3.3 Imputation & confidence
Skipped questions are filled from the posterior mean and flagged `imputed=true` in the feature vector. The final recommendation carries a **profile-confidence score**; below a floor, the engine forces **conservative defaults** (Section 6.4) and asks one extra question rather than guessing.

---

## 4. The Eight ML Models

All models register in MLflow with champion/challenger slots; all inference is logged for audit (Section 9).

### M1 — User Embedding
- **Purpose:** map a (partial) profile + behavior to a dense vector `u ∈ ℝ⁶⁴`.
- **Architecture:** feed-forward encoder over the feature vector (questionnaire posterior means + SSO-derived + behavioral aggregates), trained with a **masked-feature objective** so it is robust to missing answers — critical given adaptive skipping and absent HRMS/AA data.
- **Output:** `u`, plus a soft **persona cluster** assignment (the 6 archetypes become *cluster priors*, not hard buckets — persona is *inferred*, never quiz-assigned).
- **Cold-start:** before personal data exists, `u` = cohort-prior centroid.

### M2 — Fund Embedding
- **Purpose:** map every scheme to `f ∈ ℝ⁶⁴` in the *same space* as `u`.
- **Inputs:** category, holdings factor exposures, rolling risk metrics (vol, max-drawdown, downside-deviation, beta), cost, AUM, manager tenure, factsheet text (sentence-transformer).
- **Universe:** embeddings are computed for **all ~2,000 schemes** (benchmarking), but only the **Shriram AMC subset** is eligible for matching. Full-universe embeddings let M2 place each Shriram fund at its true **peer percentile** ("top-quartile flexi-cap on 3-yr risk-adjusted return").
- **Refresh:** nightly after bhavcopy ingestion.

### M3 — Two-Tower Matcher
- **Purpose:** score user–fund fit as `score = sim(u, f)` over the **Shriram AMC tower** only.
- **Training:** positives = (profile, fund) pairs that met goal-attainment / persistence outcomes; negatives = sampled mismatches. Bootstrapped on synthetic cohorts (Section 6), then continuously retrained on real outcomes.
- **Output:** ranked Shriram AMC shortlist with calibrated fit probabilities → feeds M6.

### M4 — Market Regime Detection
- **Purpose:** classify the current regime (e.g. *risk-on / neutral / risk-off / high-vol*) from macro + market features (index vol, breadth, yield curve, FII flows, valuation percentile).
- **Method:** Hidden Markov / Bayesian change-point model over the public + premium feed.
- **Use:** conditions M5 forecasts and M6 optimisation; **never** triggers market-timing for the user — it only adjusts *messaging* (e.g. surface the "SIPs buy more units in dips" nudge) and the conservatism of new-allocation defaults.

### M5 — Return Forecasting Ensemble
- **Purpose:** produce **distributional** (not point) forward return estimates per Shriram fund and per asset class, conditioned on the M4 regime.
- **Method:** ensemble of gradient-boosted trees + a small temporal model + a shrinkage-to-CAPM prior; output = mean, variance, and a downside quantile.
- **Governance:** forecasts are **capped and shrunk** toward long-run category means; all employee-facing projections show ranges and the words *"not a guaranteed return"*.

### M6 — RL Portfolio Optimizer
- **Purpose:** turn the M3 shortlist + M5 distributions + the user's goals/constraints into a **₹ amount, fund mix, and tenure** per goal.
- **Formulation:** constrained policy maximising **goal-attainment probability** (utility = P(corpus ≥ target by date)), penalised for: breaching the `SIP_STRESS` floor, liquidity violations, no-go-zone hits, and excess drawdown vs `risk_capacity`.
- **Captive constraint:** action space = Shriram AMC schemes only; if no in-universe fund satisfies a goal (e.g. ELSS/international gap), the optimizer returns an explicit **`unmet_need`** flag instead of forcing a poor fit.
- **Output:** the recommendation object — amount, tenure, fund(s), projected-corpus distribution, attainment probability.

### M7 — Contextual-Bandit Nudge Engine
- **Purpose:** choose the next-best **behavioral nudge** (step-up prompt, persistence reassurance during a dip, protection-gap reminder, goal-progress celebration).
- **Method:** contextual bandit (Thompson sampling) with context = user embedding + regime + recent behavior; reward = the *intended healthy action* (continued SIP, step-up accepted, no panic redemption) — explicitly **not** raw engagement, to avoid dark-pattern optimisation.
- **Guardrails:** frequency caps, a fairness constraint (Section 9), and a hard rule that no nudge may encourage churn or contradict the suitability assessment.

### M8 — Adaptive Questionnaire
Specified in Section 3.2 — the Bayesian belief-update + EIG question selector.

### Model interaction (one request)
```
SSO+age ─▶ cohort prior ─▶ M8 loop (ask 9–11) ─▶ feature vector
                                                     │
                              M1 user embedding ◀────┤
   M4 regime ─▶ M5 forecasts ─┐                      │
   M2 fund embeddings ─▶ M3 two-tower shortlist ─────┤
                                                     ▼
                                   M6 RL optimizer → recommendation
                                                     │
                              SHAP + LLM rationale ◀─┤
                                   M7 picks first nudge
```

---

## 5. Mutual Fund Universe Ingestion

| Source | Cadence | Used for | Cost |
|---|---|---|---|
| **AMFI bhavcopy / NAV files** | Daily | NAV history, scheme master | Free |
| **AMC factsheets** (incl. Shriram AMC) | Monthly | Holdings, allocation, manager info | Free |
| **SEBI disclosures** | As filed | Risk-o-meter, scheme docs, RPT context | Free |
| **Licensed premium feed** | Daily | Advanced risk metrics (rolling drawdown, downside deviation, factor betas, attribution) | Paid |

Pipeline: ingest → validate (schema + outlier checks) → normalise to a scheme master keyed by ISIN/AMFI code → compute risk metrics → write to Feature Store → recompute M2 embeddings nightly. The **Shriram AMC subset** is tagged `recommendable=true`; everything else is `benchmark_only=true`. A data-quality gate blocks the nightly model refresh if coverage or freshness drops below threshold.

---

## 6. Cold-Start Strategy

The engine has near-zero first-party data on day 1. Four mechanisms bridge the gap:

### 6.1 Industry-wide cohort priors
Build priors from public data (AMFI investor demographics, SEBI/RBI household-finance surveys, published persona research) keyed by `{age_band × designation_tier × location_tier × entity_type}`. Each cell carries prior beliefs for every `θ` component. A brand-new user with only SSO+age starts at their cell's prior.

### 6.2 Cluster-similarity weighting (first 90 days)
For the first 90 days of a user's life on the platform, the recommendation blends:
```
final = w · model_personal  +  (1−w) · cohort_cluster_recommendation
w  ramps  0.2 → 0.9  as profile-confidence and behavioral history accumulate
```
So early recommendations lean on "people like you", then progressively become personal.

### 6.3 Active learning loop
The system is **uncertainty-seeking**: where the population posterior is widest, M8 prioritises those questions, and M7 occasionally runs (low-stakes) exploratory nudges. Outcomes feed retraining — the cold-start population teaches the models fastest where they are weakest.

### 6.4 Conservative defaults
Until profile-confidence clears its floor, defaults are deliberately safe: lower equity tilt, Shriram Multi Asset Allocation Fund as the default vehicle, amount pinned to the `SIP_STRESS` floor (never the optimistic cashflow-implied number), shorter assumed horizon. The user is never *worse off* for the engine being unsure.

### 6.5 Synthetic bootstrapping
~50,000 synthetic employee profiles, sampled from the Shriram workforce distribution (age/entity/location/designation), with simulated questionnaire answers and outcome labels, bootstrap M1/M2/M3/M6 before any real data exists. Synthetic data is **clearly partitioned** from real data in training and never used for fairness audits.

---

## 7. Behavioral Signal Capture

Behavioral truth is captured **in-app from day 1** — it does not wait for AA/HRMS. Events stream to the Feature Store.

| Signal | What it reveals |
|---|---|
| **Time-to-decision** per screen | Confidence vs. hesitation; very fast = possible disengagement |
| **Edit patterns** (slider drags, answer changes) | True risk preference vs. first instinct; anchoring |
| **Login timing after market moves** | Loss-aversion / panic propensity (logs in within hours of a 3%+ index drop) |
| **Scroll depth** on disclosures/rationale | Information appetite → calibrates explanation length |
| **Nudge response** (accept/dismiss/ignore) | M7 reward signal; messaging that works for this user |
| **SIP lifecycle events** | Step-up accepted, pause, bounce, redemption — the ground-truth outcomes |

These aggregate into the M1 embedding and the `behavioral_bias_index`. **DPDP:** behavioral capture is disclosed in the consent flow, scoped to product improvement, and excluded from any employer-visible reporting.

---

## 8. Explainability

Every recommendation ships with a two-layer explanation:

1. **SHAP attribution** — the recommendation pipeline emits SHAP values over the feature vector, identifying which inputs (e.g. "6-year goal horizon", "moderate crash-scenario answer", "₹4,500 stress-tested SIP floor") drove the amount/tenure/fund.
2. **LLM rationale** — a templated-and-grounded LLM turns the top SHAP factors into 3–4 plain sentences in the employee's **preferred Indian language** (Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Malayalam, English). The LLM is *grounded* on the SHAP factors and fund facts — it may not introduce claims, returns, or funds not in the structured output. Output is template-bounded so it stays within **suitability** language, never crossing into RIA-style "advice".

Every recommendation also shows the mandatory **related-party disclosure** (Shriram Finance distributes Shriram AMC, a group entity) and *"mutual fund investments are subject to market risks"*.

---

## 9. Compliance, Governance & Risk

### 9.1 Regulatory map
| Regulation | Obligation | How the engine meets it |
|---|---|---|
| **SEBI MF Regulations + AMFI** | Operate as MFD; **suitability** only, not advice; mandatory disclosures | Recommendations framed and language-bounded as suitability; related-party disclosure on every screen; ARN/CEP current |
| **SEBI RIA boundary** | Do **not** give investment advice without RIA registration | Captive model chosen → engine stays MFD-suitability; explainability templates audited to exclude advice language |
| **DPDP Act 2023** | Consent, purpose limitation, data minimisation, erasure | Granular consent; Aadhaar raw data not stored (only DOB→age); behavioral data scoped & employer-invisible; 1-yr post-exit erasure; DPO appointed |
| **IRDAI** | Insurance Qs (Q11) are *gap awareness*, not solicitation | Q11 only flags protection gaps and educates; any insurance purchase routes to a licensed channel — the engine does not sell insurance |
| **IT Act / Income-Tax** | Accurate tax messaging | Q10 drives honest old-vs-new regime + 80C messaging, including the **ELSS-gap disclosure** |

### 9.2 Model risk governance
- **Model registry & versioning** — every model version, training data hash, and hyper-parameters in MLflow; reproducible.
- **Champion/challenger + shadow deployment** — new models run in shadow before promotion; promotion gated on offline metrics + a fairness check.
- **Drift monitoring** — input drift, prediction drift, and outcome drift alarmed; auto-rollback on breach.
- **Human-in-the-loop** — an **Investment Committee + Model Risk reviewer** sign off model promotions and review a sample of recommendations quarterly.
- **Immutable audit trail** — every recommendation stores the full input vector, model versions, SHAP output, and rationale text in a WORM log retained 8 years; any recommendation is fully reconstructable.

### 9.3 Fairness audits
Recommendations and nudges are audited for disparate impact across age, gender, location tier, and entity. Metric: comparable **goal-attainment probability** and amount-as-%-of-stress-floor across protected cohorts, not identical recommendations. Failures block model promotion.

---

## 10. Benchmarking — Exceeding ET Money Genius

| Dimension | ET Money Genius | Shriram Group SIP target |
|---|---|---|
| **Personalization depth** | Risk profile + goals, broadly rule-driven | 8-model ML stack; embeddings + RL; behavioral signals from day 1 |
| **Vernacular support** | Limited | 7 Indian languages incl. SHAP-grounded LLM rationale + WhatsApp bot |
| **Employer-trust leverage** | None (D2C) | Auto-enrol via employer; SSO; payroll-cycle framing; "your own Group's funds" |
| **Behavioral bias correction** | Generic nudges | Contextual-bandit nudges rewarding *healthy action*; loss-aversion detected from login timing & edits |
| **Goal-attainment probability** | Goal projections | RL optimizer *directly maximises* P(goal met); shown as a probability, not a single number |
| **Onboarding friction** | App download, full KYC, D2C funnel | <15 min incl. KYC; 9–11 adaptive Qs; AI pre-computes before review |

**Honest limitation vs. Genius:** the captive model means a narrower recommendable universe. The engine compensates with depth (personalization, behavior, goal-probability) and transparency (peer-percentile benchmarking that openly shows where a Shriram fund sits against all 44 AMCs), and never hides the ELSS/international gaps.

---

## 11. Latency & The 15-Minute Target

| Stage | Budget | Engine responsibility |
|---|---|---|
| Each adaptive question turn (posterior update + next-question select) | **P95 < 250 ms** | M8 conjugate updates are cheap; EIG over ≤13 Qs is trivial |
| Full recommendation (M1→M6 + SHAP + rationale) | **P95 < 1.2 s** | Embeddings cached; M5 forecasts pre-computed per regime; LLM rationale streamed |
| Cold-path (model cache miss) | < 3 s | Acceptable, rare |

Caching: fund embeddings & regime-conditioned forecasts are recomputed nightly and held in Redis; only M1/M3/M6 run per-request. The recommendation is **pre-computed** the moment the last mandatory question is answered, so the review screen is instant.

---

## 12. Phased Build Plan

| Phase | Window | Deliverable |
|---|---|---|
| **P0 — Foundations** | Months 1–3 | Data ingestion (AMFI + factsheets + premium feed); Feature Store; scheme master; cohort priors; synthetic cohort generator |
| **P1 — Heuristic-backed engine** | Months 3–5 | M8 adaptive questionnaire live; M6 as a transparent **scoring/optimisation heuristic** (the prototype in this repo); SHAP-lite + rationale templates. Ships the pilot. |
| **P2 — ML models** | Months 5–9 | Train & shadow M1–M3, M5; promote behind champion/challenger; M4 regime model; behavioral signal pipeline |
| **P3 — RL & bandits** | Months 9–14 | M6 RL optimizer and M7 contextual bandit promoted once enough outcome data exists; full fairness-audit cadence |
| **P4 — Continuous** | Ongoing | Active-learning retraining; drift monitoring; quarterly model-risk review |

> The website prototype in this repo implements **P1**: the adaptive 13-question flow and a transparent heuristic optimizer, structured so M1–M7 drop in behind the same interfaces.

---

## Appendix A — Recommendation API (captive MFD)

```http
POST /api/v2/questionnaire/{employeeId}/next
→ { question | null, profileConfidence, rendered, posteriorSummary }

POST /api/v2/recommend/{employeeId}
→ {
    perGoal: [{
      goalType, targetAmount, targetYear,
      fund: { shriramAmcSchemeId, name, peerPercentile },
      sipAmount, tenureMonths,
      projectedCorpus: { p10, p50, p90 },
      goalAttainmentProbability,
      unmetNeed: null | "ELSS_NOT_IN_UNIVERSE" | "INTERNATIONAL_NOT_IN_UNIVERSE"
    }],
    explanation: { shapTopFactors[], rationaleText, language },
    firstNudge,
    disclosures: { relatedParty: true, marketRisk: true },
    modelVersions, profileConfidence
  }
```
Salary, designation-as-income, and any HRMS field are absent by construction. The full input vector + model versions are written to the WORM audit log on every call.
