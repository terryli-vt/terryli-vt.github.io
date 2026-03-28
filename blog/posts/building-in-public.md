---
title: "Building in Public: What I Learned Shipping My First Side Project"
date: "2026-03-20"
excerpt: "Six months of building, shipping, and learning in public — the technical decisions, the mistakes, and what I'd do differently."
tags: ["engineering", "side-project"]
readtime: "6 min read"
---

I shipped my first real side project six months ago. Not a tutorial clone, not a course assignment — something I actually wanted to use myself.

Here's what I learned.

---

## The idea

The project started as a simple frustration: I kept forgetting which libraries I'd evaluated and why I'd rejected them. A notes folder wasn't cutting it. So I built a small tool to track technical decisions with context.

![A clean desk with a laptop and notebook, representing focused work](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&q=80)
*The kind of focused environment I wish I always worked in.*

The MVP was three screens: a list view, a detail view, and a form. Nothing clever. I almost didn't ship it because it felt too simple.

That was the first mistake.

---

## On scope

I spent the first two months building features nobody asked for. A tagging system. Export to CSV. A "similarity score" between decisions that used embeddings and cost me $12 in API calls during testing.

None of it survived to launch.

The version that shipped was closer to week two's prototype than week eight's bloated mess. The lesson is obvious in retrospect: **the hardest part of building small tools is resisting the urge to make them large tools**.

![A whiteboard covered in diagrams and sticky notes](https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=900&q=80)
*Early architecture sketches. Most of this didn't ship.*

---

## The stack

I went with what I knew rather than what I wanted to learn. That turned out to be the right call.

- **Frontend**: plain React, no framework overhead
- **Backend**: a single Express server, SQLite for storage
- **Auth**: I didn't build it. Used a third-party service.
- **Hosting**: a $5/mo VPS

The temptation was to use this project as an excuse to try the new hotness. I resisted, mostly. The one time I didn't — trying a new ORM I'd been curious about — cost me a weekend of debugging edge cases that the boring choice wouldn't have had.

```js
// The "clever" query that cost me a weekend
const decisions = await db.decision
  .findMany({
    where: { userId },
    include: { tags: true },
    orderBy: { updatedAt: 'desc' },
  });

// What I replaced it with
const decisions = db.prepare(
  'SELECT * FROM decisions WHERE user_id = ? ORDER BY updated_at DESC'
).all(userId);
```

Boring is underrated.

---

## What "building in public" actually meant

I posted updates on a small forum. About forty people followed along. That small audience changed how I worked:

1. **I shipped more often.** Knowing someone might ask about progress kept me from stalling indefinitely.
2. **I wrote better commit messages.** They doubled as release notes.
3. **I got useful feedback early.** The tagging system idea came from a reply to my week-three post. Ironically, so did the decision to cut it — a different person pointed out it was scope creep.

![A graph showing gradual, consistent growth over time](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80)
*Consistent progress beats bursts of intensity.*

The audience also held me accountable in a way that personal deadlines don't. I missed three self-imposed deadlines with zero consequences. I never missed a "I'll have an update by Friday" promise to the forum.

---

## The technical decision I'm most proud of

I almost built a custom markdown editor. The feature request made sense — people wanted to write longer notes — and I got excited designing the toolbar.

Then I stopped and asked: is this a markdown editor or a decision tracker?

I added a `textarea`. It renders markdown on the detail view with a library that took twenty minutes to integrate. Nobody has complained.

The decision to *not* build something is often the best engineering decision you can make.

---

## What I'd do differently

**Start with auth.** I bolted it on late and had to retrofit the data model. It was painful.

**Write tests for the data layer from day one.** I have good coverage on the UI (easy to test) and none on the queries (where the bugs actually lived).

**Ship after week two.** The gap between "shippable" and "shipped" was six weeks of unnecessary polish on things users didn't notice.

---

## Where it stands now

About 80 people use it weekly. It hasn't grown much, which I've made peace with — it was never meant to be a business. It solves my problem. Solving a few other people's problems along the way is a bonus.

I'm still adding to it occasionally, though I try to keep the scope tight. The rule I've settled on: **if I don't personally want the feature, I don't build it**.

More soon.
