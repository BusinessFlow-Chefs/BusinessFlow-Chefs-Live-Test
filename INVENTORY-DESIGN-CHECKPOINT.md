# BusinessFlow Chefs — Inventory Design Checkpoint

Status: APPROVED DIRECTION; latest requested refinements to apply before moving on.

## Inventory purpose
Inventory answers: `What is actually on board right now?`
It is distinct from Smart Provisioning. Inventory records available stock; Smart Provisioning compares locked-menu requirements against that stock and creates shortages/purchases.

## Visual / layout direction
- Preserve the premium BusinessFlow Chefs navy / metallic-gold design language.
- Preserve S.A.G.E. in the same visual position/style family as Home, with the smaller Home-matching sound waves.
- Keep a bright active alert/countdown visible at the top.
- Active alerts must include a short description of the exact step that will start, not just a generic title.
- Tapping the active alert opens Chef Mode directly on the relevant task.

## Inventory summary and filters
- Summary metrics: In Stock, Low Stock, Expiring Soon.
- Storage/category filters include Fridge, Freezer, Pantry/Dry Store, Drinks, Other/Custom.
- Search remains prominent.

## Stock item fields
Each inventory item should support:
- item / ingredient name
- picture
- weight / volume / unit quantity
- **portion count** as an additional quantity option
- a compact dropdown/selector to choose or reveal quantity mode, e.g. weight, volume, pieces, portions
- storage location
- use-by / expiry
- status: OK / LOW / EXPIRING / ALLOCATED TO CHARTER where relevant

## Adding/searching stock
- If an item is not already in Inventory, search must find the ingredient/product rather than returning nothing.
- Search result should include a relevant item picture when available so the chef can identify the item quickly.
- Chef can add from search directly into Inventory.
- Supported quick-add methods remain: barcode scan, photo, manual entry, S.A.G.E./voice add.

## Inventory logic
- Locking a menu does not immediately deduct stock.
- Locked-menu requirements are checked against Inventory and available stock may be allocated/reserved.
- Shortages flow into Smart Provisioning.
- Actual stock deduction occurs when used/prepped/service is completed.
- Usable prepared food can be returned to Inventory rather than automatically discarded from stock.

## Approval note
Darren is happy with this Inventory page direction after the refinements above. Apply these changes, then move the design work on to the next connected stage, Smart Provisioning.
