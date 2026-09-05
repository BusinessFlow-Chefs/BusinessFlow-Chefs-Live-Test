(function(global){
'use strict';
const base=global.BusinessFlowMenu;
if(!base)return;
const clone=v=>JSON.parse(JSON.stringify(v));
const normal=v=>String(v||'').trim().toLowerCase();

function courseFamily(dish){
  const tags=new Set((dish?.tags||[]).map(normal));
  const name=normal(dish?.name);
  if(tags.has('fish')||tags.has('shellfish')||tags.has('seafood')||/fish|salmon|cod|haddock|tuna|prawn|shrimp|sea bass|bream|lobster|scallop|sole|halibut|monkfish|crab|mussel|oyster|sardine|anchovy/.test(name))return'seafood';
  if(tags.has('poultry')||/chicken|turkey|duck|quail/.test(name))return'poultry';
  if(tags.has('meat')||/beef|lamb|veal|venison|pork|steak|rib-eye|fillet/.test(name))return'red-meat';
  if(tags.has('vegetarian')||tags.has('vegan')||tags.has('plant-based'))return'plant';
  return'other';
}

function validateCoursePair(first,second){
  const a=courseFamily(first),b=courseFamily(second);
  if(a==='seafood'&&b==='seafood'){
    return{ok:false,severity:'block',code:'repeat-seafood-courses',message:'Avoid fish or seafood in both starter and main. Choose a contrasting course.'};
  }
  return{ok:true,severity:'ok',code:'balanced',message:'Course balance is suitable.'};
}

function validateCourseBalance(courses){
  const list=(courses||[]).filter(Boolean),issues=[];
  for(let i=0;i<list.length-1;i++){
    const result=validateCoursePair(list[i],list[i+1]);
    if(!result.ok)issues.push({...result,first:list[i]?.name||'',second:list[i+1]?.name||'',firstIndex:i,secondIndex:i+1});
  }
  return issues;
}

function filterBalancedCandidates(candidates,existingCourses){
  const existing=(existingCourses||[]).filter(Boolean);
  if(!existing.some(d=>courseFamily(d)==='seafood'))return clone(candidates||[]);
  return (candidates||[]).filter(d=>courseFamily(d)!=='seafood').map(clone);
}

function recommendAlternatives(dishId,options={}){
  const results=base.recommendAlternatives?base.recommendAlternatives(dishId,options):[];
  if(!options.existingCourses?.length)return results;
  return filterBalancedCandidates(results,options.existingCourses);
}

global.BusinessFlowMenu=Object.freeze({...base,recommendAlternatives,courseFamily,validateCoursePair,validateCourseBalance,filterBalancedCandidates});
})(window);
