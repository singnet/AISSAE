# AISaE by Design Pattern ID Coding Guide

## Overview

This guide explains the simplified pattern ID coding system used in the AISaE by Design framework. Pattern IDs enable systematic classification and matching of AI systems with appropriate values and risk guidance.

## Pattern ID Structure

```
AISAE-[PURPOSE][ENVIRONMENT][CONTROL][CAPABILITY]-[STAKEHOLDER]-[CULTURE]-[SEQUENCE]
```

**Example:** `AISAE-CHGM-*****-ANG-001`

### Components

1. **AISAE**: Framework identifier
2. **PURPOSE**: Single character - system's primary role
3. **ENVIRONMENT**: Single character - consequence context
4. **CONTROL**: Single character - human-system control relationship
5. **CAPABILITY**: Single character - breadth of capabilities
6. **STAKEHOLDER**: 5-character stakeholder classification (currently *****)
7. **CULTURE**: 3-character cultural classification
8. **SEQUENCE**: 3-digit sequential number

## Usage Classification

### Purpose (Position 1)
*What role does this AI play in users' lives?*

| Code | Meaning | Description |
|------|---------|-------------|
| **C** | Creates | Makes things for users (content creation, synthesis) |
| **D** | Decides | Chooses for users (decision making, recommendations) |
| **F** | Finds | Finds things for users (identification, discovery, information retrieval) |
| **P** | Predicts | Tells users what's coming (prediction, monitoring) |
| **H** | Helps | Helps users do things (digital assistance, performance improvement) |
| **A** | Acts | Takes actions for users (process automation, robotic automation) |
| **M** | Multiple | System performs multiple roles at different times or upon request |

### Environment (Position 2)
*In what context is the system operating?*

| Code | Meaning | Description |
|------|---------|-------------|
| **L** | Low-stakes | Entertainment, convenience, internal tools |
| **S** | Social-facing | Public interaction, reputation, relationships |
| **H** | High-stakes | Safety, health, finance, legal decisions |

## System Design Classification

### Control Relationship (Position 3)
*What's the human-system control dynamic?*

***Note**: Control relationship combines three underlying dimensions:*
- ***Autonomy**: Supervised → Monitored → Independent*
- ***Self-learning**: Static → Adaptive/Agentic → Self-modifying
- ***Persistence**: Transactional → Stateful → Persistent operation*

| Code  | Meaning             | General escription                                                       |
| ----- | ------------------- | ------------------------------------------------------------------------ |
| **C** | Human-Controlled    | Supervised autonomy + Static (no adaptation) + Transactional interaction |
| **G** | Human-Guided        | Monitored autonomy + Adaptive/agentic + Stateful interaction             |
| **I** | System-Independence | Independent/Agent autonomy + Self-modification + Persistent operation    |

| *Autonomy level* | *Description*                                                |
| -------------- | ---------------------------------------------------------- |
| *Supervised*     | *Human approves each action*                                 |
| *Monitored*      | *Human can intervene, but system operates independently*     |
| *Independent*    | *Performs actions without specific human input or oversight* |

| *Self-learning level* | *Description*                                                |
| ------------------- | ---------------------------------------------------------- |
| *Static*              | *Fixed capabilities, doesn't learn or change*                |
| *Adaptive/Agentic*    | *Can learn and improve within existing framework*            |
| *Self-modifying*      | *Can modify own core capabilities, processes, or objectives* |

| *Persistence level* | *Description*                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| *Transactional*     | *Stateless, each interaction independent*                                 |
| *Stateful*          | *Remembers context/history, builds continuity*                            |
| *Persistent*        | *Ongoing pursuit of goals and task execution without requiring prompting* |

**Mixed Configurations**: When the three dimensions don't align (e.g., Independent/Agentic + Static + Persistent), choose the control level based on the likely **most consequential** dimension for values and risks according to the context.

### Capability Level (Position 4)
*What's the sophistication and power of the underlying system?*

| Code  | Meaning  | Description                                                                                                              |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| **B** | Basic    | Simple algorithms, narrow processing (rule-based, basic ML). Does what you expect, clear decisions, predictable failures |
| **A** | Advanced | Sophisticated models with reasoning (LLMs, multimodal models, complex ML), some surprises, novel failure modes.          |
| **E** | Emergent | Systems with unexpected or hard-to-predict capabilities. May surprise you with new capabilities, unclear boundaries      |

## Cultural Classification

Based on GLOBE 2020 study cultural clusters plus indigenous extensions:

### GLOBE Cultural Clusters

| Code | Meaning | Countries/Regions |
|------|---------|-------------------|
| **ANG** | Anglo | US, Canada, Australia, UK, Ireland |
| **LAE** | Latin Europe | France, Spain, Italy, Portugal, Israel |
| **NOR** | Nordic Europe | Denmark, Finland, Sweden |
| **GER** | Germanic Europe | Germany, Netherlands, Austria, Switzerland |
| **EEU** | Eastern Europe | Russia, Poland, Hungary, Slovenia |
| **LAM** | Latin America | Mexico, Brazil, Argentina, Colombia |
| **SSA** | Sub-Saharan Africa | Nigeria, South Africa, Zambia |
| **ARA** | Arab | Egypt, Morocco, Turkey, Kuwait |
| **SAS** | Southern Asia | India, Indonesia, Philippines, Malaysia |
| **CAS** | Confucian Asia | China, Hong Kong, Singapore |

### Indigenous Extensions

| Code | Meaning | Description |
|------|---------|-------------|
| **NAI** | North American Indigenous | First Nations, Native Americans, Inuit |
| **SAI** | South American Indigenous | Quechua, Aymara, Mapuche, Guaraní |
| **AUI** | Australian Indigenous | Aboriginal Australians, Torres Strait Islanders |
| **AFI** | African Indigenous | San (Khoisan), Batwa, other non-assimilated groups |
| **ARI** | Arctic Indigenous | Inuit, Sámi, Chukchi, Nenets, Yupik |

### Additional Cultural Regions

| Code | Meaning | Description |
|------|---------|-------------|
| **SEA** | Southeast Asia | Thailand, Vietnam, Indonesia, Philippines, Myanmar |
| **CAZ** | Central Asia | Kazakhstan, Uzbekistan, Kyrgyzstan, Tajikistan, Turkmenistan |
| **PER** | Persian / Iranic | Iran, parts of Afghanistan and Tajikistan |
| **PAC** | Pacific Islander / Austronesian | Polynesia, Micronesia, Melanesia |
| **TUR** | Turkic | Turkey, Azerbaijan, and diaspora |
| **KJP** | Korean-Japanese | Distinct from Chinese Confucianism |
| **HEB** | Jewish / Hebrew | Global cultural and religious group |

### Universal

| Code | Meaning | Description |
|------|---------|-------------|
| **ALL** | All cultures | Universal applicability across cultures |

## Examples

```
AISAE-CLGA-*****-ANG-001    # Creates content, low-stakes, human-guided, advanced capabilities, Anglo culture
AISAE-DHCB-*****-CAS-001    # Makes decisions, high-stakes, human-controlled, basic capabilities, Confucian Asia
AISAE-FSIE-*****-ALL-001    # Finds information, social-facing, system-independent, emergent capabilities, all cultures
AISAE-HSCA-*****-LAE-001    # Helps users, social-facing, human-controlled, advanced capabilities, Latin Europe
AISAE-MLGE-*****-GER-001    # Multiple roles, low-stakes, human-guided, emergent capabilities, Germanic Europe
```

## Usage Guidelines

### For Pattern Documents
- Select one specific value per dimension
- Must specify complete classification
- Patterns should address focused scenarios
- Use most specific applicable culture code

### Pattern Matching
- Exact matches preferred
- System searches across compatible patterns when multiple exist
- Cultural context influences value prioritisation

## Validation Rules

1. Pattern IDs must be unique within the pattern library
2. System classification must be complete
3. Culture must be specified
4. Sequence must be 3 digits with leading zeros
5. Single purpose only per pattern

## Common Mistakes

1. Multiple purposes in patterns - create separate patterns instead
2. Wrong culture scope - choose most specific applicable culture
3. Inconsistent sequence numbering - use systematic numbering within categories