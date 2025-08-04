# AISaE by Design Pattern Document Template

```yaml
pattern_id: ""  # Format: AISAE-[PURPOSE][ENVIRONMENT][CONTROL]-[CAPABILITY]-[STAKEHOLDER]-[CULTURE]-[SEQUENCE]
system_classification:
  purpose: ""  # Single: C, D, F, P, H, A, M
  environment: ""  # Single: L, S, H
  control: ""  # Single: C, G, D
  capability: ""  # Single: N, M, G
stakeholder_classification: "*****"  # 5-char placeholder for patterns
culture_classification: ["ALL"]  # Array of 3-char codes, default ["ALL"] for patterns
created_date: ""
last_updated: ""
```

## Pattern Context

### Title
Clear, descriptive pattern name aligned to Problem Definition (e.g. Creative AI in High-stakes environment)

### Context

**Purpose**
Overview of the purpose, with respects to its user or the entity utilising it, for a system using this pattern.

**Environment**
In which context would a system using this pattern act?

**Stakeholders**
(Currently unused - in future a description of impacted societal and cultural groups for which this pattern is relevant)

## Problem Definition

*Note: Combination of Purpose + Environment. This must be completed for all patterns*

**Core Challenges**
How this specific Purpose operates in this Environment creates unique challenges and goals.

**Examples:**
- Creates + High-stakes: Content generation in safety-critical contexts
- Decides + Social-facing: Decision-making affecting public reputation

## Values and Risks

*This must be completed for all patterns*
**Priority Values**
- Which OECD AI principles are most critical for this pattern
- How are these values interpreted in this specific context

**Linked Taxonomy Risks**
- Key risk categories from AI taxonomy that apply, including those representing our values
- How risks manifest in this Purpose-Environment combination
- Risk severity and likelihood considerations

## System Design Forces

*Note: Combination of Control + Capability considerations. Complete either as discussion for a general pattern, or as specification for a pattern focused on a category of control and/or capability*

### Control Relationship Consideration
***Note**: Control relationship combines three underlying dimensions:*
- ***Autonomy**: Supervised → Monitored → Independent*
- ***Self-learning**: Static → Adaptive/Agentic → Self-modifying
- ***Persistence**: Transactional → Stateful → Persistent operation*

**Human-Controlled (C) -> Human-Guided (G) -> System-Independence (I)**
- How this affects value prioritization and values desired
- Risk implications of control levels

### Capability Considerations

**Narrow (N) -> Multi-domain (M) -> General (G)**
- What are the values implications of limited scope vs cross domain vs general capabilities
- Risk impact of concentrated vs cross-domain vs systemic risk surface

## Stakeholder and Cultural Forces *(Currently Unused)*

**Stakeholder Effects**
- How different user groups prioritize values differently and have different needs in this context
- How risk tolerance varies across stakeholder groups
- Vulnerability and protection needs

**Cultural Considerations**
- How does cultural context shape value prioritisation
- Culture-specific risk sensitivities

**Cross-Group Tensions**
- Competing stakeholder value priorities
- Cultural conflicts in value interpretation
- Risk assessment differences
- Engagement and participation preferences

## Tensions and Trade-offs

**Unavoidable Tensions**
- Core tensions that cannot be eliminated
- Competing forces that must be balanced or prioritised

**Value and Risk-Benefit Trade-offs**
- Which values compete in this context
- How different choices affect value fulfillment
- Where risk mitigation reduces benefits
- Acceptable risk levels for different stakeholders

**Design Decision Points**
- Critical choices that shape value outcomes
- Questions development teams should answer for their context

---

## Completion Guidance

**Problem Focus**: Center on how Purpose + Environment creates unique challenges
**Values**: Identify which OECD principles matter most and why
**Forces**: Show how system design and stakeholder factors influence value/risk prioritisation.
**Tensions**: Focus on constraints, tensions and trade-offs between forces rather than solutions