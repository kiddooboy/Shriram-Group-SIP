# Shriram Group SIP — Rollout Plan

**Version:** 1.0 | **Owner:** Product Manager + HR Lead

---

## Overview

Three-phase rollout over 36 months:

| Phase | Duration | Scope | Key Objective |
|---|---|---|---|
| **Phase 1 — Pilot** | Months 1–9 | ~5,000 employees (Shriram Finance HQ + 5 branches + 1 subsidiary) | Validate product-market fit, technology, and operations before group-wide deployment |
| **Phase 2 — Group-Wide Rollout** | Months 10–18 | All 80,000+ employees across all Shriram Group entities | Full deployment with vernacular support, WhatsApp bot, and HR ambassador program |
| **Phase 3 — Feature Expansion** | Months 19–36 | All enrolled employees | Employer matching, NPS integration, AI personalization, Shriram Lifecycle Funds |

---

## Phase 1 — Pilot (Months 1–9)

**Target scope:** Shriram Finance Ltd (Head Office + 5 regional branches) + 1 NBFC subsidiary
**Target employees:** ~5,000
**Geography:** Mix of metro (Mumbai/Chennai) + Tier 2 (for realistic data)

### Month-by-Month Plan

#### Month 1–2: Foundation
**Legal & Compliance**
- [ ] External legal counsel engaged; complete regulatory structure opinion received
- [ ] Board resolution approving Shriram Group SIP as employee benefit
- [ ] Investment Committee constituted (Shriram CFO, Compliance Officer, External RIA, AMC non-voting rep)
- [ ] AMC partner 1 selected and agreement executed
- [ ] MFD partner identified; ARN verified; distribution agreement executed
- [ ] DPDP Data Protection Officer appointed

**Vendor Selection**
- [ ] RFP issued to SaaS fintech platforms (Fisdom for Business / Wealthy Enterprise / Groww for Teams)
- [ ] Platform vendor shortlisted (target 2–3 vendors for demo)
- [ ] HRMS integration scoping session with Shriram IT (SAP HR / Oracle team)

**Deliverables by end of Month 2:**
- Signed legal opinion on regulatory structure
- Executed agreements: AMC + MFD + (shortlisted) tech vendor
- Investment Committee charter signed

---

#### Month 2–3: Infrastructure Setup
**Technology**
- [ ] Tech platform vendor selected and contract executed
- [ ] Development environment set up; API access granted (BSE StAR MF sandbox, KRA sandbox, NACH sandbox)
- [ ] HRMS integration design completed; data mapping document signed off by Shriram IT
- [ ] NACH infrastructure configured with payment aggregator (sandbox)
- [ ] White-label branding applied to platform (Shriram SIP look and feel)

**Compliance**
- [ ] Privacy policy drafted (DPDP-compliant); reviewed by legal
- [ ] Data sharing agreements drafted with all third parties
- [ ] Employee communication templates reviewed by compliance

**Deliverables by end of Month 3:**
- Tech platform in staging environment
- HRMS integration design approved
- NACH sandbox transactions successful

---

#### Month 3–5: Build & Configure
**Technology**
- [ ] Employee onboarding flow built and tested: Login → Persona Quiz → Goal Selection → Fund Selection → NACH Mandate → Confirmation
- [ ] KYC status check integrated (KRA API) and tested with test PANs
- [ ] V-KYC flow integrated (for employees without KYC)
- [ ] SIP registration integrated with BSE StAR MF (test orders)
- [ ] NACH e-mandate registration and 24-hour pre-debit notification tested end-to-end
- [ ] Notification engine tested: SMS (pre-debit), push (debit success/fail), email (quarterly)
- [ ] Portfolio dashboard tested with mock data
- [ ] Goal engine: progress tracking, shortfall calculation, rebalancing check
- [ ] Admin console: HR view (aggregate data, enrollment stats, bounce rates)
- [ ] HRMS → Platform data sync tested (employee records, exit trigger, salary revision)

**Fund Universe**
- [ ] 12 funds configured in platform with correct SEBI category, AMC, expense ratio, benchmark
- [ ] Default fund mapping logic implemented and tested (all 5 goal types)
- [ ] ELSS regime warning implemented (new tax regime employees)
- [ ] Small Cap fund restricted to Persona 4 only (age gate)

**Compliance**
- [ ] Pre-debit 24-hour notification cron job tested (RBI compliance)
- [ ] DPDP consent flow integrated into onboarding
- [ ] Data sharing agreements executed with all vendors

**Deliverables by end of Month 5:**
- Platform feature-complete in staging
- All integrations tested in sandbox
- Security penetration test 1 completed; critical issues resolved

---

#### Month 5–6: Beta Launch (500 Employees)
**Pilot Group Selection**
- Volunteer-based from Shriram Finance HQ
- Intentional mix: 5 personas represented; tech-savvy + non-tech-savvy; multiple salary bands
- Goal: 100 per persona archetype

**Beta Process**
- [ ] Beta employees onboarded individually with help from financial wellness coordinator
- [ ] Actual SIPs registered (real money, real mandates) — minimum Rs. 500/month
- [ ] First SIP debit cycle completed and reconciled
- [ ] Grievance process tested (end-to-end from employee complaint to resolution)

**Feedback Collection**
- [ ] Weekly feedback sessions with beta employees (by persona group)
- [ ] SIP bounce rate tracked (target <10%)
- [ ] Onboarding completion time measured (target <7 minutes)
- [ ] App crash rate tracked (target <0.5%)
- [ ] NPS (Net Promoter Score) collected after 4 weeks (target >40)

**Iterations**
- [ ] Top 3 UX issues fixed based on beta feedback
- [ ] Vernacular content for Hindi and Tamil completed (for pilot cities)

**Deliverables by end of Month 6:**
- 500 beta employees actively invested
- First SIP cycle reconciled with zero financial errors
- Beta feedback report with top issues and resolution plan

---

#### Month 6–7: Pilot Full Launch (5,000 Employees)
**Launch Preparation**
- [ ] Employee launch communication drafted: email + SMS + WhatsApp
  - Subject: "Your Shriram SIP benefit is ready — start investing today"
  - Include: benefit description, how to enroll, auto-enrollment notice (14 days ahead)
- [ ] HR ambassador identified at each pilot branch (1 per branch)
- [ ] HR ambassadors trained on SIP basics + escalation process
- [ ] Financial wellness workshop scheduled (in-person + virtual)

**Auto-Enrollment**
- [ ] Auto-enrollment email sent 14 days before activation date
  - "On [date], you will be automatically enrolled in Shriram SIP at Rs. 500/month in the Balanced Advantage Fund. Click here to opt out or change your amount."
- [ ] Opt-out window: 14 days
- [ ] NACH mandate registration sent to all non-opt-out employees
- [ ] First SIP date: 1st of Month 8

**Monitoring (First 30 Days)**
- Daily: SIP debit success rate, mandate registration success rate, app crashes
- Weekly: Enrollment rate, opt-out rate, KYC completion rate, grievance count
- Dashboard: Real-time for tech lead + compliance officer

**Deliverables by end of Month 7:**
- 5,000 employees invited; enrollment drive complete
- NACH mandates registered for all enrolled employees
- First SIP debit scheduled

---

#### Month 7–9: Pilot Performance Review
**Tracking**
- SIP 1 (Month 8): Debit → unit allocation → portfolio update cycle verified
- SIP 2 (Month 9): Second cycle; bounce rate analysis; step-up prompts
- Grievance analysis: Volume, type, resolution time
- Behavioral metrics: App MAU, goal completion rate, persona quiz completion

**Phase 2 Go/No-Go Decision (End of Month 9)**

**Success Gate (ALL must be met for Phase 2 green light):**

| Metric | Gate Threshold | Actual | Decision |
|---|---|---|---|
| Enrollment rate | > 55% of invited employees | | |
| SIP bounce rate | < 10% of debit attempts | | |
| Onboarding NPS | > 40 | | |
| SIP continuation | > 80% of Month 8 SIPs renewed in Month 9 | | |
| Platform uptime | > 99.5% | | |
| Grievances resolved | > 90% within 7 business days | | |
| Zero financial errors | 0 unreconciled transactions | | |

**If gate not met:** 2-month remediation period → re-evaluate
**If gate met:** Phase 2 kickoff approved by Shriram Group leadership

---

## Phase 2 — Group-Wide Rollout (Months 10–18)

**Target scope:** All remaining Shriram Group entities (~75,000 additional employees)
**Total enrolled (by Month 18):** Up to 80,000 employees

### Rollout Cadence

**Batch approach:** 5,000 employees per entity/month to avoid operational overload

| Month | Entities | Employees | Priority |
|---|---|---|---|
| 10–11 | 3 large NBFC entities (Chennai, Bangalore, Hyderabad) | ~15,000 | Highest MF-awareness; easier onboarding |
| 12–13 | 4 mid-size entities (auto finance, insurance) | ~20,000 | — |
| 14–15 | Rural/chit fund entity employees | ~15,000 | Highest vernacular need; WhatsApp bot critical |
| 16–17 | Remaining entities | ~20,000 | — |
| 18 | Mop-up: employees not yet reached; re-enrollment drive | ~5,000 | — |

### Phase 2 Milestones

#### Month 10–12: Scale Infrastructure
- [ ] Platform scaled for 80,000 users (Kubernetes auto-scaling configured; load tested)
- [ ] HRMS integration extended to all group entities (30+ legal entities possible)
- [ ] Financial wellness workshop curriculum completed (in-person + webinar + video)
- [ ] HR Ambassador program: 1 ambassador per 500 employees; trained nationally
- [ ] Vernacular content completed: Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Malayalam

#### Month 13–15: Vernacular & WhatsApp Launch
- [ ] WhatsApp bot launched (7 languages)
- [ ] Bot intents tested for all 7 languages with native speakers
- [ ] Regional SIP education videos published (2-minute explainers per persona per language)
- [ ] SMS communication switched to vernacular based on employee's state

#### Month 15–18: Full Enrollment Drive & Auto-Escalation
- [ ] HR Ambassador outreach program for employees not yet enrolled
- [ ] "Second chance" enrollment drive: Re-invitation to employees who opted out in Month 1
- [ ] **Auto-escalation activated (April appraisal cycle):**
  - HRMS increment data received
  - Platform generates SIP step-up recommendation for each employee
  - Employee notified: "Your salary grew by Rs. X. We suggest increasing your SIP by Rs. Y. Approve in 1 tap."
  - Default: Auto-approve after 7 days if no response (with opt-out)

### Phase 2 Success Metrics (by Month 18)

| Metric | Target |
|---|---|
| Total enrolled employees | > 60,000 (75% of eligible) |
| Goal-linked participants | > 80% of enrolled |
| Average SIP amount | > Rs. 3,000/month |
| SIP bounce rate | < 8% |
| WhatsApp bot engagement | > 30% of enrolled employees |
| App MAU | > 50% of enrolled |
| NPS (group-wide) | > 50 |

---

## Phase 3 — Feature Expansion (Months 19–36)

### Feature Roadmap

| Feature | Target Month | Owner | Prerequisites |
|---|---|---|---|
| Employer matching contribution | Month 19 | CFO / HR Head | Board approval, budget allocation |
| NPS Corporate model integration | Month 22 | Compliance + Tech | PFRDA empanelment; NPS CRA integration |
| AI-driven persona refresh | Month 24 | Data Science + Tech | 18 months of behavioral data; ML model training |
| Bonus/lump-sum SIP trigger | Month 24 | Tech | HRMS bonus date integration |
| International fund access | Month 27 | Compliance + Investment Committee | SEBI overseas fund limit monitoring |
| Shriram Lifecycle Funds launch (NFO) | Month 30 | AMC partner + SEBI | SEBI NFO filing (Month 24); 6-month approval process |
| Retirement income planning (SWP tool) | Month 33 | Tech + Financial Wellness | Portfolio data maturity; actuarial model |
| Portfolio analytics upgrade | Month 33 | Tech | Data warehouse; advanced XIRR attribution |
| Estate planning / nominee management | Month 36 | Legal + Tech | Legal framework review |

### Feature 1: Employer Matching Contribution (Month 19)

**Design:**
- Employer matches 50% of employee SIP, up to Rs. 1,000/month
- Match deployed into same goal as employee SIP (or default: Balanced Advantage Fund if unspecified)
- Match vesting: Immediate (recommended; no cliff/graded vesting for simplicity in Indian context)
- Tax treatment: Obtain legal opinion on whether employer match is a taxable perquisite (Section 17(2))

**Expected impact (from global research):**
- Participation lift: +15–25 percentage points among non-enrolled employees
- SIP amount increase: +20% average as employees want to maximize match

**Process:**
- HRMS generates matching contribution file monthly (employee_id, match_amount)
- Employer bank account → NACH pull → AMC for unit purchase in employee's folio (employer-to-employee transfer)
- Reporting: Employer matching treated as salary income / perquisite in employee's Form 16 (per legal opinion)

**Budget approval required:** Estimate Rs. 12–15 Cr annually (for 60,000 employees at avg. Rs. 500 match × 12 months = Rs. 360 Cr; actual take-up typically 40–50% = Rs. 14–18 Cr)

---

### Feature 2: NPS Corporate Model Integration (Month 22)

**Regulatory basis:** PFRDA National Pension System (Corporate Model)
**Tax benefit:** Employee can claim additional Rs. 50,000 deduction under Section 80CCD-1B (over and above Rs. 1.5 lakh 80C limit) — applicable only under old tax regime

**Design:**
- NPS Corporate model offered as optional add-on alongside SIP
- Employer can contribute discretionary amount (not mandated)
- Employee can contribute separately under 80CCD-1B

**Integration requirements:**
- PFRDA CRA (Central Recordkeeping Agency) empanelment: NSDL or KARVY
- CRA API integration for contribution upload and account management
- Employee NPS PRAN (Permanent Retirement Account Number) registration

---

### Feature 3: Shriram Lifecycle Funds (NFO, Month 30)

**Concept:** Two custom Target-Date Fund equivalents
- **Shriram Growth Fund:** 80% equity, 20% debt at inception; tapers to 55% equity by retirement date
- **Shriram Balanced Fund:** 60% equity, 40% debt; tapers to 40% equity

**Process:**
- AMC partner files SEBI NFO (New Fund Offer) application by Month 24
- SEBI approval timeline: 4–6 months
- NFO period: 2 weeks; then available for ongoing SIP
- Investment committee reviews and approves fund structure before filing

**Auto-assignment:** Once launched, new retirement goal SIPs auto-assigned to Lifecycle Growth Fund; employees with existing SIPs migrated with 30-day opt-out window

---

## Operations: Steady-State Processes

### Monthly Reconciliation (Every Month)

| Date | Activity | Owner |
|---|---|---|
| 25th | HRMS generates SIP deduction file for next month | HRMS / Finance |
| 27th | File reviewed and confirmed by SIP Compliance Officer | Compliance |
| 28th | Pre-debit notification setup loaded for 1st-of-month debit | Tech |
| 1st | NACH debit executed; 24-hour pre-debit notification sent on 31st/30th | Payment aggregator |
| 2nd–3rd | Debit results received (success/failure) | Platform |
| 3rd | Failure notifications sent to employees | Notification service |
| 4th | Failed SIP retry on 7th noted; HR escalation for 3rd consecutive failure | Compliance |
| 7th | Retry debit for failures | Payment aggregator |
| 8th | Final debit results; units allocated at next available NAV | AMC |
| 10th | Monthly reconciliation report: Finance sign-off | Finance + Compliance |

### Investment Committee (Quarterly)

**Agenda:**
1. Fund performance review (benchmark comparison, rolling returns)
2. Expense ratio changes by AMC
3. Fund manager changes or AMC regulatory events
4. Fund additions / removals recommendation
5. Default fund review (is Balanced Advantage Fund still appropriate default?)
6. Rebalancing rules review
7. Phase 3 feature updates

**Quorum:** 3 of 4 members (CFO, Compliance Officer, External RIA, AMC non-voting)
**Outcome:** Written minutes signed by quorum; fund changes effective from next month-end

### Grievance Redressal (Ongoing)

| Level | Channel | SLA |
|---|---|---|
| L1 | App in-built form | Acknowledge 2 business days; resolve 7 business days |
| L2 | HR helpline → MFD partner | Escalate within 3 business days of L1 failure |
| L3 | AMC investor relations | SEBI-mandated resolution timeline |
| L4 | SEBI SCORES portal | Regulatory timeline per SEBI norms |

Monthly grievance report: Volume by category (debit failure, KYC issue, portfolio discrepancy, UI issue, fund query, other); resolution rate; open items.

---

## Communication Calendar (Phase 1 Launch)

| Date (Relative to Launch) | Message | Channel | Audience |
|---|---|---|---|
| L-30 days | "Shriram SIP is coming — here's what it means for you" | Email | All pilot employees |
| L-14 days | Auto-enrollment announcement + opt-out instructions | Email + SMS | All pilot employees |
| L-7 days | Reminder: "Your SIP enrollment is 7 days away" | SMS + Push | Non-opted-out employees |
| L-1 day | Final reminder with app download link | SMS | All non-opt-out |
| Launch day | Welcome notification + onboarding prompt | Push + WhatsApp | Auto-enrolled employees |
| L+7 days | "Have you completed your goal setup?" | Push | Enrolled but no goal set |
| First debit D-1 | Pre-debit notification (regulatory) | SMS + Push | All active SIP employees |
| First debit D+1 | Success notification with goal progress | Push + WhatsApp | Successful debit employees |
| Month 2 | "Your first month of investing! Here's your portfolio." | Email + In-app | All enrolled |
| Month 3 | Quarterly portfolio update | Email | All enrolled |
| Month 6 | Mid-pilot NPS survey | Email + In-app | All enrolled |

---

## Team Staffing Plan

### Phase 1 (Months 1–9): Core Team

| Role | FTE | Scope |
|---|---|---|
| Product Manager (SIP) | 1 | End-to-end product; vendor management; roadmap |
| Compliance Officer | 1 | SEBI/AMFI/RBI/DPDP; regulatory monitoring; committee secretary |
| Tech Lead / Integration Manager | 1 | HRMS integration; vendor oversight; platform config |
| Financial Wellness Coordinator (Pilot) | 2 | Employee education; onboarding support; ambassador training |
| Data Analyst | 1 | Enrollment metrics; portfolio analytics; reporting |

### Phase 2 (Months 10–18): Scaled Team

| Additional Hires | FTE | Scope |
|---|---|---|
| Regional Financial Wellness Coordinators | +3 (North, South, West, East) | On-ground ambassador support |
| HR Ambassador Program Manager | 1 | Managing 160+ ambassadors (1 per 500 employees) |
| Vernacular Content Specialist | 1 | 7-language content maintenance; WhatsApp bot training |
| Vendor Relationship Manager | 1 | AMC, MFD, tech platform, payment aggregator |

**Total Phase 2 team: 10–12 FTEs (internal) + fully outsourced operations to partners**
