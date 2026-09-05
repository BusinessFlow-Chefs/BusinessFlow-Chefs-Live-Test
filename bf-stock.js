(function(global){
'use strict';
const core=global.BusinessFlowCore;
const recipes=global.BusinessFlowRecipes;
if(!core||!recipes)return;
const clone=v=>JSON.parse(JSON.stringify(v));
const nowIso=()=>new Date().toISOString();
const round=n=>{const x=Math.round(Number(n||0)*100)/100;return Number.isInteger(x)?x:Number(x.toFixed(2));};
const slug=v=>String(v||'item').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'item';
const uid=p=>`${p}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`;
const normal=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');

const aliasRules=[
  [/sea bass|fish fillet|cod|salmon|tuna|snapper|halibut|bream/i,'fish fillet'],
  [/chicken breast|chicken supreme/i,'chicken'],
  [/lamb loin/i,'lamb loin'],
  [/beef fillet/i,'beef fillet'],
  [/large prawns|prawns/i,'prawns'],
  [/mixed seasonal vegetables|vegetable garnish|vegetables or salad garnish|fresh vegetables|courgette or vegetable garnish/i,'mixed vegetables'],
  [/mixed berries/i,'mixed berries'],
  [/fresh herbs|mixed soft herbs/i,'fresh herbs'],
  [/fine salt/i,'salt'],
  [/cold unsalted butter|unsalted butter/i,'butter']
];
function canonicalName(name){
  const s=normal(name);
  for(const [re,out] of aliasRules)if(re.test(s))return out;
  return s;
}
function keyFor(name,unit){return `${canonicalName(name)}|${normal(unit||'each')}`;}
function categoryFor(name){
  const s=canonicalName(name);
  if(/fish|prawn|chicken|lamb|beef|meat/.test(s))return'Protein';
  if(/vegetable|fruit|berr|lemon|lime|mint|herb|tomato|courgette|shallot|garlic/.test(s))return'Produce';
  if(/yoghurt|butter|egg|milk|feta/.test(s))return'Chilled';
  if(/wine|vinegar|oil|salt|granola|honey|bread|sourdough|oat|seed|couscous|cracker|dip|jus/.test(s))return'Dry Store';
  return'Other';
}
function locationFor(category){return category==='Protein'?'Fridge / Freezer':category==='Produce'?'Fridge / Produce':category==='Chilled'?'Fridge':category==='Dry Store'?'Pantry':'Other';}
function normalizeItem(item){
  item=item&&typeof item==='object'?item:{};
  const name=String(item.name||'').trim();
  const category=item.category||categoryFor(name);
  return {
    id:item.id||uid('stock'),
    ingredientKey:item.ingredientKey||keyFor(name,item.unit),
    name,
    category,
    unit:String(item.unit||'each').trim()||'each',
    onHand:Math.max(0,Number(item.onHand||0)),
    reserved:Math.max(0,Number(item.reserved||0)),
    par:Math.max(0,Number(item.par||0)),
    location:String(item.location||locationFor(category)),
    expiry:String(item.expiry||''),
    unitCost:Math.max(0,Number(item.unitCost||0)),
    barcode:String(item.barcode||''),
    notes:String(item.notes||''),
    updatedAt:item.updatedAt||nowIso()
  };
}
function inventoryItems(state){return Object.values(state.inventory?.items||{}).map(normalizeItem);}
function requirements(){
  const state=core.getState();
  const map=new Map();
  for(const day of state.menu?.days||[]){
    for(const [meal,dishes] of Object.entries(day.meals||{})){
      for(const dish of dishes||[]){
        const recipe=recipes.getRecipe(dish.id);if(!recipe)continue;
        for(const ing of recipe.ingredients||[]){
          const key=keyFor(ing.name,ing.unit);const prev=map.get(key)||{key,name:canonicalName(ing.name),displayName:ing.name,unit:ing.unit||'each',required:0,category:categoryFor(ing.name),sources:[]};
          prev.required=round(prev.required+Number(ing.qty||0));
          prev.sources.push({day:day.day,meal,dishId:dish.id,dish:dish.name});
          map.set(key,prev);
        }
      }
    }
  }
  return [...map.values()].sort((a,b)=>a.category.localeCompare(b.category)||a.displayName.localeCompare(b.displayName));
}
function stockForRequirement(req,state){
  const items=inventoryItems(state).filter(i=>i.ingredientKey===req.key||keyFor(i.name,i.unit)===req.key);
  return items.reduce((acc,i)=>{acc.onHand+=i.onHand;acc.reserved+=i.reserved;acc.items.push(i);return acc;},{onHand:0,reserved:0,items:[]});
}
function plan(){
  const state=core.getState();
  const reqs=requirements();
  const lines=reqs.map(req=>{
    const stock=stockForRequirement(req,state);const available=Math.max(0,round(stock.onHand-stock.reserved));const buy=Math.max(0,round(req.required-available));
    return {...req,onHand:round(stock.onHand),reserved:round(stock.reserved),available,buy,covered:buy<=0,priority:buy>0?'high':'covered'};
  });
  const missing=lines.filter(x=>x.buy>0),covered=lines.filter(x=>x.buy<=0);
  return {generatedAt:nowIso(),lines,summary:{requirements:lines.length,toBuy:missing.length,covered:covered.length,complete:!missing.length}};
}
function save(next,action){
  next.inventory=next.inventory||{items:{}};next.provisioning=next.provisioning||{items:[]};
  next.audit=Array.isArray(next.audit)?next.audit:[];
  next.audit.unshift({id:uid('audit'),at:nowIso(),deviceId:next.sync?.deviceId||'device_browser',action,detail:{}});
  return core.importData({state:next});
}
function upsertItem(data){
  const state=core.getState(),item=normalizeItem(data);if(!item.name)throw new Error('Item name is required');if(!Number.isFinite(item.onHand))throw new Error('Invalid stock quantity');
  const existingId=data?.id&&state.inventory?.items?.[data.id]?data.id:null;const id=existingId||item.id;item.id=id;item.updatedAt=nowIso();state.inventory.items[id]=item;save(state,existingId?'inventory.item.updated':'inventory.item.added');return clone(item);
}
function removeItem(id){const state=core.getState();if(!state.inventory?.items?.[id])throw new Error('Stock item not found');delete state.inventory.items[id];save(state,'inventory.item.removed');}
function adjustItem(id,delta){const state=core.getState(),raw=state.inventory?.items?.[id];if(!raw)throw new Error('Stock item not found');const item=normalizeItem(raw);item.onHand=Math.max(0,round(item.onHand+Number(delta||0)));item.updatedAt=nowIso();state.inventory.items[id]=item;save(state,'inventory.item.adjusted');return clone(item);}
function setCount(id,count){const state=core.getState(),raw=state.inventory?.items?.[id];if(!raw)throw new Error('Stock item not found');const item=normalizeItem(raw);item.onHand=Math.max(0,Number(count||0));item.updatedAt=nowIso();state.inventory.items[id]=item;save(state,'inventory.item.counted');return clone(item);}
function generateProvisioning(){const state=core.getState(),p=plan();state.provisioning={items:p.lines.map(x=>({id:`prov_${slug(x.key)}`,ingredientKey:x.key,name:x.displayName,category:x.category,unit:x.unit,required:x.required,onHand:x.onHand,reserved:x.reserved,available:x.available,buy:x.buy,status:x.buy>0?'toBuy':'covered',priority:x.priority,sources:x.sources})),generatedAt:p.generatedAt,summary:p.summary};save(state,'provisioning.generated');return clone(state.provisioning);}
function markPurchased(id,qty){const state=core.getState(),line=(state.provisioning?.items||[]).find(x=>x.id===id);if(!line)throw new Error('Provisioning item not found');const amount=Math.max(0,Number(qty??line.buy||0));let stock=inventoryItems(state).find(i=>i.ingredientKey===line.ingredientKey);
  if(!stock){stock=normalizeItem({name:line.name,unit:line.unit,category:line.category,onHand:0});stock.ingredientKey=line.ingredientKey;}
  stock.onHand=round(stock.onHand+amount);stock.updatedAt=nowIso();state.inventory.items[stock.id]=stock;line.status='purchased';line.purchasedQty=amount;line.purchasedAt=nowIso();line.buy=Math.max(0,round(line.buy-amount));save(state,'provisioning.item.purchased');return clone(line);
}
function getInventory(){return inventoryItems(core.getState()).sort((a,b)=>a.location.localeCompare(b.location)||a.name.localeCompare(b.name));}
function getProvisioning(){const s=core.getState();return clone(s.provisioning||{items:[]});}
global.BusinessFlowStock=Object.freeze({requirements,plan,getInventory,getProvisioning,upsertItem,removeItem,adjustItem,setCount,generateProvisioning,markPurchased,keyFor,canonicalName});
})(window);