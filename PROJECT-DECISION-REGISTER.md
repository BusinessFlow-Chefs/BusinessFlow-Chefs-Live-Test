# BusinessFlow Chefs — Project Decision Register

This file is the persistent source of truth for approved BusinessFlow Chefs product and visual decisions. It exists specifically to prevent approved work being lost, reinterpreted, or overwritten between conversations.

## Change-control rule
- Do not redesign or reinterpret an approved screen unless Darren explicitly requests that individual change.
- Before modifying an approved screen, check this register and any screen-specific lock file first.
- A generated concept is NOT approved merely because it was shown.
- Existing/legacy repository pages are NOT visual references unless explicitly confirmed.
- If a detail is marked PENDING, do not invent a final decision.
- Never treat conversational recall alone as proof that something was approved.
- When there is any conflict between an old file/generated screen and an explicit recorded approval, the explicit approval wins.

## Conversation continuity / audit rule
- The project must not depend on a chat retaining every prior turn perfectly.
- Every explicit approval, rejection, lock, and requested correction that affects the product must be written into this register or a screen-specific lock file before further implementation.
- Before declaring a screen approved, compare it against this register and the user-confirmed visual reference.
- Older generated screens are provisional until their individual elements are checked against recorded approvals.
- No currently existing repository screen should be assumed fully approved merely because it is deployed or functional.
- When Darren identifies a regression, treat it as evidence that the affected screen needs an approval audit rather than silently carrying its current state forward.

---

## HOME — LOCKED MASTER
**Status: LOCKED**

Authoritative original reference remains the Home master recorded in `HOME-DESIGN-LOCK.md`:
- `20260905_213340.jpg`
- SHA-256: `2fe7987451e812e76ec2b8e891855e1af03af42178a09a9768a6dfa42ba07f8c`

Core visual identity to preserve:
- luxury yacht photographic hero
- deep premium navy / platinum / metallic-gold treatment
- BusinessFlow Chefs branding at top
- greeting over yacht photography
- large illuminated central chef/assistant orb
- compact operational information below
- three circular lower action controls
- premium bottom navigation

### Explicit Home changes requested after the master was locked
These are approved adjustments to the locked Home, not permission to redesign it:
- REMOVE the sentence: `Here's what's happening in the galley today.`
- Move the large centre orb LOWER so it blocks less of the yacht.
- REMOVE the words `SAGE AI ASSISTANT` from the centre orb.
- KEEP the brain symbol in the centre orb.
- SAGE naming/presentation beyond this remains **PENDING**.
- Make the stopwatch/countdown to the next step/action clearly visible.
- Reduce the height of the three main information boxes; keep them thinner/compact.
- Restore the exact original three lower circular action bubbles from the locked Home master. Do not substitute newly generated action circles.
- Restore the exact original bottom navigation/tabs from the locked Home master. Do not infer or replace labels from generated concepts.
- Preserve the enlarged metallic-gold centre navigation button that Darren liked in the original.
- Restore the original premium platinum / metallic-gold treatment rather than generic blue/green replacements.
- Time-critical information should use a clearly differentiated colour treatment so urgency is immediately visible.
- Reduce the visual size/scale of the yacht in the hero composition; the yacht must not dominate the Home screen or look oversized.

### Home items still to review
- Exact numbers and metric labels shown inside the three main operational boxes are **NOT YET APPROVED** and must be reviewed by Darren.

---

## CHEF MODE — APPROVED VISUAL DIRECTION
**Status: LAYOUT/STYLE APPROVED; CONTENT CORRECTION REQUIRED**

Reference: the Chef Mode screen supplied/confirmed by Darren on 6 September 2026.

Keep:
- BusinessFlow Chefs premium branding treatment
- luxury yacht background / premium visual language
- platinum / metallic gold / deep-blue styling
- back button top-left
- notification control top-right
- large central countdown timer ring
- `Done`, `Next`, `Delay` action controls
- voice-command area
- bottom navigation with enlarged gold centre `Chef Mode` button

Remove / never use in Chef Mode:
- `Prepare client proposal draft`
- `Client: Horizon Ventures`
- `Review and refine proposal`
- other generic office/business-project placeholders

Chef Mode content rule:
- current task must be a real chef workflow action: cooking, preparing, plating, defrosting, stock/provisioning/shopping, service timing, or another explicitly chef-related operational task.
- example task types: prepare starter, start lunch prep, fire main, plate course, finish garnish, defrost ingredient, prepare service item.
- next action must also be chef/service specific.
- unrelated administrative/business tasks are deferred until a separate destination/workflow is explicitly designed.

---

## CORE WORKFLOW CONTENT RULE
**Status: APPROVED**

For now, visible operational tasks should stay focused on:
- cooking
- food preparation
- plating/service execution
- timing and next-step alerts
- stock/inventory
- provisioning
- shopping/supplies

Non-chef/general business tasks will be placed later only after Darren decides where they belong.

---

## APPROVED / ESTABLISHED AI-POWERED FEATURE NAMES
**Status: PRESERVE — DO NOT GENERICISE AWAY**

These names and concepts are part of the BusinessFlow Chefs product identity and must remain visible in product architecture, feature pages, onboarding/marketing, and relevant workflows. Do not replace them with bland generic labels without Darren's approval.

Established names:
- **Smart Provisioning** — flagship AI provisioning workflow connecting menu, guests, stock and local sourcing.
- **Smart Snack Planner** / **Smart Snacks** — guest/allergy-aware snack planning using onboard stock first and updating provisioning when needed.
- **Guest Memory** — remembers guest preferences, allergies, dislikes, feedback and special dates for future charters.
- **Galley Copilot** — conversational/voice AI assistant concept used across the chef workflow.
- **Staff Provisioning** — crew/staff meals, snacks and drinks connected to stock and budgets.
- **Smart Leftovers / Reuse Planner** — identifies safe, useful reuse opportunities and reduces waste.
- **End-of-Day Auto Close** — closes out completed service/day activity automatically.
- **Crew Requests Inbox** — captures and manages crew requests.
- **Guest Change Impact** — shows how guest changes affect menus, stock, prep and provisioning.
- **Tomorrow Prepared Tonight** — prepares the next day's information/actions ahead of time.
- **Offline Full-Day Mode** — ensures the full working day is available at sea/offline.
- **Galley Memory** — retains useful operational knowledge from prior galley use.
- **Chef Personal Routine** — adapts to the individual chef's preferred working routine.
- **16-Hour Day Mode** — long-day operational mode; this is the current approved name replacing the earlier 15-Hour wording.
- **Chef-Editable AI Menus** — AI menus that can be locked, regenerated or changed dish-by-dish while respecting allergies/dietary rules.
- **Voice-Controlled Stock Updates** — stock changes by voice during active galley work.
- **Offline-First Operation** — saved chef data remains available without connection and syncs when online.

Shopping naming clarification:
- Shopping-list generation is an established part of **Smart Provisioning**: menu/guest needs are cross-checked against inventory to produce what must be bought.
- `Smart Shopping` has been discussed/referred to conversationally, but it is **not yet treated as a separately locked final module name** in this register. Do not present it as locked until Darren explicitly confirms whether `Smart Shopping` should become its own branded feature or remain inside Smart Provisioning.

Connected product flow to preserve:
`Guest -> Menu -> Recipe -> Stock -> Smart Provisioning -> Local Sourcing`

---

## SERVICE / MENU STRUCTURE
**Status: APPROVED**
- Core daily services: Breakfast, Lunch, Dinner.
- Dinner is 3 courses: Starter -> Main -> Dessert.
- Snacks/additional meals are optional, not mandatory.
- Avoid automatically pairing seafood/fish starter with seafood/fish main unless chef overrides.

---

## PAGE APPROVAL RULE
The following generated pages/screens have been shown as contenders but are NOT automatically locked simply because they exist:
- Charter
- Guests
- Menu Builder
- Recipes
- Inventory
- Provisioning
- Service Sequence

Each becomes authoritative only after Darren explicitly approves that screen or a specific part of it.

Chef Mode is currently approved as stated above: layout/style yes; generic business wording no.

---

## BRAND / NAME
**Status: IN USE, LEGAL STRATEGY PENDING**
- Current product brand: `BusinessFlow Chefs`.
- Wider umbrella concept `BusinessFlow-[sector]` is under trademark/brand review and is not yet legally cleared as an exclusive EU master brand.
- Do not rename the product based on exploratory trademark discussion without explicit approval.
