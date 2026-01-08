# AISSE Framework: Developer Handbook

Practical support in building beneficial AI

V0.41 14-Jul-25

# Contents

[AISSE Framework: Developer Handbook [1](#aisse-framework-developer-handbook)](#aisse-framework-developer-handbook)

[Introduction to the Framework [2](#_Toc203414188)](#_Toc203414188)

[What This Is [2](#too-long-didnt-read)](#too-long-didnt-read)

[Why Use This [2](#why-use-this)](#why-use-this)

[How the Framework is Organised [4](#how-the-framework-is-organised)](#how-the-framework-is-organised)

[Alignment to your activities [4](#alignment-to-your-activities)](#alignment-to-your-activities)

[Support across all levels of AI complexity [5](#support-across-all-levels-of-ai-complexity)](#support-across-all-levels-of-ai-complexity)

[What kinds of topics are the focus of the AISSE Framework? [6](#what-kinds-of-topics-are-the-focus-of-the-aisse-framework)](#what-kinds-of-topics-are-the-focus-of-the-aisse-framework)

[Support Available [7](#support-available)](#support-available)

[AISSE Developer Companion [7](#aisse-developer-companion)](#aisse-developer-companion)

[AISSE Toolkit [7](#aisse-toolkit)](#aisse-toolkit)

[AISSE Community of Practice [8](#aisse-community-of-practice)](#aisse-community-of-practice)

[AISSE Platform [8](#aisse-platform)](#aisse-platform)

[Appendix A: Directory Progress Listing [9](#appendix-a-directory-progress-listing)](#appendix-a-directory-progress-listing)

[Appendix B: Sample AISSE Development Workflow [10](#appendix-b-sample-aisse-development-workflow)](#appendix-b-sample-aisse-development-workflow)

[Before you start [10](#before-you-start)](#before-you-start)

[During defining/refining goals [10](#during-definingrefining-goals)](#during-definingrefining-goals)

[During Exploring Options [11](#during-exploring-options)](#during-exploring-options)

[During Designing [11](#during-designing)](#during-designing)

[During Implementing [12](#during-implementing)](#during-implementing)

[Appendix C: Sample questions for projects at different stages of development [14](#appendix-c-sample-questions-for-projects-at-different-stages-of-development)](#appendix-c-sample-questions-for-projects-at-different-stages-of-development)

[Define/Refine Goals [14](#definerefine-goals)](#definerefine-goals)

[Explore [14](#_Toc203414209)](#_Toc203414209)

[Design [15](#_Toc203414210)](#_Toc203414210)

[Implement [16](#_Toc203414211)](#_Toc203414211)

[Test [16](#_Toc203414212)](#_Toc203414212)

[]{#_Toc203414188 .anchor}

## Introduction to the Framework

### Too long; didn't read?

Understanding the framework is the best way to leverage it for value, but if you're time poor and looking for help the AISSE Developer Companion AI can answer questions based on your project, and your current activities. Ask it for help.

### What This Is

The AISSE Framework helps you, the developer, build AI systems that benefit people by providing you with the tools and information you need to make sound design decisions. It\'s not about perfect ethics or endless processes, it\'s about being intentional and managing the things that matter. At its heart the framework is about providing you with clearer, less ambiguous information on the values and concerns that matter to users. It is:

- A template-driven framework for translating human values and preferences into AI development requirements at all levels

- A structured approach to considering risks and values across projects with increasing intelligence complexity

- A community-driven toolkit supporting developers to create AI that meets human expectations

- A mechanism for improving value alignment persistence as systems evolve beyond direct control

- A bridge connecting what we value to how we build AI systems

### Why Use This

**As a developer you get:**

- Clearer understanding of what your users and society actually care about

- Practical risk management that fits your project

- Optimised features that align to values, not just functionality

- Documentation that demonstrates that you\'ve thought things through

- A process that scales with your project size and where you choose the level of involvement

**Badging of your commitment**:

You will receive a badge that reflects your stated commitment level^\#^

+-----------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+
| ![](media/image1.png){width="1.0480982064741908in" height="1.2992125984251968in"} | ![](media/image2.png){width="1.0480982064741908in" height="1.2992125984251968in"} | ![](media/image3.png){width="1.0480982064741908in" height="1.2992125984251968in"} | ![](media/image4.png){width="1.0477515310586176in" height="1.2992125984251968in"} |
+===================================================================================+===================================================================================+===================================================================================+===================================================================================+
+-----------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+-----------------------------------------------------------------------------------+

^\#^ Requires registration on the framework and fill-out of templates to provide information on your project. See Appendix A

**You reduce:**

- Building something people don\'t trust or want

- Nasty surprises after launch

- Reputation damage from preventable issues

- Generic AI Ethics statements that don\'t help shape the system

> **Focus**: Connect what your community values to what you actually build.

## How the Framework is Organised

The Framework is focused on the role of the developer. The Toolkit, the Community of Practice and the AI Developer Companion are all provided to help developers during each stage of their project, from idea through to deployment, and during the in-life state:

+-----------------------------------------------------------------------+
| **Concept(Research) → Prototype/Pilot → Production → Operations**     |
+=======================================================================+
+-----------------------------------------------------------------------+

: Figure 1: Typical AI development stages

Depending on the type of projects you're running, you might not be running certain stages. Perhaps you're using well researched tools and head straight to prototype, for instance. That's fine, the framework can help you address AI Safety and Ethics considerations however you are bringing your ideas to life.

The Framework is designed to minimise overheads. Artefacts you create in early stages get reused later where you improve them and add precision, thanks to any research and prototyping you performed. For example, values and risks identified in concept phase can be carried forward to prototype.

### Alignment to your activities

Resources are organised according to familiar developer activities common to any stage. Depending on the stage you're at, the help you need and the questions you ask when performing those activities will differ. For example, during Concept questions will focus on higher level ideas and expectations; by the time you're developing for production they'll be addressing specific values, risks, behaviours and configuration.

Figure 2: Developer Activities Supported by the AISSE Framework

The activities in this figure are not a process or development flow, you don't have to manage your project following these -- use what works for you. When you want to use the toolkit you can check and find the right assistance by asking yourself *"What am I working on right now?"*

If you would prefer to have something guided, Appendix B presents a flow for projects who might be unfamiliar with applying AISSE during development. Projects are welcome to use this flow, but it is not a requirement.

Appendix C contains more details on the sorts of questions and challenges projects might have, depending on which stage they are at (research, prototype, pilot, production) and in operations.

### Support across all levels of AI complexity

Artificial Intelligence has a broad set of cognitive capabilities. Projects using well established approaches -- e.g. training a single-purpose ML model -- will face different challenges than those working on emerging approaches. The assistance in the framework is marked according to its suitability for helping with challenges on values, risks and considerations that are known, foreseeable or emergent. Whether you're looking for tools to help you check bias in data or trying to imbue AGI with values, resources are available.

The three labels in use are:

**Known**

- Well-documented concerns with established approaches

- Clear understanding of both risks and value alignment strategies

- Proven solutions and quantifiable measures available

**Foreseeable**

- Theoretically understood challenges and opportunities

- Identified vulnerabilities and emerging value considerations

- Proposed approaches needing validation at scale

**Emergent**

- Novel challenges without precedent

- Limited understanding requiring adaptive strategies

- Hypothesis-driven approaches for both safety and beneficial outcomes

Most types of resource will have content or tools for each complexity level, but individual documents, tools, guides, etc. will often be labelled for only one or two to indicate their suitability. E.g. a bias removal tool for data might be labelled **Known.**

### What kinds of topics are the focus of the AISSE Framework?

The AISSE Framework focuses on the challenges of implementing AI with attention to Safety, Security and Ethics. Tools and resources are dependent on community contribution, but the scoping for the framework is for resources on:

- Technical implementation of functionalities and mitigations to address AISSE in the development of agents

- Creation of environments that steer emergent intelligence towards positive outcomes (agentic and ASI, which we can't fully predict through design)

- Identifying values and risks relevant to a particular technology, project scope, stakeholder group or industry (What matters to humanity)

- Translating goals into a design to maximise positives aligned to identified values (what are the dangers?)

- Understanding how a system/component interacts within a larger architecture/supply-chain with respect to safety, security and/or ethics

- Practical questions on managing a particular stage/activity in development in a way that addresses AISSE and uses the framework.

- Understanding what is going on inside an in-life system or when something is changing (for better or worse)?

## Support Available 

The AISSE Framework has three key components that offer support and resources to developers, hosted on the AISSE platform.

:::: figure
![A close-up of a few icons AI-generated content may be incorrect.](media/image6.png){width="6.768055555555556in" height="2.1277777777777778in"}

::: caption
Figure 3: The four components of the AISSE Framework
:::
::::

### AISSE Developer Companion

A grounded AI chatbot that can assist you in exploring AISSE Values and addressing AISSE risks throughout the project. Assist provided:

- Guidance in navigating the AISSE Framework K/F/E

- Assistance in identifying relevant values, principles and associated risks particular to your project's footprint. K/F/E

- Guidance in setting risk thresholds and forming user stories to meet values goals\* K/F/E

- Support in running risk reviews and identifying mitigations\* K/F

- Assistance in identifying in-life monitoring and procedures\* K/F

- Exploration of best practice and emergent research relevant to your project using Qwello/Qwestor\* K/F/E

### AISSE Toolkit

The AISSE Toolkit contains knowledge, tools, guides, templates and other instant access resources you can use directly in your projects.

- Community Tools**:** Access reusable code, shared utilities, and tools to accelerate your development. K/F/E

- Value and Risk Profiles: Reusable learnings from previous, similar projects on what they identified as important in values and risk K/F/E

- Solution Pattern Documents: Leverage proven approaches and technical patterns for common AI risk mitigations and related technology challenges. K/F

- Best Practice Resources: Industry standards, responsible AI guidelines and research. K/F/E

### AISSE Community of Practice

Freelance services, expertise and input from a diverse and involved community to assist across the spectrum of challenges, provide feedback and advice, or to take on work packages for your project.

- **Community Expertise**: Request for input and expertise addressing challenges, either individual or as a deep-dives. (Seeding via academia?)

- **Community Service Offerings**: Community-offered services that can be used as advisory, testing, research and development-assistance (Seeding via academia?)

- **Stakeholder Representation:** Community members provide lived experience and local sector understanding, user-journey feedback, values and views.

### AISSE Platform

The AISSE Platform provides a single location for resources. The Platform is curated and governed by the SingularityNET AISSE Community of Practice\* who ensure the Framework is available, flexible and simple to use

The AISSE Platform also houses the AISSE Directory, an automated tool allowing developers to showcase their approach and efforts to address AISSE considerations. Developers can choose to sign-up their project and GitHub repository to feature in the AISSE directory and provide evidence to reputation system and ecosystem showcases\*

\* Functionality to be implemented

## Appendix A: Directory Progress Listing

+--------------------------------------------------------------------------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------+
| > ![](media/image8.svg){width="0.5585301837270341in" height="0.5511811023622047in"}  | →     | Project is registered on the AISSE Directory.                                                                                          |
|                                                                                      |       |                                                                                                                                        |
|                                                                                      |       | Evidenced by: Filled Project Description template; registration                                                                        |
+:====================================================================================:+:=====:+========================================================================================================================================+
| > ![](media/image10.svg){width="0.5585301837270341in" height="0.5511811023622047in"} | →     | Project has a researched list of relevant Values and Risks                                                                             |
|                                                                                      |       |                                                                                                                                        |
|                                                                                      |       | Evidenced by: Filled Values and Risk Candidates template                                                                               |
+--------------------------------------------------------------------------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------+
| > ![](media/image12.svg){width="0.5585301837270341in" height="0.5511811023622047in"} | →     | Project has prioritised their risks, agreed goals for values and set risk category thresholds                                          |
|                                                                                      |       |                                                                                                                                        |
|                                                                                      |       | Evidenced by: Updated Values and Risk Candidates template; filled Project Risk Register template.                                      |
+--------------------------------------------------------------------------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------+
| > ![](media/image14.svg){width="0.5585301837270341in" height="0.5511811023622047in"} | →     | Project has user stories/requirements for values-goals and has started risk reviews                                                    |
|                                                                                      |       |                                                                                                                                        |
|                                                                                      |       | Evidenced by: Filled Values Goals template                                                                                             |
+--------------------------------------------------------------------------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------+
| > ![](media/image16.svg){width="0.5585301837270341in" height="0.5511811023622047in"} | →     | Project has completed testing with AISSE goals met and no outstanding red category risks                                               |
|                                                                                      |       |                                                                                                                                        |
|                                                                                      |       | Evidenced by: Project in Operations stage; no red category risks in Project Risks Register; all goals checked in Values Goals template |
+--------------------------------------------------------------------------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------+
| > ![](media/image18.svg){width="0.5585301837270341in" height="0.5511811023622047in"} | →     | Project has an in-life monitoring in place aligned to risks and values.                                                                |
|                                                                                      |       |                                                                                                                                        |
|                                                                                      |       | Evidenced by: Project in Operations stage; filled In-Life Monitoring template                                                          |
+--------------------------------------------------------------------------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------+
|                                                                                      |       |                                                                                                                                        |
+--------------------------------------------------------------------------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------+
| > ![](media/image20.svg){width="0.5585301837270341in" height="0.5511811023622047in"} | →     | Project has not yet provided this detail (for any stage)                                                                               |
+--------------------------------------------------------------------------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------+
| > ![](media/image10.svg){width="0.5585301837270341in" height="0.5511811023622047in"} | →     | Project has provided details for previous stage                                                                                        |
+--------------------------------------------------------------------------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------+
| > ![](media/image22.svg){width="0.5585301837270341in" height="0.5511811023622047in"} | →     | Project has provided details for current stage                                                                                         |
+--------------------------------------------------------------------------------------+-------+----------------------------------------------------------------------------------------------------------------------------------------+

## Appendix B: Sample AISSE Development Workflow

+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ### Before you start                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                             |
+========================================================================================================================================================================+=============================================================================================================================================================================================================================================================================================================================================================================================================================+
| ***Key activity for Directory Listing***                                                                                                                               |                                                                                                                                                                                                                                                                                                                                                                                                                             |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ***\                                                                                                                                                                   | **Classify your project** (required for directory and AISSE Developer Companion)                                                                                                                                                                                                                                                                                                                                            |
| ***![](media/image8.svg){width="0.5585301837270341in" height="0.5511811023622047in"}![](media/image24.svg){width="0.5118110236220472in" height="0.5118110236220472in"} |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **What:** Classify your project by purpose, environment, control, and capability\                                                                                                                                                                                                                                                                                                                                           |
| ***\                                                                                                                                                                   | **Outcome:** Clear project category and registration onto the framework\                                                                                                                                                                                                                                                                                                                                                    |
| ***                                                                                                                                                                    | **Where/how:** Project Details Template (copy the directory verbatim to your repo and fill out)\                                                                                                                                                                                                                                                                                                                            |
|                                                                                                                                                                        | **What else** (optional): You can use the Risk Taxonomy to explore the risk landscape                                                                                                                                                                                                                                                                                                                                       |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **Register for inclusion in the directory**                                                                                                                                                                                                                                                                                                                                                                                 |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **What:** Create a new issue to register, submit and the Framework will take care of things\                                                                                                                                                                                                                                                                                                                                |
|                                                                                                                                                                        | **Outcome:** Clear project category and registration onto the framework\                                                                                                                                                                                                                                                                                                                                                    |
|                                                                                                                                                                        | **Where/how:** [Guide to registering]{.underline}. You should also update when you have made changes, these are not detected automatically. Registering will mean you can utilise the "AISSE Registered" badge.                                                                                                                                                                                                             |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ### During defining/refining goals                                                                                                                                     |                                                                                                                                                                                                                                                                                                                                                                                                                             |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ![](media/image10.svg){width="0.5585301837270341in" height="0.5511811023622047in"}![](media/image24.svg){width="0.5118110236220472in" height="0.5118110236220472in"}   | **Ask the AISSE Developer Companion for input**                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ![](media/image12.svg){width="0.5585301837270341in" height="0.5511811023622047in"}![](media/image24.svg){width="0.5118110236220472in" height="0.5118110236220472in"}   | **What:** The LLM-powered tool provides tailored suggestions for values, principles, and risks based on your project's context.\                                                                                                                                                                                                                                                                                            |
|                                                                                                                                                                        | **Outcome:** AI-generated starting point grounded in other project's risk profiles and research\                                                                                                                                                                                                                                                                                                                            |
|                                                                                                                                                                        | **Where/how:** The companion will need an upload of your Project Details Template. You can discuss the information provided and ask questions. You can also ask the companion to provide its recommendations as a markdown file which you should place in your repo's AISSE directory. This file is used in the Directory Listing.\                                                                                         |
|                                                                                                                                                                        | **What else** (optional): You can explore the risk profiles of other projects similar to yours                                                                                                                                                                                                                                                                                                                              |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **Sense-Making Session** (optional)                                                                                                                                                                                                                                                                                                                                                                                         |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **What:** These inclusive workshops help review, refine, and prioritise the Developer-generated suggestions with stakeholders. Use is entirely at the discretion of developer\[s\] if they wish to have a "human in the loop" before using the value and risks identified.\                                                                                                                                                 |
|                                                                                                                                                                        | **Outcome:** Community-validated and contextualised guidance\                                                                                                                                                                                                                                                                                                                                                               |
|                                                                                                                                                                        | **Where/how:** The AISSE Playbook contains guidance for running this and other sessions both in person and virtually, as well as links to suggested tools. Utilise the Community of Practice\* to identify help from experts or experienced staekholders. The [AISSE Risk Taxonomy](https://github.com/singnet/AISSAE/blob/master/ai-risk-taxonomy/data/taxonomy.csv) can be utilised in these sessions to assist in exploring risks and values. |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **Choose Your Badge Level**                                                                                                                                                                                                                                                                                                                                                                                                 |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **What:** Decide how much effort to put in\                                                                                                                                                                                                                                                                                                                                                                                 |
|                                                                                                                                                                        | **Outcome:** Your commitment level will be reflected in badges, but will also reflect the level of attention expected with respect to safety, security and ethics. **\                                                                                                                                                                                                                                                      |
|                                                                                                                                                                        | Where/how:** A simple [guide]{.underline} is available to help you make this decision.                                                                                                                                                                                                                                                                                                                                      |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **Prioritise Risks/Values and set Risk Thresholds**                                                                                                                                                                                                                                                                                                                                                                         |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **What:** Your team decides Must/Should/Could/Won't for values, risks and opportunities from the Companion provided list (alongside any Sense Making input) based on capacity and vision. You then set trigger points for when risks are considered Red, Amber or Greem\                                                                                                                                                    |
|                                                                                                                                                                        | **Outcome:** Clear priorities for implementation, a set of risks you'll manage and a set of values you'll prioritise.\                                                                                                                                                                                                                                                                                                      |
|                                                                                                                                                                        | **Where:** Simple guides are available to help you make these decisions. A template gets filled out containing the badge level, items chosen, and the thresholds you set. This document forms part of your directory entry and needs to be in the AISSE folder.                                                                                                                                                             |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ### During Exploring Options                                                                                                                                           |                                                                                                                                                                                                                                                                                                                                                                                                                             |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                                                                        | **Propose AISSE Features and Functionality**                                                                                                                                                                                                                                                                                                                                                                                |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **What:** Create a set of User Stories for your AISSE goals\                                                                                                                                                                                                                                                                                                                                                                |
|                                                                                                                                                                        | **Outcome:** Additional user stories to include in your BRD/PRD\                                                                                                                                                                                                                                                                                                                                                            |
|                                                                                                                                                                        | **Where/how:** The AISSE Playbook contains guidance for running this and other sessions both in person and virtually, as well as links to suggested tools.\                                                                                                                                                                                                                                                                 |
|                                                                                                                                                                        | **What else** (optional): Community members may be available to help form user stories that are relevant and impactful to stakeholder groups                                                                                                                                                                                                                                                                                |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ### During Designing                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                             |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ![](media/image14.svg){width="0.5585301837270341in" height="0.5511811023622047in"}![](media/image24.svg){width="0.5118110236220472in" height="0.5118110236220472in"}   | **Baseline your risks**                                                                                                                                                                                                                                                                                                                                                                                                     |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **What:** Based on your design, score the risks you selected for likelihood and impact\                                                                                                                                                                                                                                                                                                                                     |
|                                                                                                                                                                        | **Outcome:** The current situation for your risks is known and you can focus on ensuring they are mitigated\                                                                                                                                                                                                                                                                                                                |
|                                                                                                                                                                        | **Where/how:** The AISSE Playbook contains guidance for running this and other sessions both in person and virtually, as well as links to suggested tools. A template is available for storing your risk register with current scoring. This document forms part of your directory entry and needs to be in the AISSE folder. **\                                                                                           |
|                                                                                                                                                                        | What else** (optional): Use AISSE Patterns to explore how other projects have addressed similar AISSE user stories to yours, or mitigated risks in similar contexts                                                                                                                                                                                                                                                         |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ### During Implementing                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                             |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                                                                        | **Review your Risks**                                                                                                                                                                                                                                                                                                                                                                                                       |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **What:** At regular intervals in your development, review how your risks are performing and if any response is needed. If you're still in research,\                                                                                                                                                                                                                                                                       |
|                                                                                                                                                                        | **Outcome:** The current situation for your risks is known and you can focus on ensuring they are mitigated\                                                                                                                                                                                                                                                                                                                |
|                                                                                                                                                                        | **Where/how:** The AISSE Playbook contains guidance for running this and other sessions both in person and virtually, as well as links to suggested tools.\                                                                                                                                                                                                                                                                 |
|                                                                                                                                                                        | **What else** (optional): Use AISSE Patterns to explore how other projects have addressed similar AISSE user stories to yours, or mitigated risks in similar contexts                                                                                                                                                                                                                                                       |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **Implement AISSE Monitoring & Metrics** (Release Version development only)                                                                                                                                                                                                                                                                                                                                                 |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **What:** Form a set of monitoring solutions that can assure the ongoing adherence of the system to your AISSE goals\                                                                                                                                                                                                                                                                                                       |
|                                                                                                                                                                        | **Outcome:** Monitoring is ready for go-live\                                                                                                                                                                                                                                                                                                                                                                               |
|                                                                                                                                                                        | **Where/how:** A template is available for storing your monitoring approach together with a set of measures. This document forms part of your directory entry after go-live and needs to be in the AISSE folder. The AISSE toolkit has resources available to help you form your monitoring plan.                                                                                                                           |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ***During Testing***                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                             |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ![](media/image16.svg){width="0.5585301837270341in" height="0.5511811023622047in"}![](media/image24.svg){width="0.5118110236220472in" height="0.5118110236220472in"}   | **Run your evals & testing**                                                                                                                                                                                                                                                                                                                                                                                                |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **What:** Execute AISSE evaluations and tests to assess if you've met your goals and mitigations for risks\                                                                                                                                                                                                                                                                                                                 |
|                                                                                                                                                                        | **Outcome:** Go/no-go information to decide whether the project is set for moving to the next stage or in-life deployment\                                                                                                                                                                                                                                                                                                  |
|                                                                                                                                                                        | **Where/how:** The AISSE toolkit has resources available to help you form evals and appropriate tests for Safety, Security and Ethics concerns. Update your project risk register to reflect mitigations, and update your user story goals to indicate outcome of evals.                                                                                                                                                    |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ***During Operations***                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                             |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ![](media/image18.svg){width="0.5585301837270341in" height="0.5511811023622047in"}![](media/image24.svg){width="0.5118110236220472in" height="0.5118110236220472in"}   | **Activate your monitoring**                                                                                                                                                                                                                                                                                                                                                                                                |
|                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **What:** Execute AISSE monitoring for your system and reviews\                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **Outcome:** Insights into ongoing performance\                                                                                                                                                                                                                                                                                                                                                                             |
|                                                                                                                                                                        | **Where/how:** Activate the monitoring you designed and developed prior to completing implementation                                                                                                                                                                                                                                                                                                                        |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

## Appendix C: Sample questions for projects at different stages of development

### Define/Refine Goals

+------------------------+-------------------------------------------------------------------------------------------------+
| **Stage**              | **Potential Questions**                                                                         |
+========================+=================================================================================================+
| **Concept (Research)** | **Known:** What well known risks and values apply to my AI system type?                         |
|                        |                                                                                                 |
|                        | **Foreseeable:** What risk/value alignment challenges should I be considering for my domain?    |
|                        |                                                                                                 |
|                        | **Emergent:** What concerns are currently being explored for my envisaged system?               |
+------------------------+-------------------------------------------------------------------------------------------------+
| **Prototype/Pilot**    | **Known:** What specific values and risks apply to my project and its context?                  |
|                        |                                                                                                 |
|                        | **Foreseeable:** What theoretically identified risks should I prepare to measure in my testing? |
|                        |                                                                                                 |
|                        | **Emergent:** Which emergent areas are currently identified for my system?                      |
+------------------------+-------------------------------------------------------------------------------------------------+
| **Release Version**    | **Known:** What specific values and risks apply to my project and its context?                  |
|                        |                                                                                                 |
|                        | **Foreseeable:** What specific values and risks apply to my project and its context?            |
|                        |                                                                                                 |
|                        | **Emergent:** What values and risks might I identify as best fit to my project and its context? |
+------------------------+-------------------------------------------------------------------------------------------------+

### 
