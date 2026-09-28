import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownToLine,
  ArrowRight,
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
  Lightbulb,
  Monitor,
  Moon,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Sun,
  Terminal,
  ThumbsDown,
  ThumbsUp,
  WandSparkles,
  Waypoints,
  X,
  Zap
} from 'lucide-react';
import './styles.css';

// GA4 measurement ID for the DCS-facing site. Downloads fire a
// `bundle_download` event and feedback thumbs a `feedback_vote` event; set this
// back to 'G-XXXXXXXXXX' to disable analytics entirely.
//
// `file_name`, `link_url`, `button_label`, `vote` and `feedback_about` have to be
// registered as event-scoped custom dimensions in GA4 (Admin > Data display >
// Custom definitions) before they show up in reports — registration is not
// retroactive.
const GA_MEASUREMENT_ID = 'G-SR64HVSLY6';

// ---------- consent ----------
// Analytics must not run until someone has said yes: GA sets cookies, this is a
// public page, and visitors are in scope for GDPR. So `initAnalytics` is called
// from the consent banner, never on load.
//
// This is deliberately a single yes/no for one analytics tag, not a
// general-purpose CMP. algolia.com runs OneTrust for that job. If this site ever
// carries more third-party tags, move it there rather than growing this.
const CONSENT_KEY = 'algolia-skills-consent';

// Bump when what is being consented to changes, which re-asks everyone. Their
// old answer no longer covers the new thing.
const CONSENT_VERSION = 1;

function readConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved.version !== CONSENT_VERSION) return null;
    return saved.choice === 'granted' ? 'granted' : 'denied';
  } catch {
    // Private mode or a wiped profile: treat an unreadable answer as no answer.
    return null;
  }
}

function clearConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Ignored; state is reset in memory regardless.
  }
}

function writeConsent(choice) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      choice,
      version: CONSENT_VERSION,
      at: new Date().toISOString()
    }));
  } catch {
    // Nothing we can do; the banner will simply ask again next visit.
  }
}

// Google's documented opt-out flag. gtag checks it on every call, so a
// withdrawal stops collection immediately instead of at the next page load. The
// cookies already set live on the GA domain and cannot be removed from here.
function disableAnalytics() {
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
}

function initAnalytics() {
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
  if (window.__gaStarted) return;
  window.__gaStarted = true;
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

// Prefix site-local URLs with Vite's base so subpath deploys work.
function withBase(path) {
  return path.startsWith('/') ? import.meta.env.BASE_URL.replace(/\/$/, '') + path : path;
}

function trackDownload(href, label) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'bundle_download', {
    file_name: href.split('/').pop(),
    link_url: href,
    button_label: label
  });
}

// ---------- feedback ----------
// The site is static, so feedback goes to a Google Form rather than an endpoint
// of our own. It is POSTed in the background, so nobody is ever sent to the raw
// Google Form — that experience is the whole thing this avoids.
//
// FEEDBACK_FORM_ID is the *published* id from the form's Send > link
// (/forms/d/e/<id>/viewform), not the id in the /edit URL. The entry ids come
// from the form's "Get pre-filled link". See enablement/feedback-form.md.
//
// Two form settings SILENTLY break this, because a no-cors POST cannot read the
// response back. Both were verified against the live form:
//   * "Collect email addresses" — adds a required Email field. Without an
//     `emailAddress` param every POST is rejected 400.
//   * marking any question Required — same failure for a submission that omits
//     it, e.g. a row thumb that carries no note.
// Keep email collection off and every question optional.
const FEEDBACK_FORM_ID = '1FAIpQLSdXcr1qSItx0wyXzAWfVfTYssU1aJgaF4RMkuCitgAKl6qq5g';
const FEEDBACK_ENTRY = {
  vote: 'entry.931205562',   // Q1 "How's it working out?" — multiple choice
  about: 'entry.1186007049', // Q2 "What's this about?" — short answer
  idea: 'entry.1544401237'   // Q3 "What would make it better?" — paragraph
};

// Must match the Q1 option text character for character, or Google discards the
// answer and Q1 arrives blank.
const VOTE_ANSWERS = { up: 'Working well', down: 'Needs work' };

const IDEA_MAX = 1200;

const isSet = (value) => !value.includes('PASTE_');

const feedbackReady = isSet(FEEDBACK_FORM_ID);

// Without Q2 a per-skill vote is indistinguishable from a site-wide one, so the
// row thumbs stay hidden until that question exists rather than quietly
// collecting votes nobody can attribute to a skill.
const rowVoteReady = feedbackReady && isSet(FEEDBACK_ENTRY.about);

// `no-cors` is what lets a static page post cross-origin to Google without a
// preflight, and the trade is that the response is opaque: a 400 is
// indistinguishable from a 200 here. So this resolves for anything the server
// answered and rejects only on a genuine network failure — which is why the
// payload correctness above is verified out-of-band rather than trusted.
async function submitFeedback({ vote, about, idea = '' }) {
  const body = new URLSearchParams();
  const add = (entry, value) => {
    if (value && isSet(entry)) body.set(entry, value);
  };
  add(FEEDBACK_ENTRY.vote, vote && VOTE_ANSWERS[vote]);
  add(FEEDBACK_ENTRY.about, about);
  add(FEEDBACK_ENTRY.idea, idea.trim().slice(0, IDEA_MAX));

  await fetch(`https://docs.google.com/forms/d/e/${FEEDBACK_FORM_ID}/formResponse`, {
    method: 'POST',
    mode: 'no-cors',
    body
  });
}

// Mirrored to GA4 so a vote is still counted if the Google POST is ever
// rejected — a no-op until GA_MEASUREMENT_ID is set to a real property.
function trackFeedback(vote, about) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'feedback_vote', { vote, feedback_about: about });
}

const packages = [
  {
    id: 'algolia-audit',
    title: 'Audit',
    description: "Reviews a live setup.",
    icon: Search,
    color: 'teal',
    files: 2,
    type: 'QA',
    triggers: ['audit', 'review our setup', 'health check', 'inherited implementation', 'is this configured correctly', 'search got worse'],
    includes: ['Symptom-free checklist', 'Live-evidence-first workflow', 'Routing to the deep skills', 'Defect vs preference rule'],
    summary: 'This is the front door for anything that already exists and mostly works. Its premise: the costliest configuration defects are symptom-free. It captures live state before judging, runs a nine-item checklist of defects that pass every demo, routes deep work to index-configuration, data-modeling, events-insights and release-qa, and requires every fix to be re-verified against the live index and rendered page.',
    useWhen: [
      'A user asks to audit, review, health-check, or troubleshoot an Algolia implementation that already exists.',
      'A team inherited an implementation, or search quality got worse and nobody knows why.',
      'A pre-launch review of a build that "works" and needs someone to check whether it is right.'
    ],
    teachesAgentToAsk: [
      'Which surfaces are in scope: indices and replicas, frontend pages, event pipeline, API keys?',
      'What does the live state look like right now: primary and replica settings, a public-key hit payload, facet stats, the rendered page and its console?',
      'Does a near-unique numeric lead the ranking chain, making every later signal inert?',
      'Is every high-cardinality facet searchable in the index AND in the UI, and does hierarchical data drive a hierarchical widget?',
      'Which findings are defects against documented practice, and which are defensible preferences?'
    ],
    deliverables: [
      'Live before/after evidence for every finding: settings read-back, live queries, rendered page, captured Insights payloads.',
      'The symptom-free checklist scored: ranking tie-breakers, searchable facets, hierarchy, facet stats, retrieval hygiene, replica parity, event truth, page startup and mobile, key scope.',
      'Fixes re-verified against live state, never from the write-up alone.',
      'A severity-led report in release-qa format: what was checked, what was not, residual risk.'
    ],
    filesInside: ['SKILL.md', 'evals/evals.json'],
    href: '/downloads/algolia-audit.zip'
  },
  {
    id: 'algolia-search-implementation',
    title: 'Search Implementation',
    description: "The build-from-scratch checklist.",
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
    description: "Turns your request into a plan.",
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
    description: "Shapes your data for search.",
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
    description: "Result order, filters, promotions.",
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
    description: "Click and conversion tracking, set up right the first time. NeuralSearch and Dynamic Re-Ranking learn from it.",
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
    description: "The results page.",
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
    description: "Which front-end library to use.",
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
    description: "Suggestions as people type.",
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
    description: "Pre-launch check, blockers first.",
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
    description: "A chat assistant, scoped and measured.",
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
    description: "AI relevance, rolled out safely.",
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

// Reader-facing grouping. Stages read as a journey, not as engineering
// categories, so someone who does not know the vocabulary can still place
// themselves. Order inside a stage is the order you would normally reach for them.
const stages = [
  { id: 'Plan and review' },
  { id: 'Foundations' },
  { id: 'Search screen' },
  { id: 'Launch check' },
  { id: 'AI features' },
  { id: 'Reference' }
];

const stageById = {
  'algolia-discovery-planning': 'Plan and review',
  'algolia-audit': 'Plan and review',
  'algolia-search-implementation': 'Plan and review',
  'algolia-data-modeling': 'Foundations',
  'algolia-index-configuration': 'Foundations',
  'algolia-events-insights': 'Foundations',
  'algolia-instantsearch-ui': 'Search screen',
  'algolia-autocomplete': 'Search screen',
  'algolia-release-qa': 'Launch check',
  'algolia-neuralsearch': 'AI features',
  'algolia-agent-studio': 'AI features',
  'algolia-ui-libraries': 'Reference'
};

const badgeById = {
  'algolia-discovery-planning': 'New to Algolia',
  'algolia-audit': 'Already live',
  'algolia-search-implementation': 'Loaded for you'
};

const skillOrder = Object.keys(stageById);
packages.sort((a, b) => skillOrder.indexOf(a.id) - skillOrder.indexOf(b.id));
packages.forEach((pkg) => {
  pkg.stage = stageById[pkg.id];
  pkg.badge = badgeById[pkg.id];
});

const skillPackages = packages;

const filters = ['All', ...stages.map((stage) => stage.id)];

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
    skills: ['algolia-audit', 'algolia-index-configuration', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-release-qa'],
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
    pickIf: "you sell products online.",
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
    pickIf: "your customers log in and see different prices or stock.",
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
    pickIf: "people search your help articles.",
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
    pickIf: "you want a chat assistant that helps people shop.",
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
    pickIf: "many sellers list on your site.",
    title: 'Marketplace bundle',
    icon: Store,
    description: 'Multi-seller catalogs, region or permission variants, relevance controls, events, UI, AI readiness, and QA.',
    skills: ['algolia-search-implementation', 'algolia-discovery-planning', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-instantsearch-ui', 'algolia-autocomplete', 'algolia-neuralsearch', 'algolia-release-qa'],
    artifacts: [artifactLinks.start, artifactLinks.brief, artifactLinks.examples, artifactLinks.indexing, artifactLinks.events, artifactLinks.qa, artifactLinks.useCase],
    href: '/downloads/marketplace-bundle.zip',
    guideHref: '/artifacts/use-cases/marketplace.md'
  }
];

// Plain-language on purpose: this section is read by CSMs and AEs, not only
// engineers. Each card answers "what does this let me do" before it shows a
// command, and the command says which tool it is for rather than assuming
// Claude Code.
const companionTools = [
  {
    id: 'algolia-productivity-mcp',
    title: 'Algolia Productivity MCP',
    eyebrow: 'See your real account',
    description: 'Your assistant reads your real account. Read-only.',
    note: 'Read-only. Signs in through your browser.',
    icon: Bot,
    command: 'claude mcp add --transport http algolia https://mcp.algolia.com/mcp',
    commandFor: 'For Claude Code. Other tools are in the setup guide.',
    href: 'https://www.algolia.com/doc/guides/get-started/build-with-ai/#install-the-algolia-productivity-mcp',
    action: 'Setup guide'
  },
  {
    id: 'algolia-cli',
    title: 'Algolia CLI',
    eyebrow: 'Make the changes',
    description: 'Your assistant makes the changes.',
    note: 'For anyone comfortable in a terminal.',
    icon: Terminal,
    command: 'brew install algolia',
    commandFor: 'For macOS. Windows and Linux are in the setup guide.',
    href: 'https://www.algolia.com/doc/guides/get-started/build-with-ai/#install-the-algolia-cli',
    action: 'Setup guide'
  },
  {
    id: 'official-algolia-skills',
    title: 'Official Algolia skills',
    eyebrow: 'The wider set',
    description: 'Every official Algolia skill, these included.',
    note: '',
    icon: Library,
    command: '/plugin marketplace add algolia/skills',
    commandFor: 'For Claude Code. Other tools are covered in the repo.',
    href: 'https://github.com/algolia/skills',
    action: 'Open the repo'
  }
];

function getPackageById(id) {
  return packages.find((pkg) => pkg.id === id);
}

const detailProfiles = {
  'algolia-audit': {
    useThisTo: ["Algolia is already live.", "Search got worse, or nobody knows the setup."],
    asks: ["Access to the live app and the search pages."],
    produces: ["Problems ranked worst first, with evidence.", "Fixes re-checked against the live setup."],
    prompt: "Use the Algolia Audit skill to review our existing Algolia setup. Our search is live at [URL] and the index is [index name]. We think [what feels wrong, or “nothing specific”]. Look at what is actually configured before judging anything, tell me what is a real problem versus a matter of preference, worst first, with the evidence, and do not change anything without asking me first.",
    academyModules: ['Implementation review', 'Relevance and event health'],
    learningObjectives: ['Capture live state before judging.', 'Separate defects from preferences and re-verify every fix.'],
    docs: ['Index settings', 'Insights events', 'API key security']
  },
  'algolia-search-implementation': {
    useThisTo: ["Building search from scratch."],
    asks: ["The plan from Discovery Planning."],
    produces: ["A checklist in order: data, tracking, settings, page, launch."],
    prompt: "Use the Algolia Search Implementation skill to plan our search build. We sell [what] to [whom]. People mainly need to find [top tasks]. Our data lives in [platform] and the site is built with [framework]. Walk me through the decisions in order: data, tracking, settings, the page, launch checks. Do not change anything in Algolia yet.",
    academyModules: ['Search implementation workflow', 'Data and event foundations', 'AI readiness signposts'],
    learningObjectives: ['Sequence data, events, index configuration, UI, AI readiness, and QA work in order.', 'Apply search implementation readiness signposts.'],
    docs: ['Algolia documentation: Getting started', 'Algolia documentation: Send events']
  },
  'algolia-discovery-planning': {
    useThisTo: ["New to Algolia.", "The request is broad."],
    asks: ["What people search for, and what success means."],
    produces: ["A plan in stages.", "The next skill to open."],
    prompt: "Use the Algolia Discovery Planning skill. I want to [add search to my store / improve our site search]. Ask me only the questions you need, assume I may not know which technical details matter, then recommend the next skill, the smallest useful first step, and how we will check it worked.",
    academyModules: ['Search implementation discovery', 'Business outcomes and relevance ownership'],
    learningObjectives: ['Identify the minimum customer context required before setup.', 'Route broad requests to the right implementation skill.'],
    docs: ['Algolia documentation: Getting started', 'Algolia documentation: Sending and managing data']
  },
  'algolia-data-modeling': {
    useThisTo: ["Before anything is indexed.", "Search can’t filter or sort the way you want."],
    asks: ["A sample of your data, even a spreadsheet."],
    produces: ["What one result is and which fields it carries.", "A list of data gaps."],
    prompt: "Use the Algolia Data Modeling skill. Here is a sample of our data: [paste or attach]. Decide what one search result should be, which fields people search, filter and sort by, and what is missing for [what the business wants to do]. Explain the trade-offs in plain language.",
    academyModules: ['Prepare and structure records', 'Indexing strategy and objectID design'],
    learningObjectives: ['Choose record granularity from the user journey.', 'Design stable objectIDs and search-ready variant data.'],
    docs: ['Prepare your data', 'Searchable attributes', 'Custom ranking']
  },
  'algolia-index-configuration': {
    useThisTo: ["Results come back in the wrong order.", "You want to promote certain items."],
    asks: ["A few important searches and their ideal results."],
    produces: ["Settings changes, with the reasoning.", "Test searches, and how to undo."],
    prompt: "Use the Algolia Index Configuration skill. Important searches and what should come first: [examples]. Rules that must always hold: [in stock, permitted, region]. Preferences: [brand, popularity, margin]. Recommend the settings changes, the test searches to run before and after, and how to undo them. Do not change live settings without asking.",
    academyModules: ['Relevance configuration fundamentals', 'Faceting, filtering, synonyms, rules, and replicas'],
    learningObjectives: ['Map business intent to ranking settings.', 'Validate relevance changes with representative queries.'],
    docs: ['Searchable attributes', 'Custom ranking', 'Rules', 'Synonyms']
  },
  'algolia-events-insights': {
    useThisTo: ["Analytics show no clicks or conversions.", "Before NeuralSearch, Dynamic Re-Ranking or Personalization. They learn from these events."],
    asks: ["What counts as success: purchase, add to cart, sign-up."],
    produces: ["The few events that matter, set up right the first time.", "Proof they arrive, and that the AI features can use them."],
    prompt: "Use the Algolia Events & Insights skill. Our analytics show [no clicks / no conversions / odd numbers]. Our search page is built with [framework or tag manager]. The action that counts as success is [purchase / add to cart / sign-up]. Explain in plain language what is wrong, check the tracking end to end on the live page, and give me the smallest fix.",
    academyModules: ['Insights event implementation', 'Analytics and AI feature readiness'],
    learningObjectives: ['Implement search-attributed events with queryID and userToken.', 'Validate events against downstream feature requirements, not only HTTP 200 responses.'],
    docs: ['Event types', 'Send events', 'InstantSearch events', 'Segment connector', 'Google Tag Manager connector']
  },
  'algolia-instantsearch-ui': {
    useThisTo: ["Building or fixing the results page."],
    asks: ["Your framework, and the filters people need."],
    produces: ["A page plan: filters, sorting, links, mobile.", "Tracking wired in."],
    prompt: "Use the Algolia InstantSearch UI skill together with Algolia’s official InstantSearch skill. We are building a [search results / category] page in [React / Vue / plain JavaScript]. People need [filters, sorting, shareable links, mobile]. Plan the page first, then build it, and make sure result clicks are tracked.",
    academyModules: ['Build search UI with InstantSearch', 'Filters, routing, and events'],
    learningObjectives: ['Choose the right widgets or connectors for the journey.', 'Preserve search state, mobile recovery paths, accessibility, and event attribution.'],
    docs: ['Official algolia/skills instantsearch', 'InstantSearch documentation', 'Routing', 'Insights middleware']
  },
  'algolia-autocomplete': {
    useThisTo: ["Adding suggestions as people type."],
    asks: ["What should show up, and what choosing it does."],
    produces: ["What appears, and where it leads.", "Keyboard and mobile behaviour."],
    prompt: "Use the Algolia Autocomplete skill. As people type we want to show [past searches / popular searches / products / categories]. Choosing one should [run the search / open the item]. Plan what appears and where it leads, make it work on a phone and with a keyboard, and track the clicks.",
    academyModules: ['Autocomplete and query suggestions', 'Search UX patterns'],
    learningObjectives: ['Design source strategy by user intent.', 'Validate helpfulness, clarity, focus, device usability, selection handoff, and attribution across every input path.'],
    docs: ['Official algolia/skills instantsearch', 'Autocomplete documentation', 'Query Suggestions', 'Recent searches plugin']
  },
  'algolia-release-qa': {
    useThisTo: ["About to launch.", "A change that could break something."],
    asks: ["What changed, and access to the live page."],
    produces: ["Blockers first, with evidence.", "What was and wasn’t tested."],
    prompt: "Use the Algolia Release QA skill. We are about to launch [what changed]. You can check [the live page URL / the app]. Test rather than read, list anything that would block launch first, then the rest by severity, and tell me what you could not check.",
    academyModules: ['Launch readiness and implementation QA', 'Analytics and security validation'],
    learningObjectives: ['Inspect the full implementation surface before launch.', 'Write actionable findings with evidence and owner.'],
    docs: ['API key security', 'Index settings', 'Insights validation']
  },
  'algolia-agent-studio': {
    useThisTo: ["Building a chat or shopping assistant."],
    asks: ["The one job the agent should do."],
    produces: ["Scope, tools and safety rules.", "Test conversations and a first rollout."],
    prompt: "Use the Algolia Agent Studio skill. The first agent should do one job: [task]. Users are [audience]. It may use [data / tools] and must not [actions]. Map its scope, tools and safety rules, suggest test conversations, and recommend a small first rollout.",
    academyModules: ['Agent Studio setup and validation', 'AI experience measurement'],
    learningObjectives: ['Define safe agent-room and tool boundaries.', 'Diagnose behavior from scope through retrieval, safety, and integration before changing the model.'],
    docs: ['Agent Studio documentation', 'Algolia AI documentation', 'Insights events']
  },
  'algolia-neuralsearch': {
    useThisTo: ["Considering Algolia’s AI relevance.", "It’s on and not helping."],
    asks: ["Searches to improve, and searches that must not change."],
    produces: ["Ready or not yet, with reasons.", "Before/after tests, and a way back."],
    prompt: "Use the Algolia NeuralSearch skill. Searches we hope it improves: [examples]. Searches that must not change: [examples]. We have [some / little / no] click data. Tell me whether we are ready, what to fix first if not, how to test before and after, and how to roll back.",
    academyModules: ['NeuralSearch readiness and rollout', 'Semantic relevance measurement'],
    learningObjectives: ['Validate data quality, event readiness, and measurement readiness before AI relevance rollout.', 'Measure hybrid relevance with query sets, evidence, diagnostics, and rollout controls.'],
    docs: ['NeuralSearch documentation', 'A/B testing', 'Insights events']
  },
  'algolia-ui-libraries': {
    useThisTo: ["Choosing or upgrading a front-end library."],
    asks: ["Your framework and platform."],
    produces: ["The library to use, and why.", "Docs to verify against."],
    prompt: "Use the Algolia UI Libraries skill. Our site is built with [framework] on [web / iOS / Android / Flutter] and we need [a results page / suggestions as you type / mobile search]. Recommend the current Algolia library and point me to the docs to verify.",
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

// "Where do I start?" answered in the reader's own words. Each situation names
// one skill to open first and what it brings in after, plus a prompt that
// works as written. Kept in step with recommendedPaths above.
const situations = [
  {
    id: 'new',
    icon: Rocket,
    label: 'Starting fresh',
    lead: 'algolia-discovery-planning',
    then: ['algolia-data-modeling', 'algolia-events-insights', 'algolia-index-configuration', 'algolia-instantsearch-ui', 'algolia-release-qa'],
    prompt: 'Use the Algolia Discovery Planning skill. I want to [add search to my store / build search for our help centre]. Ask me only the questions you need, assume I may not know which technical details matter, then tell me the smallest useful first step.'
  },
  {
    id: 'live',
    icon: Check,
    label: 'Already live, want it checked',
    lead: 'algolia-audit',
    then: ['algolia-index-configuration', 'algolia-data-modeling', 'algolia-events-insights', 'algolia-release-qa'],
    prompt: 'Use the Algolia Audit skill to review our existing Algolia setup. Look at what is actually configured before judging anything, tell me what is a real problem versus a matter of preference, and do not change anything without asking me first.'
  },
  {
    id: 'events',
    icon: ChartNoAxesColumnIncreasing,
    label: 'Analytics look wrong or empty',
    lead: 'algolia-events-insights',
    then: ['algolia-instantsearch-ui', 'algolia-autocomplete', 'algolia-release-qa'],
    prompt: 'Use the Algolia Events & Insights skill. Our search analytics show [no click-through / no conversions / odd numbers]. Explain in plain language what is happening, check our event tracking end to end on the live page, and tell me the smallest fix.'
  },
  {
    id: 'ai',
    icon: Sparkles,
    label: 'Turning on AI features',
    lead: 'algolia-discovery-planning',
    then: ['algolia-data-modeling', 'algolia-events-insights', 'algolia-neuralsearch', 'algolia-agent-studio', 'algolia-release-qa'],
    prompt: 'Use the Algolia Discovery Planning skill. We want to turn on [NeuralSearch / Recommend / Personalization / Agent Studio]. Tell me what our data and event tracking need to look like first, what is already good enough, and the order to do things in.'
  },
  {
    id: 'screen',
    icon: Monitor,
    label: 'Building the search page',
    lead: 'algolia-instantsearch-ui',
    then: ['algolia-ui-libraries', 'algolia-autocomplete', 'algolia-events-insights', 'algolia-release-qa'],
    prompt: 'Use the Algolia InstantSearch UI skill. We are building a [search results / category / suggestions-as-you-type] page in [React / Vue / plain JavaScript]. Plan the page first, then build it, and make sure clicks on results are tracked.'
  },
  {
    id: 'launch',
    icon: ShieldCheck,
    label: 'About to launch',
    lead: 'algolia-release-qa',
    then: ['algolia-events-insights', 'algolia-index-configuration'],
    prompt: 'Use the Algolia Release QA skill. We are about to launch [what changed]. Check it the way a careful reviewer would, test against the live page and app rather than reading code alone, and list anything that would block launch first.'
  }
];

function Situations({ onSelect }) {
  return (
    <section className="situation-section" aria-labelledby="situation-title">
      <div className="section-heading compact-heading">
        <div>
          <h2 id="situation-title">Where do I start?</h2>
        </div>
      </div>
      <div className="situation-grid">
        {situations.map((situation) => (
          <SituationCard situation={situation} onSelect={onSelect} key={situation.id} />
        ))}
      </div>
      <SuitePrompt />
    </section>
  );
}

// One prompt that works for anything: the Discovery Planning skill reads the
// situation and routes to the rest of the suite.
const SUITE_PROMPT = 'Use the Algolia Discovery Planning skill. Here is what I am trying to do: [describe it in your own words]. Ask me only the questions you need, assume I may not know which technical details matter, then tell me which skill to use next and the smallest useful first step.';

function SuitePrompt() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(SUITE_PROMPT);
    } catch {
      const area = document.createElement('textarea');
      area.value = SUITE_PROMPT;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="suite-prompt">
      <span><strong>Not sure which?</strong> One prompt works for anything. It asks, then picks the skill.</span>
      <button type="button" onClick={copy}>
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? 'Copied' : 'Copy prompt'}
      </button>
    </div>
  );
}

function SituationCard({ situation, onSelect }) {
  const lead = getPackageById(situation.lead);
  const Icon = lead.icon;
  return (
    <button className="situation-card" type="button" onClick={() => onSelect(lead, situation.prompt)}>
      <span className={`package-icon ${lead.color}`}><Icon size={20} /></span>
      <span className="situation-text">
        <span className="situation-label">{situation.label}</span>
        <span className="situation-skill">{lead.title}</span>
      </span>
      <ArrowRight size={16} className="situation-arrow" />
    </button>
  );
}

function App() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [promptOverride, setPromptOverride] = useState(null);
  const [guideBundle, setGuideBundle] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('algolia-skills-theme') || 'light');
  const [consent, setConsent] = useState(readConsent);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('algolia-skills-theme', theme);
  }, [theme]);

  // The browser tries its own anchor jump before React has rendered anything, so
  // it finds no element and gives up. Redo it once the target exists — the quick
  // start's troubleshooting links here as /#feedback.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // One frame, so the first paint has settled before measuring.
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  }, []);

  // Runs on load for a returning visitor who already accepted, and immediately
  // when someone accepts. Never for a decline, and never before a choice.
  useEffect(() => {
    if (consent === 'granted') {
      window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
      initAnalytics();
    } else if (consent === 'denied') {
      disableAnalytics();
    }
  }, [consent]);

  function chooseConsent(choice) {
    writeConsent(choice);
    setConsent(choice);
  }

  // Re-opening the banner discards the stored answer, so leaving without
  // choosing again means being asked next visit rather than silently keeping a
  // decision the person was in the middle of changing.
  function reopenConsent() {
    clearConsent();
    disableAnalytics();
    setConsent(null);
  }

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
              <h1 id="page-title">Algolia Implementation Skills</h1>
              <p>
                Instruction packs that teach your AI assistant to work like an Algolia expert.
              </p>
              <ol className="hero-steps" aria-label="How it works">
                {quickStartSteps.map(({ label, copy }, index) => (
                  <li key={label}>
                    <span className="quickstart-num">{index + 1}</span>
                    <strong>{label}</strong>
                    <span>{copy}</span>
                  </li>
                ))}
                <li className="hero-guide">
                  <a href={withBase('/start/')}>
                    Step-by-step guide
                    <ArrowRight size={14} />
                  </a>
                </li>
              </ol>
            </div>
          </section>

          <Situations onSelect={(pkg, prompt) => { setPromptOverride(prompt); setSelectedPackage(pkg); }} />

          <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
            <div className="section-heading compact-heading">
              <div>
                <h2 id="catalog-title">Choose a skill</h2>
              </div>
            </div>

            <div className="package-table" role="list">
              {stages.map((stage) => (
                <React.Fragment key={stage.id}>
                  <div className="stage-heading" role="presentation">
                    <strong>{stage.id}</strong>
                  </div>
                  {skillPackages.filter((pkg) => pkg.stage === stage.id).map((pkg) => (
                    <PackageRow pkg={pkg} onDetails={() => setSelectedPackage(pkg)} key={pkg.id} />
                  ))}
                </React.Fragment>
              ))}
            </div>

            <WorksBestWith />
            <UseCaseBundles onGuide={setGuideBundle} />
          </section>

          <FeedbackSection />
        </main>
        <SiteFooter consent={consent} onReopen={reopenConsent} />
      </div>
      {consent === null && <CookieBanner onChoose={chooseConsent} />}
      {guideOpen && <GuideModal onClose={() => setGuideOpen(false)} />}
      {selectedPackage && (
        <PackageDetailsModal
          pkg={selectedPackage}
          prompt={promptOverride}
          onClose={() => { setSelectedPackage(null); setPromptOverride(null); }}
        />
      )}
      {guideBundle && <BundleGuideModal bundle={guideBundle} onClose={() => setGuideBundle(null)} />}
    </>
  );
}

function Header({ onGuide, theme, onToggleTheme }) {
  const isLight = theme === 'light';

  return (
    <header className="site-header">
      <a className="brand" href={withBase('/')} aria-label="Algolia Skills Library home">
        <img src={withBase(isLight ? '/brand/Algolia-logo-blue.svg' : '/brand/Algolia-logo-white.svg')} alt="Algolia" />
        <span />
        <strong>Skills Library</strong>
      </a>
      <nav aria-label="Primary navigation">
        <a href={withBase('/benchmark/')}>Benchmark</a>
        <a href="https://academy.algolia.com/" target="_blank" rel="noreferrer">
          Academy <ExternalLink size={15} />
        </a>
        <a href="https://www.algolia.com/doc/" target="_blank" rel="noreferrer">
          Docs <ExternalLink size={15} />
        </a>
        <button className="nav-link" type="button" onClick={onGuide}>Install</button>
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
          <h2 id="companion-title">Optional Algolia tools</h2>
        </div>
      </div>
      <div className="tool-rows">
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
    <div className="tool-row">
      <span className="tool-icon"><Icon size={18} /></span>
      <span className="tool-text">
        <span className="tool-title">{tool.title}</span>
        <span className="tool-desc">{tool.description}</span>
      </span>
      <code>{tool.command}</code>
      <span className="tool-actions">
        <button type="button" onClick={copyCommand} aria-label={`Copy the ${tool.title} command`}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <a href={tool.href} target="_blank" rel="noreferrer">
          {tool.action} <ExternalLink size={13} />
        </a>
      </span>
    </div>
  );
}

function UseCaseBundles({ onGuide }) {
  return (
    <section className="bundle-section" aria-labelledby="bundle-title">
      <div className="section-heading compact-heading">
        <div>
          <h2 id="bundle-title">Bundles</h2>
        </div>
      </div>
      <div className="bundle-grid">
        {useCaseBundles.map((bundle) => {
          const Icon = bundle.icon;
          return (
            <button className="bundle-card" type="button" onClick={() => onGuide(bundle)} key={bundle.id}>
              <span className="bundle-header">
                <span><Icon size={20} /></span>
                <strong className="bundle-title">{bundle.title}</strong>
              </span>
              <span className="bundle-pick"><strong>Pick this if</strong> {bundle.pickIf}</span>
              <span className="bundle-arrow"><ArrowRight size={15} /></span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PackageRow({ pkg, onDetails }) {
  const Icon = pkg.icon;
  return (
    <article className="package-row" role="listitem">
      <button className="package-main" type="button" onClick={onDetails}>
        <span className={`package-icon ${pkg.color}`}><Icon size={26} /></span>
        <span className="package-text">
          <span className="package-title">
            {pkg.title}
            {pkg.badge && <span className="package-badge">{pkg.badge}</span>}
          </span>
          <span className="package-desc">{pkg.description}</span>
        </span>
        <ArrowRight size={16} className="package-arrow" />
      </button>
      <a className="package-download" href={withBase(pkg.href)} download onClick={() => trackDownload(pkg.href, 'Download')}>
        <ArrowDownToLine size={15} />
        Download
      </a>
    </article>
  );
}

// Teaser only. The full walkthrough — per-tool install paths, prompts and
// troubleshooting — lives at /start/, generated by enablement/build-customer.py.
const quickStartSteps = [
  { icon: ArrowDownToLine, label: 'Download', copy: 'One ZIP.' },
  { icon: Layers3, label: 'Drop it in', copy: 'Into your AI tool.' },
  { icon: Sparkles, label: 'Ask', copy: 'Paste one prompt.' }
];

function DownloadButton({ href, label, size }) {
  return (
    <a
      className={`download-button ${size === 'large' ? 'large' : ''}`}
      href={withBase(href)}
      download
      onClick={() => trackDownload(href, label)}
    >
      <ArrowDownToLine size={size === 'large' ? 22 : 18} />
      <span>{label}</span>
    </a>
  );
}

// Quiet per-skill vote, so it's visible which of the skills actually land.
// Posts in place — no navigation, no Google Form.
function RowVote({ about, showLabel }) {
  const [state, setState] = useState('idle');

  if (!rowVoteReady) return null;

  async function vote(choice) {
    if (state === 'sending' || state === 'sent') return;
    setState('sending');
    trackFeedback(choice, about);
    try {
      await submitFeedback({ vote: choice, about });
      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <p className="row-vote is-sent" role="status">
        <Check size={13} />
        Thanks — noted.
      </p>
    );
  }

  if (state === 'error') {
    return (
      <p className="row-vote is-error" role="status">
        Didn't send — check your connection.
      </p>
    );
  }

  return (
    <p className="row-vote">
      <span className={`row-vote-label ${showLabel ? '' : 'sr-only'}`}>Useful?</span>
      {['up', 'down'].map((choice) => {
        const Icon = choice === 'up' ? ThumbsUp : ThumbsDown;
        return (
          <button
            key={choice}
            type="button"
            className={`row-vote-button ${choice}`}
            disabled={state === 'sending'}
            aria-label={
              choice === 'up'
                ? `${about} is working well`
                : `${about} needs work`
            }
            onClick={() => vote(choice)}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </p>
  );
}

// Page-end feedback block. Submits in the background, so nobody leaves the page
// and nobody sees the Google Form. This page never asks for a name or an email:
// keep "Collect email addresses" off in the form, or every POST is rejected.
function FeedbackSection() {
  const [vote, setVote] = useState(null);
  const [idea, setIdea] = useState('');
  const [state, setState] = useState('idle');

  if (!feedbackReady) return null;

  const nothingToSend = !vote && !idea.trim();

  async function send() {
    if (state === 'sending' || nothingToSend) return;
    setState('sending');
    if (vote) trackFeedback(vote, 'The site overall');
    try {
      await submitFeedback({ vote, about: 'The site overall', idea });
      setState('sent');
    } catch {
      setState('error');
    }
  }

  return (
    <section className="feedback-section" id="feedback" aria-labelledby="feedback-title">
      <div className="feedback-copy">
        <h2 id="feedback-title">
          Tell us what to <em>build next</em>
        </h2>
        <p className="feedback-meta">Anonymous.</p>
      </div>

      {state === 'sent' ? (
        <div className="feedback-card is-done" role="status">
          <span className="feedback-done-mark" aria-hidden="true"><Check size={22} /></span>
          <strong>Thanks — that's landed.</strong>
          <span>It goes straight to the people maintaining these skills.</span>
        </div>
      ) : (
        <div className="feedback-card">
          <fieldset className="feedback-vote">
            <legend>How's it working out?</legend>
            <div className="feedback-vote-buttons">
              {[
                { choice: 'up', Icon: ThumbsUp, label: 'Working well' },
                { choice: 'down', Icon: ThumbsDown, label: 'Needs work' }
              ].map(({ choice, Icon, label }) => (
                <button
                  key={choice}
                  type="button"
                  className={`feedback-vote-button ${choice} ${vote === choice ? 'is-active' : ''}`}
                  aria-pressed={vote === choice}
                  onClick={() => setVote((current) => (current === choice ? null : choice))}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="feedback-field">
            <span>What would make it better?</span>
            <textarea
              value={idea}
              maxLength={IDEA_MAX}
              rows={1}
              placeholder="An idea or a rough edge…"
              onChange={(event) => setIdea(event.target.value)}
            />
          </label>

          <div className="feedback-actions">
            <button
              type="button"
              className="download-button feedback-submit"
              onClick={send}
              disabled={nothingToSend || state === 'sending'}
            >
              <Send size={17} />
              <span>{state === 'sending' ? 'Sending…' : 'Send'}</span>
            </button>
            <span className="feedback-status" role="status">
              {state === 'error' && (
                <>Didn't send — check your connection and try again.</>
              )}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

// Bottom banner. Non-blocking on purpose: it does not trap focus or cover the
// page, because nothing here needs consent to be read — only to be measured.
// Accept and Decline are given identical weight, which is a requirement, not a
// style choice: a prominent Accept beside a buried Decline is not a free choice.
function CookieBanner({ onChoose }) {
  return (
    <div className="consent-banner" role="region" aria-label="Cookie choices">
      <div className="consent-copy">
        <strong>Can we count visits?</strong>
        <p>
          We would like Google Analytics to see which skills get downloaded, so we know what to
          work on. It sets cookies. Nothing on this page needs them, and declining changes
          nothing about what you can read or download.{' '}
          <a href="https://www.algolia.com/policies/privacy" target="_blank" rel="noreferrer">
            Privacy policy <ExternalLink size={13} />
          </a>
        </p>
      </div>
      <div className="consent-actions">
        <button type="button" className="consent-button" onClick={() => onChoose('denied')}>
          Decline
        </button>
        <button type="button" className="consent-button" onClick={() => onChoose('granted')}>
          Accept
        </button>
      </div>
    </div>
  );
}

// Gives the page a footer it never had, and — more to the point — somewhere to
// change your mind. Consent you cannot withdraw is not consent.
function SiteFooter({ consent, onReopen }) {
  const label = consent === 'granted' ? 'Analytics on' : 'Analytics off';
  return (
    <footer className="site-footer">
      <span>
        Algolia Implementation Skills — MIT licensed. Part of the official{' '}
        <a href="https://github.com/algolia/skills" target="_blank" rel="noreferrer">
          Algolia skills <ExternalLink size={13} />
        </a>
      </span>
      <span className="site-footer-right">
        <a href="https://www.algolia.com/policies/privacy" target="_blank" rel="noreferrer">
          Privacy <ExternalLink size={13} />
        </a>
        <button type="button" className="consent-link" onClick={onReopen}>
          Cookie preferences
          <span className="consent-state">{label}</span>
        </button>
      </span>
    </footer>
  );
}

// The bundle guides are markdown files in public/artifacts/use-cases/. They used
// to open as raw .md, which the browser shows as unstyled plain text.
//
// Deliberately not a full markdown library: these files use headings, ordered
// and unordered lists, and fenced code, and nothing else. Bold, inline code and
// links are handled too so a future edit does not render as literal asterisks.
// Anything else falls through as plain text rather than breaking.
function renderInline(text, keyPrefix) {
  const out = [];
  const pattern = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${keyPrefix}-i${i++}`;
    if (match[1]) out.push(<strong key={key}>{match[1]}</strong>);
    else if (match[2]) out.push(<code key={key}>{match[2]}</code>);
    else out.push(
      <a key={key} href={match[4]} target="_blank" rel="noreferrer">{match[3]}</a>
    );
    last = pattern.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// All five guides share the same four sections, so they get treated as a known
// shape rather than arbitrary markdown: each becomes a titled card with an icon,
// which gives the eye somewhere to land instead of one long column of prose.
const GUIDE_SECTIONS = {
  'Start Prompt': { icon: Sparkles, hint: 'Paste this to begin' },
  'Priority Decisions': { icon: Waypoints, hint: 'Settle these first' }
};

// The guide file is also shipped inside the bundle ZIP as BUNDLE.md, where it is
// a working checklist read after downloading. The modal has a smaller job —
// "should I download this" — so Required Outputs and Launch Gates are left to
// BUNDLE.md rather than shown to someone who has not started yet. Anything not
// listed here is skipped, so a new section does not silently appear.
const MODAL_SECTIONS = Object.keys(GUIDE_SECTIONS);

// Splits the file into a lead paragraph plus one entry per `##` heading. Content
// under an unrecognised heading still renders, just without an icon.
function parseGuide(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const lead = [];
  const sections = [];
  let current = null;
  let i = 0;

  const push = (line) => (current ? current.lines : lead).push(line);

  while (i < lines.length) {
    const line = lines[i];
    const heading = line.match(/^(#{1,6})\s+(.*)$/);

    // The modal header already shows the bundle name, so a leading `# Title` is
    // a duplicate of it.
    if (heading && heading[1].length === 1) { i += 1; continue; }

    if (heading) {
      current = { title: heading[2], lines: [] };
      sections.push(current);
      i += 1;
      continue;
    }

    // Fences are copied whole so a `##` inside one is not read as a heading.
    if (line.trim().startsWith('```')) {
      push(line);
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { push(lines[i]); i += 1; }
      if (i < lines.length) { push(lines[i]); i += 1; }
      continue;
    }

    push(line);
    i += 1;
  }

  return { lead: lead.join('\n').trim(), sections };
}

// Renders the body of one section: lists, fenced code and paragraphs.
function renderBlocks(source, keyPrefix) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  const ordered = /^\s*\d+\.\s+/;
  const bullet = /^\s*[-*]\s+/;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    const key = `${keyPrefix}-${blocks.length}`;

    if (line.trim().startsWith('```')) {
      const body = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { body.push(lines[i]); i += 1; }
      i += 1;
      blocks.push(<pre key={key}><code>{body.join('\n')}</code></pre>);
      continue;
    }

    if (ordered.test(line) || bullet.test(line)) {
      const isOrdered = ordered.test(line);
      const re = isOrdered ? ordered : bullet;
      const items = [];
      while (i < lines.length && re.test(lines[i])) { items.push(lines[i].replace(re, '')); i += 1; }
      const Tag = isOrdered ? 'ol' : 'ul';
      blocks.push(
        <Tag key={key} className="guide-list">
          {items.map((item, n) => <li key={`${key}-${n}`}>{renderInline(item, `${key}-${n}`)}</li>)}
        </Tag>
      );
      continue;
    }

    const para = [];
    while (
      i < lines.length && lines[i].trim() &&
      !ordered.test(lines[i]) && !bullet.test(lines[i]) && !lines[i].trim().startsWith('```')
    ) { para.push(lines[i].trim()); i += 1; }
    blocks.push(<p key={key}>{renderInline(para.join(' '), key)}</p>);
  }

  return blocks;
}

// The prompt is the one thing here you act on, so it gets a copy button rather
// than leaving people to hand-select sixty words.
function GuidePrompt({ text }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="guide-prompt">
      <pre><code>{text}</code></pre>
      <button className="secondary-button" type="button" onClick={copy}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

// The one fact the modal was missing. The site already has the list; it just was
// not shown anywhere.
function GuideSkills({ skills }) {
  return (
    <section className="guide-section">
      <div className="guide-section-head">
        <span className="guide-section-icon"><Library size={17} /></span>
        <div>
          <h3>What's in it</h3>
          <p className="guide-section-hint">{skills.length} skills, installed together</p>
        </div>
      </div>
      <ul className="guide-chips">
        {skills.map((id) => (
          <li key={id}>{getPackageById(id)?.title || id}</li>
        ))}
      </ul>
    </section>
  );
}

function GuideSection({ title, body, index }) {
  const meta = GUIDE_SECTIONS[title];
  const Icon = meta?.icon;
  // Pull a lone fenced block out so it can carry a copy button. Trim first: the
  // body starts with the newline that followed the heading, which an anchored
  // match would not survive.
  const fence = body.trim().match(/^```[^\n]*\n([\s\S]*?)\n?```$/);

  return (
    <section className="guide-section">
      <div className="guide-section-head">
        {Icon && <span className="guide-section-icon"><Icon size={17} /></span>}
        <div>
          <h3>{title}</h3>
          {meta?.hint && <p className="guide-section-hint">{meta.hint}</p>}
        </div>
      </div>
      {fence ? <GuidePrompt text={fence[1].trim()} /> : renderBlocks(body, `s${index}`)}
    </section>
  );
}

function BundleGuideModal({ bundle, onClose }) {
  const Icon = bundle.icon;
  const [state, setState] = useState('loading');
  const [source, setSource] = useState('');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let live = true;
    fetch(withBase(bundle.guideHref))
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((text) => { if (live) { setSource(text); setState('ready'); } })
      .catch(() => { if (live) setState('error'); });
    return () => { live = false; };
  }, [bundle.guideHref]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bundle-guide-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="close-button" type="button" onClick={onClose} aria-label={`Close ${bundle.title} guide`}>
          <X size={18} />
        </button>
        <header className="modal-head">
          <span className="package-icon blue"><Icon size={24} /></span>
          <div>
            <h2 id="bundle-guide-title">{bundle.title}</h2>
            <p>Pick this if {bundle.pickIf}</p>
          </div>
        </header>
        <div className="guide-body">
          {state === 'loading' && <p className="guide-status">Loading the guide…</p>}
          {state === 'error' && (
            // A dead modal is worse than the raw file it replaced.
            <p className="guide-status">
              Couldn't load the guide.{' '}
              <a href={withBase(bundle.guideHref)} target="_blank" rel="noreferrer">
                Open the file directly
              </a>.
            </p>
          )}
          {state === 'ready' && (() => {
            const guide = parseGuide(source);
            return (
              <>
                <div className="guide-sections">
                  <GuideSkills skills={bundle.skills} />
                  {guide.sections
                    .filter((section) => MODAL_SECTIONS.includes(section.title))
                    .map((section, n) => (
                      <GuideSection key={section.title} title={section.title} body={section.lines.join('\n')} index={n} />
                    ))}
                </div>
              </>
            );
          })()}
        </div>
        {state === 'ready' && (
          <footer className="modal-foot">
            <span>{bundle.skills.length} skills &middot; MIT licensed</span>
            <DownloadButton href={bundle.href} label="Download" />
          </footer>
        )}
      </section>
    </div>
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
      <section className="modal narrow" role="dialog" aria-modal="true" aria-labelledby="guide-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close installation guide">
          <X size={18} />
        </button>
        <header className="modal-head plain">
          <div>
            <h2 id="guide-title">Install</h2>
            <p>Unzip, then put each skill folder where your tool looks.</p>
          </div>
        </header>
        <dl className="install-rows">
          <div><dt>Most tools</dt><dd><code>.agents/skills/</code></dd></div>
          <div><dt>Claude Code</dt><dd><code>~/.claude/skills/</code></dd></div>
          <div><dt>Claude and ChatGPT apps</dt><dd>Upload one skill ZIP at a time</dd></div>
        </dl>
        <footer className="modal-foot">
          <a className="modal-link" href={withBase('/start/')}>Step-by-step guide <ArrowRight size={14} /></a>
          <DownloadButton href="/downloads/algolia-skills-library.zip" label="Download full library" />
        </footer>
      </section>
    </div>
  );
}

function PackageDetailsModal({ pkg, prompt, onClose }) {
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
  const promptText = prompt || profile.prompt;

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
      await navigator.clipboard.writeText(promptText);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = promptText;
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
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="package-details-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label={`Close ${pkg.title} details`}>
          <X size={18} />
        </button>
        <header className="modal-head">
          <span className={`package-icon ${pkg.color}`}><Icon size={24} /></span>
          <div>
            <h2 id="package-details-title">{pkg.title}</h2>
            <p>{pkg.description}</p>
          </div>
        </header>

        <div className="modal-cols">
          <div>
            <h3 className="modal-label">Use it when</h3>
            <ul>{profile.useThisTo.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3 className="modal-label">You get</h3>
            <ul>{profile.produces.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
        <p className="modal-bring"><strong>Have handy</strong> {profile.asks[0]}</p>

        <div className="modal-prompt">
          <div>
            <h3 className="modal-label">Prompt</h3>
            <p>{promptText}</p>
            {promptText.includes('[') && <small>Swap the [bracketed] parts for your details.</small>}
          </div>
          <button type="button" onClick={copyPrompt}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <footer className="modal-foot">
          <span>{pkg.id} &middot; {pkg.filesInside.length} {pkg.filesInside.length === 1 ? 'file' : 'files'}</span>
          <RowVote about={pkg.title} showLabel />
          <DownloadButton href={pkg.href} label="Download" />
        </footer>
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

createRoot(document.getElementById('root')).render(<App />);
