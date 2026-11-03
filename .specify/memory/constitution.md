<!--
Sync Impact Report
Version change: unresolved scaffold → 1.0.0 (initial adoption)
Modified principles: [PRINCIPLE_1_NAME] → I. Maintainable Code;
  [PRINCIPLE_2_NAME] → II. Reliable Testing;
  [PRINCIPLE_3_NAME] → III. Consistent User Experience;
  [PRINCIPLE_4_NAME] → IV. Measured Performance;
  [PRINCIPLE_5_NAME] → V. Shopify Platform Alignment
Added sections: Quality and Performance Standards; Development Workflow
Removed sections: none
Follow-up TODOs: none
-->
# CupsSell Constitution

## Core Principles

### I. Maintainable Code
Code MUST have clear ownership, cohesive responsibilities, and names that express intent.
Contributors MUST follow established project patterns and avoid duplication where shared
abstractions improve clarity. Changes MUST handle expected errors at system boundaries and
MUST NOT introduce dead code, unexplained complexity, or unrelated changes. Rationale:
maintainable code lowers the cost and risk of future changes.

### II. Reliable Testing
Changes MUST include automated tests for new behavior and regression coverage for corrected
defects. Tests MUST verify observable behavior, including relevant failure and boundary cases.
Integration tests MUST cover changed contracts and interactions with Shopify or persistence
boundaries when unit tests alone cannot establish correctness. A change MUST NOT be considered
complete until its relevant checks pass; any unavailable or failing check MUST be reported with
the reason. Rationale: dependable tests make changes safer to review and release.

### III. Consistent User Experience
New and changed flows MUST follow the app's established interaction, visual, accessibility,
and content patterns. User actions MUST provide clear feedback, validation MUST identify how
to resolve input errors, and loading, empty, success, and failure states MUST be handled where
applicable. Interfaces MUST remain usable with keyboard navigation and assistive technology.
Rationale: consistency helps merchants complete tasks without relearning the app.

### IV. Measured Performance
User-facing routes and interactions MUST avoid unnecessary work, data transfer, and rendering.
Data access MUST be bounded and use pagination or limits for collections. Changes that may
materially affect latency, memory use, or external API volume MUST be measured against an
appropriate baseline and MUST document the result. Performance optimizations MUST preserve
correctness and remain proportionate to measured impact. Rationale: responsive workflows and
bounded resource use support reliable operation as store data grows.

### V. Shopify Platform Alignment
Shopify API and platform work MUST follow the Shopify AI Toolkit guidance and current
project-supported Shopify patterns. Contributors MUST use the least required permissions,
validate external input, and handle API errors and rate limits. Changes MUST preserve embedded
app navigation and authentication behavior where applicable. Rationale: platform alignment
reduces compatibility, security, and operational risks.

## Quality and Performance Standards

The repository's configured lint, type-check, build, and test commands define the applicable
automated quality gates. A change MUST pass the relevant gates before merge. When a gate is not
available or cannot run, the change description MUST identify the gap. Performance claims
MUST state the workload and measurement method so results can be reproduced.

## Development Workflow

Implementation plans and reviews MUST identify affected user flows, data boundaries, tests,
and performance implications. Reviewers MUST check the principles in this constitution and
request evidence for material correctness or performance claims. Shopify platform changes
MUST be grounded in the Shopify AI Toolkit; its tooling belongs in the agent host and MUST NOT
be added to this repository.

## Governance

This constitution governs project implementation and review. Amendments MUST update this
document and its version and amendment date. Versioning follows semantic versioning: MAJOR for
backward-incompatible governance changes, MINOR for added or materially expanded principles
or sections, and PATCH for clarifications and non-semantic edits. Every change review MUST
consider compliance with these principles; exceptions MUST be documented with their scope
and rationale and reviewed with the change. Conflicts between implementation guidance and
this constitution MUST be resolved in favor of this constitution or by amending it.

**Version**: 1.0.0 | **Ratified**: 2026-11-02 | **Last Amended**: 2026-11-02
