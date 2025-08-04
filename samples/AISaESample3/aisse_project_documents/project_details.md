# Project Details
*(Note: The AISaE by Design Framework does not provide legal or regulatory advice. Developers should ensure they adhere to all legal and regulatory requirements for their development work)*


## Project Context
*(These details are project-specific and will not be included in any reusable patterns)*

**Project Name** (full title of your project)
<!--%PROJ_NAME-->EduSupport AI: Personalised Learning Assistant for Secondary Education

**Current Development Stage** (choose from Concept, Prototype, Release Development, or Operations)
<!--%CURRENT_STAGE-->Operations

**Team/Organisation**
- Lead organisation or team: Pearson Education Technology Division
- Project website or repository: https://github.com/pearson-edtech/edusupport-ai

### Context

**Purpose**
Describe the purpose of this system from the perspective of its users. What need or goal does this AI system address?
To provide personalised learning support for secondary school students (ages 11-18) by adapting to individual learning styles, identifying knowledge gaps, suggesting targeted resources, and providing real-time feedback on academic progress. The system helps students learn more effectively while supporting teachers with insights into student performance and engagement.

**Environment**
Describe the context in which this system will operate (e.g. industry, work area, geographies, etc)
UK secondary schools using Pearson's digital learning platform. Currently deployed across 150 schools with 45,000 active student users. Operates within existing school IT infrastructure and integrates with school management information systems (SIMS). Used both in classroom settings and for homework/revision.

**Stakeholders**
List all groups who will be impacted by this system (direct users, affected parties, decision makers)
Primary users: Secondary school students, teachers, teaching assistants
Secondary stakeholders: Parents/guardians, school leadership teams, IT administrators, Pearson customer support
Decision makers: Head teachers, local education authorities, school IT departments, parents
Affected parties: Future employers assessing AI-assisted learning, universities reviewing student applications

Identify any vulnerable or high-risk groups
Students with special educational needs (SEN), students with learning difficulties (dyslexia, ADHD), students from disadvantaged backgrounds with limited home IT access, students with English as additional language (EAL), students with mental health challenges affecting learning

Note any specific cultural or demographic groups who are intended users or be affected
Diverse student population across UK state schools including various ethnic communities, students from different socioeconomic backgrounds, international students in UK schools, students in rural areas with limited resources, home-educated students using the platform.

## Categorisation of use-case

*(Combination of Purpose + Environment)*

**Purpose/Role** (What role does this AI play in users' lives?. Select ALL that apply:)
<!--%PURPOSE_CODE-->
- [x] **Creates (C)** - Makes new things for users (new content creation)
- [x] **Decides (D)** - Chooses for users (decision making, recommendations)
- [x] **Finds (F)** - Finds things for users (identification, discovery, information retrieval)
- [x] **Predicts (P)** - Tells users what's coming (prediction, monitoring)
- [x] **Helps (H)** - Provides guidance to users (digital assistance, performance improvement)
- [ ] **Acts (A)** - Takes actions for users (process automation, robotic automation)
- [x] **Explains (E)** - Makes things clearer for users (summarising, interpretation, synthesising)
- [ ] **Translates (T)** - Converts input from one form to another (language translation, modality conversion, input recognition)
- [ ] **Unknown (?)** - The purpose or role of this system is not known or decided

**Environment** (In what context is the system operating? Select ONE or ? for unknown)
<!--%ENVIRONMENT_CODE-->
- [ ] **Low-stakes (L)** - Entertainment, convenience, internal tools
- [x] **Social-facing (S)** - Public interaction, reputation, relationships
- [ ] **High-stakes (H)** - Safety, health, finance, legal decisions, well-being affecting
- [ ] **Unknown (?)** - The environment for the use-case is not known or decided

## Categorisation of System Design Forces

**Autonomy level** (What level of autonomy does the system have in performing actions? Select ONE or ? for unknown)
<!--%AUTONOMY_CODE-->
- [ ] **Supervised(S)** - Human approves each action
- [x] **Monitored (M)** - Human has oversight and can intervene, but system operates independently
- [ ] **Independent (I)** - Performs actions without specific human input or oversight
- [ ] **Unknown (?)** - The autonomy level of the system is not known or decided

**Self-learning level** (What ability does the system have to change its own execution to reflect updated understanding or experiences? Select ONE or ? for unknown)
<!--%SELF_LEARNING_CODE-->
- [ ] **Static(S)** - Fixed capabilities, doesn't learn or change during normal operations.
- [x] **Adaptive/Agentic (M)** - Uses memory type structures or similar to improve responses and approaches.
- [ ] **Self-modifying (I)** - Can modify its own capabilities, processes or objectives.
- [ ] **Unknown (?)** - The self-learning level of the system is not known or decided.

**Persistence level** (What level of persistence does the system have in for users or context? Select ONE or ? for unknown)
<!--%PERSISTENCE_CODE-->
- [ ] **Transactional (T)** - Stateless, each interaction or session is independent.
- [x] **Stateful (S)** - Remembers context/history, builds continuity
- [ ] **Persistent (P)** - Ongoing pursuit of goals and task execution without requiring prompting
- [ ] **Unknown (?)** - The persistence level of the system is not known or decided.

**Capability Level** (What's the sophistication and power of the underlying system? Select ONE or ? for unknown)
<!--%CAPABILITY_CODE-->
- [ ] **Basic (B)** - Simple algorithms, narrow processing (rule-based, basic ML). Does what you expect, clear decisions, predictable failures
- [x] **Advanced (A)** - Sophisticated models with a degree of simulated reasoning (LLMs, multimodal models, complex ML), some surprises, novel failure modes. 
- [ ] **Emergent (E)** - Systems with unexpected or hard-to-predict capabilities. May produce new capabilities, unclear boundaries 
- [ ] **Unknown (?)** - The capability level of the system is not known or decided

**Data Sources** (select all that apply)
<!--%DATA_CODE-->
- [x] **Controlled Internal(I)** - Operating organisation's own data
- [x] **User-Provided(U)** - End users input
- [x] **Verified Public(V)** - Vetted datasets, government, academic sources
- [ ] **Unverified Public(W)** - Scraped web content, social media
- [x] **Third-Party Licensed(T)**

**Other Behaviours** (What other system behaviours are relevant? Select any/all applicable, leave blank if none apply)
<!--%OTHER_SYS_CODE-->
- [ ] **Agentic Interaction (A)** - System will operate in an agentic colony structure (i.e. communicating with and sharing work with other cognitive agents)
- [ ] **Upstream (U)** - System operates upstream of other cognitive agents (i.e. the system will call other AI to execute tasks).
- [ ] **Downstream (D)** - System is downstream of other cognitive agents (i.e. the system is called by other AI to execute tasks).

## Categorisation of Stakeholder and Cultural Forces

At this moment Stakeholder and Cultural forces are not in scope for the framework and default to "All":

<!--%CAPABILITY_CODE-->
- [X] **ALL STAKEHOLDERS GROUPS (ALL)**

<!--%CULTURES_CODE-->
- [X] **ALL CULTURES (ALL)**