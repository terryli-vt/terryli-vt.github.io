---
title: "Building Fitlyst: What I Learned Making My First AI-Powered App"
date: "2026-03-29"
excerpt: "From a simple nutrition calculator to a full-stack app with AI meal generation — the decisions I made, the things I got wrong, and what I'd do differently."
tags: ["engineering", "side-project", "ai"]
readtime: "7 min read"
---

I built Fitlyst because I couldn't find a free tool that just told me what to eat for my goal without asking me to pay for a subscription. So I made one.

Here's what I learned building it.

![A person tracking fitness metrics on a phone and laptop](https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80)

---

## The idea

The concept is simple: enter your stats, get your calorie and macro targets, then ask AI to suggest meals. No login wall for basic features, no upsell after step two.

The first version was a single page with a form and a table. No database, no auth, no AI — just the math. That version worked in two days. I almost stopped there.

The math is genuinely interesting. The [Mifflin-St Jeor equation](https://en.wikipedia.org/wiki/Basal_metabolic_rate) gives you your Basal Metabolic Rate — the calories your body burns at rest. Multiply by an activity factor and you get TDEE (Total Daily Energy Expenditure). Adjust up or down depending on whether you're trying to build muscle or lose fat. Distribute the remainder into protein, carbs, and fat.

```ts
// BMR via Mifflin-St Jeor
const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + genderOffset;

// TDEE
const tdee = bmr * activityFactor;

// Calorie target
const calories = goal === "bulk" ? tdee + 300 : tdee - 400;

// Macros
const protein = weightKg * 2; // grams
const fat = weightKg * 0.8; // grams
const carbs = (calories - protein * 4 - fat * 9) / 4;
```

Carbs are the "lever" — they absorb whatever's left after protein and fat are set. That's not obvious until you write it out.

---

## The stack decision

![A developer's workspace with multiple monitors showing code](https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=900&q=80)

I used Next.js, TypeScript, Tailwind, Neon PostgreSQL, Drizzle ORM, NextAuth, and OpenAI. That's a lot for a nutrition calculator.

Honestly, the stack was slightly over-engineered for the MVP. I could have shipped the same feature set in half the time with a simpler setup. But I made a deliberate trade: I wanted to practice the full-stack patterns I'd be using in production work — server/client separation, OAuth, typed database queries — and a toy project is the right place to practice them.

A few specific choices are worth explaining. I picked **Neon** for the database because setup was genuinely fast — a connection string and you're done — and the web console is clear enough that I could watch rows appear in real time as I tested. No local Postgres to maintain, no guessing what's in the database. For the ORM, **Drizzle** felt like the right fit alongside Neon: the schema is just TypeScript, queries are type-safe, and `drizzle-kit studio` gives you a visual view of the database locally when you need it. Together they made the data layer the least painful part of the project.

---

## On file structure

I spent more time on folder organization than I'd like to admit. The structure I landed on separates concerns by feature:

```
/app          → routes, pages, API endpoints
/features     → business logic, per feature
  /onboarding
    components/
    hooks/
    utils/
    types.ts
  /profile
    ...
/components   → reusable, logic-free UI only
/lib          → third-party SDK init (OpenAI, etc.)
/db           → schema and queries
```

The rule that made the biggest difference: `/components` is for UI only. No data fetching, no business logic. If a component needs to know about users or nutrition data, it belongs in `/features` instead.

This kept the codebase navigable even as it grew. When I needed to change how nutrition was calculated, I knew exactly where to look.

---

## Adding AI: easier and harder than I expected

![AI](https://images.unsplash.com/photo-1684487747720-1ba29cda82f8?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

Calling the OpenAI API is genuinely trivial. The SDK is well-designed, the API is predictable, and for a use case like "give me five meal ideas for these macros," a single prompt gets you 90% of the way there.

```ts
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "user",
      content: `Suggest 5 meals for someone targeting ${calories} kcal/day,
                ${protein}g protein, ${carbs}g carbs, ${fat}g fat.
                Format as JSON array with name, calories, and macros.`,
    },
  ],
});
```

The hard part isn't the API call. It's everything around it: handling loading states gracefully, validating that the JSON response is actually shaped the way you expect, deciding how many requests to allow per user per day. I skipped the rate limiting for the MVP. That's fine for now — real scale would force the decision.

The other thing I underestimated: prompt engineering for structured output. Getting the model to return clean, parseable JSON consistently takes iteration. I went through about a dozen prompt variations before I was happy with the reliability.

---

## Auth was the most humbling part

I've implemented auth before, but NextAuth v5 with a Drizzle adapter was new territory. The v5 beta docs are sparse. The Drizzle adapter is community-maintained.

The key architectural pattern is splitting the config across two files. `auth.config.ts` holds only the lightweight pieces — providers, session strategy, callbacks — with no heavy dependencies. `auth.ts` then spreads that config in and layers on the Drizzle adapter, which pulls in the database client. The reason for the split: `proxy.ts` (what Next.js 16 calls middleware, now running on the Node.js runtime) imports from `auth.config.ts` to check auth state on every request. Keeping that file dependency-light ensures the middleware stays fast and doesn't drag in anything it doesn't need.

I spent a good chunk of time just understanding how auth actually flows — what happens between the moment a user clicks "Sign in with Google" and the moment my server component knows who they are. That meant getting clear on the difference between the two session strategies NextAuth supports.

With **database sessions**, a session record is written to your database on login, and every subsequent request hits the database to validate it. You get the ability to revoke sessions instantly, but you're paying a database read on every authenticated request. With **JWT sessions**, the session is encoded into a signed token stored in a cookie — no database lookup needed per request. The trade-off is that you can't invalidate a token until it expires.

For Fitlyst, JWT was the right call. There's no admin use case that requires force-logging someone out, and avoiding a database round-trip on every page load is a meaningful win for a small app running on a free Neon tier.

---

## What I'd do differently

![A notebook with sketched wireframes and diagrams](https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&q=80)

**Start with a proper design.** I built the UI by feel, one screen at a time. It worked out, but having wireframes first would have saved two rounds of layout rework.

**Write calculation tests from day one.** The nutrition math is the core of the product. I added tests late and found two edge cases — users at extreme weights, users with very high activity levels — where the results were technically correct but physiologically nonsensical. Catching those earlier would have been better.

**Ship the MVP earlier.** I added Google OAuth before anyone had tried the app. A simpler email-based flow, or even no auth at all for the first version, would have let me validate the core value faster.

---

## What I'm proud of

The nutrition calculation pipeline is solid. It handles unit conversion, applies safety guardrails (minimum calorie floors), and accounts for the difference between bulk, cut, and maintenance goals — all in a clean, testable utility function.

The file structure held up. As features were added, I always knew where things belonged. That's not a guarantee with Next.js projects.

And it works. You put in your stats, you get numbers that make sense, and the AI gives you meals you could actually cook. For a personal project, that's enough.

---

The code is [open source on GitHub](https://github.com/terryli-vt/fitlyst) and the app is [live on Vercel](https://fitlyst-xi.vercel.app) if you want to try it.
