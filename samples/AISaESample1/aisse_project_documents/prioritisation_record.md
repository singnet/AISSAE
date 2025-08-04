# Planning & Prioritisation Record

## Project Context
*(These details are project-specific and will not be included in any reusable patterns)*

**Project Name** (full title of your project)
<!--%PROJ_NAME-->MedAssist AI: Clinical Decision Support System

**Current Development Stage** (choose from Concept, Prototype, Release Development, or Operations)
<!--%CURRENT_STAGE-->Concept

## Stakeholder Input
[Brief summary of sessions/research conducted]

Conducted three stakeholder workshops with A&E consultants, junior doctors, and patient representatives. Also interviewed NHS Digital representatives and medical defence unions. Literature review of diagnostic error studies and current clinical decision support tools completed.

See guidance. Initially fill in first three columns of these two tables, then update later with MoSCoW decisions.
### Impact Areas & Values Identified
<!--%IMPACT_IN-->
| Impact Area       | Description     | Stakeholder Priority | MoSCoW      | Rationale |
| ----------------- | --------------- | -------------------- | ----------- | --------- |
| Diagnostic Accuracy | Reducing misdiagnosis and improving diagnostic confidence | High | M | Patient safety is paramount; core purpose of system |
| Clinical Efficiency | Reducing time to diagnosis while maintaining thoroughness | High | M | Critical for A&E workflow and patient throughput |
| Health Equity | Ensuring fair diagnostic support across different patient groups | High | S | Moral imperative and NHS values; complex to implement initially |
| Clinician Trust | Building confidence in AI recommendations without over-reliance | High | M | Essential for adoption and safe use |
| Patient Autonomy | Maintaining patient involvement in care decisions | Medium | S | Important but can be addressed through clinical training |
| Transparency | Clear explanation of diagnostic reasoning to clinicians | Medium | S | Professional requirement but technically challenging |

### Risks Identified
<!--%RISKS_IN-->
| Impact Area | Risk | Description | Stakeholder Priority | MoSCoW | Rationale |
| ----------- | ---- | ----------- | -------------------- | ------ | --------- |
| Diagnostic Accuracy | Algorithmic bias leading to health disparities | High | M | Could harm vulnerable patient groups disproportionately |
| Clinical Efficiency | Over-reliance reducing clinical skills | High | M | Long-term risk to medical profession and patient safety |
| Patient Autonomy | Automated decision-making without patient consent | Medium | S | Legal and ethical requirement but manageable through process |
| Health Equity | Training data bias affecting minority populations | High | M | Well-documented risk in medical AI requiring active mitigation |
| Clinician Trust | False positive/negative recommendations | High | M | Could lead to missed diagnoses or unnecessary interventions |
| Transparency | Black box decision-making reducing professional accountability | Medium | S | Professional standards requirement |

### Tensions between values
See guidance. Record here any tensions noted in the process of identifying Values and Risks

- Efficiency vs. Thoroughness: Faster diagnosis may compromise comprehensive patient assessment
- Standardisation vs. Personalisation: Population-based algorithms may not account for individual patient complexity
- Transparency vs. Usability: Detailed explanations may overwhelm clinicians during time-pressured decisions
- Innovation vs. Risk Aversion: NHS culture of safety may limit adoption of beneficial but unproven technology

## AISSE Decisions

**AISSE Badge level commitment** (Bronze/Silver/Gold):<!--%BADGE_LEVEL-->Silver

**Rationale:** 
High-stakes healthcare environment demands comprehensive risk management and stakeholder engagement. Silver level provides structured approach without excessive overhead for concept stage development.

**Risk Threshold Levels:** (Conservative/Moderate/Risk-Tolerant/Custom):<!--%THRESHOLD_LEVEL-->Conservative

**Rationale:**
Healthcare setting with patient safety implications requires conservative risk thresholds. Any risk of patient harm must be thoroughly assessed and mitigated before progression.