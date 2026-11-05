---
layout: page.njk
title: "Editorial Policy"
permalink: "/editorial-policy/"
description: "How PactDraft chooses, writes, checks and corrects its articles."
updated: 2026-11-05
---
This policy explains how {{ site.name }} decides what to publish and the standards we hold ourselves to.

## How our articles are produced
Articles are published by the [{{ site.author.name }}](/author/{{ site.author.slug }}/). {% if site.editorial.aiAssisted %}We use AI-assisted tools to help research and draft articles. {% endif %}{% if site.editorial.humanReview %}A human editor reviews each article before it is published. {% else %}We aim to check names, dates and numbers against the cited sources, and we correct errors when we find them. {% endif %}

## Our standards
- **Sources.** Every article ends with a list of the sources it relies on. We attribute claims and do not invent quotes, people or documents.
- **Accuracy first.** Headlines must match the article. If a fact is uncertain or still developing, we say so.
- **Fairness.** We describe contested topics from the main sides and keep news separate from opinion.
- **Updates.** When we add important new information we update the article and show the update date.
- **Corrections.** Mistakes are corrected openly. See our [Corrections Policy](/corrections/).

## Images
{% if site.editorial.illustrativeImages %}Images on {{ site.name }} are illustrative. Many are created with AI tools or are stock-style illustrations, and they should not be read as photographs of the actual event unless an article says so.{% else %}Images are credited where required.{% endif %}

## Advertising
Advertising is separate from editorial decisions. Ads and sponsored links, such as native ads labeled "Promoted" or "Sponsored", are not written by our editorial team and do not influence our coverage. See [Advertise](/advertise/).

## Independence
We do not accept payment to publish or change news coverage.

## Contact
Questions about this policy: [{{ site.email }}](mailto:{{ site.email }}).
