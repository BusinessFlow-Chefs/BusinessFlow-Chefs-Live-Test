(function(global){
'use strict';
const core=global.BusinessFlowCore;
const base=global.BusinessFlowMenu;
if(!core||!base)return;
const clone=v=>JSON.parse(JSON.stringify(v));
const uid=p=>`${p}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`;
const normal=v=>String(v||'').trim().toLowerCase();

const starterLibrary=[
  {name:'Burrata, heritage tomatoes, basil & olive oil',tags:['vegetarian','starter'],allergens:['dairy']},
  {name:'Roasted beetroot, goat cheese, orange & herbs',tags:['vegetarian','starter'],allergens:['dairy']},
  {name:'Wild mushroom tartlet, herbs & parmesan',tags:['vegetarian','starter'],allergens:['dairy','gluten']},
  {name:'Beef carpaccio, rocket, capers & parmesan',tags:['meat','starter'],allergens:['dairy']},
  {name:'Duck breast, orange, chicory & hazelnut',tags:['poultry','starter'],allergens:['nuts']},
  {name:'Seared scallops, cauliflower, apple & herb oil',tags:['shellfish','starter'],allergens:['shellfish']},
  {name:'Tuna tartare, avocado, lime & sesame',tags:['fish','starter'],allergens:['fish','sesame']},
  {name:'Prawn cocktail, avocado, cucumber & citrus',tags:['shellfish','starter'],allergens:['shellfish']}
];
const dessertLibrary=[
  {name:'Lemon tart, crème fraîche & berries',tags:['dessert','vegetarian'],allergens:['dairy','eggs','gluten']},
  {name:'Dark chocolate fondant, vanilla & raspberries',tags:['dessert','vegetarian'],allergens:['dairy','eggs','gluten']},
  {name:'Vanilla panna cotta, berries & mint',tags:['dessert','vegetarian'],allergens:['dairy']},
  {name:'Pavlova, seasonal fruit & passion fruit',tags:['dessert','vegetarian'],allergens:['eggs']},
  {name:'Citrus sorbet, fresh berries & mint',tags:['dessert','vegan'],allergens:[]},
  {name:'Seasonal fruit plate, lime & basil syrup',tags:['dessert','vegan'],allergens:[]}
];
const extraLibrary={
  'Morning Snack':[
    {name:'Fresh fruit, yoghurt & toasted seeds',tags:['vegetarian','snack'],allergens:['dairy']},
    {name:'Berry smoothie & oat bites',tags:['vegetarian','snack'],allergens:['gluten']}
  ],
  'Afternoon Snack':[
    {name:'Watermelon, mint & feta cups',tags:['vegetarian','snack'],allergens:['dairy']},
    {name:'Crudités, hummus & seeded crackers',tags:['vegan','snack'],allergens:['sesame','gluten']}
  ],
  'Late Snack':[
    {name:'Seasonal fruit & coconut yoghurt',tags:['vegan','snack'],allergens:[]},
    {name:'Cucumber cups with avocado & herbs',tags:['vegan','snack'],allergens:[]}
  ],
  'Extra Light Meal':[
    {name:'Chicken, avocado & citrus salad',tags:['poultry','light-meal'],allergens:[]},
    {name:'Grilled tuna, tomato, olive & herb salad',tags:['fish','light-meal'],allergens:['fish']},
    {name:'Market vegetable salad, grains & herbs',tags:['vegetarian','light-meal'],allergens:['gluten']}
  ]
};

function activeAllergies(state){return new Set((state.guests?.allergySummary||[]).map(a=>normal(a.label)));}
function conflicts(dish,allergies){return(dish.allergens||[]).some(a=>allergies.has(normal(a)));}
function family(dish){
  const tags=new Set((dish?.tags||[]).map(normal)),name=normal(dish?.name);
  if(tags.has('fish')||tags.has('shellfish')||/fish|salmon|cod|tuna|prawn|shrimp|lobster|scallop|haddock|sea bass|bream|sole/.test(name))return'seafood';
  if(tags.has('poultry')||/chicken|duck|turkey/.test(name))return'poultry';
  if(tags.has('meat')||/beef|lamb|venison|pork|veal/.test(name))return'meat';
  if(tags.has('dessert')||/tart|fondant|panna cotta|pavlova|sorbet|fruit plate/.test(name))return'dessert';
  return'vegetarian';
}
function materialize(dish,meal,course){return{id:uid('dish'),name:dish.name,meal,tags:clone(dish.tags||[]),allergens:clone(dish.allergens||[]),status:'draft',locked:false,course:course||'',sourceFocus:family(dish)==='seafood'?['Protein','Seafood']:family(dish)==='poultry'?['Protein','Poultry']:family(dish)==='meat'?['Protein','Meat']:['Produce']};}
function chooseSafe(pool,index,state,excludeFamily){const allergies=activeAllergies(state);let safe=pool.filter(d=>!conflicts(d,allergies));if(excludeFamily)safe=safe.filter(d=>family(d)!==excludeFamily);if(!safe.length)safe=pool.filter(d=>!conflicts(d,allergies));if(!safe.length)throw new Error('No allergy-safe dish available for this course');return safe[index%safe.length];}
function ensureDinner(day,index,state){
  day.meals=day.meals||{};
  const existing=Array.isArray(day.meals.dinner)?day.meals.dinner:[];
  let main=existing.find(d=>d.course==='main')||existing[0];
  if(!main)return;
  main={...main,meal:'dinner',course:'main'};
  const mainFamily=family(main);
  let starter=existing.find(d=>d.course==='starter');
  if(!starter||family(starter)===mainFamily&&mainFamily==='seafood')starter=materialize(chooseSafe(starterLibrary,index,state,mainFamily==='seafood'?'seafood':mainFamily),'dinner','starter');
  let dessert=existing.find(d=>d.course==='dessert');
  if(!dessert)dessert=materialize(chooseSafe(dessertLibrary,index,state),'dinner','dessert');
  day.meals.dinner=[starter,main,dessert];
}
function normaliseExtras(day){
  day.extraServices=Array.isArray(day.extraServices)?day.extraServices:[];
  if(Array.isArray(day.meals?.snack)&&day.meals.snack.length&&!day.extraServices.length){
    const key='extra_legacy_snack';
    const dish={...day.meals.snack[0],meal:'extra',extraType:'Afternoon Snack'};
    day.meals[key]=[dish];
    day.extraServices.push({id:'legacy_snack',key,type:'Afternoon Snack',label:'Afternoon Snack',time:'16:00'});
  }
  if(day.meals)delete day.meals.snack;
}
function save(state,action){state.audit=Array.isArray(state.audit)?state.audit:[];state.audit.unshift({id:uid('audit'),at:new Date().toISOString(),deviceId:state.sync?.deviceId||'device_browser',action,detail:{}});core.importData({state});return core.getState().menu;}
function postProcess(action){const state=core.getState();(state.menu?.days||[]).forEach((day,i)=>{normaliseExtras(day);ensureDinner(day,i,state);});return save(state,action);}
function generate(theme){base.generate(theme);return postProcess('menu.structure.generated');}
function setNightTheme(dayId,theme){base.setNightTheme(dayId,theme);return postProcess('menu.structure.night-theme');}
function findContext(state,dishId){for(const day of state.menu?.days||[]){for(const[meal,items]of Object.entries(day.meals||{})){const index=(items||[]).findIndex(d=>d.id===dishId);if(index>=0)return{day,meal,items,index,dish:items[index]};}}return null;}
function recommendAlternatives(dishId,options={}){
  const state=core.getState(),ctx=findContext(state,dishId);if(!ctx)return base.recommendAlternatives(dishId,options);
  if(ctx.dish.course==='starter'){
    const main=(ctx.day.meals?.dinner||[]).find(d=>d.course==='main'),mainFamily=family(main),allergies=activeAllergies(state);
    return starterLibrary.filter(d=>d.name!==ctx.dish.name&&!conflicts(d,allergies)&&!(mainFamily==='seafood'&&family(d)==='seafood')).slice(0,Math.min(8,Number(options.count||5))).map(d=>({...clone(d),meal:'dinner',course:'starter',score:30,reasons:['Balances the main course']}));
  }
  if(ctx.dish.course==='dessert'){
    const allergies=activeAllergies(state);return dessertLibrary.filter(d=>d.name!==ctx.dish.name&&!conflicts(d,allergies)).slice(0,Math.min(8,Number(options.count||5))).map(d=>({...clone(d),meal:'dinner',course:'dessert',score:30,reasons:['Dessert alternative']}));
  }
  const out=base.recommendAlternatives(dishId,options)||[];
  if(ctx.dish.course==='main'){
    const starter=(ctx.day.meals?.dinner||[]).find(d=>d.course==='starter');if(family(starter)==='seafood')return out.filter(d=>family(d)!=='seafood');
  }
  return out;
}
function replaceDish(dishId,candidateName){
  const state=core.getState(),ctx=findContext(state,dishId);if(!ctx)return base.replaceDish(dishId,candidateName);
  if(ctx.dish.locked)throw new Error('Unlock the dish before replacing it');
  if(ctx.dish.course==='starter'||ctx.dish.course==='dessert'){
    const pool=ctx.dish.course==='starter'?starterLibrary:dessertLibrary,allergies=activeAllergies(state),main=(ctx.day.meals?.dinner||[]).find(d=>d.course==='main'),mainFamily=family(main);
    let choices=pool.filter(d=>d.name!==ctx.dish.name&&!conflicts(d,allergies));if(ctx.dish.course==='starter'&&mainFamily==='seafood')choices=choices.filter(d=>family(d)!=='seafood');
    if(candidateName)choices=choices.filter(d=>d.name===candidateName);
    if(!choices.length)throw new Error('No balanced allergy-safe alternative is available');
    const pick=choices[Math.floor(Math.random()*choices.length)];ctx.items[ctx.index]=materialize(pick,'dinner',ctx.dish.course);return save(state,'menu.course.replaced');
  }
  base.replaceDish(dishId,candidateName);return postProcess('menu.main.replaced');
}
function addExtraService(dayId,type,time){
  if(!extraLibrary[type])throw new Error('Unknown extra service type');
  const state=core.getState(),day=(state.menu?.days||[]).find(d=>d.id===dayId||String(d.day)===String(dayId));if(!day)throw new Error('Charter day not found');
  normaliseExtras(day);const id=uid('extra'),key=`extra_${id}`,index=day.extraServices.length;const pick=chooseSafe(extraLibrary[type],index,state);const dish=materialize(pick,'extra','');dish.extraType=type;day.meals[key]=[dish];day.extraServices.push({id,key,type,label:type,time:String(time||'16:00')});return save(state,'menu.extra.added');
}
function removeExtraService(dayId,extraId){const state=core.getState(),day=(state.menu?.days||[]).find(d=>d.id===dayId||String(d.day)===String(dayId));if(!day)throw new Error('Charter day not found');normaliseExtras(day);const extra=day.extraServices.find(x=>x.id===extraId);if(!extra)return clone(state.menu);delete day.meals[extra.key];day.extraServices=day.extraServices.filter(x=>x.id!==extraId);return save(state,'menu.extra.removed');}
function getExtraTypes(){return Object.keys(extraLibrary);}
function compositionIssues(){const state=core.getState(),issues=[];(state.menu?.days||[]).forEach(day=>{const courses=day.meals?.dinner||[],starter=courses.find(d=>d.course==='starter'),main=courses.find(d=>d.course==='main');if(starter&&main&&family(starter)==='seafood'&&family(main)==='seafood')issues.push({type:'course-balance',day:day.day,meal:'dinner',dish:`${starter.name} + ${main.name}`,message:'Starter and main are both fish/seafood. Change one course for better balance.'});});return issues;}
function validate(){return[...(base.validate?base.validate():[]),...compositionIssues()];}
function ensureStructure(){return postProcess('menu.structure.normalised');}

global.BusinessFlowMenu=Object.freeze({...base,generate,setNightTheme,replaceDish,recommendAlternatives,validate,addExtraService,removeExtraService,getExtraTypes,compositionIssues,ensureStructure,family});
})(window);