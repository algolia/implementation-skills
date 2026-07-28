import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownToLine,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronDown,
  Copy,
  Database,
  ExternalLink,
  Filter,
  GitBranch,
  Headphones,
  Layers3,
  Library,
  Monitor,
  Moon,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Sun,
  Terminal,
  WandSparkles,
  Waypoints,
  X,
  Zap
} from 'lucide-react';
import './styles.css';

// GA4 measurement ID for the DCS-facing site. Downloads fire a
// `bundle_download` event; leave as the placeholder to disable analytics.
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

function initAnalytics() {
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

function trackDownload(href, label) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'bundle_download', {
    file_name: href.split('/').pop(),
    link_url: href,
    button_label: label
  });
}

const packages = [
  {
    id: 'algolia-search-implementation',
    title: 'Search Implementation',
    description: 'Execution checklist for net-new builds, loaded via Discovery Planning, with data and events as the foundation.',
    icon: Rocket,
    color: 'green',
    files: 2,
    type: 'Planning',
    triggers: ['build search', 'add Algolia', 'search UI', 'ecommerce search', 'browse', 'autocomplete', 'Dynamic Re-Ranking'],
    includes: ['Whole-Algolia lens', 'Foundation checkpoints', 'Decision summary'],
    summary: 'This is the execution checklist for net-new Algolia search builds, loaded through the Discovery Planning front door. It frames the work through the whole Algolia system: data determines what search can retrieve, rank, filter, display, and attribute; events determine whether analytics, personalization, Recommend, Dynamic Re-Ranking, NeuralSearch evaluation, and Agent Studio feedback can be trusted.',
    useWhen: [
      'Discovery Planning marks a net-new build in scope: building search, adding Algolia, ecommerce search, autocomplete, or a search/browse experience.',
      'The task could otherwise jump straight to UI or index seeding before data and events are considered.',
      'The implementation needs clear readiness signposts across data, events, settings, UI, AI features, and launch QA.'
    ],
    teachesAgentToAsk: [
      'What data contract decisions shape search behavior and AI readiness?',
      'What event taxonomy decisions shape analytics, relevance optimization, and AI feedback loops?',
      'Which UI surface is in scope: autocomplete, search results, browse, recommendations, or ecommerce?',
      'What is explicitly deferred, who approved it, and what QA evidence exists?'
    ],
    deliverables: [
      'Decision-by-decision implementation summary.',
      'Data contract and event taxonomy expectations.',
      'Explicit deferrals and risks.',
      'Cross-skill readiness signposts before AI rollout or release QA.'
    ],
    filesInside: ['SKILL.md', 'agents/openai.yaml'],
    href: '/downloads/algolia-search-implementation.zip'
  },
  {
    id: 'algolia-discovery-planning',
    title: 'Discovery Planning',
    description: 'START HERE orchestrator for mapping Algolia work to the full implementation lifecycle.',
    icon: Waypoints,
    color: 'blue',
    files: 3,
    type: 'Planning',
    triggers: ['discovery', 'requirements', 'business context', 'solution design', 'build search', 'add InstantSearch', 'index catalog'],
    includes: ['Lifecycle map', 'Multi-skill orchestration', 'Context question bank', 'Assumption contract'],
    summary: 'This is the front door skill. It teaches an agent to map a request across data modeling, index configuration, UI, autocomplete, events, QA, and AI phases before jumping into a single implementation skill.',
    useWhen: [
      'A user asks to add, migrate, redesign, audit, or configure Algolia.',
      'The request is broad and could touch indexing, relevance, UI, events, recommendations, or analytics.',
      'The request looks scoped but still needs lifecycle routing, such as adding InstantSearch, building storefront search, or indexing a catalog.'
    ],
    teachesAgentToAsk: [
      'Which implementation phases are in scope, and which companion skill owns each phase?',
      'What user journey is being improved: search, browse, autocomplete, recommendations, or operations lookup?',
      'What business outcome matters most: conversion, revenue, content discovery, support deflection, or operational speed?',
      'What does a good result mean for this business: exactness, availability, freshness, margin, popularity, geo, or personalization?',
      'Which events define success and who owns relevance decisions after launch?'
    ],
    deliverables: [
      'Phase-by-phase implementation plan.',
      'List of in-scope skills and the order they should run.',
      'Known facts and open questions.',
      'Explicit assumptions if the user wants the agent to proceed.',
      'A focused context-gathering plan instead of a giant questionnaire.'
    ],
    filesInside: ['SKILL.md', 'agents/openai.yaml', 'references/discovery-question-bank.md'],
    href: '/downloads/algolia-discovery-planning.zip'
  },
  {
    id: 'algolia-data-modeling',
    title: 'Data Modeling',
    description: 'Record-model, ecommerce data-gap, merchandising attribute, and ranking metric guidance.',
    icon: Database,
    color: 'teal',
    files: 4,
    type: 'Data',
    triggers: ['records', 'variants', 'SKUs', 'objectID', 'indexing', 'replicas', 'migration', 'data gaps', 'custom ranking'],
    includes: ['Ecommerce record models', 'Data-gap diagnostics', 'Custom ranking metric map', 'Index contract'],
    summary: 'This skill helps agents design search-ready Algolia data before writing indexing code. It now emphasizes ecommerce record model choices, common merchandising data gaps, object identity, ranking metric precision, and update ownership.',
    useWhen: [
      'Designing records, variants, SKUs, objectIDs, indices, replicas, or indexing pipelines.',
      'Migrating data into Algolia from a database, CMS, commerce platform, or existing search system.',
      'Choosing whether ecommerce records should represent variants, variation groups such as color, master products, articles, locations, accounts, tenants, or locales.',
      'Diagnosing why merchandising strategies such as new, best seller, high inventory, margin, rating, or popularity cannot be executed from the current data.'
    ],
    teachesAgentToAsk: [
      'What entity should one search result represent?',
      'Should variants appear as separate hits, one hit per product, one hit per shared variation such as color, or hidden behind filters, availability, permissions, or account context?',
      'Which attributes are searchable, filterable, sortable, display-only, ranking-only, secured, or not customer-facing?',
      'Which business metrics should break textual ties, and should they be raw, rounded, bucketed, or curated?',
      'Which identifiers are stable enough to become objectIDs?',
      'Do locales, regions, tenants, channels, or permissions require separate records, filters, or indices?'
    ],
    deliverables: [
      'An index contract covering names, environments, objectIDs, record shape, facets, ranking fields, and replicas.',
      'A record-model strategy and merchandising data-gap report aligned to the user journey.',
      'A custom ranking metric map covering order, direction, precision, owner, and validation.',
      'Guidance for full reindexing, incremental updates, partial updates, and validation.',
      'Migration risk notes when objectIDs or record granularity change.'
    ],
    filesInside: ['SKILL.md', 'agents/openai.yaml', 'references/data-modeling-guide.md', 'references/example-output.md'],
    href: '/downloads/algolia-data-modeling.zip'
  },
  {
    id: 'algolia-index-configuration',
    title: 'Index Configuration',
    description: 'Evidence-led relevance configuration for ranking, facets, filters, rules, synonyms, replicas, and experiments.',
    icon: GitBranch,
    color: 'purple',
    files: 3,
    type: 'Configuration',
    triggers: ['settings', 'ranking', 'facets', 'synonyms', 'rules'],
    includes: ['Control map', 'Experiment discipline', 'Rollback record'],
    summary: 'This skill guides controlled index decisions: hard versus optional filters, ranking, facets, synonyms, rules, replicas, one-variable experiments, and rollback checks.',
    useWhen: [
      'Changing Algolia settings that affect ranking, filtering, faceting, or merchandising.',
      'Diagnosing poor results, bad top hits, noisy recall, weak facets, or confusing sort behavior.',
      'Turning business priorities into repeatable index settings instead of frontend hacks.'
    ],
    teachesAgentToAsk: [
      'Which queries or browse pages are most valuable or currently broken?',
      'Which attributes should match first, and which should only help recall?',
      'Which constraints are deterministic filters versus optional ranking preferences?',
      'Which business metrics should break textual ties, and which sorts need replicas?',
      'Are synonyms, rules, and promotions global, scoped, seasonal, or campaign-specific?'
    ],
    deliverables: [
      'Settings decision record with hard/optional constraints and relevance intent.',
      'Representative test queries, facet/filter checks, experiment criteria, and rollback notes.',
      'Guidance for ranking, typo-sensitive terms, synonyms, rules, replicas, and merchandising.'
    ],
    filesInside: ['SKILL.md', 'agents/openai.yaml', 'references/configuration-guide.md'],
    href: '/downloads/algolia-index-configuration.zip'
  },
  {
    id: 'algolia-events-insights',
    title: 'Events & Insights',
    description: 'Production event planning for usable Insights signals, connector paths, attribution, and feature readiness.',
    icon: Zap,
    color: 'orange',
    files: 5,
    type: 'Events',
    triggers: ['insights', 'analytics', 'queryID', 'userToken', 'conversion'],
    includes: ['Event readiness model', 'Connector path QA', 'Attribution rules'],
    summary: 'This skill helps agents design and audit Algolia events beyond ingestion: clicks, primary conversions, cart or purchase events, durable userToken, queryID attribution, connector mappings, and downstream feature eligibility.',
    useWhen: [
      'Adding or auditing click, conversion, view, add-to-cart, purchase, filter, or revenue events.',
      'Choosing between InstantSearch/search-insights, custom frontend, GTM, Segment/CDP, backend, or hybrid event paths.',
      'Wiring queryID, objectID, one-based position, index, and userToken attribution from frontend or backend flows.',
      'Preparing event data for analytics, personalization, Recommend, dynamic re-ranking, or A/B testing.'
    ],
    teachesAgentToAsk: [
      'Which user actions count as meaningful conversions?',
      'Which system owns each event, and where can fields be renamed, dropped, duplicated, or flattened?',
      'How is userToken assigned before and after login?',
      'Can the UI access queryID and hit position when an event fires?',
      'Does the event merely arrive, or is it usable for the target Algolia feature?'
    ],
    deliverables: [
      'A minimal event map that starts with the customer journey and downstream feature goal.',
      'Connector recommendation and mapping risks for InstantSearch, GTM, Segment/CDP, backend, or hybrid paths.',
      'Attribution rules for queryID, userToken, objectID, index, and one-based positions.',
      'Deduplication guidance for frontend/backend ownership.',
      'A validation plan that separates arrival, usability, and attribution readiness.'
    ],
    filesInside: ['SKILL.md', 'agents/openai.yaml', 'references/events-guide.md', 'references/example-output.md', 'references/search-event-taxonomy.md'],
    href: '/downloads/algolia-events-insights.zip'
  },
  {
    id: 'algolia-instantsearch-ui',
    title: 'InstantSearch UI',
    description: 'Customer-readiness wrapper for official InstantSearch implementation, routing, filters, events, mobile, and QA.',
    icon: Search,
    color: 'pink',
    files: 3,
    type: 'Frontend',
    triggers: ['InstantSearch', 'search UI', 'facets', 'routing', 'pagination'],
    includes: ['Official skill bridge', 'Routing rules', 'UX QA checklist'],
    summary: 'This skill wraps Algolia’s official instantsearch skill with customer-facing readiness guidance for search and browse experiences: data contract, filters, routing, mobile behavior, accessibility, events, and launch QA.',
    useWhen: [
      'Planning or reviewing search result pages, category browse pages, facets, filters, sort-by, pagination, infinite hits, or current refinements.',
      'Using Algolia’s official instantsearch skill for code while validating the customer journey around it.',
      'Connecting UI state to URL routing or existing app navigation.',
      'Adding Insights event helpers or preserving queryID attribution from hit components.'
    ],
    teachesAgentToAsk: [
      'Is this a search page, browse page, federated page, or team-facing tool?',
      'Which index and replicas power the view?',
      'Which refinements are visible versus silently applied?',
      'Should query, filters, and sort state be shareable in the URL?',
      'Which official instantsearch reference or source-of-truth check is needed before code?'
    ],
    deliverables: [
      'Official skill usage note for framework/API decisions.',
      'A UI-state plan for query, refinements, sort, routing, mobile filters, empty states, and loading states.',
      'Event attribution wiring when analytics or personalization are in scope.',
      'A QA checklist for desktop, mobile, accessibility, and search behavior.'
    ],
    filesInside: ['SKILL.md', 'agents/openai.yaml', 'references/instantsearch-guide.md'],
    href: '/downloads/algolia-instantsearch-ui.zip'
  },
  {
    id: 'algolia-ui-libraries',
    title: 'UI Libraries',
    description: 'Living selector for current Algolia UI libraries, framework docs, routing, SSR, events, and mobile SDKs.',
    icon: Library,
    color: 'blue',
    files: 3,
    type: 'Reference',
    triggers: ['InstantSearch.js', 'React InstantSearch', 'Vue InstantSearch', 'Angular', 'Autocomplete', 'iOS', 'Android', 'Flutter', 'SSR', 'routing'],
    includes: ['Library selector', 'Current docs links', 'Framework QA'],
    summary: 'This skill helps agents choose the right current Algolia UI library without freezing copied docs or package versions. It points to live docs and gives framework-aware decision logic for InstantSearch, Autocomplete, native/mobile helpers, routing, SSR, events, and security.',
    useWhen: [
      'Choosing which Algolia UI library to use for a frontend or mobile search experience.',
      'Installing, upgrading, or auditing InstantSearch.js, React InstantSearch, Vue InstantSearch, legacy Angular InstantSearch (deprecated; use InstantSearch.js), Autocomplete, iOS, Android, or Flutter implementations.',
      'Planning routing, SSR, events, secured API keys, mobile behavior, or frontend search architecture.'
    ],
    teachesAgentToAsk: [
      'What framework, platform, and version does the app use?',
      'Is the experience a full results page, browse page, autocomplete, federated search, mobile UI, or docs search?',
      'Does the project need SSR, URL routing, backend search, secured API keys, or native/mobile behavior?',
      'Which events and analytics features are required?'
    ],
    deliverables: [
      'A recommended Algolia UI library and why it fits.',
      'Official docs paths to verify before installing or upgrading.',
      'Implementation plan covering routing, events, security, accessibility, and performance.',
      'QA checklist tailored to the selected framework and experience shape.'
    ],
    filesInside: ['SKILL.md', 'agents/openai.yaml', 'references/ui-library-selector.md'],
    href: '/downloads/algolia-ui-libraries.zip'
  },
  {
    id: 'algolia-autocomplete',
    title: 'Autocomplete',
    description: 'Customer-readiness guidance for official Autocomplete implementation, source contracts, routing, events, mobile, and QA.',
    icon: Layers3,
    color: 'gold',
    files: 3,
    type: 'Frontend',
    triggers: ['autocomplete', 'query suggestions', 'typeahead', 'recent searches'],
    includes: ['Official skill bridge', 'Quality standard', 'Handoff QA'],
    summary: 'This skill wraps official Autocomplete implementation guidance with source strategy, selection contracts, Academy quality checks, mobile content budgets, events, and QA.',
    useWhen: [
      'Building autocomplete, query suggestions, recent searches, popular searches, federated panels, or direct result suggestions.',
      'Using the official InstantSearch skill for code while validating the typeahead journey, selection handoff, and source behavior.',
      'Auditing keyboard navigation, mobile detached mode, source ordering, or selection behavior.'
    ],
    teachesAgentToAsk: [
      'What should appear while typing: queries, products, categories, content, recent searches, or popular searches?',
      'Does selecting a suggestion submit a query, navigate, refine InstantSearch state, or open a record?',
      'Is there a query suggestions index and how is it generated?',
      'Does every source solve a named user need and define its destination, carried scope, fallback, and event treatment?'
    ],
    deliverables: [
      'Official skill usage note and source contract for every group.',
      'Explicit selection, URL/state, category scope, fallback, and event behavior per source.',
      'Customer UI plan for focus/empty states, keyboard behavior, mobile detached mode, content budgets, and latency.',
      'Helpful, clear, focused, device-usable, and accessible quality verdicts with routing, event, and attribution QA.'
    ],
    filesInside: ['SKILL.md', 'agents/openai.yaml', 'references/autocomplete-guide.md'],
    href: '/downloads/algolia-autocomplete.zip'
  },
  {
    id: 'algolia-release-qa',
    title: 'Release QA',
    description: 'Evidence-led launch audit for data, relevance, UI, events, security, operations, and AI readiness.',
    icon: ShieldCheck,
    color: 'green',
    files: 4,
    type: 'QA',
    triggers: ['launch', 'audit', 'regression', 'security', 'validation'],
    includes: ['Evidence matrix', 'Attribution chain', 'Confidence-aware QA'],
    summary: 'This skill gives agents a launch and regression audit with reproducible evidence, attribution-chain checks, experiment confidence, security, operations, and AI readiness.',
    useWhen: [
      'Auditing an Algolia implementation before release.',
      'Checking a risky relevance, data, UI, event, or credential change.',
      'Diagnosing analytics gaps, missing attribution, stale records, bad filters, or launch regressions.'
    ],
    teachesAgentToAsk: [
      'What changed: data model, settings, UI, events, environment, credentials, or deployment?',
      'Which scenarios, evidence sources, owners, and residual risks must be recorded for each surface?',
      'Which user paths, attribution links, secured data, experiment states, and rollback flows must pass?',
      'What rollback path exists if the launch exposes relevance, security, or indexing issues?'
    ],
    deliverables: [
      'Severity-led findings with evidence source, reproduction steps, owner, and smallest retest.',
      'Evidence matrix for data, relevance, UI, autocomplete, events, security, operations, and AI.',
      'Attribution-chain and experiment-confidence checks.',
      'Tests run, tests not run, rollback state, and residual risk when live systems cannot be inspected.'
    ],
    filesInside: ['SKILL.md', 'agents/openai.yaml', 'references/release-qa-checklist.md', 'references/example-output.md'],
    href: '/downloads/algolia-release-qa.zip'
  },
  {
    id: 'algolia-agent-studio',
    title: 'Agent Studio',
    description: 'Customer-readiness guidance for Agent Studio contracts, tools, retrieval, safety, entry points, and refinement.',
    icon: Bot,
    color: 'blue',
    files: 3,
    type: 'Product AI',
    triggers: ['Agent Studio', 'agents', 'LLM providers', 'tools', 'guardrails', 'feedback', 'analytics'],
    includes: ['Agent room map', 'Tool contracts', 'Troubleshooting trace'],
    summary: 'This product-focused skill helps agents implement Agent Studio responsibly: define a narrow agent contract, connect grounded tools and retrieval, choose an entry point, validate safety, and refine through Conversations and Analytics.',
    useWhen: [
      'Planning, building, integrating, or auditing an Algolia Agent Studio experience.',
      'Working with LLM providers, Algolia Search tools, client-side tools, MCP tools, memory, prompting, conversations, turn context, caching, analytics, or feedback.',
      'Validating user authentication, approved domains, guardrails, tool security, and launch readiness.'
    ],
    teachesAgentToAsk: [
      'Which narrow, high-intent job should the first agent solve and what is deliberately out of scope?',
      'Which Algolia indices, tools, user context, and external systems may the agent use, and what is each tool contract?',
      'Which actions are read-only versus write/action-taking, and what requires confirmation?',
      'What analytics, feedback, events, and conversions define success?'
    ],
    deliverables: [
      'An agent-room map covering scope, tools, retrieval, data/context, memory, safety, provider, and entry point.',
      'Tool contracts with trigger, constrained inputs, authority, outcome, failure path, and measurement.',
      'Data, event, search-tool, memory, and security readiness checks.',
      'Launch QA and a troubleshooting trace for auth, domains, tool safety, feedback, analytics, and fallback behavior.'
    ],
    filesInside: ['SKILL.md', 'agents/openai.yaml', 'references/agent-studio-guide.md', 'references/example-output.md'],
    href: '/downloads/algolia-agent-studio.zip'
  },
  {
    id: 'algolia-neuralsearch',
    title: 'NeuralSearch',
    description: 'Customer-readiness guidance for NeuralSearch hybrid relevance, semantic fields, evidence, rollout, and optimization.',
    icon: BrainCircuit,
    color: 'purple',
    files: 4,
    type: 'Product AI',
    triggers: ['NeuralSearch', 'AI relevance', 'semantic search', 'adaptive intent', 'model training', 'A/B testing'],
    includes: ['Hybrid evidence', 'Semantic field rationale', 'Explainability triage'],
    summary: 'This product-focused skill helps agents validate NeuralSearch as a hybrid relevance rollout: semantic field rationale, event readiness (events optimize but are not required for activation), query evidence, business-rule checks, staged testing, and explainability-led optimization.',
    useWhen: [
      'Enabling, configuring, testing, or tuning NeuralSearch or AI relevance.',
      'Evaluating semantic retrieval, adaptive intent, model training, limitations, or A/B testing.',
      'Diagnosing whether poor NeuralSearch performance is caused by data quality, events, settings, or rollout measurement.'
    ],
    teachesAgentToAsk: [
      'Which query classes should NeuralSearch improve: vague, natural-language, synonym-heavy, long-tail, support, content, or product discovery queries?',
      'Which queries must remain exact, deterministic, compliance-sensitive, or heavily merchandised?',
      'Which semantic fields deserve priority, and which noisy or non-customer-facing fields must be excluded?',
      'Do event readiness, evaluation signals, and a rollback path exist for the desired rollout?'
    ],
    deliverables: [
      'A NeuralSearch readiness assessment covering data, relevance settings, filters, secured data, and event readiness (not an activation blocker).',
      'Semantic attribute rationale, representative query evaluation set, and hybrid evidence log.',
      'Implementation or configuration plan with current-docs verification and explainability points.',
      'A staged preview, experiment, validation, and rollback strategy.'
    ],
    filesInside: ['SKILL.md', 'agents/openai.yaml', 'references/neuralsearch-guide.md', 'references/example-output.md'],
    href: '/downloads/algolia-neuralsearch.zip'
  }
];

const skillPackages = packages.filter((pkg) => pkg.id !== 'algolia-ui-libraries');
const referencePackages = packages.filter((pkg) => pkg.id === 'algolia-ui-libraries');

const filters = ['All', 'Product AI', 'Planning', 'Data', 'Configuration', 'Events', 'Frontend', 'QA'];

const artifactLinks = {
  academy: { label: 'Academy alignment template', href: '/artifacts/academy-alignment-template.md' },
  academyReference: { label: 'Academy metadata reference pack', href: '/artifacts/academy-reference-pack.md' },
  retrieval: { label: 'Public source lookup guide', href: '/artifacts/academy-docs-retrieval-contract.md' },
  maturity: { label: 'Customer maturity scorecard', href: '/artifacts/customer-maturity-scorecard.md' },
  brief: { label: 'Customer implementation brief', href: '/artifacts/customer-implementation-brief.md' },
  install: { label: 'Install instructions', href: '/artifacts/install-instructions.md' },
  limitations: { label: 'Known limitations', href: '/artifacts/known-limitations.md' },
  forwardTest: { label: 'Forward test report', href: '/artifacts/forward-test-report.md' },
  start: { label: 'Start here prompt', href: '/artifacts/start-here-prompt.md' },
  examples: { label: 'Example output pack', href: '/artifacts/example-output-pack.md' },
  events: { label: 'Event taxonomy template', href: '/artifacts/event-taxonomy-template.md' },
  indexing: { label: 'Indexing contract template', href: '/artifacts/indexing-contract-template.md' },
  qa: { label: 'Sample QA report template', href: '/artifacts/qa-report-template.md' },
  useCase: { label: 'Use-case bundle template', href: '/artifacts/use-case-bundle-template.md' },
  official: { label: 'Official tooling map', href: '/artifacts/official-tooling-integration-map.md' },
  repo: { label: 'Repo integration strategy', href: '/artifacts/repo-integration-strategy.md' }
};

const allUseCases = [
  'Ecommerce search',
  'Content search',
  'B2B catalog',
  'Support knowledge base',
  'Marketplace',
  'AI shopping assistant'
];

const recommendedPaths = [
  {
    id: 'new-implementation',
    label: 'Start a new Algolia implementation',
    shortLabel: 'New implementation',
    icon: Rocket,
    skills: ['algolia-search-implementation', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-instantsearch-ui', 'algolia-release-qa'],
    artifacts: [artifactLinks.academy, artifactLinks.indexing, artifactLinks.events, artifactLinks.qa]
  },
  {
    id: 'audit-existing',
    label: 'Review current setup',
    shortLabel: 'Review setup',
    icon: Check,
    skills: ['algolia-release-qa', 'algolia-data-modeling', 'algolia-index-configuration', 'algolia-events-insights'],
    artifacts: [artifactLinks.qa, artifactLinks.events, artifactLinks.indexing]
  },
  {
    id: 'fix-events',
    label: 'Event setup',
    shortLabel: 'Event setup',
    icon: ChartNoAxesColumnIncreasing,
    skills: ['algolia-events-insights', 'algolia-instantsearch-ui', 'algolia-autocomplete', 'algolia-release-qa'],
    artifacts: [artifactLinks.events, artifactLinks.qa]
  },
  {
    id: 'ai-readiness',
    label: 'Prepare for AI features',
    shortLabel: 'AI readiness',
    icon: Sparkles,
    skills: ['algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-neuralsearch', 'algolia-agent-studio', 'algolia-release-qa'],
    artifacts: [artifactLinks.maturity, artifactLinks.indexing, artifactLinks.events, artifactLinks.qa]
  },
  {
    id: 'frontend-ui',
    label: 'Build frontend search UI',
    shortLabel: 'Frontend UI',
    icon: Monitor,
    skills: ['algolia-search-implementation', 'algolia-ui-libraries', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-instantsearch-ui', 'algolia-autocomplete', 'algolia-release-qa'],
    artifacts: [artifactLinks.academy, artifactLinks.indexing, artifactLinks.events, artifactLinks.qa]
  },
  {
    id: 'launch-qa',
    label: 'Launch QA',
    shortLabel: 'Launch QA',
    icon: ShieldCheck,
    skills: ['algolia-release-qa', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-data-modeling'],
    artifacts: [artifactLinks.qa, artifactLinks.events, artifactLinks.indexing]
  }
];

const useCaseBundles = [
  {
    id: 'ecommerce-search',
    title: 'Ecommerce search bundle',
    icon: ShoppingCart,
    description: 'Product and variant data, relevance, events, InstantSearch, autocomplete, NeuralSearch readiness, and launch QA.',
    skills: ['algolia-search-implementation', 'algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-instantsearch-ui', 'algolia-autocomplete', 'algolia-neuralsearch', 'algolia-release-qa'],
    artifacts: [artifactLinks.start, artifactLinks.brief, artifactLinks.examples, artifactLinks.indexing, artifactLinks.events, artifactLinks.qa, artifactLinks.useCase],
    href: '/downloads/ecommerce-search-bundle.zip',
    guideHref: '/artifacts/use-cases/ecommerce-search.md'
  },
  {
    id: 'b2b-catalog',
    title: 'B2B catalog bundle',
    icon: BriefcaseBusiness,
    description: 'Account-aware records, price lists, secured filters, permissions, relevance, events, and production readiness.',
    skills: ['algolia-search-implementation', 'algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-instantsearch-ui', 'algolia-release-qa'],
    artifacts: [artifactLinks.start, artifactLinks.brief, artifactLinks.examples, artifactLinks.indexing, artifactLinks.events, artifactLinks.qa, artifactLinks.maturity],
    href: '/downloads/b2b-catalog-bundle.zip',
    guideHref: '/artifacts/use-cases/b2b-catalog.md'
  },
  {
    id: 'support-knowledge-base',
    title: 'Support knowledge base bundle',
    icon: Headphones,
    description: 'Content records, synonyms, article UX, deflection events, NeuralSearch, Agent Studio, and QA.',
    skills: ['algolia-search-implementation', 'algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-instantsearch-ui', 'algolia-autocomplete', 'algolia-neuralsearch', 'algolia-agent-studio', 'algolia-release-qa'],
    artifacts: [artifactLinks.start, artifactLinks.brief, artifactLinks.examples, artifactLinks.academy, artifactLinks.indexing, artifactLinks.events, artifactLinks.qa],
    href: '/downloads/support-knowledge-base-bundle.zip',
    guideHref: '/artifacts/use-cases/support-knowledge-base.md'
  },
  {
    id: 'ai-shopping-assistant',
    title: 'AI shopping assistant bundle',
    icon: WandSparkles,
    description: 'AI readiness, product data, event feedback loops, NeuralSearch, Agent Studio guardrails, and validation.',
    skills: ['algolia-search-implementation', 'algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-neuralsearch', 'algolia-agent-studio', 'algolia-release-qa'],
    artifacts: [artifactLinks.start, artifactLinks.brief, artifactLinks.examples, artifactLinks.maturity, artifactLinks.indexing, artifactLinks.events, artifactLinks.qa],
    href: '/downloads/ai-shopping-assistant-bundle.zip',
    guideHref: '/artifacts/use-cases/ai-shopping-assistant.md'
  },
  {
    id: 'marketplace',
    title: 'Marketplace bundle',
    icon: Store,
    description: 'Multi-seller catalogs, region or permission variants, relevance controls, events, UI, AI readiness, and QA.',
    skills: ['algolia-search-implementation', 'algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-instantsearch-ui', 'algolia-autocomplete', 'algolia-neuralsearch', 'algolia-release-qa'],
    artifacts: [artifactLinks.start, artifactLinks.brief, artifactLinks.examples, artifactLinks.indexing, artifactLinks.events, artifactLinks.qa, artifactLinks.useCase],
    href: '/downloads/marketplace-bundle.zip',
    guideHref: '/artifacts/use-cases/marketplace.md'
  }
];

const companionTools = [
  {
    id: 'algolia-productivity-mcp',
    title: 'Algolia Productivity MCP',
    description: 'Live Algolia context for analytics, index inspection, recommendations, and account-aware reviews.',
    icon: Bot,
    command: 'claude mcp add --transport http algolia https://mcp.algolia.com/mcp',
    commandLabel: 'Claude Code setup',
    href: 'https://www.algolia.com/doc/guides/get-started/build-with-ai/#install-the-algolia-productivity-mcp',
    action: 'Open MCP setup'
  },
  {
    id: 'algolia-cli',
    title: 'Algolia CLI',
    description: 'Terminal access for index, settings, rules, synonyms, records, and operational account tasks.',
    icon: Terminal,
    command: 'brew install algolia/algolia-cli/algolia',
    commandLabel: 'macOS install',
    href: 'https://www.algolia.com/doc/guides/get-started/build-with-ai/#install-the-algolia-cli',
    action: 'Open CLI setup'
  },
  {
    id: 'official-algolia-skills',
    title: 'Official Algolia skills',
    description: 'Official Algolia agent skills for MCP, CLI, algobot, InstantSearch, and core tooling workflows.',
    icon: Library,
    command: 'npx skills add https://github.com/algolia/skills',
    commandLabel: 'Skill installer',
    href: 'https://github.com/algolia/skills',
    action: 'Open skills repo'
  }
];

function getPackageById(id) {
  return packages.find((pkg) => pkg.id === id);
}

const detailProfiles = {
  'algolia-search-implementation': {
    useThisTo: ['View a net-new search build through the whole Algolia system.', 'Keep relevance, UI, and AI feature choices grounded in data and event foundations.'],
    asks: ['What data contract decisions shape retrieval, ranking, filtering, display, and attribution?', 'What event foundation supports analytics, optimization, personalization, Recommend, Dynamic Re-Ranking, NeuralSearch, and Agent Studio?'],
    produces: ['Decision-by-decision status, suggested artifacts, explicit deferrals, and next validation step.'],
    prompt: `Use $algolia-search-implementation to plan an ecommerce search build.

Context: We sell [product type] in [markets]. Our users need to find [top tasks].
Data source: [platform/ERP/PIM]. Frontend: [framework]. Current state: [new/existing].
Success means: [conversion, discovery, support deflection, etc.].

First, identify the in-scope skills and assumptions. Then produce:
1. data contract,
2. event taxonomy,
3. relevance and UI plan,
4. phased implementation plan,
5. launch QA checklist.
Do not make live Algolia changes.`,
    academyModules: ['Search implementation workflow', 'Data and event foundations', 'AI readiness signposts'],
    learningObjectives: ['Sequence data, events, index configuration, UI, AI readiness, and QA work in order.', 'Apply search implementation readiness signposts.'],
    docs: ['Algolia documentation: Getting started', 'Algolia documentation: Send events']
  },
  'algolia-discovery-planning': {
    useThisTo: ['Turn a broad Algolia request into a scoped implementation path.', 'Choose which skill should drive the next step.'],
    asks: ['What journey and business metric matter most?', 'Which data, UI, events, and governance choices are still unknown?'],
    produces: ['Known facts, decision-changing questions, assumptions, and a recommended next skill.'],
    prompt: 'Use algolia-discovery-planning to turn my Algolia request into the right discovery questions and implementation path.',
    academyModules: ['Search implementation discovery', 'Business outcomes and relevance ownership'],
    learningObjectives: ['Identify the minimum customer context required before setup.', 'Route broad requests to the right implementation skill.'],
    docs: ['Algolia documentation: Getting started', 'Algolia documentation: Sending and managing data']
  },
  'algolia-data-modeling': {
    useThisTo: ['Decide product vs variant vs grouped records.', 'Create a durable indexing contract before writing ingestion code.'],
    asks: ['What should one result represent?', 'Which variant fields affect search, filtering, price, availability, permissions, or events?'],
    produces: ['Variant strategy, objectID pattern, record contract, update plan, and validation checks.'],
    prompt: 'Use algolia-data-modeling to design my product, variant, SKU, locale, and permission record strategy before indexing.',
    academyModules: ['Prepare and structure records', 'Indexing strategy and objectID design'],
    learningObjectives: ['Choose record granularity from the user journey.', 'Design stable objectIDs and search-ready variant data.'],
    docs: ['Prepare your data', 'Searchable attributes', 'Custom ranking']
  },
  'algolia-index-configuration': {
    useThisTo: ['Translate business relevance into settings.', 'Audit ranking, facets, synonyms, rules, replicas, and sort behavior.'],
    asks: ['Which queries or browse pages matter most?', 'Which attributes should match first, filter, rank, or merchandise results?'],
    produces: ['Settings decision record, relevance intent, hard/optional filter behavior, test queries, experiment criteria, and rollback notes.'],
    prompt: `Use $algolia-index-configuration to audit our ranking, facets, filters, synonyms, rules, replicas, and sort behavior.

Business goal: [goal]. Important queries or browse pages: [examples].
Hard constraints: [permissions, availability, region, compliance]. Preferences: [brand, margin, popularity, freshness].
Return a settings decision record, test set, expected tradeoffs, experiment recommendation, and rollback plan. Do not make live settings changes.`,
    academyModules: ['Relevance configuration fundamentals', 'Faceting, filtering, synonyms, rules, and replicas'],
    learningObjectives: ['Map business intent to ranking settings.', 'Validate relevance changes with representative queries.'],
    docs: ['Searchable attributes', 'Custom ranking', 'Rules', 'Synonyms']
  },
  'algolia-events-insights': {
    useThisTo: ['Implement the smallest useful event plan first.', 'Audit queryID, userToken, click, conversion, cart, purchase, connector, and downstream feature readiness.'],
    asks: ['Which user action proves success?', 'Which event path owns the payload?', 'Where do queryID, objectID, one-based position, index, and userToken come from?'],
    produces: ['Minimal event map, connector recommendation, payload checklist, duplicate-event rules, and arrival/usability/attribution validation plan.'],
    prompt: `Use $algolia-events-insights to audit our search events for analytics, NeuralSearch, and personalization readiness.

We have [frontend/backend/GTM/Segment] instrumentation. Our primary conversion is [action].
Return an event taxonomy, ownership map, queryID/userToken continuity checks, validation plan, and the smallest fixes required before measurement is trustworthy.`,
    academyModules: ['Insights event implementation', 'Analytics and AI feature readiness'],
    learningObjectives: ['Implement search-attributed events with queryID and userToken.', 'Validate events against downstream feature requirements, not only HTTP 200 responses.'],
    docs: ['Event types', 'Send events', 'InstantSearch events', 'Segment connector', 'Google Tag Manager connector']
  },
  'algolia-instantsearch-ui': {
    useThisTo: ['Build or audit search and browse pages around the official instantsearch skill.', 'Wire filters, routing, sort, pagination, empty states, mobile behavior, accessibility, and events.'],
    asks: ['Is this search, browse, federated search, or team-facing lookup?', 'Which refinements are visible, silent, routed, or secured?', 'Which official instantsearch source-of-truth check is needed?'],
    produces: ['Official skill usage note, customer UI plan, routing/state plan, event readiness notes, and QA checklist.'],
    prompt: `Use $algolia-instantsearch-ui with the official instantsearch skill to plan our [React/Vue/JS] search results page.

We need [filters, sorting, routing, mobile behavior, SSR]. Our index has [key fields].
Return the customer journey, data contract checks, routing/state plan, mobile and accessibility plan, event handoff, and QA checklist.`,
    academyModules: ['Build search UI with InstantSearch', 'Filters, routing, and events'],
    learningObjectives: ['Choose the right widgets or connectors for the journey.', 'Preserve search state, mobile recovery paths, accessibility, and event attribution.'],
    docs: ['Official algolia/skills instantsearch', 'InstantSearch documentation', 'Routing', 'Insights middleware']
  },
  'algolia-autocomplete': {
    useThisTo: ['Frame the customer journey before implementing with the official Autocomplete skill.', 'Audit source contracts, Academy quality criteria, category handoff, mobile, keyboard, routing, and event attribution.'],
    asks: ['What should appear while typing or on focus?', 'Which named user need does each advanced pattern solve, and do all input paths carry the same destination and scope?'],
    produces: ['Official skill usage note, source contract, quality standard verdict, customer UI plan, data/event readiness notes, and mobile/keyboard/routing QA.'],
    prompt: 'Use algolia-autocomplete to design my query suggestions, recent searches, federated sources, and selection behavior.',
    academyModules: ['Autocomplete and query suggestions', 'Search UX patterns'],
    learningObjectives: ['Design source strategy by user intent.', 'Validate helpfulness, clarity, focus, device usability, selection handoff, and attribution across every input path.'],
    docs: ['Official algolia/skills instantsearch', 'Autocomplete documentation', 'Query Suggestions', 'Recent searches plugin']
  },
  'algolia-release-qa': {
    useThisTo: ['Run pre-launch or regression QA.', 'Prioritize defects by conversion, discoverability, analytics integrity, security, and rollback risk.'],
    asks: ['What changed and what user paths must pass?', 'Can data, settings, UI, events, keys, and rollback be inspected safely?'],
    produces: ['Severity-led findings, evidence matrix, attribution-chain checks, recommended fixes, tests run, tests not run, and residual risk.'],
    prompt: `Use $algolia-release-qa to create a severity-led launch review for our Algolia implementation.

Changed surfaces: [data/settings/UI/events/AI]. Available evidence: [code, screenshots, payloads, exports].
Return blockers first, then high/medium/low risks, owners, smallest retests, tests run, tests not run, and residual risk.`,
    academyModules: ['Launch readiness and implementation QA', 'Analytics and security validation'],
    learningObjectives: ['Inspect the full implementation surface before launch.', 'Write actionable findings with evidence and owner.'],
    docs: ['API key security', 'Index settings', 'Insights validation']
  },
  'algolia-agent-studio': {
    useThisTo: ['Plan, implement, validate, or audit an Agent Studio experience.', 'Define a narrow agent room, tool contracts, entry point, guardrails, feedback, auth, and measurement.'],
    asks: ['What high-intent job should the first rollout perform?', 'Which tools, indices, context, actions, guardrails, and failure paths are allowed?'],
    produces: ['Agent-room map, tool contracts, security checks, feedback/events plan, troubleshooting trace, and launch QA.'],
    prompt: `Use $algolia-agent-studio to design a narrow first agent.

The job is [one high-intent task]. Users are [audience]. The agent may access [indices/tools] and must not [out-of-scope actions].
Return an agent-room map, tool contracts, entry-point recommendation, guardrails, memory decision, test conversations, feedback events, and limited-rollout recommendation.`,
    academyModules: ['Agent Studio setup and validation', 'AI experience measurement'],
    learningObjectives: ['Define safe agent-room and tool boundaries.', 'Diagnose behavior from scope through retrieval, safety, and integration before changing the model.'],
    docs: ['Agent Studio documentation', 'Algolia AI documentation', 'Insights events']
  },
  'algolia-neuralsearch': {
    useThisTo: ['Plan NeuralSearch rollout and validation.', 'Check whether semantic fields, event readiness, query evidence, settings, and measurement can support hybrid relevance.'],
    asks: ['Which query classes should improve?', 'Which exact, compliance, filter, or merchandising behavior must remain deterministic, and how will hybrid evidence be reviewed?'],
    produces: ['Readiness assessment, semantic field rationale, query test set, hybrid evidence log, rollout strategy, and blockers.'],
    prompt: `Use $algolia-neuralsearch to assess whether we are ready for NeuralSearch.

Our target queries are [examples]. Exact behavior that must remain stable: [examples].
Our semantic fields are [fields]. We have [click/conversion] events and [traffic level].
Return readiness gates, semantic attribute rationale, query evaluation set, hybrid evidence log, staged rollout, rollback, and blockers.`,
    academyModules: ['NeuralSearch readiness and rollout', 'Semantic relevance measurement'],
    learningObjectives: ['Validate data quality, event readiness, and measurement readiness before AI relevance rollout.', 'Measure hybrid relevance with query sets, evidence, diagnostics, and rollout controls.'],
    docs: ['NeuralSearch documentation', 'A/B testing', 'Insights events']
  },
  'algolia-ui-libraries': {
    useThisTo: ['Select the current Algolia UI library before implementation.', 'Avoid stale package-memory and route to InstantSearch or Autocomplete skills.'],
    asks: ['What framework, platform, SSR/routing needs, and event requirements exist?', 'Is this full search, browse, autocomplete, mobile, or docs search?'],
    produces: ['Recommended library, official docs paths, assumptions, and QA considerations.'],
    prompt: 'Use algolia-ui-libraries to select the right current Algolia UI library and docs path for my frontend.',
    academyModules: ['UI library selection', 'Frontend implementation paths'],
    learningObjectives: ['Pick the right frontend library for the job.', 'Verify live docs before install or upgrade.'],
    docs: ['InstantSearch documentation', 'Autocomplete documentation', 'Mobile UI libraries']
  }
};

const educationProfiles = {
  'algolia-discovery-planning': {
    academy: 'Aligns broad customer requests to Academy learning objectives before routing to implementation skills.',
    maturity: ['Beginner implementation', 'Production readiness'],
    useCases: allUseCases,
    prompts: [
      'Use this skill to turn my Algolia request into the right discovery questions.',
      'Use this skill to map my customer use case to the right implementation path.'
    ],
    artifacts: [artifactLinks.install, artifactLinks.start, artifactLinks.brief, artifactLinks.academyReference, artifactLinks.academy, artifactLinks.official, artifactLinks.repo, artifactLinks.retrieval, artifactLinks.maturity, artifactLinks.limitations, artifactLinks.useCase]
  },
  'algolia-data-modeling': {
    academy: 'Maps record design work to Academy modules about indexing, searchable records, object identity, and data readiness.',
    maturity: ['Beginner implementation', 'Production readiness', 'AI readiness'],
    useCases: allUseCases,
    prompts: [
      'Use this skill to create an indexing contract for my records.',
      'Use this skill to audit whether my data is ready for AI features.'
    ],
    artifacts: [artifactLinks.brief, artifactLinks.examples, artifactLinks.indexing, artifactLinks.official, artifactLinks.maturity, artifactLinks.useCase]
  },
  'algolia-index-configuration': {
    academy: 'Connects relevance changes to Academy objectives for searchable attributes, ranking, facets, synonyms, rules, and merchandising.',
    maturity: ['Production readiness', 'Optimization'],
    useCases: ['Ecommerce search', 'Content search', 'B2B catalog', 'Marketplace'],
    prompts: [
      'Use this skill to design my relevance settings from business goals.',
      'Use this skill to audit my ranking, facets, synonyms, and rules.'
    ],
    artifacts: [artifactLinks.qa, artifactLinks.official, artifactLinks.maturity]
  },
  'algolia-events-insights': {
    academy: 'Aligns event setup to Academy learning objectives for Insights, queryID, userToken, connector paths, analytics, personalization, and AI readiness.',
    maturity: ['Beginner implementation', 'Production readiness', 'Optimization', 'AI readiness'],
    useCases: allUseCases,
    prompts: [
      'Use this skill to audit my events setup.',
      'Use this skill to design the event taxonomy for personalization, Recommend, and AI features.'
    ],
    artifacts: [artifactLinks.events, artifactLinks.qa, artifactLinks.official, artifactLinks.maturity]
  },
  'algolia-instantsearch-ui': {
    academy: 'Maps UI work to Academy objectives for search pages, browse pages, widgets, filters, routing, mobile behavior, states, and events while deferring code-level API authority to Algolia’s official instantsearch skill.',
    maturity: ['Beginner implementation', 'Production readiness', 'Optimization'],
    useCases: ['Ecommerce search', 'Content search', 'B2B catalog', 'Support knowledge base', 'Marketplace'],
    prompts: [
      'Use this skill to build my InstantSearch results page.',
      'Use this skill to audit my filters, routing, mobile behavior, and event attribution.'
    ],
    artifacts: [artifactLinks.qa, artifactLinks.events, artifactLinks.official]
  },
  'algolia-ui-libraries': {
    academy: 'Uses public Academy and docs sources as a living selector for current UI libraries, not a frozen API dump.',
    maturity: ['Beginner implementation', 'Production readiness'],
    useCases: allUseCases,
    prompts: [
      'Use this skill to select the right current Algolia UI library for my app.',
      'Use this skill to plan an upgrade without relying on stale package-memory.'
    ],
    artifacts: [artifactLinks.academyReference, artifactLinks.academy, artifactLinks.qa, artifactLinks.official, artifactLinks.repo]
  },
  'algolia-autocomplete': {
    academy: 'Connects typeahead work to Academy objectives for query suggestions, recent searches, federated sources, mobile behavior, and attribution.',
    maturity: ['Beginner implementation', 'Production readiness', 'Optimization'],
    useCases: ['Ecommerce search', 'Content search', 'Support knowledge base', 'Marketplace', 'AI shopping assistant'],
    prompts: [
      'Use this skill to design my autocomplete source strategy.',
      'Use this skill to audit suggestion selection behavior and analytics attribution.'
    ],
    artifacts: [artifactLinks.qa, artifactLinks.events, artifactLinks.official]
  },
  'algolia-release-qa': {
    academy: 'Turns Academy learning objectives into a launch-readiness review across data, relevance, UI, events, security, and rollback.',
    maturity: ['Production readiness', 'Optimization', 'AI readiness'],
    useCases: allUseCases,
    prompts: [
      'Use this skill to create a pre-launch QA report.',
      'Use this skill to validate whether my Algolia change is ready for production.'
    ],
    artifacts: [artifactLinks.qa, artifactLinks.events, artifactLinks.indexing, artifactLinks.official]
  },
  'algolia-agent-studio': {
    academy: 'Connects Agent Studio implementation to Academy objectives for AI readiness, search tools, events, feedback, security, and validation.',
    maturity: ['Production readiness', 'Optimization', 'AI readiness'],
    useCases: ['Support knowledge base', 'Marketplace', 'AI shopping assistant', 'Content search', 'B2B catalog'],
    prompts: [
      'Use this skill to design my Agent Studio setup.',
      'Use this skill to audit Agent Studio tools, guardrails, analytics, and feedback readiness.'
    ],
    artifacts: [artifactLinks.academyReference, artifactLinks.academy, artifactLinks.events, artifactLinks.qa, artifactLinks.official, artifactLinks.maturity]
  },
  'algolia-neuralsearch': {
    academy: 'Connects NeuralSearch rollout to Academy objectives for semantic data, relevance intent, test queries, events-informed optimization, and measurement.',
    maturity: ['Production readiness', 'Optimization', 'AI readiness'],
    useCases: ['Ecommerce search', 'Content search', 'B2B catalog', 'Support knowledge base', 'Marketplace', 'AI shopping assistant'],
    prompts: [
      'Use this skill to design my NeuralSearch rollout.',
      'Use this skill to validate my data, measurement path, and query set before rolling out NeuralSearch.'
    ],
    artifacts: [artifactLinks.academyReference, artifactLinks.academy, artifactLinks.events, artifactLinks.qa, artifactLinks.official, artifactLinks.maturity]
  }
};

function getEducationProfile(pkg) {
  return educationProfiles[pkg.id] || {
    academy: 'Retrieve relevant Academy modules or learning objectives before implementation, then use them to guide procedural decisions.',
    maturity: ['Beginner implementation', 'Production readiness'],
    useCases: allUseCases,
    prompts: [`Use this skill to plan ${pkg.title}.`],
    artifacts: [artifactLinks.academyReference, artifactLinks.academy, artifactLinks.qa, artifactLinks.official]
  };
}

function App() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('algolia-skills-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('algolia-skills-theme', theme);
  }, [theme]);

  const visiblePackages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return skillPackages.filter((pkg) => {
      const matchesFilter = filter === 'All' || pkg.type === filter;
      const haystack = [pkg.title, pkg.description, pkg.type, pkg.id, ...pkg.triggers, ...pkg.includes]
        .join(' ')
        .toLowerCase();
      return matchesFilter && (!needle || haystack.includes(needle));
    });
  }, [filter, query]);

  return (
    <>
      <div className="app-shell">
        <Header
          onGuide={() => setGuideOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
        />
        <main>
          <section className="hero-section" aria-labelledby="page-title">
            <div className="hero-copy">
              <div>
                <h1 id="page-title">Algolia Implementation Skills</h1>
                <p>
                  Agent skills for planning, building, and validating Algolia implementations through the whole Algolia lens: data and events first, then relevance, UI, AI readiness, and launch QA.
                </p>
                <p className="hero-meta">Updated July 23, 2026</p>
              </div>
              <div className="hero-actions" aria-label="Primary actions">
                <DownloadButton href="/downloads/algolia-skills-library.zip" label="Download library" size="large" />
                <p>New build: Search Implementation. Unclear scope or migration: Discovery Planning. Existing build audit: Release QA.</p>
              </div>
            </div>
          </section>

          <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
            <div className="section-heading">
              <div>
                <h2 id="catalog-title">Choose a skill</h2>
                <p>Download the full library for the whole Algolia workflow, or pick the skill your agent needs right now.</p>
              </div>
              <div className="catalog-controls">
                <label className="search-control">
                  <Search size={18} />
                  <span className="sr-only">Search skills</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search skills..."
                  />
                </label>
                <label className="filter-control">
                  <Filter size={18} />
                  <span className="sr-only">Filter packages</span>
                  <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                    {filters.map((item) => (
                      <option value={item} key={item}>{item}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} />
                </label>
              </div>
            </div>

            <div className="package-table" role="list">
              <div className="table-head" aria-hidden="true">
                <span>Skill</span>
                <span>Action</span>
              </div>
              {visiblePackages.map((pkg, index) => (
                <PackageRow pkg={pkg} index={index} onDetails={() => setSelectedPackage(pkg)} key={pkg.id} />
              ))}
              {visiblePackages.length === 0 && (
                <div className="empty-state">
                  <Search size={24} />
                  <strong>No skills found</strong>
                  <p>Try a different query or clear the filter.</p>
                </div>
              )}
            </div>

            <div className="reference-pack-section" aria-labelledby="reference-pack-title">
              <div>
                <h3 id="reference-pack-title">Living reference pack</h3>
                <p>Current UI library selection belongs beside the skills, not mixed into the implementation list.</p>
              </div>
              <div className="package-table compact" role="list">
                {referencePackages.map((pkg, index) => (
                  <PackageRow pkg={pkg} index={index} onDetails={() => setSelectedPackage(pkg)} key={pkg.id} />
                ))}
              </div>
            </div>

            <WorksBestWith />
            <UseCaseBundles onDetails={setSelectedPackage} />
          </section>
        </main>
      </div>
      {guideOpen && <GuideModal onClose={() => setGuideOpen(false)} />}
      {selectedPackage && <PackageDetailsModal pkg={selectedPackage} onClose={() => setSelectedPackage(null)} />}
    </>
  );
}

function Header({ onGuide, theme, onToggleTheme }) {
  const isLight = theme === 'light';

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Algolia Skills Library home">
        <img src={isLight ? '/brand/Algolia-logo-blue.svg' : '/brand/Algolia-logo-white.svg'} alt="Algolia" />
        <span />
        <strong>Skills Library</strong>
      </a>
      <nav aria-label="Primary navigation">
        <a href="https://academy.algolia.com/" target="_blank" rel="noreferrer">
          Academy <ExternalLink size={15} />
        </a>
        <a href="https://www.algolia.com/doc/" target="_blank" rel="noreferrer">
          Docs <ExternalLink size={15} />
        </a>
        <a href="https://www.algolia.com/" target="_blank" rel="noreferrer">
          Algolia.com <ExternalLink size={15} />
        </a>
        <button className="install-button" type="button" onClick={onGuide}>Install</button>
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-pressed={!isLight}
        >
          <span className="theme-toggle-track" aria-hidden="true">
            <Sun className="theme-toggle-icon sun-icon" size={12} />
            <Moon className="theme-toggle-icon moon-icon" size={12} />
            <span className="theme-toggle-thumb" />
          </span>
        </button>
        <DownloadButton href="/downloads/algolia-skills-library.zip" label="Download full library" />
      </nav>
    </header>
  );
}

function WorksBestWith() {
  return (
    <section className="companion-section" aria-labelledby="companion-title">
      <div className="section-heading compact-heading">
        <div>
          <h2 id="companion-title">Works with official Algolia tools</h2>
          <p>Install official tooling separately when agents need live account access, official workflows, or framework-specific implementation details.</p>
        </div>
      </div>
      <div className="companion-grid">
        {companionTools.map((tool) => (
          <CompanionToolCard tool={tool} key={tool.id} />
        ))}
      </div>
    </section>
  );
}

function CompanionToolCard({ tool }) {
  const Icon = tool.icon;
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(tool.command);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = tool.command;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      document.body.removeChild(fallback);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article className="companion-card">
      <div className="companion-card-header">
        <span><Icon size={22} /></span>
        <div>
          <p>{tool.commandLabel}</p>
          <h3>{tool.title}</h3>
        </div>
      </div>
      <p>{tool.description}</p>
      <code>{tool.command}</code>
      <div className="companion-actions">
        <button type="button" onClick={copyCommand}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy install'}
        </button>
        <a href={tool.href} target="_blank" rel="noreferrer">
          {tool.action} <ExternalLink size={15} />
        </a>
      </div>
      {tool.downloadHref && (
        <a className="companion-download" href={tool.downloadHref} download>
          <ArrowDownToLine size={16} />
          {tool.downloadLabel}
        </a>
      )}
    </article>
  );
}

function UseCaseBundles() {
  return (
    <section className="bundle-section" aria-labelledby="bundle-title">
      <div className="section-heading compact-heading">
        <div>
          <h2 id="bundle-title">Bundles</h2>
          <p>Scenario-specific guides and skill sets for common projects.</p>
        </div>
      </div>
      <div className="bundle-grid">
        {useCaseBundles.map((bundle) => {
          const Icon = bundle.icon;
          return (
            <article className="bundle-card" key={bundle.id}>
              <div className="bundle-header">
                <span><Icon size={20} /></span>
                <h3>{bundle.title}</h3>
              </div>
              <p>{bundle.description}</p>
              <a className="bundle-guide-link" href={bundle.guideHref} target="_blank" rel="noreferrer">
                <BookOpen size={16} />
                Read bundle guide
              </a>
              <DownloadButton href={bundle.href} label="Download bundle" />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PackageRow({ pkg, index, onDetails }) {
  const Icon = pkg.icon;
  return (
    <article className="package-row" role="listitem">
      <div className="package-main">
        <span className={`package-icon ${pkg.color}`}><Icon size={30} /></span>
        <div>
          <h3>{index + 1}. {pkg.title}</h3>
          <p>{pkg.description}</p>
        </div>
      </div>
      <div className="package-actions">
        <button className="details-button" type="button" onClick={onDetails}>
          <BookOpen size={17} />
          Details
        </button>
        <DownloadButton href={pkg.href} label={pkg.type === 'Reference' ? 'Download reference' : 'Download skill'} />
      </div>
    </article>
  );
}

function DownloadButton({ href, label, size }) {
  return (
    <a
      className={`download-button ${size === 'large' ? 'large' : ''}`}
      href={href}
      download
      onClick={() => trackDownload(href, label)}
    >
      <ArrowDownToLine size={size === 'large' ? 22 : 18} />
      <span>{label}</span>
    </a>
  );
}

function GuideModal({ onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="guide-modal" role="dialog" aria-modal="true" aria-labelledby="guide-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close installation guide">
          <X size={20} />
        </button>
        <h2 id="guide-title">Install the skills</h2>
        <p>Download the full library or individual ZIPs, unzip them, then keep each skill folder intact with its top-level SKILL.md. Orient agents to the whole Algolia system: data and events first, then relevance, UI, AI readiness, and release QA. This library extends Algolia MCP, the Algolia CLI, and official Algolia skills when live data or account actions are needed.</p>
        <div className="install-grid">
          <div>
            <h3>Codex</h3>
            <code>~/.codex/skills/algolia-*/SKILL.md</code>
            <p>Copy each extracted algolia-* folder into ~/.codex/skills/.</p>
          </div>
          <div>
            <h3>Claude</h3>
            <code>skills/algolia-*/SKILL.md</code>
            <p>Upload or import the full extracted folder into the Claude skill or project area your workspace uses.</p>
          </div>
        </div>
        <p className="guide-note">Customers still need current docs verification and access to their own Algolia app, source data, codebase, and analytics for production work.</p>
        <a className="download-button large" href="/downloads/algolia-skills-library.zip" download>
          <ArrowDownToLine size={22} />
          Download full library
        </a>
      </section>
    </div>
  );
}

function PackageDetailsModal({ pkg, onClose }) {
  const Icon = pkg.icon;
  const profile = detailProfiles[pkg.id] || {
    useThisTo: pkg.useWhen,
    asks: pkg.teachesAgentToAsk,
    produces: pkg.deliverables,
    prompt: `Use ${pkg.id} to plan and validate ${pkg.title}.`,
    academyModules: ['Academy/docs source alignment'],
    learningObjectives: ['Retrieve relevant learning objectives before implementation.'],
    docs: ['Algolia documentation']
  };
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(profile.prompt);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = profile.prompt;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="details-modal" role="dialog" aria-modal="true" aria-labelledby="package-details-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label={`Close ${pkg.title} details`}>
          <X size={20} />
        </button>
        <div className="details-header">
          <span className={`package-icon ${pkg.color}`}><Icon size={30} /></span>
          <div>
            <p>{pkg.id}</p>
            <h2 id="package-details-title">{pkg.title}</h2>
          </div>
        </div>
        <p className="details-purpose">{pkg.description}</p>

        <div className="task-summary-grid practical" aria-label={`${pkg.title} practical details`}>
          <TaskSummaryBlock title="Use It For" items={profile.useThisTo} />
          <TaskSummaryBlock title="Have Ready" items={profile.asks} />
          <TaskSummaryBlock title="You Get" items={profile.produces} />
        </div>

        <section className="prompt-panel" aria-labelledby={`${pkg.id}-prompt-title`}>
          <div>
            <h3 id={`${pkg.id}-prompt-title`}>Sample prompt</h3>
            <p>{profile.prompt}</p>
          </div>
          <button type="button" onClick={copyPrompt}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
        </section>

        <section className="included-panel" aria-labelledby={`${pkg.id}-included-title`}>
          <h3 id={`${pkg.id}-included-title`}>Included in the download</h3>
          <div className="included-list">
            {pkg.filesInside.map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>

        <div className="details-footer">
          <DownloadButton href={pkg.href} label={pkg.type === 'Reference' ? 'Download reference' : 'Download skill'} />
        </div>
      </section>
    </div>
  );
}

function TaskSummaryBlock({ title, items }) {
  return (
    <article className="task-summary-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}

function DetailBlock({ title, items }) {
  return (
    <article className="detail-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}

initAnalytics();
createRoot(document.getElementById('root')).render(<App />);
