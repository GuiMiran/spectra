# Variable Guide — How to Fill the Prompt

> For each `{{VARIABLE}}`, here's what to put, with examples by business type.

---

## Required Variables

| Variable | What to put | SaaS Example | eCommerce Example | Clinic Example |
|----------|-------------|-------------|-------------------|----------------|
| `{{PROJECT_NAME}}` | Your product/project name | GestorPyme Pro | MyStore.com | ClinicCloud |
| `{{PRODUCT_TYPE}}` | Product format | SaaS Web | B2C Marketplace | Web + Mobile App |
| `{{SECTOR}}` | Main industry | Business Management / Accounting | Retail / Fashion | Health / Private Medicine |
| `{{COUNTRY}}` | Where it operates legally | Spain | Spain + EU | Spain |
| `{{REGULATIONS}}` | Applicable laws and regulations | VAT Law, RD 1619/2012, Crea y Crece, GDPR, SII | Consumer Law, VAT, LSSI-CE, GDPR, PSD2 | LOPD-GDD, GDPR, Law 41/2002 patient autonomy |
| `{{BUSINESS_MODEL}}` | How you make money | Monthly subscription by plan | Commission per sale + seller subscription | Pay-per-consultation + clinic subscription |
| `{{PRODUCT_DESCRIPTION}}` | What it does and for whom (2-5 sentences) | *see below* | *see below* | *see below* |
| `{{USERS}}` | List of roles/user types | Freelancer, SME Admin, Accountant, Employee | Buyer, Seller, Admin, Delivery | Doctor, Patient, Receptionist, Admin |
| `{{MODULES}}` | Main functional areas | Invoicing, Clients, Expenses, Taxes, Treasury | Catalogue, Cart, Payments, Shipping, Returns | Appointments, Records, Prescriptions, Invoicing, Reports |

---

## Rules and Constraints Variables

| Variable | What to put | Tip |
|----------|-------------|-----|
| `{{KNOWN_RULES}}` | Business rules you ALREADY know | Include EVERYTHING you know: VAT rates, deadlines, limits, formulas. The more you add, the better spec the AI generates |
| `{{REGULATORY_CONSTRAINTS}}` | Specific legal obligations | Look up the laws for your sector. The AI knows them but being explicit is better |
| `{{INTEGRATIONS}}` | External systems to connect | Not tech — functional: "I need to query tax data from AEAT" |

---

## Format Variables

| Variable | What to put | Recommendation |
|----------|-------------|----------------|
| `{{LANGUAGE}}` | Language for the specs | "English" / "Spanish" / "French" |
| `{{REGULATORY_COVERAGE}}` | How deep to go with regulations | Be specific: "ALL Spanish tax regulations for SMEs 2024-2026" |

---

## Optional Variables (but very useful)

| Variable | What to put | Why it matters |
|----------|-------------|----------------|
| `{{COMPETITORS}}` | Similar existing products | AI understands functional context by analogy |
| `{{DIFFERENTIATION}}` | What makes you different | Defines the scope of specs that WON'T be in competitors |
| `{{SCOPE_CONSTRAINTS}}` | What NOT to include in this phase | Avoids unnecessary specs in phase 1 |
| `{{ADDITIONAL_INFO}}` | Anything else | Documents, current manual processes, screenshots... |

---

## `{{PRODUCT_DESCRIPTION}}` Examples by type

### Management SaaS
```
Comprehensive SaaS management platform for Spanish SMEs and freelancers.
Enables electronic invoicing, expense management, automatic tax calculation
(VAT, IRPF, IS), bank reconciliation, treasury management and
automatic generation of tax returns for submission to AEAT.
Complies with Crea y Crece Law and VeriFactu e-invoicing regulations.
```

### eCommerce
```
Online marketplace connecting Spanish fashion sellers with buyers
across the EU. Manages catalogue, secure PSD2/SCA payments, shipping
logistics, returns under consumer regulations, invoicing with country VAT
(OSS system) and a points-based loyalty program.
```

### Clinic
```
Management system for private medical clinics in Spain. Manages appointments,
electronic clinical records, prescription writing, patient and insurer billing,
informed consent forms, and GDPR/LOPD compliance for special category data (health).
```

---

## Recommended process

1. **Copy** `SPECTRA-PROMPT.md`
2. **Fill** the variables using this guide
3. **Paste** the complete prompt to the AI
4. **Review** the generated spec
5. **Iterate**: ask it to expand, correct or go deeper on specific layers
6. **Save** the specs in the folder structure as source of truth

---

## Follow-up prompt

Once the spec is generated, use this follow-up prompt:

```
Review layer {{LAYER_NUMBER}} and:
1. Verify that ALL rules from {{REGULATIONS}} are covered
2. Add any missing exceptions and edge cases
3. Ensure cross-references (IDs) are consistent
4. Identify gaps: what stories/rules/skills are missing?
```
