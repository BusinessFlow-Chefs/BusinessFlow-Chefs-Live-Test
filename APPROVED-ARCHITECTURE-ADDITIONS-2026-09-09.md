# BusinessFlow Chefs — Approved Architecture Additions — 09 Sep 2026

Status: APPROVED. These items were explicitly accepted and must be treated as part of the product architecture. Do not silently remove, rename, or weaken them in later design or implementation.

## Smart Shopping — now approved as a major BusinessFlow feature
Smart Shopping is no longer just conversational wording. It is an approved major part of BusinessFlow Chefs and must work in close connection with Smart Provisioning.

### Core chain
Locked menu -> exact ingredient requirements -> compare with current Inventory -> identify shortages -> Smart Provisioning calculates what is needed -> Smart Shopping sources those items -> chef can open the selling premises / supplier -> received goods update Inventory.

### Location and sourcing rules
- Smart Shopping must source ingredients against either the chef's current location OR a destination/location manually entered by the chef.
- Charter route data may also provide relevant sourcing locations, including departure, stop-off points and destination.
- Results must be based on real premises/suppliers where possible; do not fabricate suppliers, stock availability, prices or routes.
- Each shopping requirement should show a direct link/action to the premises selling the item so the chef can inspect/contact/navigate to the supplier.
- When multiple suitable suppliers exist, BusinessFlow should be able to compare useful factors such as distance, suitability, price where reliably available, opening status and ingredient availability where available.
- Smart Shopping should support the Menu Generator / Smart Provisioning local-sourcing logic: menus can favour ingredients that can realistically be sourced locally when the chef enables that option.
- Shopping/provisioning lists are generated only after menu selections are locked, so provisional menu drafts do not create misleading purchase lists.

### Future preferred-supplier commercial layer
- Preferred BusinessFlow suppliers and chef/yacht preferred suppliers are separate concepts and must not be conflated.
- Later release: approved/preferred suppliers may offer a BusinessFlow discount or loyalty rate.
- Discount logic is future work; do not fake partnerships or discounts before agreements exist.

## Vessel Capability Profile
Saved vessels should retain relevant galley capability information so S.A.G.E. does not recommend an impractical dish or method.
Examples include oven, burner count, grill, fryer, sous-vide, blender, mixer, vacuum sealer, fridge/freezer capacity and other useful galley equipment/capacity.
Menu generation, recipe instructions and prep planning should respect vessel capability.

## Food Safety / HACCP-style operational controls
Include useful chef-facing food-safety controls without turning the product into a cumbersome compliance system.
Relevant examples: fridge/freezer temperatures, holding temperatures, use-by/expiry, defrost records, receiving checks, relevant cooked-core temperatures and allergen confirmation.
These should integrate naturally into Inventory and Chef Mode.

## Guest Change Impact
If guest count, attendance, preferences or allergies change after planning, S.A.G.E. should calculate the knock-on effect across menu portions, stock, Smart Provisioning, Smart Shopping, prep timings, service timings and budget.
Do not make the chef manually recalculate connected areas.

## Undo / Change History
Important operational changes should have recoverable recent history / undo where practical, especially menu edits, stock changes, guest/allergy changes and service-time changes.

## Receiving / Delivery Confirmation
Smart Provisioning / Smart Shopping does not end at ordering.
When goods arrive, support statuses such as received, short, substituted, damaged and wrong quantity.
Accepted goods should flow into Inventory with the correct quantity/location/details.

## Guest Feedback + voiced feedback to S.A.G.E.
Guest feedback must feed Guest Memory.
- Chef can record feedback manually.
- Guest can also speak feedback directly to S.A.G.E.
- S.A.G.E. links useful feedback to the correct guest, meal/dish and charter and stores it for future menu generation.
- Examples: loved it, liked it, disliked it, favourite, never again, less spice next time, preferred preparation style.
- Safety-critical statements such as a newly mentioned allergy must NOT silently overwrite the allergy record. They must be surfaced for chef confirmation before becoming an authoritative allergy/dietary rule.

## Offline resilience and recovery
Maintain the established offline-first requirement with explicit recovery behaviour:
- full working-day data available offline,
- local recovery after interruption,
- automatic resync when online,
- conflict handling,
- export/backup,
- restore to a replacement device/account where supported.

## Global S.A.G.E. access
S.A.G.E. should remain accessible throughout the product for natural commands such as what to do next, stock sufficiency, service-time changes and menu/provisioning questions.
Current approved expansion: Service AI-Powered Galley Expert.

## Service Delay Impact
If a service time changes, S.A.G.E. should recalculate every affected prep, cooking, plating and alert time rather than moving only one timer.

## Live Budget Impact
Where a charter budget exists, material guest/menu/provisioning changes should show the expected budget impact so the chef can see whether the plan remains on target.

## Operational principle
Chef Mode remains the all-day execution cockpit. Active alerts across Home, Menu and Inventory should deep-link to the exact relevant Chef Mode task. Smart Provisioning and Smart Shopping solve sourcing/purchasing; Inventory remains the truth for what is physically on board.
