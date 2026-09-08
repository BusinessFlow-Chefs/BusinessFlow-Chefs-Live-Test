# BusinessFlow Chefs — Chef Mode Recipe & Execution Rules

Status: APPROVED REQUIREMENT

This file records Darren's explicit requirement that Chef Mode must provide operational cooking guidance detailed enough for a person who has never cooked the dish before.

## Core rule
Chef Mode must not use generic cooking steps such as `prepare fish`, `cook chicken`, `make sauce`, or `plate dish` without exact supporting instructions.

For every active dish/task, Chef Mode must include the real recipe timings and execution detail required to buy, prep, cook, hold, plate and serve the dish correctly.

## Recipe timing requirements
Each recipe must show, where relevant:
- total prep time
- hands-on prep time
- passive/marinating/resting/chilling time
- preheat time
- actual cook time for each component
- exact target cooking temperature / heat level where appropriate
- internal temperature target where food safety/reliable doneness requires it
- resting time
- holding time and safe holding method
- plating time
- service deadline / target service time

Timers in Chef Mode must represent the actual cooking process, not vague placeholders.

Example: if chicken needs 18–22 minutes at a specified oven temperature plus a 5-minute rest, those timings must be shown as separate actionable steps and timed accordingly.

## Beginner-proof instructions
Instructions must be detailed enough that someone unfamiliar with the dish can execute it successfully. Include:
- exact ingredients and quantities scaled to current guest count
- what to buy / required ingredient specification where relevant
- how to identify/select suitable produce, meat, fish or other ingredients when useful
- required equipment and cookware
- preparation instructions in precise order
- cut sizes / knife preparation where relevant
- seasoning amounts or useful ranges
- pan/oven/grill temperature or heat level
- cooking sequence for all components
- doneness indicators and/or target temperatures
- sauce/garnish/component preparation
- make-ahead instructions
- chilling, resting and holding instructions
- plating sequence and presentation guidance
- service instructions
- allergen warnings
- dietary substitutions
- ingredient substitutions
- recovery guidance for common mistakes where useful

## Operational chain
The locked charter menu remains the source of truth for the working day:
Charter -> Menu Generated -> Review/Alternatives -> Lock Menu -> Prep Timeline -> Chef Mode.

Once a menu is locked, BusinessFlow generates the real prep/cook/service timeline from the recipe detail above.

Active alerts on Home and Menu pages route directly to the relevant current task inside Chef Mode, preserving the same countdown and task state.

Chef Mode is the primary all-day execution cockpit during an active charter day.
