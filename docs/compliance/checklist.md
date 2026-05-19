# Shriram Group SIP — Regulatory Compliance Checklist

**Owner:** Compliance Officer (Shriram Group SIP team)
**Last Reviewed:** May 2026
**Next Review:** November 2026

Status legend: [ ] Not started | [~] In progress | [x] Complete | [!] Blocked / Needs attention

---

## Part 1 — Legal Structure & Entity Setup

### 1.1 Product Model Clarification — Captive AMC Distribution

**This SIP distributes only Shriram AMC schemes.** This is a captive distribution model — the same structure used by SBI MF through SBI branches, HDFC MF through HDFC Bank, and Kotak MF through Kotak Mahindra Bank. SEBI and AMFI explicitly permit this model subject to mandatory disclosure and suitability obligations.

**Precedent:** SEBI has not prohibited bank-group or financial-group sponsored distribution of own-AMC products. The obligations are: (a) disclose the conflict clearly, (b) still apply suitability norms, (c) never recommend an own-group product that is inappropriate for the investor's risk profile.

### 1.2 Regulatory Structure Decision

- [ ] **Legal opinion obtained** from external counsel (SEBI/AMFI specialist) on complete legal structure
  - Key question 1: Can a Shriram Finance subsidiary (as MFD with ARN) distribute only Shriram AMC schemes to Shriram employees? What disclosures are required?
  - Key question 2: Does "exclusive distribution of own-AMC schemes" violate AMFI Code of Conduct (suitability norms, conflict of interest)?
  - Key question 3: What RPT disclosures are required under SEBI LODR Regulation 23 for Shriram Finance distributing Shriram AMC products to Shriram Group employees?
  - Key question 4: Can the employer mandate minimum SIP contribution as a salary benefit (opt-out structure)?
  - Recommended counsel: AZB & Partners / Cyril Amarchand Mangaldas (SEBI/MF specialists)

- [ ] **Entity role confirmed** in writing:
  - Shriram Finance Ltd. (or designated subsidiary with ARN) = MFD distributing only Shriram AMC schemes
  - Shriram AMC = Fund manager + folio creation + KYC support
  - Technology vendor = Platform utility (onboarding, goal tracking, mandate management)
  - No third-party AMCs involved; all products are Shriram Group products

- [ ] **Board approval obtained** for:
  - Establishing the Shriram Group SIP as an employee benefit
  - Authorizing Shriram Finance / subsidiary to act as MFD for Shriram AMC products for own employees
  - Conflict of interest policy: Investment Committee must evaluate Shriram AMC funds with same rigour as third-party funds
  - Budget allocation for employer matching contribution (Phase 3)
  - Appointment of Investment Committee members (including at least 1 independent external RIA)

---

## Part 2 — SEBI Compliance

### 2.1 Shriram AMC — Regulatory Standing

- [ ] Confirm Shriram AMC is SEBI-registered under Regulation 7 of SEBI (Mutual Funds) Regulations, 1996
  - Verification: SEBI website → Registered Intermediaries → Mutual Funds → Shriram Mutual Fund
  - SEBI Reg No: _____________ | AMFI Member Code: _____________ | Confirmed: [ ]

- [ ] Confirm Shriram AMC complies with SEBI Master Circular on Mutual Funds (June 27, 2024)

- [ ] Confirm all SIP schemes offered are in SEBI-approved categories (from Shriram AMC's SEBI-filed Scheme Information Documents)
  - Verify current live scheme list: AMFI website → NAV → Shriram Mutual Fund
  - Cross-check each scheme's SEBI category against the SIP fund-universe.md

- [ ] Confirm all schemes offer both Direct and Regular plans (SEBI mandate)

- [ ] Internal SLA with Shriram AMC defined: API access, folio creation SLA, NAV feed, transaction confirmation turnaround

### 2.2 Distributor (MFD) — Shriram Finance or Subsidiary

**Model:** Shriram Finance Ltd. (or a designated distribution subsidiary) acts as MFD for Shriram AMC products distributed to own employees. This is equivalent to the bank-AMC group distribution model (SBI / HDFC / Kotak).

- [ ] Identify which Shriram entity will hold the ARN:
  - Option A: Shriram Finance Ltd. directly (if it has or can obtain ARN)
  - Option B: A designated wholly-owned subsidiary (cleaner from RPT perspective)
  - Choice made: _____________ | Rationale documented: [ ]

- [ ] ARN registration confirmed (if new registration needed):
  - Entity identified; NISM Series V-A exam passed by designated personnel
  - KYD (Know Your Distributor) process with AMFI completed
  - ARN issued: _____________ | ARN expiry date: _____________

- [ ] If existing ARN held by Shriram entity: verify active status at amfiindia.com

- [ ] MFD entity holds valid NISM Series V-A certification (Mutual Fund Distributors) for all relevant personnel

- [ ] MFD ARN renewal date confirmed (valid for 3 years; track in compliance calendar)
  - ARN expiry date: _____________

- [ ] MFD partner has completed mandatory Continuing Education Program (CEP) sessions

- [ ] MFD distribution agreement executed with Shriram Group (covering: scope, commission structure, conduct standards, termination)

- [ ] Confirm MFD is NOT simultaneously acting as RIA for the same employees (SEBI prohibition)

- [ ] If considering RIA (Investment Adviser) instead of MFD:
  - [ ] RIA registration number confirmed (SEBI IA registration)
  - [ ] Fee-only model documented (no product commissions for RIA)
  - [ ] Conflict of interest policy reviewed

### 2.3 Captive Distribution — Conflict of Interest Obligations

**AMFI Code of Conduct Requirement:** A distributor recommending only its own group's products must still satisfy suitability norms. Recommending an inappropriate in-house fund (e.g., equity fund for a 6-month goal) because it is Shriram AMC's product is a violation, even if commercially motivated.

- [ ] **Mandatory investor disclosure** built into onboarding flow — shown at fund selection step:
  - Text (verbatim, cannot be abbreviated): *"The mutual fund schemes offered here are managed by Shriram Asset Management Company Ltd., a Shriram Group entity. Shriram Finance Ltd. has a commercial interest in promoting Shriram AMC schemes. You are not required to invest in these schemes."*
  - Employee acknowledgment via checkbox (logged with timestamp)

- [ ] **Suitability engine implemented:** Platform must prevent recommending inappropriate fund for goal
  - Liquid fund must be recommended for emergency corpus — even though equity funds have higher AUM and commission
  - Equity fund must NOT be recommended for a 1-year goal — even if Shriram AMC's equity fund is the flagship
  - Mismatch warning built into platform (hard block or soft warning with mandatory acknowledgment — to be decided with compliance officer)

- [ ] **Annual conflict review certified** by Shriram Group Compliance Officer:
  - Certification statement: "No employee was recommended a Shriram AMC scheme that was unsuitable for their declared risk profile or goal"
  - Signed, dated, filed with Board minutes

- [ ] **Investment Committee independence:** At least 1 member is an independent external RIA (not a Shriram Group employee) who has authority to flag underperforming Shriram AMC funds and recommend pause of new SIP registrations for that fund

- [ ] **Performance disclosure in annual statement:** Each employee's annual SIP statement includes:
  - Shriram AMC fund performance vs. category benchmark (SEBI-mandated comparison)
  - Total trail commission earned by Shriram MFD entity from employee's investment (SEBI disclosure requirement for related-party distributors)

### 2.5 SEBI (April 9, 2025) Circular — Employer SIP

- [ ] Confirm that minimum investment thresholds do NOT apply to employer-mandated employee SIP investments per SEBI April 9, 2025 circular
- [ ] Obtain copy of SEBI Master Circular section confirming this exemption
- [ ] Include in legal structure documentation

### 2.6 Related-Party Transaction (RPT) Governance

**Since Shriram Finance (distributor) is distributing Shriram AMC (fund house) products, this IS a Related-Party Transaction.** The following steps are mandatory:

- [ ] Classify distribution arrangement as RPT under SEBI LODR Regulation 23
- [ ] **Audit Committee pre-approval obtained** (all RPTs require this before commencing)
- [ ] Material RPT test computed:
  - Threshold: Rs. 1,000 Cr or 10% of consolidated annual turnover (whichever lower)
  - Estimated annual trail commission (Shriram MFD ← Shriram AMC): Rs. _______ Cr
  - Material RPT: Yes / No (circle after calculation)
  - If Material: [ ] Shareholder Special Resolution prepared and passed
- [ ] **Arm's length pricing verified:** Trail commission paid to Shriram MFD entity must equal what any independent ARN holder would earn on the same schemes — not inflated or reduced
  - Verification: Compare with 2–3 independent MFD commission schedules for Shriram AMC schemes
- [ ] **RPT disclosure prepared** for: Board's Report, Annual Report, SEBI filing (as applicable)
- [ ] Ongoing: RPT disclosed in every quarterly Board meeting until arrangement continues

### 2.5 SEBI Investment Adviser (RIA) Framework — If Using RIA

- [ ] Confirm selected RIA's registration: https://www.sebi.gov.in (Registered Intermediaries list)
- [ ] Fiduciary obligations documented: duty of care, duty of loyalty, fee disclosure
- [ ] Conflict of interest policy reviewed and accepted
- [ ] Advisory agreement executed

---

## Part 3 — AMFI Compliance

- [ ] ARN of MFD partner verified and active (see Section 2.2)
- [ ] AMFI Code of Conduct for MFDs (Revised April 2022) reviewed and signed by MFD
- [ ] MFD prohibited actions confirmed understood:
  - Cannot use terms: "Adviser," "Financial Adviser," "Wealth Manager" (without RIA registration)
  - Cannot deal in Direct Plans
  - Cannot provide financial planning advice
  - Cannot earn transaction fees on large investments (abolished 2024)
- [ ] Appropriateness check documented: MFD will explain product features and disclose risks to employees
- [ ] AMFI investor education materials integrated into onboarding flow

---

## Part 4 — RBI Compliance (Payment Systems)

### 4.1 NACH E-Mandate Setup

- [ ] Payment aggregator/NPCI partner identified for NACH mandate processing
  - Partner: _____________ | RBI authorization confirmed: [ ]

- [ ] NACH One-Time Mandate (OTM) flow implemented and tested:
  - Employee authenticates with net banking or debit card
  - Mandate registered for recurring SIP debit
  - Maximum amount per mandate set per employee's SIP election

- [ ] **24-hour pre-debit notification system implemented** (RBI E-Mandate Framework, April 22, 2025)
  - Notification includes: amount, date, purpose, opt-out link
  - Channels: SMS mandatory; push notification optional
  - Timing: Exactly 24 hours before debit (not less)

- [ ] **Employee opt-out mechanism** built: employee can opt out of individual debit or cancel entire mandate
  - Opt-out window: Any time before actual debit
  - Opt-out channels: App, web portal, SMS reply, HR helpline

- [ ] **Zero charge to employee** for e-mandate facility confirmed with payment aggregator

- [ ] SIP debit limits confirmed:
  - Up to Rs. 1 lakh: No Additional Factor of Authentication (AFA) required
  - Above Rs. 1 lakh: AFA (OTP) required per debit

- [ ] Mandate failure handling tested (see ops/rollout-plan.md for retry logic)

### 4.2 NACH Mandate Testing

- [ ] End-to-end NACH test completed in sandbox environment (10 test employees minimum)
- [ ] Mandate registration → debit execution → confirmation flow verified
- [ ] Failure scenarios tested: insufficient funds, bank system downtime, mandate cancellation

---

## Part 5 — KYC Compliance

### 5.1 KYC Framework Setup

- [ ] KRA API access obtained from CAMS KRA (https://www.camskra.com) or Karvy KRA
  - KRA partner: _____________ | API sandbox access: [ ] | Production access: [ ]

- [ ] KYC status check flow implemented:
  - On enrollment: System queries KRA with employee PAN
  - Returns: KYC-Validated / KYC-Registered / KYC-On Hold / Not-KYC'd
  - Action per status:
    - KYC-Validated: Proceed directly → full AMC access
    - KYC-Registered: Proceed → limited to partner AMCs only; prompt to upgrade
    - KYC-On Hold: Block enrollment → direct to KYC update flow
    - Not-KYC'd: Initiate V-KYC flow

- [ ] Video KYC (V-KYC) flow integrated via AMC or KRA partner
  - OVD documents accepted: Aadhaar, Passport, Driving License, Voter ID

- [ ] PAN-Aadhaar linking: system checks status; if not linked, prompt employee to link for KYC-Validated status (for unrestricted fund house access)

- [ ] KYC update reminders: employees with KYC-Registered prompted quarterly to upgrade to KYC-Validated

### 5.2 KYC Data Accuracy

- [ ] AML (Anti-Money Laundering) check integrated (via AMC's existing AML system)
- [ ] PEP (Politically Exposed Person) screening: AMC handles; confirm scope

---

## Part 6 — Income Tax Compliance

### 6.1 Employee Tax Communication

- [ ] **Tax regime detection**: onboarding asks employee which tax regime they are on (old / new)
  - New regime is default from FY2025-26; employee must explicitly opt for old regime
  - Affects: ELSS recommendation, 80C deduction availability

- [ ] **ELSS communication**: If employee on new tax regime, ELSS is available but flagged:
  - "Under the new tax regime, ELSS investments do not qualify for Section 80C deduction. However, it remains a good equity investment with 3-year lock-in."

- [ ] **Tax savings illustration**: For old regime employees, show:
  - Section 80C: ELSS SIP contribution up to Rs. 1.5 lakh/year
  - Section 80CCD-1B: NPS contribution up to Rs. 50,000/year (Phase 3)
  - Projected tax saving at employee's income slab

- [ ] **Capital gains education**: Employee-facing content on:
  - LTCG: 12.5% on equity gains above Rs. 1.25 lakh/FY (>12 months holding)
  - STCG: 20% on equity gains (<12 months holding)
  - Debt fund gains: Taxed at slab rate
  - LTCG exemption harvesting: Alert before March 31 each year

### 6.2 Employer Tax Reporting

- [ ] SIP contributions are NOT a separate salary deduction for TDS purposes (employee invests from post-tax salary via NACH mandate from bank account)
  - Clarification: Employer facilitates the SIP but does not deduct from salary before TDS computation (unless employer chooses salary deduction model — needs separate assessment)
  - If employer chooses salary deduction model: [ ] Obtain legal opinion on TDS treatment
  - If bank-debit model (recommended): [ ] No TDS implications for employer; employee manages own taxes

- [ ] **Form 16 / Annual Tax Statement**: Employer must clearly indicate in Form 16 that employee participates in Shriram Group SIP (informational; not a deductible salary component unless salary-deduction model is chosen)

- [ ] **Employer matching contribution** (Phase 3): Obtain tax opinion on whether employer matching SIP contribution is a taxable perquisite under Section 17(2) of Income Tax Act

---

## Part 7 — EPFO Interaction

- [ ] **Internal circular drafted** for all HR teams: "Shriram Group SIP does NOT replace EPF. EPF contributions continue as mandated under EPF & MP Act, 1952. SIP is an additional, voluntary investment benefit."

- [ ] Confirm employee SIP contributions are NOT counted against EPF contribution limits

- [ ] If employer matching is added (Phase 3):
  - [ ] Obtain legal opinion: Is employer SIP match treated separately from EPF employer contribution for PF Act purposes?
  - [ ] Confirm no impact on EPF wage ceiling calculations

- [ ] VPF option: Employees can separately increase VPF contributions; SIP platform should provide informational comparison (EPF/VPF vs. MF SIP trade-offs)

---

## Part 8 — DPDP Act 2023 Compliance

**Key dates:**
- DPDP Rules notified: November 14, 2025
- Full compliance deadline: **May 13, 2027**
- Target: Be compliant by product launch (ahead of deadline)

### 8.1 Data Fiduciary Obligations (Employer)

- [ ] **Legal classification confirmed**: Shriram Group (employer) = Data Fiduciary for employee SIP data
  - Financial institutions (AMC, MFD) processing large-scale data may be classified as Significant Data Fiduciaries — confirm with DPDP Authority guidance

- [ ] **Data Protection Officer (DPO) appointed** within Shriram Group (or legal counsel designated)

- [ ] **Privacy Policy drafted** (DPDP-compliant):
  - Purpose of data collection (SIP enrollment, management, reporting)
  - Data types collected: PAN, Aadhaar (OTP, not stored), bank account, investment data, goal data
  - Data sharing: with AMC, MFD, KRA, payment aggregator (named)
  - Retention period: Until account closure + 1 year (statutory minimum)
  - Employee rights: access, correction, erasure

- [ ] **Consent mechanism** at onboarding:
  - Clear, plain-language consent for financial data processing
  - Separate consent checkbox (not bundled with terms and conditions)
  - Consent log maintained with timestamp

- [ ] **Data Sharing Agreements** executed with:
  - AMC partner(s): data processing scope, security standards, employee data usage restrictions
  - MFD partner: same
  - Technology platform vendor: data processor agreement (DPDP Schedule terms)
  - Payment aggregator / NACH partner: same
  - KRA partner: same

### 8.2 Technical Safeguards

- [ ] All PII encrypted at rest (AES-256) and in transit (TLS 1.3 minimum)
- [ ] Data residency: India-only cloud (AWS Mumbai / Azure Central India)
- [ ] Role-based access control: HR admin sees aggregate data only; employee sees own data only
- [ ] Audit logs maintained for all PII access (who accessed what, when)
- [ ] Penetration testing: Quarterly for production environment
- [ ] Business continuity and disaster recovery plan: RTO < 4 hours; RPO < 1 hour

### 8.3 Employee Rights Management

- [ ] Data access request flow: Employee can request full data export within 72 hours
- [ ] Data correction request: Employee can correct PAN, bank account, nominee details
- [ ] Data erasure on exit: Automated trigger on employee exit date → 1-year countdown → data erasure
  - Exception: Data required for legal/regulatory compliance retained per applicable law

### 8.4 Breach Response

- [ ] Incident response plan documented:
  - Detect → Contain → Assess → Notify DPDP Authority (within 72 hours of discovery)
  - Notify affected employees if high risk
  - Post-incident review and remediation

---

## Part 9 — IRDAI (If ULIPs Are Included)

**Current decision: Shriram Group SIP Phase 1 & 2 do NOT include ULIPs.**
The product uses pure mutual fund SIPs only.

If ULIPs are added in Phase 3+:
- [ ] Obtain IRDAI-registered insurer partner for ULIP distribution
- [ ] Confirm employee communications do NOT advertise ULIP as an investment product (IRDAI June 19, 2024 circular)
- [ ] Add mandatory disclosures: "This is an insurance product with market-linked risk"
- [ ] Separate mortality charge disclosure from investment component

---

## Part 10 — Companies Act, 2013

- [ ] Employee benefit scheme: Board resolution approving Shriram Group SIP as employee benefit
- [ ] Disclosure in Directors' Report: Nature of employee SIP benefit, number of enrolled employees, total assets under management (annual)
- [ ] Shareholder disclosure: If material RPT involved (see Section 2.4)
- [ ] ESOP/ESOS differentiation confirmed: Shriram Group SIP is NOT an equity-based benefit; no SEBI (Share Based Employee Benefits) Regulations apply

---

## Compliance Calendar

| Event | Frequency | Owner | Due Date |
|---|---|---|---|
| ARN renewal check | Annual (3-yr cycle) | Compliance Officer | Track from ARN issue date |
| MFD CEP verification | Annual | Compliance Officer | December each year |
| Fund universe review | Quarterly | Investment Committee | March / June / September / December |
| NACH infrastructure audit | Annual | Tech Lead | April each year |
| KYC status sweep | Quarterly | Compliance + Tech | End of each quarter |
| DPDP compliance audit | Annual | DPO / Legal | November each year |
| SEBI circular review | Monthly | Compliance Officer | 1st week of each month |
| Grievance report to management | Monthly | Compliance Officer | 5th of each month |
| Income tax communication to employees | Annual | HR / Finance | January (before March 31 tax deadline) |
| Annual portfolio statement to employees | Annual | Tech / Ops | April (for previous FY) |
| Board / Investment Committee report | Quarterly | Compliance + Product | End of each quarter |

---

## Red Lines (Do Not Cross)

These actions are prohibited and would constitute regulatory violations:

1. Shriram Group employees/entities providing investment advice without SEBI RIA registration
2. Distribution of mutual funds without valid AMFI ARN
3. Advertising ELSS as a "guaranteed" or "assured return" product
4. Using employee financial data for any purpose other than SIP management (cross-selling, credit scoring, HR evaluation) without separate consent
5. Deducting SIP amounts from employee salary without employee's explicit NACH mandate (bank debit authorization)
6. Commingling SIP funds with employer operating accounts (AMC holds assets directly in employee names)
7. Failing to provide 24-hour pre-debit notification for NACH debits
8. Operating after ARN expiry without renewal
