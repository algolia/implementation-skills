# Start Here Prompt

Use this prompt when a customer is not sure which Algolia skill or package to start with.

Use this library as a customer-ready extension to Algolia MCP, the Algolia CLI, and official Algolia skills when live app data or account actions are needed.

Use the full library through the whole Algolia lens. Data and events are the foundation for search behavior and AI feature behavior: records determine what can be retrieved, ranked, filtered, displayed, and attributed; events determine whether analytics, personalization, Recommend, Dynamic Re-Ranking, NeuralSearch evaluation, and Agent Studio feedback can be trusted.

```text
Use the Algolia Discovery Planning skill to help me choose the right implementation path. Ask me only the questions needed to understand my goal, data, search UI, events, and launch risk. Assume I may not know which technical details matter yet. Then recommend the next Algolia skill, the smallest useful first milestone, and the validation artifact I should create.
```

## Whole-Library Orientation Prompt

```text
Use the Algolia skills library through the whole Algolia lens. Begin by clarifying the data contract and event foundation because they determine search behavior, relevance tuning, analytics trust, and AI feature readiness. Then route to the right skills for index configuration, UI, NeuralSearch, Dynamic Re-Ranking, Recommend, personalization, Agent Studio, and release QA.
```

## Good Follow-Up Prompts

```text
Use algolia-data-modeling to turn my sample records into an indexing contract, including variants, objectIDs, facets, ranking fields, and update ownership.
```

```text
Use algolia-events-insights to design the smallest useful event setup for search result clicks and my primary conversion. Include queryID, userToken, objectID, index, owner, and validation steps.
```

```text
Use algolia-release-qa to review my Algolia setup before launch. Lead with blockers and high-risk issues, then list what was tested, what was not tested, and who needs to fix each issue.
```
