---
layout: page.njk
title: "About {{ site.name }}"
permalink: "/about/"
description: "About PactDraft: who runs it, how articles are made and how to reach us."
updated: 2026-11-05
---
{{ site.name }} is an independent news website that publishes clear, sourced updates and explainers on India, the United States, the United Kingdom, world affairs, technology, business, defense, and science and health.

## Why we exist
News is easier to trust when you can see where it came from. Every {{ site.name }} article ends with a list of the sources it relies on, so you can check the facts yourself.

## Who runs {{ site.name }}
{{ site.name }} was founded by **{{ site.founder.name }}**, {{ site.founder.title }}, and is published from {{ site.address.oneLine }}. Articles appear under the byline [{{ site.author.name }}](/author/{{ site.author.slug }}/).

## How we work
{% if site.editorial.aiAssisted %}We use AI-assisted tools for research and drafting. {% endif %}{% if site.editorial.humanReview %}Every article is reviewed by a human editor before it is published. {% endif %}You can read the full details in our [Editorial Policy](/editorial-policy/). If we get something wrong, we fix it and say so: see our [Corrections Policy](/corrections/).

## What we cover
{% for cat in categories %}- [{{ cat.label }}](/category/{{ cat.slug }}/)
{% endfor %}
## Contact
Email: [{{ site.email }}](mailto:{{ site.email }}). Address: {{ site.address.oneLine }}. More on the [Contact page](/contact/).
