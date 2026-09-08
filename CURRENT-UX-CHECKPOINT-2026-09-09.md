# BusinessFlow Chefs — Current UX Checkpoint — 9 Sep 2026

Status: current approved direction / final review checkpoint before implementation lock.

## Global visual rules
- Premium yacht visual family: deep navy, platinum, metallic gold.
- S.A.G.E. = Service AI-Powered Galley Expert.
- S.A.G.E. uses the gold circular bubble with compact sound waves matching Home; keep size/placement consistent across pages.
- Active Alert appears on Home and operational pages. It must include: exact next action, a short description of the step, visible countdown, and direct handoff to the exact current task in Chef Mode.
- Chef Mode is the all-day operational cockpit.

## Bottom navigation — latest explicit order
Home / Charter / Smart Provisioning / Chef Mode / Inventory / Predict / More
- Chef Mode is central and slightly enlarged in metallic gold.
- This latest explicit navigation supersedes earlier concerns about seven nav items.
- `Predict` remains a working feature name only; do not show the ™ symbol as proof of registration until trademark clearance is complete.

## Home
- Keep Home-only greeting.
- Keep yacht hero and rotating curated yacht image library.
- Smaller S.A.G.E. sound waves matching the Home master.
- Active alert/countdown is prominent and opens the exact task in Chef Mode.
- Temperature/location sit directly on hero image with no box.

## Charter
- Calm layout; dropdowns closed by default.
- One yearly charter database/dropdown, not duplicate overview panels.
- Journey order: Departure -> optional stops -> Final Destination -> optional Return Journey.
- Accurate narrowing typeahead for locations.
- Saved vessels retained.
- Charter details include guests, dates, route, services, budget, theme, allergies/special requests.
- Crew setup must be part of Charter:
  - number of crew
  - crew meals per day
  - separate crew menu selection / generation
  - crew meals must remain distinct from guest menus unless chef deliberately chooses to reuse dishes
- Guest data is stored with saved charters / Guest Memory, not a redundant standalone Guest Profiles card on Charter Home.

## Menu Library / Generator flow
- Menu Library contains at least 50 options for each relevant menu/dish/category/theme and at least 50 suitable alternatives for allergy/dietary needs.
- Chef can add and save their own dishes, full meals and menus.
- Themes must feed the generator when selected.
- Menu generation uses charter details, guest needs, theme, services and chef-selected logic.
- Three generator logic choices are simple tick-box options:
  1. Use Onboard Stock
  2. Local Sourcing Check
  3. Menu Variety
- The generator/engine CTA sits below those three choices.
- Avoid generic duplicate protein families across paired courses unless chef overrides: e.g. fish starter -> no fish main; beef starter -> no beef main; same principle for chicken, lamb, pork, etc.
- If dinner/service is multi-course, chef can choose service format in Charter (single dish / 2-course / 3-course / tasting etc.) and review/swap individual courses later.

## Menu operational flow — 3 screens max
1. Menu Generated
2. Review + Alternatives + Lock
3. Prep Timeline + Chef Mode
- No premature shopping list before menu lock.
- Chef reviews and swaps individual dishes/courses before locking.
- Locking the menu triggers the prep/service chain and stock/provisioning calculation.
- Shopping/provisioning is generated only after lock, based on final dishes, guest/crew counts, quantities and current inventory.

## Chef Mode / recipes
- Chef Mode is the all-day working page.
- Any Active Alert opens directly to the exact active task.
- Must show current task, next action, service timing, recipe timing, detailed instructions and countdown.
- Recipe instructions must be beginner-proof and detailed enough for someone unfamiliar with the dish to buy, prep, cook, hold, plate and serve it correctly.
- Include exact quantities, equipment, cut sizes, temperatures, cook time, turning/basting/resting, target doneness/internal temperature where relevant, make-ahead/holding, plating sequence, allergens, substitutions and recovery tips.
- Done / Next / Delay remain core controls; delay should recalculate affected downstream timings.

## Inventory
- Purpose: what is actually on board now.
- Storage filters: Fridge / Freezer / Pantry / Drinks / Other.
- Summary: In Stock / Low Stock / Expiring Soon / Allocated to Menu.
- Single search experience only; if ingredient is not already in stock, search must find it and show image/details so chef can add it.
- Add via barcode, photo, manual entry, voice.
- Rows include item, qty/weight, portion amount dropdown, storage location, use-by/expiry and status.
- Portion amount supports chef-defined serving size and calculated number of portions.
- Menu lock allocates/flags required stock; stock is deducted when actually used, not simply when menu is locked.
- Prepared but unused food can return to inventory where safe/appropriate.

## Smart Provisioning
- Compares locked menu requirements against onboard inventory.
- Generates shortages only after menu lock.
- Includes local sourcing logic based on charter route/ports and availability.
- Connects guest and crew menu requirements.

## Predict — working name
Purpose: forward-looking intelligence before a problem occurs.
- Forecast low stock, expiry risk, provisioning deadlines, local sourcing difficulty, tight prep windows, guest-change impact and likely waste.
- Uses locked menus + inventory + expiry dates + route + service timing.
- Routes actions into Chef Mode, Inventory or Smart Provisioning.
- Keep name provisional pending trademark clearance; do not imply registration.

## More
Grouped sections:
### Food & Guests
- Menu Library
- Guest Memory
- Smart Leftovers / Reuse Planner

### Crew & Galley
- Crew Requests Inbox
- Staff Provisioning
- Galley Memory
- Chef Personal Routine

### Planning & Offline
- Tomorrow Prepared Tonight
- Offline Full-Day Mode
- End-of-Day Auto Close
- Mayday / Emergency

### Account & Records
- Saved Suppliers / sourcing history
- Reports & History
- Export / Backup / Restore
- Settings & Account

## Food waste / leftovers logic
- Preserve Smart Leftovers / Reuse Planner as a real feature, not just a marketing card.
- Track waste, expiry and safe reuse opportunities.
- Suggest where safe leftovers can be reused in future guest/crew meals without compromising quality/allergy rules.
- End-of-Day Auto Close should reconcile used stock, reusable leftovers, discarded waste and tomorrow's requirements.
- Predict should flag items likely to become waste before expiry.

## Mayday / Emergency
- Keep a visible emergency option in More.
- Must be designed as a safety shortcut, not confused with normal app support.
- Exact emergency calling/location behaviour requires legal/technical validation before launch.

## Items still requiring final naming/legal check
- `Predict` feature name / trademark clearance.
- Exact final microcopy for a few page headings and CTA labels.
