(function(global){
'use strict';
const core=global.BusinessFlowCore;
if(!core)return;
const clone=v=>JSON.parse(JSON.stringify(v));
const uid=p=>`${p}_${Math.random().toString(36).slice(2,9)}_${Date.now().toString(36)}`;
const library={
  Mediterranean:[
    {name:'Greek yoghurt, berries & pistachio granola',meal:'breakfast',tags:['vegetarian'],allergens:['dairy','nuts']},
    {name:'Herb omelette, tomatoes & sourdough',meal:'breakfast',tags:['vegetarian'],allergens:['eggs','gluten']},
    {name:'Citrus sea bass, fennel & new potatoes',meal:'lunch',tags:['fish'],allergens:['fish']},
    {name:'Lemon chicken, charred courgette & couscous',meal:'lunch',tags:['poultry'],allergens:['gluten']},
    {name:'Watermelon, mint & feta cups',meal:'snack',tags:['vegetarian'],allergens:['dairy']},
    {name:'Seasonal fruit & coconut yoghurt',meal:'snack',tags:['vegan'],allergens:[]},
    {name:'Pan-roasted sea bass, beurre blanc & vegetables',meal:'dinner',tags:['fish'],allergens:['fish','dairy']},
    {name:'Herb lamb loin, aubergine & tomato jus',meal:'dinner',tags:['meat'],allergens:[]}
  ],
  'Modern European':[
    {name:'Poached eggs, spinach & rye toast',meal:'breakfast',tags:['vegetarian'],allergens:['eggs','gluten']},
    {name:'Apple bircher, seeds & berries',meal:'breakfast',tags:['vegetarian'],allergens:['gluten']},
    {name:'Roast salmon, peas, asparagus & dill',meal:'lunch',tags:['fish'],allergens:['fish']},
    {name:'Chicken supreme, crushed potatoes & greens',meal:'lunch',tags:['poultry'],allergens:[]},
    {name:'Berry smoothie & oat bites',meal:'snack',tags:['vegetarian'],allergens:['gluten']},
    {name:'Crudités, hummus & seeded crackers',meal:'snack',tags:['vegan'],allergens:['sesame','gluten']},
    {name:'Beef fillet, pommes purée & red wine jus',meal:'dinner',tags:['meat'],allergens:['dairy']},
    {name:'Roast cod, leeks & herb velouté',meal:'dinner',tags:['fish'],allergens:['fish','dairy']}
  ],
  'Light & Fresh':[
    {name:'Chia, mango & lime breakfast pot',meal:'breakfast',tags:['vegan'],allergens:[]},
    {name:'Fresh fruit, yoghurt & toasted seeds',meal:'breakfast',tags:['vegetarian'],allergens:['dairy']},
    {name:'Grilled tuna, tomato, olive & herb salad',meal:'lunch',tags:['fish'],allergens:['fish']},
    {name:'Chicken, avocado & citrus salad',meal:'lunch',tags:['poultry'],allergens:[]},
    {name:'Frozen grapes, berries & melon',meal:'snack',tags:['vegan'],allergens:[]},
    {name:'Cucumber cups with avocado & herbs',meal:'snack',tags:['vegan'],allergens:[]},
    {name:'Grilled prawns, courgette ribbons & lemon',meal:'dinner',tags:['shellfish'],allergens:['shellfish']},
    {name:'Herb chicken, ratatouille & basil oil',meal:'dinner',tags:['poultry'],allergens:[]}
  ]
};
function normal(v){return String(v||'').trim().toLowerCase();}
function activeAllergies(state){return new Set((state.guests?.allergySummary||[]).map(a=>normal(a.label)));}
function conflicts(dish,allergies){return (dish.allergens||[]).some(a=>allergies.has(normal(a)));}
function allLibrary(){const out=[];Object.entries(library).forEach(([theme,dishes])=>dishes.forEach(d=>out.push({...clone(d),theme})));return out;}
function sourceFocus(dish){
  const tags=new Set((dish.tags||[]).map(normal));const name=normal(dish.name),focus=[];
  if(tags.has('fish')||tags.has('shellfish')||/fish|salmon|cod|tuna|prawn|sea bass/.test(name))focus.push('Protein','Seafood');
  if(tags.has('poultry')||/chicken|turkey/.test(name))focus.push('Protein','Poultry');
  if(tags.has('meat')||/lamb|beef|venison/.test(name))focus.push('Protein','Meat');
  if(tags.has('vegetarian')||tags.has('vegan')||/fruit|vegetable|salad|courgette|tomato|berries|mango|melon|avocado/.test(name))focus.push('Produce');
  if(/yoghurt|feta|butter|egg/.test(name))focus.push('Chilled');
  if(/bread|toast|granola|oat|couscous|cracker/.test(name))focus.push('Dry Store');
  return [...new Set(focus)];
}
function choose(theme,meal,index,allergies){
  const source=library[theme]||library.Mediterranean;
  const safe=source.filter(d=>d.meal===meal&&!conflicts(d,allergies));
  const fallback=source.filter(d=>d.meal===meal);
  const pool=safe.length?safe:fallback;
  if(!pool.length)return {id:uid('dish'),name:`Chef's ${meal}`,meal,allergens:[],status:'draft'};
  const d=pool[index%pool.length];
  return {id:uid('dish'),name:d.name,meal:d.meal,tags:clone(d.tags||[]),allergens:clone(d.allergens||[]),status:'draft',locked:false,sourceFocus:sourceFocus(d)};
}
function buildDraft(theme){
  const state=core.getState();
  const days=Math.max(1,core.charterDays?core.charterDays():1);
  const allergies=activeAllergies(state);
  const menuDays=[];
  for(let i=0;i<days;i++){
    const date=state.charter.startDate?new Date(`${state.charter.startDate}T00:00:00Z`):null;
    if(date)date.setUTCDate(date.getUTCDate()+i);
    menuDays.push({id:`day_${i+1}`,day:i+1,date:date?date.toISOString().slice(0,10):'',meals:{
      breakfast:[choose(theme,'breakfast',i,allergies)],
      lunch:[choose(theme,'lunch',i,allergies)],
      snack:[choose(theme,'snack',i,allergies)],
      dinner:[choose(theme,'dinner',i,allergies)]
    }});
  }
  return {status:'draft',theme,days:menuDays,lockedDishIds:[]};
}
function saveState(nextState){
  nextState.audit=Array.isArray(nextState.audit)?nextState.audit:[];
  nextState.audit.unshift({id:uid('audit'),at:new Date().toISOString(),deviceId:nextState.sync?.deviceId||'device_browser',action:'menu.updated',detail:{theme:nextState.menu?.theme||'',days:nextState.menu?.days?.length||0}});
  core.importData({state:nextState});
  return core.getState().menu;
}
function generate(theme){const state=core.getState();state.menu=buildDraft(theme||state.menu?.theme||'Mediterranean');return saveState(state);}
function setTheme(theme){if(!library[theme])throw new Error('Unknown menu theme');const state=core.getState();state.menu.theme=theme;return saveState(state);}
function findDish(state,dishId){for(const day of state.menu?.days||[]){for(const meal of Object.values(day.meals||{})){const dish=(meal||[]).find(d=>d.id===dishId);if(dish)return dish;}}return null;}
function toggleLock(dishId){const state=core.getState(),dish=findDish(state,dishId);if(!dish)throw new Error('Dish not found');dish.locked=!dish.locked;state.menu.lockedDishIds=state.menu.lockedDishIds||[];state.menu.lockedDishIds=dish.locked?[...new Set([...state.menu.lockedDishIds,dishId])]:state.menu.lockedDishIds.filter(id=>id!==dishId);return saveState(state);}
function recommendAlternatives(dishId,options={}){
  const state=core.getState(),dish=findDish(state,dishId);if(!dish)throw new Error('Dish not found');const allergies=activeAllergies(state),currentTheme=state.menu?.theme||'Mediterranean';
  const wantedCategories=new Set((Array.isArray(options.categories)?options.categories:[options.category]).filter(Boolean).map(normal));
  const wantedTags=new Set((options.tags||[]).map(normal));const count=Math.min(8,Math.max(3,Math.round(Number(options.count||5))));
  return allLibrary().filter(c=>c.meal===dish.meal&&c.name!==dish.name&&!conflicts(c,allergies)).map(c=>{
    let score=0,reasons=[];const focus=sourceFocus(c),focusNorm=focus.map(normal);
    if(c.theme===currentTheme){score+=10;reasons.push('Matches current menu theme');}
    if(wantedCategories.size){const hit=focusNorm.some(x=>wantedCategories.has(x));if(hit){score+=24;reasons.push('Matches sourcing category');}}
    if(wantedTags.size){const hit=(c.tags||[]).map(normal).some(x=>wantedTags.has(x));if(hit){score+=16;reasons.push('Matches available ingredient type');}}
    if(options.location){score+=2;reasons.push(`Suitable alternative for ${options.location}`);}
    if(options.preferredSupplier){score+=3;reasons.push(`Can be considered with ${options.preferredSupplier}`);}
    if((c.tags||[]).includes('vegan'))score+=1;
    return {...clone(c),sourceFocus:focus,score,reasons};
  }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)).slice(0,count);
}
function replaceDish(dishId,candidateName){
  const state=core.getState(),allergies=activeAllergies(state),theme=state.menu?.theme||'Mediterranean';
  for(const day of state.menu?.days||[]){for(const [meal,items] of Object.entries(day.meals||{})){const idx=(items||[]).findIndex(d=>d.id===dishId);if(idx<0)continue;if(items[idx].locked)throw new Error('Unlock the dish before replacing it');
    let pool=allLibrary().filter(d=>d.meal===meal&&!conflicts(d,allergies)&&d.name!==items[idx].name);if(candidateName){const exact=pool.find(d=>d.name===candidateName);if(!exact)throw new Error('That alternative is not available or conflicts with guest requirements');pool=[exact];}else{const sameTheme=pool.filter(d=>d.theme===theme);if(sameTheme.length)pool=sameTheme;}
    if(!pool.length)throw new Error('No alternative safe dish available in this starter library');const pick=pool[Math.floor(Math.random()*pool.length)];items[idx]={id:uid('dish'),name:pick.name,meal,tags:clone(pick.tags||[]),allergens:clone(pick.allergens||[]),status:'draft',locked:false,sourceFocus:sourceFocus(pick)};return saveState(state);}}
  throw new Error('Dish not found');
}
function validate(){const state=core.getState(),allergies=activeAllergies(state),issues=[];for(const day of state.menu?.days||[]){for(const [meal,items] of Object.entries(day.meals||{})){for(const dish of items||[]){const hits=(dish.allergens||[]).filter(a=>allergies.has(normal(a)));if(hits.length)issues.push({day:day.day,meal,dishId:dish.id,dish:dish.name,allergens:hits});}}}return issues;}
function getThemes(){return Object.keys(library);}
global.BusinessFlowMenu=Object.freeze({generate,setTheme,toggleLock,replaceDish,recommendAlternatives,validate,getThemes});
})(window);