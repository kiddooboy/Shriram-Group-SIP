# Shriram Group SIP — Fund Universe

**Only Shriram AMC schemes. Purpose-built for Shriram employees.**

This SIP distributes exclusively the mutual fund schemes managed by **Shriram Asset Management Company Ltd.** (Shriram AMC) — the Group's own fund house. This is the same model used by SBI MF through SBI branches, HDFC MF through HDFC Bank, and Kotak MF through Kotak Mahindra Bank. It is SEBI/AMFI-compliant with mandatory related-party disclosure to every investor.

The advantage: employees invest in products managed by their own group's financial expertise, with full visibility into the AMC's philosophy, and Shriram's institutional backing giving employees familiarity and trust.

---

## Disclosure Requirement (AMFI Mandatory)

**Every employee must be shown this at fund selection:**

> *"The mutual fund schemes offered through Shriram Group SIP are managed by Shriram Asset Management Company Ltd., a subsidiary of Shriram Finance Ltd. — your employer. As a related party, Shriram Finance Ltd. has a commercial interest in the growth of Shriram AMC. You are not obligated to invest in Shriram AMC schemes and may choose any mutual fund independently outside this platform. The schemes recommended below are selected for their suitability to your risk profile and goal — not solely because they are Shriram AMC products."*

This disclosure must be:
- Shown during onboarding (before fund selection)
- Acknowledged via checkbox
- Logged with timestamp (compliance audit trail)
- Included in the annual account statement

---

## Shriram AMC Fund Lineup (SIP Universe)

> **Note for implementation team:** Verify the current live scheme list at AMFI (amfiindia.com → NAV → Shriram Mutual Fund) before go-live. Shriram AMC may launch new schemes or modify existing ones. The table below reflects the known lineup as of May 2026 — confirm exact scheme names, SEBI categories, and expense ratios before configuring the platform.

### Equity & Growth Funds

| Fund | SEBI Category | Risk Level | Horizon | Role in SIP |
|---|---|---|---|---|
| Shriram Flexi Cap Fund | Flexi Cap Fund | Moderately High | 7+ years | Core long-term equity; wealth creation |
| Shriram Multi Asset Allocation Fund | Multi Asset Allocation | Moderate | 5+ years | **DEFAULT FUND** for all auto-enrolled employees |
| Shriram Aggressive Hybrid Fund | Aggressive Hybrid | Moderately High | 5+ years | Growth with inbuilt debt cushion |
| Shriram Large Cap Fund | Large Cap Fund | Moderate | 5+ years | Stable equity core; lower volatility |

### Hybrid & Balanced Funds

| Fund | SEBI Category | Risk Level | Horizon | Role in SIP |
|---|---|---|---|---|
| Shriram Multi Asset Allocation Fund | Multi Asset Allocation | Moderate | 5+ years | Default; all-weather allocation across equity + debt + gold |
| Shriram Aggressive Hybrid Fund | Aggressive Hybrid | Moderately High | 5+ years | High equity tilt with debt buffer |
| Shriram Regular Savings Fund | Conservative Hybrid | Low-Moderate | 2–4 years | Capital protection + modest growth; short-term goals |

### Debt & Liquid Funds

| Fund | SEBI Category | Risk Level | Horizon | Role in SIP |
|---|---|---|---|---|
| Shriram Liquid Fund | Liquid Fund | Very Low | 0–3 months | Emergency corpus; SIP parking |
| Shriram Overnight Fund | Overnight Fund | Very Low | Days–weeks | Ultra-short capital parking |
| Shriram Short Duration Fund | Short Duration Fund | Low | 1–3 years | Capital safety + better than FD returns |

---

## The Anchor Product: Shriram Multi Asset Allocation Fund

This is the **flagship scheme and the SIP default** — every auto-enrolled employee starts here.

### Why Multi Asset as the Default

Global evidence (US 401(k) research, NBER behavioral studies) shows that the default fund is the most consequential product design decision — 39–60% of auto-enrolled employees never change it. The default must therefore be an **all-weather, self-rebalancing** fund that works across all risk profiles and market cycles.

The Shriram Multi Asset Allocation Fund fits this role because:

| Feature | Why It Works as Default |
|---|---|
| Allocates across Equity + Debt + Gold (min. 10% each per SEBI) | Built-in diversification; no single asset class dominates |
| Internally rebalanced by fund manager | Employee doesn't need to act; no behavioral error from inaction |
| Moderate risk | Appropriate for the widest range of employees (Personas 1–3) |
| Gold component | Inflation hedge; particularly relevant for Tier 2/3 employees who culturally understand gold |
| 5-year+ horizon | Long enough for equity to perform; short enough for mid-career employees |

**Communication message for employees:**
> *"Your Shriram SIP invests in the Multi Asset Allocation Fund by default — a single fund that spreads your money across stocks, bonds, and gold, just like a seasoned investor would. The fund manager handles all the balancing. You just stay invested."*

---

## Fund × Goal Mapping

### Five Life Goal Categories → Recommended Shriram AMC Fund

| Goal | Horizon | Risk Level | Primary Fund | Secondary Fund |
|---|---|---|---|---|
| **Emergency Corpus** | 0–1 year | Very Low | Shriram Liquid Fund | Shriram Overnight Fund |
| **Short-Term Goals** (marriage, vehicle) | 1–4 years | Low | Shriram Regular Savings Fund | Shriram Short Duration Fund |
| **Medium-Term Goals** (home down payment, education) | 5–10 years | Moderate | Shriram Multi Asset Allocation Fund | Shriram Aggressive Hybrid Fund |
| **Long-Term Wealth Creation** | 10–20 years | Moderate-High | Shriram Flexi Cap Fund | Shriram Aggressive Hybrid Fund |
| **Retirement** | 15–30 years | High → tapering | Shriram Flexi Cap Fund (early years) → Shriram Multi Asset (mid) → Shriram Regular Savings (final 5 years) | — |

### Goal-Fund Assignment Logic (Auto-Selection)

```
Goal = EMERGENCY                → Shriram Liquid Fund (100%)
Goal = MARRIAGE / VEHICLE       → Shriram Regular Savings Fund (70%) +
                                  Shriram Short Duration Fund (30%)
Goal = HOME / EDUCATION (5-10yr)→ Shriram Multi Asset Allocation Fund (100%)
Goal = WEALTH CREATION (10yr+)  → Shriram Flexi Cap Fund (60%) +
                                  Shriram Multi Asset Allocation Fund (40%)
Goal = RETIREMENT (15yr+)
  Persona 1–3 (conservative)    → Shriram Multi Asset Allocation Fund (60%) +
                                  Shriram Flexi Cap Fund (40%)
  Persona 4 (aggressive)        → Shriram Flexi Cap Fund (70%) +
                                  Shriram Aggressive Hybrid Fund (30%)
  Persona 5–6 (near-retirement) → Shriram Regular Savings Fund (40%) +
                                  Shriram Multi Asset Allocation Fund (40%) +
                                  Shriram Short Duration Fund (20%)
```

**Note:** If goal is not set (auto-enrolled, no quiz completed) → **Shriram Multi Asset Allocation Fund, 100%**

---

## Persona × Fund Matrix

| Shriram AMC Fund | Starter (P1) | Grower (P2) | Consolidator (P3) | Accelerator (P4) | Pre-Retiree (P5) | Near-Exit (P6) |
|---|---|---|---|---|---|---|
| Multi Asset Allocation | **Default** | Secondary | Secondary | — | Secondary | — |
| Flexi Cap | — | Primary | Primary | **Primary** | — | — |
| Aggressive Hybrid | — | Secondary | Secondary | Secondary | — | — |
| Large Cap | Optional | Optional | Secondary | Optional | — | — |
| Regular Savings | Secondary | — | — | — | Secondary | **Primary** |
| Short Duration | Secondary | Secondary | — | — | **Primary** | Primary |
| Liquid | **Primary** (emergency) | Optional | Optional | Optional | Optional | Optional |
| Overnight | Optional | — | — | — | — | — |

*Primary = core recommended allocation; Secondary = supplementary; Optional = available on request; — = not recommended by default*

---

## Handling Product Gaps

Shriram AMC, as a focused fund house, may not cover every SEBI category. Where gaps exist, the SIP design handles them as follows:

| Category Gap | Impact | Platform Response |
|---|---|---|
| **No ELSS scheme** (if not offered) | Employees on old tax regime cannot use SIP for 80C deduction | Educate employees: "Use this SIP for wealth creation; for 80C tax saving, consider ELSS from any AMC separately." Do NOT sell a non-Shriram fund to fill this gap. |
| **No Mid Cap / Small Cap scheme** | Accelerator persona (P4) has limited high-growth option | Default to Flexi Cap (which can allocate to mid/small). If Shriram AMC launches these, add them. |
| **No Balanced Advantage / Dynamic AA** | If Multi Asset is not available, no auto-rebalancing default | Use Aggressive Hybrid as secondary default for moderate personas |
| **No International Fund** | No global diversification for high-income employees | Acknowledge the gap; educate employees that global exposure can be taken outside this platform. Do not compromise by selling third-party funds. |

**Key principle:** Only sell what Shriram AMC manages. Never add third-party funds to fill gaps. The product is honest about its scope.

---

## ELSS Gap — Tax Saving Solution

If Shriram AMC does not currently have an ELSS scheme:

**For old tax regime employees:** Shriram AMC Flexi Cap or Multi Asset Allocation Fund does NOT qualify for Section 80C deduction. Employees wanting 80C benefit must invest in an ELSS from any AMC outside this platform.

**Platform communication (honesty first):**
> *"This SIP does not currently offer an ELSS (tax-saving) fund. If you want to save tax under Section 80C, you can invest in ELSS from any AMC through platforms like Zerodha Coin, Groww, or your bank. Your Shriram SIP is for wealth creation — it works alongside your tax-saving investments."*

**Product development recommendation:** Shriram AMC should consider launching a Shriram ELSS Tax Saver scheme. This would be a powerful addition — employee familiarity + 3-year lock-in dramatically improves SIP continuation rates. Filing with SEBI takes 30–60 days; NFO can be launched within 3 months.

---

## Retirement Glide Path (Manual, Until Lifecycle Fund Launches)

Since Shriram AMC does not yet have a Target-Date Fund equivalent, the platform implements a **manual glide path** for retirement goals:

```
Employee Age          Recommended Allocation
22–35                 Shriram Flexi Cap (70%) + Multi Asset (30%)
36–45                 Shriram Flexi Cap (50%) + Multi Asset (40%) + Shriram Regular Savings (10%)
46–50                 Shriram Multi Asset (50%) + Shriram Aggressive Hybrid (25%) + Short Duration (25%)
51–55                 Shriram Multi Asset (40%) + Short Duration (35%) + Regular Savings (25%)
56–60                 Shriram Regular Savings (40%) + Short Duration (40%) + Multi Asset (20%)
```

**Annual rebalancing:** Platform checks employee age on their birthday month → if age band has changed → notifies employee → "We've updated your retirement fund recommendation based on your age. Review and confirm the rebalance."

**Future state (Phase 3):** Shriram AMC to launch "Shriram Lifecycle Fund" series — filed with SEBI in Month 24 of rollout. Until then, the manual glide path above applies.

---

## Fund Evaluation Framework (Investment Committee)

Even though all funds are Shriram AMC products, the Investment Committee must evaluate them with the same rigour as any third-party fund. This is required by AMFI's suitability obligations.

### Quarterly Review Metrics

| Metric | Good | Watch | Remove from SIP |
|---|---|---|---|
| Rolling 1-yr return vs. category benchmark | > benchmark | benchmark – 1% to benchmark | < benchmark by > 2% for 3 consecutive quarters |
| Rolling 3-yr return vs. category benchmark | > benchmark | benchmark – 1% | Underperformance sustained |
| Expense ratio vs. category average | Below average | At average | Significantly above average without justification |
| AUM | > Rs. 200 Cr | Rs. 50–200 Cr | < Rs. 50 Cr (liquidity risk) |
| Sharpe Ratio | > category median | At median | Below median for 3+ quarters |
| Fund manager change | None | 1 change | > 1 change in 12 months without explanation |

**Important:** If a Shriram AMC fund consistently underperforms and no corrective action is taken by Shriram AMC, the Investment Committee must pause SIP registrations for that fund even though it is an in-house product. AMFI's suitability norms override commercial interest. This preserves employee trust and regulatory standing.

### Annual Conflict Review

Shriram Group Compliance must annually certify:
- Scheme recommendations are based on employee suitability, not commercial interest
- No employee was sold a scheme that was inappropriate for their risk profile or goal horizon
- Fund performance disclosures in the annual statement are accurate and unedited

---

## Direct Plan vs. Regular Plan

**Decision for Shriram AMC captive model:**

Since the distribution is captive (Shriram Group facilitating SIP for Shriram AMC), the platform should use **Regular Plans** — the trail commission stays within the Shriram Group ecosystem (distributed to the MFD entity or used to fund the SIP platform operations).

However, employees should be informed:
- Regular plan expense ratios are slightly higher than direct plans
- Direct plans are available to any employee who wants to invest in Shriram AMC funds independently outside this platform

**Communication:** *"This platform uses Regular Plans. The difference in expense ratio supports the cost of running this program — your goal tracking, customer support, and auto-debit service. Direct plans for these same schemes are available at shriram-amc.com if you prefer."*

---

## Fund Profile Cards (Employee-Facing)

Each fund has a simplified "Fund Card" shown in the app, designed for low-to-moderate financial literacy:

### Example: Shriram Multi Asset Allocation Fund Card

```
┌──────────────────────────────────────────────────────┐
│  🏦 Shriram Multi Asset Allocation Fund              │
│  By: Shriram Asset Management Company               │
│                                                      │
│  What it does:                                       │
│  "Spreads your money across stocks, bonds, and gold  │
│   automatically. Good for medium-to-long term goals  │
│   without needing to manage it yourself."            │
│                                                      │
│  Risk:     ████████░░  MODERATE                      │
│  Horizon:  5 years+                                  │
│  Type:     Multi Asset (Equity + Debt + Gold)        │
│                                                      │
│  3-Year Return:  X.X% p.a.  (Category avg: X.X%)   │
│  Expense:  X.XX%/year                                │
│                                                      │
│  ⚠️ Shriram Group is related to this fund's AMC     │
│     [See disclosure]                                 │
│                                                      │
│  [Invest Now]           [Learn More]                 │
└──────────────────────────────────────────────────────┘
```

Key design principles:
- No financial jargon in fund name explanation
- Risk meter as visual bar (not "Moderately High" text alone)
- Related-party flag visible but non-alarming — with "learn more" link
- 3-year return shown vs. category average (not just absolute number — context matters)
- Horizon stated in plain language (years, not "long duration")
