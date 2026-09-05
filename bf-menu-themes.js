(function(global){
'use strict';
const core=global.BusinessFlowCore;
const base=global.BusinessFlowMenu;
if(!core||!base)return;
const clone=v=>JSON.parse(JSON.stringify(v));
const uid=p=>`${p}_${Math.random().toString(36).slice(2,9)}_${Date.now().toString(36)}`;
const normal=v=>String(v||'').trim().toLowerCase();

const extraNightLibrary={
  'French Riviera Night':[
    {name:'Dover sole meunière, pommes fondantes & green beans',meal:'dinner',tags:['fish','french'],allergens:['fish','dairy']},
    {name:'Herb-roasted chicken, ratatouille & olive jus',meal:'dinner',tags:['poultry','french'],allergens:[]},
    {name:'Provençal vegetable tart, goat cheese & basil',meal:'dinner',tags:['vegetarian','french'],allergens:['dairy','gluten']}
  ],
  'Spanish Tapas & Paella Night':[
    {name:'Seafood paella, saffron, lemon & parsley',meal:'dinner',tags:['fish','shellfish','spanish'],allergens:['fish','shellfish']},
    {name:'Iberian-style chicken, peppers, olives & potatoes',meal:'dinner',tags:['poultry','spanish'],allergens:[]},
    {name:'Patatas bravas, roasted peppers & manchego tapas board',meal:'dinner',tags:['vegetarian','spanish'],allergens:['dairy']}
  ],
  'Provençal Night':[
    {name:'Bouillabaisse-style local fish, saffron & fennel',meal:'dinner',tags:['fish','shellfish','provence'],allergens:['fish','shellfish']},
    {name:'Lamb cutlets, aubergine, tomato & rosemary jus',meal:'dinner',tags:['meat','provence'],allergens:[]},
    {name:'Stuffed courgettes, tomato, herbs & chèvre',meal:'dinner',tags:['vegetarian','provence'],allergens:['dairy']}
  ],
  'Japanese Night':[
    {name:'Miso black cod, steamed rice & sesame greens',meal:'dinner',tags:['fish','japanese'],allergens:['fish','soy','sesame']},
    {name:'Teriyaki chicken, shiitake & rice',meal:'dinner',tags:['poultry','japanese'],allergens:['soy']},
    {name:'Miso aubergine, edamame & sesame rice',meal:'dinner',tags:['vegetarian','japanese'],allergens:['soy','sesame']}
  ],
  'Sushi & Sashimi Night':[
    {name:'Chef’s sashimi selection, ponzu & daikon',meal:'dinner',tags:['fish','japanese','raw'],allergens:['fish','soy']},
    {name:'Salmon, tuna & avocado sushi platter',meal:'dinner',tags:['fish','japanese'],allergens:['fish','soy','sesame']},
    {name:'Vegetable maki, avocado & pickled ginger',meal:'dinner',tags:['vegetarian','japanese'],allergens:['soy','sesame']}
  ],
  'Thai Night':[
    {name:'Thai green chicken curry, jasmine rice & basil',meal:'dinner',tags:['poultry','thai'],allergens:[]},
    {name:'Seared sea bass, Thai herbs, lime & coconut',meal:'dinner',tags:['fish','thai'],allergens:['fish']},
    {name:'Vegetable red curry, coconut, lime & jasmine rice',meal:'dinner',tags:['vegan','thai'],allergens:[]}
  ],
  'Indian Night':[
    {name:'Tandoori chicken, saffron rice & cucumber raita',meal:'dinner',tags:['poultry','indian'],allergens:['dairy']},
    {name:'Spiced fish tikka, tomato masala & basmati rice',meal:'dinner',tags:['fish','indian'],allergens:['fish','dairy']},
    {name:'Paneer tikka, dhal, spinach & basmati rice',meal:'dinner',tags:['vegetarian','indian'],allergens:['dairy']}
  ],
  'Middle Eastern Mezze Night':[
    {name:'Chargrilled lamb, hummus, tabbouleh & flatbread',meal:'dinner',tags:['meat','middle-eastern'],allergens:['sesame','gluten']},
    {name:'Sumac chicken, fattoush & tahini yoghurt',meal:'dinner',tags:['poultry','middle-eastern'],allergens:['sesame','dairy','gluten']},
    {name:'Falafel, hummus, baba ghanoush & herb salad',meal:'dinner',tags:['vegan','middle-eastern'],allergens:['sesame']}
  ],
  'Mexican Night':[
    {name:'Charred fish tacos, avocado, lime & pico de gallo',meal:'dinner',tags:['fish','mexican'],allergens:['fish']},
    {name:'Adobo chicken, corn, black beans & salsa verde',meal:'dinner',tags:['poultry','mexican'],allergens:[]},
    {name:'Roasted vegetable tacos, guacamole & black beans',meal:'dinner',tags:['vegan','mexican'],allergens:[]}
  ],
  'Caribbean Night':[
    {name:'Jerk chicken, coconut rice, mango & lime',meal:'dinner',tags:['poultry','caribbean'],allergens:[]},
    {name:'Grilled mahi-style fish, pineapple salsa & rice',meal:'dinner',tags:['fish','caribbean'],allergens:['fish']},
    {name:'Coconut vegetable curry, plantain & lime rice',meal:'dinner',tags:['vegan','caribbean'],allergens:[]}
  ],
  'Steakhouse Night':[
    {name:'Prime beef fillet, truffle mash, greens & peppercorn jus',meal:'dinner',tags:['meat','steakhouse'],allergens:['dairy']},
    {name:'Rib-eye, hand-cut potatoes, tomato & chimichurri',meal:'dinner',tags:['meat','steakhouse'],allergens:[]},
    {name:'Portobello steak, charred vegetables & herb potatoes',meal:'dinner',tags:['vegetarian','steakhouse'],allergens:[]}
  ],
  'Surf & Turf Night':[
    {name:'Beef fillet & grilled lobster, asparagus & jus',meal:'dinner',tags:['meat','shellfish','surf-turf'],allergens:['shellfish','dairy']},
    {name:'Lamb loin & prawns, courgette, lemon & herb jus',meal:'dinner',tags:['meat','shellfish','surf-turf'],allergens:['shellfish']},
    {name:'Sea bass & scallops, seasonal vegetables & beurre blanc',meal:'dinner',tags:['fish','shellfish','surf-turf'],allergens:['fish','shellfish','dairy']}
  ],
  'Plant-Based Night':[
    {name:'Charred cauliflower, romesco, chickpeas & herbs',meal:'dinner',tags:['vegan','plant-based'],allergens:['nuts']},
    {name:'Wild mushroom risotto, asparagus & herb oil',meal:'dinner',tags:['vegan','plant-based'],allergens:[]},
    {name:'Aubergine steak, tomato fondue, lentils & basil',meal:'dinner',tags:['vegan','plant-based'],allergens:[]}
  ],
  'Wellness & Clean Eating Night':[
    {name:'Grilled sea bass, quinoa, greens & citrus dressing',meal:'dinner',tags:['fish','wellness'],allergens:['fish']},
    {name:'Herb chicken, sweet potato, broccoli & avocado',meal:'dinner',tags:['poultry','wellness'],allergens:[]},
    {name:'Quinoa, roasted vegetables, avocado & seed dressing',meal:'dinner',tags:['vegan','wellness'],allergens:['sesame']}
  ],
  'Farm-to-Table Night':[
    {name:'Market fish, garden vegetables & herb butter',meal:'dinner',tags:['fish','local','farm-to-table'],allergens:['fish','dairy']},
    {name:'Local butcher’s cut, roast roots & garden herbs',meal:'dinner',tags:['meat','local','farm-to-table'],allergens:[]},
    {name:'Market vegetable tasting, grains & fresh herbs',meal:'dinner',tags:['vegetarian','local','farm-to-table'],allergens:['gluten']}
  ],
  'Beach Club Night':[
    {name:'Grilled prawns, watermelon, feta & lime',meal:'dinner',tags:['shellfish','beach-club'],allergens:['shellfish','dairy']},
    {name:'Chicken skewers, Greek salad & lemon potatoes',meal:'dinner',tags:['poultry','beach-club'],allergens:['dairy']},
    {name:'Mediterranean mezze, grilled vegetables & flatbread',meal:'dinner',tags:['vegetarian','beach-club'],allergens:['gluten','sesame']}
  ],
  'Street Food Night':[
    {name:'Korean-style chicken, sesame slaw & sticky rice',meal:'dinner',tags:['poultry','street-food'],allergens:['soy','sesame']},
    {name:'Fish tacos, lime slaw, avocado & chilli',meal:'dinner',tags:['fish','street-food'],allergens:['fish']},
    {name:'Crispy cauliflower bao, pickles & sesame',meal:'dinner',tags:['vegan','street-food'],allergens:['gluten','soy','sesame']}
  ],
  'Family Comfort Night':[
    {name:'Roast chicken, crispy potatoes, vegetables & gravy',meal:'dinner',tags:['poultry','comfort'],allergens:[]},
    {name:'Beef lasagne, tomato salad & parmesan',meal:'dinner',tags:['meat','comfort'],allergens:['gluten','dairy']},
    {name:'Baked vegetable pasta, mozzarella & basil',meal:'dinner',tags:['vegetarian','comfort'],allergens:['gluten','dairy']}
  ],
  'Celebration Night':[
    {name:'Beef Wellington, pomme purée, greens & red wine jus',meal:'dinner',tags:['meat','celebration','fine-dining'],allergens:['gluten','dairy']},
    {name:'Lobster thermidor, seasonal vegetables & herb potatoes',meal:'dinner',tags:['shellfish','celebration','fine-dining'],allergens:['shellfish','dairy']},
    {name:'Wild mushroom pithivier, truffle sauce & greens',meal:'dinner',tags:['vegetarian','celebration','fine-dining'],allergens:['gluten','dairy']}
  ],
  'Romantic Dinner Night':[
    {name:'Beef fillet, pommes anna, asparagus & red wine jus',meal:'dinner',tags:['meat','romantic','fine-dining'],allergens:['dairy']},
    {name:'Sea bass, champagne beurre blanc & baby vegetables',meal:'dinner',tags:['fish','romantic','fine-dining'],allergens:['fish','dairy']},
    {name:'Truffle risotto, asparagus & parmesan crisp',meal:'dinner',tags:['vegetarian','romantic','fine-dining'],allergens:['dairy']}
  ],
  'Chef’s Tasting Menu':[
    {name:'Chef’s fish tasting, seasonal garnish & sauce',meal:'dinner',tags:['fish','tasting','fine-dining'],allergens:['fish']},
    {name:'Chef’s meat tasting, seasonal garnish & jus',meal:'dinner',tags:['meat','tasting','fine-dining'],allergens:[]},
    {name:'Chef’s vegetable tasting, textures & seasonal herbs',meal:'dinner',tags:['vegetarian','tasting','fine-dining'],allergens:[]}
  ]
};

function activeAllergies(state){return new Set((state.guests?.allergySummary||[]).map(a=>normal(a.label)));}
function conflicts(dish,allergies){return(dish.allergens||[]).some(a=>allergies.has(normal(a)));}
function sourceFocus(dish){
  const tags=new Set((dish.tags||[]).map(normal)),name=normal(dish.name),focus=[];
  if(tags.has('fish')||tags.has('shellfish')||/fish|salmon|cod|tuna|prawn|sea bass|bream|lobster|scallop|sole/.test(name))focus.push('Protein','Seafood');
  if(tags.has('poultry')||/chicken|turkey/.test(name))focus.push('Protein','Poultry');
  if(tags.has('meat')||/lamb|beef|venison|rib-eye/.test(name))focus.push('Protein','Meat');
  if(tags.has('vegetarian')||tags.has('vegan')||/fruit|vegetable|salad|courgette|tomato|avocado|pepper|aubergine|mushroom|cauliflower/.test(name))focus.push('Produce');
  return[...new Set(focus)];
}
function materialize(d,theme){return{id:uid('dish'),name:d.name,meal:'dinner',tags:clone(d.tags||[]),allergens:clone(d.allergens||[]),status:'draft',locked:false,sourceFocus:sourceFocus(d),theme,nightTheme:theme};}
function findContext(state,dishId){for(const day of state.menu?.days||[]){for(const[meal,items]of Object.entries(day.meals||{})){const index=(items||[]).findIndex(d=>d.id===dishId);if(index>=0)return{day,meal,items,index,dish:items[index]};}}return null;}
function save(state){state.audit=Array.isArray(state.audit)?state.audit:[];state.audit.unshift({id:uid('audit'),at:new Date().toISOString(),deviceId:state.sync?.deviceId||'device_browser',action:'menu.night-theme.updated',detail:{}});core.importData({state});return core.getState().menu;}
function safePool(theme,state,exclude){const allergies=activeAllergies(state);return(extraNightLibrary[theme]||[]).filter(d=>d.name!==exclude&&!conflicts(d,allergies));}
function getNightThemes(){return[...new Set([...(base.getNightThemes?base.getNightThemes():['Chef’s Choice']),...Object.keys(extraNightLibrary)])];}
function setNightTheme(dayId,theme){
  if(!extraNightLibrary[theme])return base.setNightTheme(dayId,theme);
  const state=core.getState(),day=(state.menu?.days||[]).find(d=>d.id===dayId||String(d.day)===String(dayId));if(!day)throw new Error('Charter day not found');
  day.nightTheme=theme;const dinner=day.meals?.dinner?.[0];
  if(!dinner?.locked){const pool=safePool(theme,state,'');if(!pool.length)throw new Error('No allergy-safe dishes available for this themed night');day.meals.dinner=[materialize(pool[Math.max(0,(day.day||1)-1)%pool.length],theme)];}
  return save(state);
}
function replaceDish(dishId,candidateName){
  const state=core.getState(),ctx=findContext(state,dishId);if(!ctx)return base.replaceDish(dishId,candidateName);if(ctx.dish.locked)throw new Error('Unlock the dish before replacing it');
  const theme=ctx.day.nightTheme||'';const allExtra=Object.entries(extraNightLibrary).flatMap(([t,items])=>items.map(d=>({...d,nightTheme:t})));
  if(candidateName){const pick=allExtra.find(d=>d.name===candidateName&&!conflicts(d,activeAllergies(state)));if(pick){ctx.items[ctx.index]=materialize(pick,pick.nightTheme);return save(state);}return base.replaceDish(dishId,candidateName);}
  if(ctx.meal==='dinner'&&extraNightLibrary[theme]){const pool=safePool(theme,state,ctx.dish.name);if(pool.length){ctx.items[ctx.index]=materialize(pool[Math.floor(Math.random()*pool.length)],theme);return save(state);}}
  return base.replaceDish(dishId);
}
function recommendAlternatives(dishId,options={}){
  const state=core.getState(),ctx=findContext(state,dishId);const count=Math.min(8,Math.max(3,Math.round(Number(options.count||5))));let results=[];
  try{results=base.recommendAlternatives(dishId,{...options,count:8})||[];}catch(e){}
  if(ctx&&ctx.meal==='dinner'){
    const allergies=activeAllergies(state),currentTheme=ctx.day.nightTheme||'';
    const extras=Object.entries(extraNightLibrary).flatMap(([theme,items])=>items.filter(d=>d.name!==ctx.dish.name&&!conflicts(d,allergies)).map(d=>({...clone(d),nightTheme:theme,theme,sourceFocus:sourceFocus(d),score:(theme===currentTheme?40:4),reasons:[theme===currentTheme?`Matches ${theme}`:`${theme} alternative`]})));
    results=[...extras,...results];
  }
  const seen=new Set();return results.sort((a,b)=>(b.score||0)-(a.score||0)||a.name.localeCompare(b.name)).filter(x=>{if(seen.has(x.name))return false;seen.add(x.name);return true;}).slice(0,count);
}

global.BusinessFlowMenu=Object.freeze({...base,setNightTheme,replaceDish,recommendAlternatives,getNightThemes});
})(window);
