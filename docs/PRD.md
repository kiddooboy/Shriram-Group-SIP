# Shriram Group SIP — Product Requirements Document (PRD)

**Version:** 1.0 | **Date:** May 2026
**Status:** Approved for Phase 1 Build
**Owner:** Product Manager, Shriram Group SIP

---

## 1. Product Overview

### 1.1 Problem Statement

Shriram Group's 80,000+ employees face three compounding problems:

**Savings Gap:** EPF alone covers <40% of post-retirement income needs. India's household financial savings rate dropped to 5.1% of GDP in FY24 — a 47-year low. Employees are building liability (EMIs, insurance premiums) faster than assets.

**Access Gap:** Mutual fund penetration in India is ~16% of households; for Tier 2/3 salaried employees (60%+ of Shriram's workforce), it is <8%. The primary barriers are perceived complexity, lack of a trusted intermediary, and the absence of employer facilitation.

**Behavioral Gap:** Without structured employer facilitation, opt-in investment programs see 20–30% participation. Programs with auto-enrollment reach 80–94% (evidence from US 401(k) research, UK workplace pensions, Australian Superannuation).

### 1.2 Product Mission

*Make every Shriram employee a disciplined, goal-aligned investor — irrespective of income, city tier, or financial literacy level.*

### 1.3 Product Summary

Shriram Group SIP is a voluntary (opt-out), employer-facilitated, goal-linked Systematic Investment Plan offered to all salaried employees across Shriram Group companies. It:
- Is layered on top of EPF — not replacing it
- Uses SEBI-registered mutual funds via an AMFI-registered MFD partner
- Offers a curated universe of 12 funds matched to 6 employee personas and 5 life goal categories
- Defaults employees into a balanced fund at Rs. 500/month with a clear opt-out path
- Provides goal tracking, auto-escalation, and vernacular communication

---

## 2. Goals & Success Metrics

### 2.1 Business Goals
1. Increase employee financial wellness across Shriram Group
2. Strengthen employer brand and retention (employees with financial security show higher engagement)
3. Position Shriram Group as a progressive employer in the NBFC/financial services sector

### 2.2 Product KPIs

| Metric | Year 1 | Year 3 |
|---|---|---|
| Enrollment rate | 60% of eligible | 85% |
| Active SIP participants | 15,000 | 60,000 |
| Average SIP amount | Rs. 2,000/month | Rs. 4,500/month |
| Goal-linked participants | 70% of enrolled | 90% |
| SIP 12-month continuation rate | 80% | 90% |
| App MAU (% of enrolled) | 40% | 65% |
| SIP bounce rate (debit failures) | < 10% | < 6% |
| Grievance resolution rate | > 90% in 7 days | > 95% in 5 days |
| Average portfolio XIRR (3-year) | Aligned to benchmark | Outperform by 1.5% (behavior effect) |

### 2.3 Anti-Goals (What This Product Does NOT Do)
- Does NOT provide financial advice (not registered as RIA)
- Does NOT guarantee returns
- Does NOT replace EPF or any statutory benefit
- Does NOT include insurance products in Phase 1 & 2 (ULIPs excluded)
- Does NOT distribute third-party AMC funds — only Shriram AMC schemes
- Does NOT recommend a Shriram AMC fund that is unsuitable for the employee's declared goal/risk profile

---

## 3. User Personas

See full persona cards in [docs/product/personas.md](product/personas.md).

### Summary

| # | Name | Age | Income (LPA) | Risk | Primary Goal |
|---|---|---|---|---|---|
| P1 | The Starter (Aarav) | 22–28 | 3–5 | Low-Moderate | Emergency fund, marriage |
| P2 | The Grower (Priya) | 28–35 | 6–12 | Moderate | Child education, home |
| P3 | The Consolidator (Ramesh) | 35–45 | 12–25 | Moderate-High | Retirement, children's education |
| P4 | The Accelerator (Kavitha) | 35–45 | 20–50 | High | Wealth creation, legacy |
| P5 | The Pre-Retiree (Subramaniam) | 45–55 | 15–40 | Moderate-Low | Retirement corpus |
| P6 | The Near-Exit (Meenakshi) | 55–60 | 20–60 | Low | Corpus completion, SWP |

**Primary user:** Employee (persona P1–P6)
**Secondary user:** HR Admin (aggregate view; no access to individual employee data)
**Tertiary user:** Shriram Investment Committee (fund universe management)

---

## 4. User Journey

### 4.1 Employee Onboarding Flow

**Core principle:** Shriram already knows its employees. The AI engine uses HRMS data (age, salary band, grade, city, years of service) to pre-compute a recommendation *before* the employee even opens the app. The employee walks in to a screen that says "Here's what we suggest for you" — not a blank form. They answer 2 context questions we cannot infer, then confirm or adjust.

```
[Trigger: Auto-enrollment email / self-registration]

Step 1 — Discovery
  Employee receives: "Your Shriram SIP is ready — we've already built
  a plan for you. Takes 3 minutes."
  Opens mobile app or web portal.

Step 2 — Authentication
  Login: Employee ID + Aadhaar OTP
  Background (instant, invisible to employee):
    → HRMS pull: age, salary band, grade, city tier, years of service, department
    → KRA query: KYC status
    → AI engine pre-computes recommendation (fund + amount + tenure)

Step 3 — KYC Gate
  KYC_VALIDATED / KYC_REGISTERED  → Proceed
  KYC_ON_HOLD                      → Block; show document update instructions
  NOT_KYC                          → Initiate V-KYC (5-min video process)

Step 4 — 3 Context Questions
  Salary and designation are not shared by Shriram HRMS.
  Income is the most important input for the amount model, so
  the employee self-declares it — 1 tap from 6 bands.
  
  Q1: "What is your annual income?"
      [Below Rs. 2L]  [Rs. 2–4L]  [Rs. 4–6L]  [Rs. 6–10L]  [Rs. 10–15L]  [Above Rs. 15L]
      ↳ Privacy note shown below tiles: "Never shared with your employer or HR."
  
  Q2: "What's your family situation?"
      [Single]  [Married, no kids]  [Married with kids]  [Supporting parents]
  
  Q3: "What's your main savings goal right now?"
      [Emergency fund]  [Big purchase]  [Child's future]  [Buy a home]  [Retirement]
  
  These 3 signals + age, city, department, years-of-service from HRMS
  give the AI everything it needs. No salary pulled from employer,
  no designation disclosed. Employee controls what income info they share.

Step 5 — AI Recommendation Screen ("Your Shriram SIP Plan")
  ┌──────────────────────────────────────────────────────────────┐
  │  Here's what we recommend for you, Priya                    │
  │                                                              │
  │  💰 SIP Amount    Rs. 4,500 / month                         │
  │  📅 Invest for    12 years                                  │
  │  📊 Fund          Shriram Multi Asset Allocation Fund        │
  │                                                              │
  │  Why this?                                                   │
  │  "Based on your income, 2 young dependents, and education   │
  │   goal, this fund balances growth with stability. At this   │
  │   pace, you'll have Rs. 14.2 lakh by 2038."                │
  │                                                              │
  │  [Looks good — Start my SIP]    [I want to change this]     │
  └──────────────────────────────────────────────────────────────┘
  
  Employee can:
    → Accept (1 tap → goes directly to NACH mandate)
    → Adjust amount (slider)
    → Adjust tenure (slider)
    → Change fund (shows alternatives with AI reasoning for each)
    → Add a second goal (repeats step 4–5 for second goal)

Step 6 — NACH Mandate Authorization
  Employee enters bank account / selects linked account
  Redirected to bank net banking for NACH authorization
  On success: Mandate activated; URN stored

Step 7 — Confirmation
  "Your SIP of Rs. 4,500/month starts on [date]."
  App home: Goal progress card (0% — journey begins)
  WhatsApp confirmation in employee's preferred language
```

**Target onboarding time: < 4 minutes** (3 questions + KYC + mandate; AI pre-computes recommendation as soon as Q1 is answered)
**Benchmark comparison:** Zerodha Coin = 8 min, Groww = 6 min, Shriram SIP = 4 min — possible because age/city/department are pre-loaded from HRMS; employee only provides 3 context signals.

### 4.2 Auto-Enrollment Experience (AI Pre-Computed)

For employees who do not self-register, the AI pre-computes their recommendation using HRMS data alone (no 2 context questions — uses safe defaults for unknowns):

1. Email 14 days before: *"Your Shriram SIP is ready. Based on your profile, we suggest Rs. X/month in [Fund Name]. Starts on [date] unless you opt out or personalize."*
2. SMS reminder 7 days before with opt-out link
3. Auto-enrolled on target date — **AI-suggested amount and fund** (not a generic Rs. 500 + Balanced Advantage; each employee gets a differentiated starting point)
4. First WhatsApp/SMS: *"You're enrolled! Rs. X/month invested for you. Answer 2 quick questions to sharpen your plan →"*
5. Employee can personalize (answer 2 questions → AI refines), adjust, or opt out at any time

### 4.3 Monthly SIP Cycle

```
25th of previous month: HRMS confirms active employee list + amounts
28th:                   Pre-debit notification setup loaded
31st/30th:              24-hour pre-debit SMS sent (RBI mandate)
1st:                    NACH debit executed
2nd–3rd:                Debit results received (success/failure)
3rd (if success):       Push: "Rs. X invested! Goal now X% complete"
3rd (if failure):       SMS + Push: "SIP bounce — retry on 7th"
7th (if retry):         Retry debit attempt
8th:                    Units allocated at next NAV; portfolio updated
```

### 4.4 AI-Driven Annual Escalation

```
April (post-appraisal):
  HRMS sends updated salary band, increment percentage to AI engine
  AI engine re-runs recommendation with updated income signal:
    → New recommended SIP amount computed
    → If new amount > current SIP: escalation suggested
    → If goal is now off-track (corpus shortfall): escalation flagged as urgent
  
  Notification sent (personalized by AI):
    "Congrats on your increment, Priya! Your salary grew.
     To stay on track for Riya's education by 2038, we suggest
     increasing your SIP from Rs. 4,500 to Rs. 5,200/month.
     [Approve Rs. 5,200]  [Choose different amount]  [Skip]"
  
  Key difference from rule-based escalation:
    - Amount is AI-computed from new income signal + goal shortfall + time remaining
    - Not a flat 10% or 50%-of-increment formula
    - Each employee gets a different escalation amount based on their specific situation
  
  If no action in 7 days → auto-approved (with prior disclosure in T&Cs)
  If goal is already on track → no escalation nudge (AI suppresses unnecessary prompts)
```

---

## 5. Feature Requirements

### 5.1 Phase 1 MVP Features (Must Have)

#### F01 — Employee Authentication
- Login via Employee ID + Aadhaar OTP
- Session management: JWT 8-hour expiry; refresh token 30 days
- Biometric unlock (Face ID / fingerprint) for returning users

#### F02 — KYC Status Check & V-KYC
- Real-time KYC status check via KRA (CAMS KRA API)
- Status-based routing: validated → proceed; on-hold → block with instructions
- V-KYC initiation via AMC partner for new KYC cases

#### F03 — AI Recommendation Engine (Core Feature)

This is the central differentiator of the product. It replaces all rule-based persona assignment and fund-matching logic.

**What it does:** Given everything Shriram already knows about the employee (from HRMS) + 2 lightweight context signals from the employee, the AI recommends:
1. **Which Shriram AMC fund** (from the live fund universe) suits the employee
2. **How much to invest** (SIP amount in Rs./month) — a specific number, not a range
3. **For how long** (tenure in months/years) — tied to the inferred or declared goal horizon

**Inputs (from HRMS — no employee input required):**
- Age / date of birth
- Salary band / grade level (proxy for income; exact CTC not exposed)
- City tier (Tier 1 / 2 / 3 — proxy for cost of living)
- Department / function (proxy for job stability and financial exposure)
- Years of service at Shriram (proxy for financial maturity and EPF corpus)
- Employment type (permanent / probationary / contract)
- Appraisal rating history (if available — proxy for income trajectory)

**Inputs (2 questions from employee — the only mandatory inputs):**
- Family situation (single / married-no-kids / married-with-kids / supporting-parents)
- Primary financial goal (emergency / big-purchase / child-future / home / retirement)

**Outputs — the AI recommendation object:**
```json
{
  "employee_id": "SHR-12345",
  "recommendation": {
    "fund": {
      "name": "Shriram Multi Asset Allocation Fund",
      "scheme_code": "SMAAF-G-REG",
      "allocation_pct": 100,
      "reason": "Balances equity growth with debt stability — right for your 10-year education goal with 2 dependents"
    },
    "sip_amount": 4500,
    "sip_amount_reasoning": "Estimated 18% of your take-home after EPF and basic living costs for a Tier 2 city household of 4",
    "tenure_months": 144,
    "tenure_reasoning": "12 years to align with your child's higher education timeline",
    "projected_corpus": 1420000,
    "projected_corpus_cagr_assumed": 12.0,
    "confidence_score": 0.81,
    "persona_inferred": "GROWER",
    "alternatives": [
      {
        "fund": "Shriram Flexi Cap Fund",
        "sip_amount": 4500,
        "tenure_months": 144,
        "reason": "Higher equity allocation — better growth potential but more volatility",
        "confidence_score": 0.71
      }
    ]
  },
  "generated_at": "2026-06-01T09:45:00Z",
  "model_version": "shriram-sip-rec-v1.2"
}
```

**How the amount is calculated:**
```
Estimated take-home = salary_band_midpoint × (1 - tax_rate_estimate) - EPF_employee_deduction
City cost-of-living factor applied (Tier 1: 0.65 disposable ratio, Tier 2: 0.72, Tier 3: 0.78)
Family factor applied (single: 0.30 savings rate, married+kids: 0.18, supporting parents: 0.15)
SIP suggestion = take-home × savings_rate × goal_priority_weight
Minimum floor: Rs. 500; Soft cap: 40% of estimated disposable
```

**How the tenure is calculated:**
```
RETIREMENT goal  → tenure = max(retirement_age 60 - current_age, 5) years
CHILD_FUTURE     → tenure = max(18 - child_approx_age, 3) years  [child age inferred: if married+kids, child assumed 0-5yr; employee can adjust]
HOME goal        → tenure = 7 years (median home purchase horizon)
EMERGENCY goal   → tenure = 18 months (standard 6-month corpus build)
BIG_PURCHASE     → tenure = 3 years
```

**How the fund is selected:**
The AI scores every live Shriram AMC scheme against the employee's inferred risk profile and goal horizon:

```
fund_score = w1 × risk_match_score
           + w2 × horizon_match_score
           + w3 × fund_momentum_score (recent performance vs. benchmark)
           + w4 × expense_efficiency_score

Where:
  risk_match_score    = how well fund's risk level matches inferred risk appetite
  horizon_match_score = whether fund's recommended holding period ≤ employee's tenure
  fund_momentum_score = 1-year and 3-year performance relative to category average
  expense_efficiency_score = how low the fund's expense ratio is within its category
```

**Model evolution over time:**
- **Phase 1 (launch):** Gradient boosted model (XGBoost) trained on financial planning principles and synthetic Shriram employee profiles. Cold-start; no behavioral data yet.
- **Phase 2 (6+ months):** Add behavioral signals — SIP continuation rate, amount changes, app engagement — to retrain model quarterly.
- **Phase 3 (18+ months):** Add collaborative filtering — "Employees in your profile cluster (same age + salary band + city + goal) who invested in Fund X had Y% better goal completion rate."

**Explainability requirement (SEBI suitability + employee trust):**
Every recommendation must have a plain-language "Why this?" — 1–2 sentences in the employee's preferred language, stating the 2–3 HRMS signals that drove the suggestion. No black-box output shown to employee without reasoning.

**Regulatory note — AI vs. RIA boundary:**
The AI recommendation must be framed as a **suitability assessment** (distributor obligation under AMFI Code of Conduct) — not as "investment advice" (which requires SEBI RIA registration). Key safeguards:
- Recommendations are limited to Shriram AMC's own scheme universe (distributor scope)
- Employee can freely override any recommendation
- No guarantee of returns implied in the UI or copy
- Compliance sign-off required from legal team before launch on: whether AI-generated suitability output crosses into "investment advice" territory under IA Regulations 2013
- Obtain SEBI informal guidance if legal opinion is ambiguous (see docs/compliance/checklist.md)

#### F04 — 3-Question Context Capture
- **Why 3 questions:** Shriram HRMS does not share salary or designation. Income is the primary driver of the SIP amount recommendation. The employee self-declares it (standard practice: Zerodha, Groww, Kuvera all do this at onboarding).
- **Q1 — Annual income band** (6 options: Below Rs. 2L / Rs. 2–4L / Rs. 4–6L / Rs. 6–10L / Rs. 10–15L / Above Rs. 15L)
  - Displayed as tap tiles, no text input
  - Privacy assurance shown below: *"Never shared with your employer or HR team"*
  - This question is shown first; AI cannot recommend an amount without this signal
- **Q2 — Family situation** (Single / Married no kids / Married with kids / Supporting parents)
- **Q3 — Primary savings goal** (Emergency fund / Big purchase / Child's future / Buy a home / Retirement)
- All three displayed on a single screen — one smooth tap flow, not 3 separate screens
- Defaults if all 3 skipped: income=`2L_4L` (conservative), family=`single`, goal=`wealth`; AI outputs a safe floor recommendation with a prompt to answer questions for a better plan
- Employee can update any answer at any time from profile settings → triggers recommendation refresh within 2 seconds

#### F05 — AI Recommendation Screen & Fund Selection
- Full-screen recommendation card: fund name, amount, tenure, projected corpus, plain-English reasoning
- "Looks good" 1-tap confirm path (fast path — majority of employees)
- Adjustment path: amount slider (Rs. 500 – Rs. 1,00,000), tenure slider (1–30 years), alternative funds
- Each alternative fund card shows: fund name, risk level, why it's different from primary recommendation
- Related-party disclosure shown on this screen (mandatory; acknowledged via checkbox)
- Suitability gate: if employee selects an equity fund for a <3-year goal, show hard warning with explanation — employee must actively acknowledge risk before proceeding
- KYC upgrade prompt for KYC-Registered employees (quarterly)

#### F03 — Persona Quiz & Assignment
- 5-question quiz; < 90 seconds
- Auto-assignment algorithm (rule-based, not ML in Phase 1)
- Manual override capability
- Annual refresh prompt (birthday month)

#### F04 — Goal Setup
- Up to 5 simultaneous goals
- Goal types: Emergency, Short-term, Education, Home, Wealth, Retirement, Marriage, Vehicle
- Target amount + target date → system calculates required SIP
- Goal visualization: progress bar, projected completion date, monthly shortfall
- Emergency corpus auto-suggested if no existing emergency fund

#### F05 — Fund Selection
- Shriram AMC schemes only — no third-party funds (see docs/product/fund-universe.md)
- Fund detail page: SEBI category, risk level, 3/5-year returns vs. category benchmark, expense ratio, exit load
- **Mandatory related-party disclosure shown before fund selection** (AMFI suitability obligation); employee acknowledges via checkbox
- Pre-selected default per goal + persona (Multi Asset Allocation Fund is default for auto-enrolled); employee can change
- Suitability gate: system prevents recommending equity fund for <3-year goal; shows warning with rationale
- ELSS gap communication: if Shriram AMC has no ELSS scheme, employees are informed they must use a different platform for 80C tax saving

#### F06 — SIP Registration
- SIP amount: Rs. 500 minimum; no maximum
- Frequency: Monthly (fixed in Phase 1)
- SIP date: 1st of month (fixed in Phase 1)
- Registration via BSE StAR MF API
- Multiple SIPs allowed (up to 5; one per goal)

#### F07 — NACH E-Mandate
- Bank account selection / entry
- Redirect to bank net banking for authorization
- Mandate status tracking: pending → active → cancelled
- Mandate amount = sum of all active SIP amounts + 10% buffer (to allow step-ups without new mandate)
- 24-hour pre-debit notification (RBI-compliant; every month without exception)
- Opt-out mechanism: skip individual debit or cancel mandate entirely

#### F08 — Portfolio Dashboard
- Total invested, current value, XIRR (overall and per goal)
- Goal progress: bar chart showing current vs. target corpus
- Fund breakdown: units, current value, purchase cost
- Transaction history: date, amount, units, NAV, status
- Tax summary: STCG, LTCG, ELSS deduction eligible

#### F09 — Notification System
- Templates: Pre-debit (24hr), debit success, debit failure, unit allotment, quarterly update, goal milestone, escalation prompt, LTCG alert
- Channels: SMS (mandatory for pre-debit), push notification, email, WhatsApp
- Language: Employee's preferred language (set at onboarding; 7 options)
- Opt-out: Employee can configure notification preferences (except regulatory-mandated notifications)

#### F10 — Auto-Enrollment (Admin Trigger)
- HR Admin can trigger auto-enrollment for a batch of employees
- 14-day opt-out window with automated reminder emails/SMS
- Default: Rs. 500/month, Balanced Advantage Fund
- Auto-enrollment results: enrolled / opted-out / pending mandate

#### F11 — Grievance Redressal
- In-app grievance form: category selection, description, attachment
- Ticket number + acknowledgment within 2 business days
- Status tracking in app
- Escalation to MFD/AMC/SEBI SCORES as needed

#### F12 — HRMS Integration
- Daily employee data sync (active/exited status, salary band, appraisal date)
- Exit trigger: SIP suspended; data erasure countdown (1 year per DPDP)
- Salary revision trigger: Auto-escalation notification

#### F13 — Admin Console (HR View)
- Aggregate enrollment stats (no individual employee data visible to HR admin)
- SIP bounce rate dashboard
- Grievance summary
- Monthly reconciliation report download
- Entity-level breakdown

#### F14 — Compliance Logging
- 24-hour pre-debit notification log (timestamp + delivery status per employee)
- KYC event log
- DPDP consent log (timestamp + version)
- Transaction audit trail

---

### 5.2 Phase 2 Features (High Priority)

#### F15 — WhatsApp Bot (7 Languages)
- Commands: my sip, balance, pause sip, stop sip, goal status, help
- Conversational flows for each command
- Language auto-detection from WhatsApp profile
- Fallback to HR helpline

#### F16 — Auto-Escalation
- HRMS increment data integration
- SIP step-up calculation and recommendation
- 1-tap approval or modify flow
- Auto-approve after 7 days (with disclosure)

#### F17 — Vernacular Content Library
- SIP education videos: 2-minute explainers per persona per language (42 videos total: 6 personas × 7 languages)
- Financial literacy modules: compound interest, goal planning, risk vs. return (7 languages)
- WhatsApp bot content: all templates in 7 languages

#### F18 — Advanced Portfolio Analytics
- XIRR by fund, by goal, vs. benchmark
- Asset allocation pie chart
- Rebalancing alerts (>5% drift from target)
- Goal shortfall calculator

---

### 5.3 Phase 3 Features (Future)

#### F19 — Employer Matching Contribution
- Employer contribution amount configurable per employee grade/band
- Matching SIP purchased in employee's name (separate folio)
- Vesting: Immediate (Phase 3 default)
- Employee notification: "Your employer contributed Rs. X to your SIP!"

#### F20 — NPS Corporate Model
- PFRDA CRA integration (NSDL/KARVY)
- PRAN creation and management
- Contribution upload for employer + employee
- 80CCD-1B benefit illustration

#### F21 — Bonus/Lump-Sum SIP Trigger
- HRMS bonus date integration
- Notification: "Your bonus of Rs. X is arriving. Want to invest a portion? Suggested: Rs. Y lump sum to [goal]."
- 1-tap lump sum order

#### F22 — AI Persona Refresh
- Annual persona re-assessment (not rule-based; ML model trained on 18 months of data)
- Proactive: "Based on your investment behavior, we've updated your profile. Review?"
- Silent persona adjustment + notification if recommended fund mix changes

#### F23 — Shriram Lifecycle Funds
- Integration of new NFO scheme (Lifecycle Growth + Lifecycle Balanced)
- Glide path display: equity allocation decreasing as retirement date approaches
- Migration offer for existing retirement goal SIP investors

#### F24 — SWP (Systematic Withdrawal Plan) Tool
- Retirement income calculator: "How much monthly income will your corpus generate?"
- SWP setup flow (for employees approaching retirement)
- Tax-efficient withdrawal sequencing recommendation

---

## 6. Non-Functional Requirements

### 6.1 Performance
- API response time: P95 < 1.5 seconds (portfolio load < 1.5s, SIP registration < 3s)
- Onboarding flow completion: < 7 minutes end-to-end
- Concurrent users: Handle 80,000 simultaneous connections on SIP debit day (1st of month)
- App startup time: < 2 seconds on 4G

### 6.2 Reliability
- Platform uptime: 99.5% (measured monthly; excludes scheduled maintenance)
- Scheduled maintenance: Sunday 2:00 AM – 4:00 AM only; never on SIP debit days
- Data backup: Real-time PostgreSQL replication; daily snapshots to S3

### 6.3 Security
- OWASP Top 10 compliance; annual VAPT by CERT-In empaneled auditor
- PAN masking in all logs and non-essential displays
- Aadhaar: OTP only; never stored; Virtual ID stored if needed
- Bank account: Last 4 digits stored; full account transmitted directly to payment aggregator only
- AES-256 encryption at rest; TLS 1.3 in transit
- Multi-factor authentication for all HR Admin and Investment Committee access

### 6.4 Accessibility
- WCAG 2.1 AA compliance for web portal
- Mobile app: Dynamic font sizing support; high contrast mode
- Vernacular: 7 Indian languages; right-to-left layout NOT required for current language set

### 6.5 Device & Browser Support
- Mobile app: iOS 14+ and Android 8.0+
- Web portal: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- Minimum screen size: 320px width (older Android devices)
- Offline support: View last-synced portfolio without internet (48-hour cache)

### 6.6 Data Retention
- Active employees: Data retained for duration of employment + 1 year post-exit
- Exited employees: Automated data erasure triggered 1 year after exit (DPDP compliance)
- Transaction logs: 7 years (Income Tax Act audit trail requirement)
- Notification logs: 2 years (SEBI/RBI compliance audit)
- KYC event logs: Duration of folio existence + 5 years

### 6.7 Localization
- Date format: DD/MM/YYYY (Indian standard)
- Currency: Indian Rupees (Rs. / ₹); no currency conversion
- Number format: Indian system (lakhs, crores) — e.g., "Rs. 2.5 lakh" not "Rs. 250,000"
- Timezone: IST (UTC+5:30) for all timestamps

---

## 7. Regulatory Requirements

See full compliance checklist in [docs/compliance/checklist.md](compliance/checklist.md).

### Summary of Hard Requirements
1. **SEBI:** Use only SEBI-registered AMCs; operate through AMFI-registered MFD (ARN holder)
2. **RBI:** 24-hour pre-debit notification before every NACH debit (non-negotiable; penalty risk)
3. **KYC:** Every investor must be KYC-Registered minimum; KYC-Validated for unrestricted AMC access
4. **DPDP:** Explicit consent at onboarding; data sharing agreements with all vendors; 1-year post-exit erasure
5. **Income Tax:** Employee tax regime captured; ELSS availability conditioned on regime; LTCG/STCG education
6. **EPFO:** No interference with EPF; SIP is additive, not replacement

---

## 8. Dependencies & Risks

### 8.1 External Dependencies

| Dependency | Provider | Risk If Delayed |
|---|---|---|
| AMC partnership agreement | SBI MF / HDFC MF | Cannot launch SIPs; critical path |
| MFD partner with valid ARN | Third-party MFD | Regulatory block on distribution |
| BSE StAR MF empanelment | BSE India | SIP registration not possible |
| KRA API access | CAMS KRA | KYC flow broken; cannot onboard |
| NACH integration | Digio / Signzy / Razorpay | Auto-debit impossible |
| HRMS API access | Shriram IT (SAP/Oracle) | No employee data sync; manual workaround only |
| SEBI legal opinion | External counsel | Cannot confirm legal structure; launch risk |

### 8.2 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| HRMS integration complexity (30+ entities) | High | Medium | Start Month 1; Phase 1 covers only 2 entities; fallback to manual CSV import |
| BSE StAR MF API instability on 1st of month | Medium | High | Circuit breaker; retry queue; AMC direct API fallback |
| NACH mandate registration failures (bank errors) | Medium | Medium | Multiple payment aggregator options; V-mandate as fallback |
| App crash on peak load (SIP debit day) | Low | High | Load test to 2x expected users; auto-scaling configured |
| KYC API rate limits | Low | Medium | Redis caching of KYC status (24-hour TTL) |

### 8.3 Regulatory Risks

| Risk | Mitigation |
|---|---|
| Shriram subsidiary inadvertently classified as distributor | Use only third-party MFD; legal opinion obtained pre-launch |
| RPT rules triggered if Shriram related entity involved | Audit committee pre-approval; arm's length pricing; full disclosure |
| SEBI NACH 24-hour notification violation | Automated cron job; compliance log; alert on cron failure |
| Employee data breach (DPDP) | Encryption, VAPT, incident response plan, DPDP-compliant contracts |

---

## 9. Open Questions (To Be Resolved Before Launch)

| # | Question | Owner | Target Resolution |
|---|---|---|---|
| Q1 | Should employer matching (Phase 3) count as perquisite under Sec 17(2)? | Legal + Finance | Month 18 |
| Q2 | Which Shriram entity holds or will apply for the ARN? Shriram Finance directly, or a designated distribution subsidiary? What are the RPT and LODR implications of each option? | Legal | Month 2 |
| Q3 | Should SIP date be 1st only or offer 5th/10th/15th options? (operational complexity vs. employee preference) | Product + Ops | Month 3 |
| Q4 | Direct or regular plans for Persona 1/2? (direct = better returns; regular = MFD support funded) | Product + CFO | Month 2 |
| Q5 | Phase 1 pilot: Shriram Finance only, or also include 1 insurance entity? | HR Head + Product | Month 1 |
| Q6 | How to handle NRI employees (if any) — foreign exchange implications? | Compliance + Legal | Month 4 |
| Q7 | WhatsApp number verification at onboarding — mandatory or optional? | Product | Month 3 |

---

## 10. Appendix

### A. Glossary

| Term | Definition |
|---|---|
| SIP | Systematic Investment Plan — recurring investment in a mutual fund scheme |
| NACH | National Automated Clearing House — RBI-operated system for recurring bank debits |
| AMC | Asset Management Company — entity that manages mutual fund schemes |
| MFD | Mutual Fund Distributor — AMFI-registered entity that distributes MF schemes |
| ARN | AMFI Registration Number — 6-digit identifier for AMFI-registered distributors |
| KRA | KYC Registration Agency — SEBI-registered entity that manages investor KYC records |
| RIA | Registered Investment Adviser — SEBI-registered entity that provides fee-based advice |
| ELSS | Equity Linked Savings Scheme — mutual fund with 3-year lock-in; eligible for 80C deduction |
| LTCG | Long-Term Capital Gains — gains on equity MF held >12 months; taxed at 12.5% above Rs. 1.25 lakh/FY |
| STCG | Short-Term Capital Gains — gains on equity MF held <12 months; taxed at 20% |
| XIRR | Extended Internal Rate of Return — annualized return calculation for irregular cash flows |
| TDF | Target-Date Fund — fund that automatically shifts allocation from equity to debt as target date approaches |
| PRAN | Permanent Retirement Account Number — NPS account identifier |
| VPF | Voluntary Provident Fund — additional voluntary contribution above mandatory EPF |
| DPDP | Digital Personal Data Protection Act 2023 — India's data protection law |

### B. Referenced Documents

- [Persona Playbook](product/personas.md)
- [Fund Universe](product/fund-universe.md)
- [Compliance Checklist](compliance/checklist.md)
- [API & Integration Design](tech/api-design.md)
- [Rollout Plan](ops/rollout-plan.md)

### C. Regulatory References

| Regulation | Scope |
|---|---|
| SEBI (Mutual Funds) Regulations 1996 (amended Mar 2025) | Fund structure, AMC requirements |
| SEBI (Investment Advisers) Regulations 2013 | RIA framework |
| AMFI Code of Conduct for MFDs (Apr 2022) | Distributor obligations |
| RBI E-Mandate Framework (Apr 22, 2025) | NACH rules, pre-debit notification |
| Income Tax Act — Section 80C, 80CCD | Tax-saving investment provisions |
| Income Tax Act — Section 112A, 111A | LTCG/STCG on equity MFs |
| Digital Personal Data Protection Act 2023 | Employee data protection |
| DPDP Rules 2025 (effective May 13, 2027) | Data processing obligations |
| Companies Act 2013 — Regulation 23 SEBI LODR | Related-party transactions |
| EPF & MP Act 1952 | EPF obligations (SIP does not interfere) |
| PFRDA NPS Regulations | NPS Corporate model (Phase 3) |
