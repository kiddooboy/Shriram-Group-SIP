# Shriram Group SIP — API & Integration Design

**Version:** 1.0 | **Owner:** Tech Lead

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         EMPLOYEE-FACING LAYER                            │
│                                                                          │
│   Mobile App (React Native)  │  Web Portal (React.js)  │  WhatsApp Bot  │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ HTTPS / WSS
┌──────────────────────────────▼───────────────────────────────────────────┐
│                        API GATEWAY (Kong / AWS API Gateway)              │
│        Auth (JWT)  │  Rate Limiting  │  Logging  │  TLS Termination      │
└───────────┬──────────────────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────────────────┐
│                        CORE MICROSERVICES                                │
│                                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │   Profile   │ │    Goal     │ │  Portfolio   │ │   Notification   │  │
│  │   Service   │ │   Engine    │ │   Service    │ │    Service       │  │
│  └──────┬──────┘ └──────┬──────┘ └──────┬───────┘ └────────┬─────────┘  │
│         │               │               │                  │             │
│  ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼───────┐ ┌───────▼─────────┐  │
│  │     KYC     │ │  SIP Order  │ │   Mandate    │ │    Analytics    │  │
│  │   Service   │ │   Service   │ │   Service    │ │    Service      │  │
│  └──────┬──────┘ └──────┬──────┘ └──────┬───────┘ └────────┬─────────┘  │
│         │                                                               │
│  ┌──────▼──────────────────────────────────────────────────────────┐   │
│  │              AI RECOMMENDATION SERVICE  ★                       │   │
│  │  Feature Engineering → Model Inference → Explainability          │   │
│  │  (AWS SageMaker endpoint; XGBoost; SHAP explainability)         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────┼───────────────┼───────────────┼──────────────────┼─────────────┘
          │               │               │                  │
┌─────────▼───────────────▼───────────────▼──────────────────▼─────────────┐
│                         EXTERNAL INTEGRATIONS                            │
│                                                                          │
│  HRMS/Payroll  │  AMC APIs/BSE  │  KRA/KYC  │  NACH/RBI  │  WhatsApp   │
│  (SAP/Oracle)  │  StAR MF/MFU  │  (CAMS)   │  (NPCI)    │  Cloud API  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Mobile | React Native (iOS + Android) | Single codebase; large talent pool in India |
| Web frontend | React.js | Component reuse with mobile; good ecosystem |
| API gateway | Kong or AWS API Gateway | Rate limiting, auth, logging, TLS |
| Backend services | Node.js (Express) or Java Spring Boot | Shriram IT preference; microservices-friendly |
| Message queue | Apache Kafka or AWS SQS | Async SIP order processing; decouple services |
| Database — transactional | PostgreSQL | ACID compliance for financial transactions |
| Database — portfolio snapshots | MongoDB | Flexible schema for portfolio history |
| Cache | Redis | Session management, KYC status cache |
| Search | Elasticsearch | Fund search, transaction history queries |
| Infrastructure | AWS Mumbai (ap-south-1) or Azure India Central | India data residency (DPDP compliance) |
| Container orchestration | Kubernetes (EKS or AKS) | Auto-scaling for SIP debit peak days |
| CI/CD | GitHub Actions + ArgoCD | Standard modern pipeline |
| Monitoring | Datadog or AWS CloudWatch | APM + log aggregation |

---

## Core Services — API Contracts

### 1. Profile Service

Manages employee profile, persona, and KYC status.

**Base URL:** `/api/v1/profile`

```
GET    /api/v1/profile/{employeeId}
       → Returns: profile, persona, KYC status, tax regime, goals[]

POST   /api/v1/profile/{employeeId}/persona-quiz
       Body: { age_band, income_band, dependents, primary_goal, risk_response }
       → Returns: { persona: "GROWER", confidence: 0.87, adjustable: true }

PUT    /api/v1/profile/{employeeId}/persona
       Body: { persona: "CONSOLIDATOR", reason: "self_override" }

PUT    /api/v1/profile/{employeeId}/tax-regime
       Body: { regime: "old" | "new" }
       → Triggers: fund recommendation recalculation

GET    /api/v1/profile/{employeeId}/recommendations
       → Returns: recommended funds[], suggested SIP amount, goal suggestions[]
```

**Employee Profile Schema:**
```json
{
  "employee_id": "SHR-12345",
  "pan": "ABCDE1234F",
  "kyc_status": "KYC_VALIDATED | KYC_REGISTERED | KYC_ON_HOLD | NOT_KYC",
  "persona": "GROWER",
  "tax_regime": "old",
  "salary_band": "6L_12L",
  "location_tier": "tier_1",
  "enrolled_at": "2026-06-01T10:30:00Z",
  "auto_enrolled": true,
  "goals": [],
  "created_at": "2026-06-01T10:00:00Z",
  "updated_at": "2026-06-01T10:30:00Z"
}
```

---

### 2. Goal Engine

Manages employee life goals and maps to recommended fund allocations.

**Base URL:** `/api/v1/goals`

```
GET    /api/v1/goals/{employeeId}
       → Returns: goals[] with progress, target, shortfall, SIP amount

POST   /api/v1/goals/{employeeId}
       Body: { goal_type, target_amount, target_date, monthly_sip }
       → Returns: { goal_id, recommended_funds[], projected_completion, shortfall_risk }

PUT    /api/v1/goals/{goalId}
       Body: { target_amount?, target_date?, monthly_sip? }

DELETE /api/v1/goals/{goalId}

GET    /api/v1/goals/{goalId}/progress
       → Returns: { current_corpus, target, pct_complete, projected_date, on_track: bool }

GET    /api/v1/goals/{goalId}/rebalance-check
       → Returns: { drift_pct, rebalance_needed: bool, recommended_action }
```

**Goal Schema:**
```json
{
  "goal_id": "GOAL-78901",
  "employee_id": "SHR-12345",
  "goal_type": "CHILD_EDUCATION | RETIREMENT | HOME | EMERGENCY | WEALTH | MARRIAGE | VEHICLE",
  "target_amount": 2800000,
  "target_date": "2038-06-01",
  "current_corpus": 145000,
  "monthly_sip": 5000,
  "assigned_funds": [
    { "fund_slot": 2, "allocation_pct": 60 },
    { "fund_slot": 1, "allocation_pct": 40 }
  ],
  "status": "ON_TRACK | AT_RISK | ACHIEVED",
  "created_at": "2026-06-01T10:30:00Z"
}
```

**Goal Type → Default Fund Mapping Logic:**
```
EMERGENCY         → fund_slot: 9 (Liquid Fund), 100%
VEHICLE/MARRIAGE  → fund_slot: 7 (Conservative Hybrid) 70% + fund_slot: 9 30%
HOME (5-10yr)     → fund_slot: 6 (Balanced Advantage) 60% + fund_slot: 8 40%
EDUCATION (7-12yr)→ fund_slot: 2 (Flexi Cap) 60% + fund_slot: 8 40%
WEALTH (10yr+)    → fund_slot: 2 50% + fund_slot: 3 30% + fund_slot: 1 20%
RETIREMENT (15yr+)→ persona-based (see fund-universe.md default logic)
```

---

### 3. AI Recommendation Service ★

The core differentiation engine. Called immediately after authentication; pre-computes fund + amount + tenure before the employee sees any input form.

**Base URL:** `/api/v1/recommend`

```
POST   /api/v1/recommend/{employeeId}
       Body: {
         context: {
           income_band: "BELOW_2L" | "2L_4L" | "4L_6L" | "6L_10L" | "10L_15L" | "ABOVE_15L",
           family_situation: "SINGLE" | "MARRIED_NO_KIDS" | "MARRIED_WITH_KIDS" | "SUPPORTING_PARENTS",
           primary_goal: "EMERGENCY" | "BIG_PURCHASE" | "CHILD_FUTURE" | "HOME" | "RETIREMENT"
         }
       }
       // Note: salary and designation are NOT in this payload — Shriram HRMS does not share them.
       // income_band is self-declared by the employee (annual income bracket).
       // Body is optional — if omitted, AI uses HRMS signals only with conservative floor defaults.
       
       → Returns:
       {
         "recommendation": {
           "fund": {
             "scheme_code": "SMAAF-G-REG",
             "name": "Shriram Multi Asset Allocation Fund - Regular - Growth",
             "allocation_pct": 100,
             "reason_key": "multi_asset_education_moderate"
           },
           "sip_amount": 4500,
           "sip_amount_min": 3500,   // slider lower bound
           "sip_amount_max": 6000,   // slider upper bound
           "tenure_months": 144,
           "tenure_display": "12 years",
           "projected_corpus": 1420000,
           "projected_corpus_display": "Rs. 14.2 lakh",
           "cagr_assumed": 12.0,
           "reasoning": {
             "en": "Based on your income level and 2 dependents, Rs. 4,500/month fits your budget. 12 years aligns with your child's college timeline. The Multi Asset Fund balances growth and stability automatically.",
             "hi": "आपकी आय और 2 आश्रितों को देखते हुए...",
             "ta": "..."
           },
           "persona_inferred": "GROWER",
           "confidence_score": 0.81,
           "alternatives": [
             {
               "fund_scheme_code": "SFF-G-REG",
               "fund_name": "Shriram Flexi Cap Fund - Regular - Growth",
               "sip_amount": 4500,
               "tenure_months": 144,
               "projected_corpus": 1680000,
               "reason_key": "flexi_cap_higher_growth",
               "reasoning": { "en": "Higher equity exposure means potentially better returns, but more short-term volatility." }
             }
           ]
         },
         "model_version": "shriram-sip-rec-v1.2",
         "generated_at": "2026-06-01T09:45:00Z"
       }

POST   /api/v1/recommend/{employeeId}/refresh
       // Re-runs recommendation after: salary revision, goal change, family status update
       Body: { trigger: "SALARY_REVISION" | "GOAL_CHANGE" | "FAMILY_UPDATE" }
       → Same response shape as above

POST   /api/v1/recommend/{employeeId}/feedback
       Body: {
         recommendation_id: "...",
         action: "ACCEPTED" | "AMOUNT_ADJUSTED" | "FUND_CHANGED" | "TENURE_ADJUSTED" | "REJECTED",
         final_amount: 5000,          // what employee actually chose
         final_fund_code: "SFF-G-REG",
         final_tenure_months: 144
       }
       // Critical: logs every interaction for model retraining
       → Returns: { logged: true }

GET    /api/v1/recommend/{employeeId}/history
       → Returns: all recommendation versions for this employee (audit trail)
```

**Performance contract:**
- P95 latency: < 300ms (HRMS signals cached in Redis; model served via SageMaker)
- Called once per login session (result cached for session duration)
- Re-computed on: salary revision event, goal change, family status update

**Caching strategy:**
```
Redis cache key: recommend:{employee_id}:{context_hash}
TTL: 24 hours (recommendation stays fresh for one day without re-inference)
Invalidate on: HRMS update event, goal change, family update
```

### 4. SIP Order Service

Handles SIP registration, modification, pause, and cancellation with AMC/BSE StAR MF.

**Base URL:** `/api/v1/sip`

```
POST   /api/v1/sip/register
       Body: { employee_id, goal_id, fund_slot, amount, frequency, start_date, bank_mandate_id }
       → Async: Submits to BSE StAR MF; returns { sip_ref_id, status: "PENDING" }

GET    /api/v1/sip/{sipRefId}/status
       → Returns: { status: "ACTIVE|PAUSED|CANCELLED|PENDING", next_debit_date, amount }

PUT    /api/v1/sip/{sipRefId}/amount
       Body: { new_amount }  // step-up or step-down
       → Returns: { status: "AMENDMENT_PENDING", effective_date }

POST   /api/v1/sip/{sipRefId}/pause
       Body: { months: 1-3 }  // temporary pause
       → Notifies AMC; pauses NACH mandate for specified months

DELETE /api/v1/sip/{sipRefId}
       → Cancels SIP at AMC; cancels NACH mandate

GET    /api/v1/sip/{employeeId}/active
       → Returns: all active SIPs for employee with amounts, funds, next debit
```

**Order Lifecycle:**
```
EMPLOYEE_INITIATED
  → MANDATE_PENDING (awaiting NACH registration)
  → MANDATE_ACTIVE
  → SIP_REGISTERED (at BSE StAR MF / AMC)
  → FIRST_DEBIT_SCHEDULED
  → [Monthly cycle: DEBIT_INITIATED → DEBIT_SUCCESS → UNITS_ALLOCATED]
                                    → DEBIT_FAILED → RETRY_SCHEDULED
```

---

### 4. Mandate Service

Manages NACH e-mandate lifecycle with payment aggregator.

**Base URL:** `/api/v1/mandate`

```
POST   /api/v1/mandate/initiate
       Body: { employee_id, bank_account_number, ifsc, max_amount, purpose }
       → Returns: { mandate_id, redirect_url }  // redirect to net banking for auth

GET    /api/v1/mandate/{mandateId}/status
       → Returns: { status: "PENDING|ACTIVE|REJECTED|CANCELLED", urn }

POST   /api/v1/mandate/{mandateId}/cancel
       → Cancels mandate with NPCI; stops all future debits

POST   /api/v1/mandate/pre-debit-notify
       Body: { mandate_id, amount, debit_date, purpose }
       → Triggers 24-hour pre-debit notification to employee (RBI compliance)
       → Must be called exactly 24 hours before each debit
```

**NACH Pre-Debit Notification Job:**
```
Cron: Runs daily at 8:00 AM
For each SIP with debit_date = tomorrow:
  1. Look up active mandate
  2. Call /api/v1/mandate/pre-debit-notify
  3. Send SMS (mandatory) + push notification (optional)
  4. Log notification timestamp (compliance audit trail)
```

---

### 5. Portfolio Service

Fetches and manages portfolio data from AMC/BSE StAR MF.

**Base URL:** `/api/v1/portfolio`

```
GET    /api/v1/portfolio/{employeeId}
       → Returns: { total_invested, current_value, xirr, folios[], goal_breakdowns[] }

GET    /api/v1/portfolio/{employeeId}/transactions
       Query: ?page=1&limit=50&fund_slot=2&from=2026-01-01
       → Returns: paginated transaction history

GET    /api/v1/portfolio/{employeeId}/xirr
       → Returns: { overall_xirr, by_goal[], by_fund[], vs_benchmark }

POST   /api/v1/portfolio/{employeeId}/snapshot
       → Persists daily NAV snapshot to MongoDB (called by daily batch job)

GET    /api/v1/portfolio/{employeeId}/tax-summary
       Query: ?fy=2025-26
       → Returns: { stcg_gains, ltcg_gains, ltcg_exempt, ltcg_taxable, elss_deduction_eligible }
```

**Transaction Schema:**
```json
{
  "txn_id": "TXN-20260601-78901",
  "employee_id": "SHR-12345",
  "sip_ref_id": "SIP-45678",
  "goal_id": "GOAL-78901",
  "fund_slot": 2,
  "fund_name": "HDFC Flexi Cap Fund - Direct",
  "type": "SIP_PURCHASE | LUMP_SUM | REDEMPTION | SWITCH",
  "amount": 5000.00,
  "nav": 42.35,
  "units": 118.063,
  "folio_number": "HDFC-12345678",
  "status": "SUCCESS | FAILED | PENDING",
  "debit_date": "2026-06-01",
  "allotment_date": "2026-06-02",
  "created_at": "2026-06-01T09:00:00Z"
}
```

---

### 6. KYC Service

Handles KYC status checks and V-KYC initiation.

**Base URL:** `/api/v1/kyc`

```
GET    /api/v1/kyc/{pan}
       → Queries KRA (CAMS KRA API)
       → Returns: { status: "KYC_VALIDATED|KYC_REGISTERED|KYC_ON_HOLD|NOT_KYC", 
                    folio_restricted: bool, can_invest_any_amc: bool }

POST   /api/v1/kyc/initiate-vkyc
       Body: { employee_id, preferred_amc }
       → Returns: { vkyc_url, session_id, expires_at }

GET    /api/v1/kyc/{employeeId}/status-history
       → Returns: KYC status change log (for compliance audit)
```

**KYC Status → Action Matrix:**
```
KYC_VALIDATED     → Proceed; unrestricted fund access (any AMC)
KYC_REGISTERED    → Proceed; only partner AMC(s); show upgrade prompt
KYC_ON_HOLD       → Block; show: "Update your KYC documents to continue"
NOT_KYC           → Initiate V-KYC; cannot invest until complete
```

---

### 7. Notification Service

Centralized notification dispatcher across SMS, push, email, WhatsApp.

**Base URL:** `/api/v1/notify`

```
POST   /api/v1/notify/send
       Body: {
         employee_id,
         channel: ["sms", "push", "email", "whatsapp"],
         template_id: "SIP_DEBIT_SUCCESS",
         variables: { amount, goal, corpus_pct },
         language: "hi" | "ta" | "te" | "kn" | "mr" | "bn" | "ml" | "en"
       }
       → Async delivery via appropriate gateway
```

**Notification Templates:**

| Template ID | Trigger | Channels | Message (en) |
|---|---|---|---|
| SIP_DEBIT_TOMORROW | D-1 24hr pre-debit | SMS (mandatory) + Push | "Your SIP of Rs. {amount} for {goal} will be debited tomorrow from your bank account. To skip this debit, click {opt_out_link}" |
| SIP_DEBIT_SUCCESS | Debit confirmed | Push + WhatsApp | "Rs. {amount} invested! Your {goal} corpus is now Rs. {corpus} ({pct}% of target)." |
| SIP_DEBIT_FAILED | NACH bounce | SMS + Push | "Your SIP of Rs. {amount} could not be debited. Please ensure sufficient balance. We'll retry on {retry_date}." |
| SIP_UNITS_ALLOTTED | Units allocated | Push | "Rs. {amount} invested at NAV Rs. {nav}. Units added: {units}." |
| GOAL_MILESTONE | Goal 25/50/75/100% | Push + In-app | "You're {pct}% of the way to {goal}! Keep going!" |
| PORTFOLIO_QUARTERLY | Quarterly | Email + Push | "Your portfolio update for {quarter}: Current value Rs. {value}. XIRR: {xirr}%." |
| SIP_ESCALATION_PROMPT | April appraisal | Push + Email | "Your salary grew! Suggested SIP increase: Rs. {amount}/month. Approve in 1 tap." |
| LTCG_ALERT | Feb 28 annually | Push + Email | "Tax tip: Book up to Rs. 1.25 lakh in long-term gains tax-free before March 31." |
| KYC_UPGRADE_PROMPT | Quarterly (KYC-Reg) | Push | "Upgrade your KYC to access all fund houses. Takes 5 minutes." |

**WhatsApp Bot Commands (Vernacular supported):**
```
"my sip" / "मेरा SIP"   → Returns active SIPs and last debit status
"balance" / "शेष राशि"   → Returns total portfolio value
"pause sip"              → Initiates SIP pause flow
"stop sip"               → Initiates SIP cancellation flow
"goal status"            → Returns goal progress for all goals
"help" / "मदद"          → Returns command list in employee's preferred language
```

---

## External Integrations

### Integration 1 — HRMS / Payroll (SAP HR or Oracle HCM)

**Purpose:** Employee data sync, salary revision triggers, organizational structure

**Data Flow:**
```
Daily batch (SFTP or REST API):
  HRMS → Shriram SIP Platform
    Payload: employee_id, name, employee_status (active/exited), 
             salary_band, joining_date, department, location, 
             appraisal_date, annual_increment_pct
  
  Trigger events:
    EMPLOYEE_JOINED    → Auto-enrollment workflow
    SALARY_REVISED     → SIP escalation notification
    EMPLOYEE_EXITED    → SIP suspension + data erasure countdown
    DEPARTMENT_CHANGED → Persona re-assessment prompt
```

**Authentication:** Service-to-service OAuth 2.0 client credentials flow

**Frequency:**
- Full sync: Daily at 2:00 AM (batch)
- Event triggers: Near-real-time via webhook or Kafka topic

**Failure handling:**
- HRMS sync failure: Retry with exponential backoff (3 attempts over 30 minutes)
- If HRMS unavailable >24 hours: Alert tech lead; freeze new enrollments; existing SIPs continue unaffected

---

### Integration 2 — BSE StAR MF / MFU (AMC Transaction Platform)

**Purpose:** SIP registration, order placement, redemption, portfolio data

**BSE StAR MF Overview:**
- Industry-standard platform for MF transactions in India
- Supports: SIP registration (SIP Registration Number / SRN), lump sum, redemption, switch
- AMC coverage: All major AMCs registered on BSE platform

**Transaction Flow:**
```
SIP Registration:
  Platform → BSE StAR MF API
    POST /sip/register
    { client_code, amc_code, scheme_code, amount, frequency, 
      start_date, end_date, folio_number, mandate_urn }
    ← { sip_registration_number, status }

Monthly SIP Processing:
  BSE StAR MF triggers debit on mandate
  ← Sends transaction confirmation with { units, nav, allotment_date }

Portfolio Data Pull:
  GET /portfolio/{client_code}
  ← { folios[], schemes[], units[], nav[], current_value[] }
```

**Authentication:** BSE StAR MF member credentials (obtained after empanelment); API key + HMAC signature

**Empanelment requirement:** MFD partner must be BSE StAR MF registered member; Shriram SIP platform acts as technology arm of the MFD

**Fallback:** If BSE StAR MF unavailable, route through AMC direct API (backup channel)

---

### Integration 3 — AMC Direct APIs

**Purpose:** Fallback for BSE StAR MF; NAV data; fund-specific operations

**API type:** REST (each AMC has slightly different API; abstraction layer needed)

**Operations:**
```
GET /nav?scheme_code={code}&date={date}     → Current NAV
GET /scheme/{code}/info                      → Fund details, exit load, benchmark
POST /folio/create                           → Create new investor folio
GET /portfolio/{pan}                         → Investor portfolio from this AMC
POST /transaction                            → Lump sum / redemption
```

**Abstraction layer design:** Build a unified `AmcAdapter` interface that normalizes across SBI MF, HDFC MF, Mirae Asset APIs:

```javascript
interface AmcAdapter {
  getNav(schemeCode: string, date: Date): Promise<NavData>
  createFolio(investorDetails: InvestorDetails): Promise<FolioNumber>
  placeOrder(order: OrderRequest): Promise<OrderConfirmation>
  getPortfolio(pan: string): Promise<PortfolioData>
}
```

---

### Integration 4 — KRA (CAMS KRA API)

**Purpose:** KYC status check, V-KYC initiation, KYC update

**Endpoint:** CAMS KRA production API (sandbox available for testing)

**Operations:**
```
GET /kyc/status?pan={pan}
    ← { status: "V|R|OH|N", kyc_date, kyc_type, poa_verified }

POST /kyc/vkyc/initiate
    Body: { pan, dob, mobile, amc_code }
    ← { session_url, session_id, expires_at }

GET /kyc/status/{session_id}
    ← { completed: bool, status: "V|R" }
```

**Caching:** KYC status cached in Redis for 24 hours (reduces API calls; KYC status changes are rare)

---

### Integration 5 — NACH / NPCI (Payment System)

**Purpose:** SIP auto-debit mandate registration and execution

**Partner options:** Digio, Signzy, Razorpay eNACH, Airtel Payment Gateway

**Mandate Registration Flow:**
```
1. Platform calls payment aggregator API:
   POST /mandate/create
   { employee_id, bank_account, ifsc, max_amount, start_date, end_date, purpose }
   ← { mandate_id, redirect_url }  // employee completes net banking auth

2. Employee redirected to bank's net banking for OTP-based authorization

3. Webhook callback to Platform:
   POST /api/v1/mandate/callback
   { mandate_id, status: "ACTIVE|REJECTED", urn }

4. NACH URN stored; linked to SIP order
```

**Debit Execution:**
- Handled by payment aggregator on scheduled debit date
- Platform receives webhook on success/failure
- Failure reasons: Insufficient funds, account closed, mandate cancelled, technical failure

**Pre-debit notification requirement:**
- Platform must send notification exactly 24 hours before each debit
- Include: amount, date, purpose, opt-out link
- Log: timestamp of notification sent (compliance audit)

---

### Integration 6 — WhatsApp Business API (Meta Cloud API)

**Purpose:** Vernacular conversational interface for Tier 2/3 employees

**Integration:** Meta WhatsApp Business Cloud API (WABA)

**Setup requirements:**
- WhatsApp Business Account (WABA) approval from Meta
- Verified business phone number
- Message templates pre-approved by Meta for transactional messages

**Bot Framework:** Build on Dialogflow CX or Botpress; trained on SIP-related intents in 7 languages

**Session Management:**
```
Incoming message → Language detection (or employee profile preference)
                → Intent classification
                → Context lookup (employee_id from phone number mapping)
                → Response generation
                → WhatsApp Cloud API send
```

**Phone number mapping:** Employee registers their WhatsApp number at onboarding; stored in profile

**Fallback:** If bot cannot answer (confidence <70%), escalate to human agent via HR helpline

---

## Database Schema (Key Tables)

### PostgreSQL — Transactional

```sql
-- Core tables
employees (employee_id PK, pan, kyc_status, persona, tax_regime, 
           salary_band, location_tier, enrolled_at, auto_enrolled, 
           exit_date, data_erasure_scheduled_at, created_at, updated_at)

goals (goal_id PK, employee_id FK, goal_type, target_amount, 
       target_date, monthly_sip, status, created_at, updated_at)

goal_fund_allocations (allocation_id PK, goal_id FK, fund_slot, 
                       allocation_pct, effective_from, effective_to)

sip_orders (sip_ref_id PK, employee_id FK, goal_id FK, fund_slot, 
            amount, frequency, start_date, end_date, status, 
            bse_sip_reg_number, folio_number, created_at, updated_at)

mandates (mandate_id PK, employee_id FK, bank_account_last4, ifsc, 
          max_amount, urn, status, valid_from, valid_to, created_at)

transactions (txn_id PK, employee_id FK, sip_ref_id FK, goal_id FK, 
              fund_slot, txn_type, amount, nav, units, folio_number, 
              status, debit_date, allotment_date, bse_order_id, created_at)

-- Compliance
notification_log (log_id PK, employee_id FK, template_id, channel, 
                  language, status, sent_at, mandate_id, debit_date)
                  -- Critical for 24-hr pre-debit compliance audit

kyc_events (event_id PK, employee_id FK, pan, old_status, new_status, 
            triggered_by, created_at)
```

### MongoDB — Portfolio Snapshots

```javascript
// Daily NAV snapshots (append-only)
{
  _id: ObjectId,
  employee_id: "SHR-12345",
  snapshot_date: ISODate("2026-06-01"),
  total_invested: 60000,
  current_value: 68450,
  xirr: 14.2,
  goals: [
    {
      goal_id: "GOAL-78901",
      goal_type: "CHILD_EDUCATION",
      current_corpus: 45000,
      target_amount: 2800000,
      pct_complete: 1.6
    }
  ],
  funds: [
    {
      fund_slot: 2,
      folio_number: "HDFC-12345678",
      units: 1234.567,
      nav: 42.35,
      current_value: 52284
    }
  ]
}
```

---

## Security Requirements

### Authentication & Authorization

- **Employee auth:** Employee ID + Aadhaar OTP (login); JWT with 8-hour expiry; refresh token 30 days
- **HR admin auth:** SSO via Shriram corporate identity provider (SAML 2.0 / Azure AD)
- **Service-to-service:** OAuth 2.0 client credentials; per-service secrets rotated monthly
- **API gateway:** All external APIs protected behind gateway with rate limiting (100 req/min per employee)

### Data Security

- **Encryption at rest:** AES-256 for all PII (PAN, Aadhaar reference, bank account details)
- **Encryption in transit:** TLS 1.3 minimum; TLS 1.2 acceptable only for legacy integrations
- **PAN masking:** ABCDE****F in all logs, admin views, and non-essential displays
- **Aadhaar:** Never store Aadhaar number; store only Virtual ID (VID) or consent artifact
- **Bank account:** Store last 4 digits only; full number transmitted directly to payment aggregator (never stored in SIP platform)

### Vulnerability Management

- **Penetration testing:** Quarterly by CERT-In empaneled security auditor
- **SAST:** Integrated in CI/CD pipeline (SonarQube or Snyk)
- **DAST:** Monthly automated scanning
- **Dependency scanning:** Automated with Dependabot; critical vulnerabilities patched within 48 hours

---

## Performance & Scalability

### Load Characteristics

- **Peak load:** 1st of each month (SIP debit day) — 80,000 concurrent notifications
- **Normal load:** 3,000–5,000 daily active users
- **Batch operations:** HRMS sync (80,000 records/night), NAV snapshot (80,000 employees/night)

### SLAs

| Operation | Target Latency | SLA Uptime |
|---|---|---|
| Portfolio load | < 1.5 seconds | 99.5% |
| SIP registration | < 3 seconds | 99.5% |
| KYC status check | < 800ms | 99.9% |
| Notification delivery (SMS) | < 30 seconds | 99.5% |
| Monthly batch (HRMS sync) | < 2 hours | 99% |

### Auto-Scaling

- Kubernetes HPA (Horizontal Pod Autoscaler) on API pods
- Scale trigger: CPU >70% or memory >80%
- Min replicas: 2 (always on); Max replicas: 20 (SIP debit day)
- Database connection pooling: PgBouncer for PostgreSQL

---

## Build vs. Buy Recommendation

**Recommended approach: White-label a fintech SaaS platform + custom employer layer**

| Component | Build vs. Buy | Rationale |
|---|---|---|
| Core MF transaction engine | BUY (Fisdom for Business / Wealthy Enterprise / Groww for Teams) | Pre-built BSE StAR MF, KRA, NACH integrations; SEBI-compliant; 6–12 months faster to market |
| Employee portal (web + mobile) | WHITE-LABEL + customize | Brand as Shriram; customize persona quiz, goal UI, vernacular |
| HRMS integration layer | BUILD | Shriram-specific; SAP HR / Oracle HCM; no off-shelf solution |
| Admin dashboard | BUILD | Shriram-specific employer console; HR analytics |
| WhatsApp bot | BUILD on bot framework | Vernacular; Shriram-specific intents |
| Notification engine | BUY (AWS SNS / Twilio) | Commodity; no differentiation in building |

**Estimated timelines:**
- Buy + white-label: Production-ready in 4–5 months
- Full custom build: 10–14 months
- Recommendation: White-label for Phase 1 pilot; evaluate custom build for Phase 2 if gaps identified
