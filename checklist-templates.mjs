import {defaultChecklist} from './model.mjs';

// Templates are fictional coordination aids, never eligibility determinations.
const stamp=()=>new Date().toISOString();
const validVersion=v=>Number.isSafeInteger(v)&&v>0;
const equalItems=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function cleanItems(items){
  if(!Array.isArray(items)||items.length<1||items.length>40)throw Error('Use between 1 and 40 template items.');
  return items.map(i=>{
    if(!i||typeof i.text!=='string'||!i.text.trim()||i.text.trim().length>250||!['before','bring'].includes(i.group))throw Error('Each template item needs text up to 250 characters and a preparation group.');
    return {text:i.text.trim(),group:i.group};
  });
}
function offered(state,examinerId,certificate){return state.examiners.some(e=>e.id===examinerId&&e.certificates.includes(certificate));}
function examinerActor(state,examinerId,actor){
  if(actor?.role!=='examiner'||actor.id!==examinerId||!state.examiners.some(e=>e.id===examinerId))throw Error('Only this examiner can edit or apply their templates.');
}
export function templateFor(state,examinerId,certificate){return state.checklistTemplates?.find(t=>t.examinerId===examinerId&&t.certificate===certificate)||null;}
export function migrateTemplates(state){
  const valid=[];
  for(const t of Array.isArray(state.checklistTemplates)?state.checklistTemplates:[]){
    if(!t||!offered(state,t.examinerId,t.certificate)||!validVersion(t.version)||typeof t.updatedAt!=='string'||!Number.isFinite(Date.parse(t.updatedAt)))continue;
    try{
      const items=cleanItems(t.items),existing=valid.findIndex(x=>x.examinerId===t.examinerId&&x.certificate===t.certificate);
      const clean={examinerId:t.examinerId,certificate:t.certificate,version:t.version,items,updatedAt:t.updatedAt};
      if(existing<0)valid.push(clean);else if(valid[existing].version<t.version)valid[existing]=clean;
    }catch{/* Corrupt extension data never resets a valid appointment. */}
  }
  for(const e of state.examiners)for(const certificate of e.certificates)if(!valid.some(t=>t.examinerId===e.id&&t.certificate===certificate))valid.push({examinerId:e.id,certificate,version:1,items:defaultChecklist().map((c,i)=>({text:c.text,group:i>=2?'bring':'before'})),updatedAt:'2026-10-01T00:00:00.000Z'});
  state.checklistTemplates=valid;
  for(const r of state.requests){
    const source=r.templateSource,t=templateFor(state,r.examinerId,r.certificate);
    r.templateSource=source&&t&&source.examinerId===r.examinerId&&source.certificate===r.certificate&&validVersion(source.version)&&source.version<=t.version?{examinerId:r.examinerId,certificate:r.certificate,version:source.version}:null;
    r.templateNoticeSeenVersion=r.templateSource&&Number.isSafeInteger(r.templateNoticeSeenVersion)&&r.templateNoticeSeenVersion>=r.templateSource.version&&r.templateNoticeSeenVersion<=t.version?r.templateNoticeSeenVersion:r.templateSource?.version||0;
  }
  return state;
}
export function saveTemplate(state,{examinerId,certificate,items,expectedVersion},actor){
  examinerActor(state,examinerId,actor);
  if(!offered(state,examinerId,certificate))throw Error('Choose a test offered by this examiner.');
  const clean=cleanItems(items),prior=templateFor(state,examinerId,certificate);
  if(expectedVersion!==undefined&&expectedVersion!==(prior?.version||0))throw Error('This template changed. Reload it before saving.');
  if(prior&&equalItems(prior.items,clean))return prior;
  if(prior?.version===Number.MAX_SAFE_INTEGER)throw Error('Template version limit reached.');
  const next={examinerId,certificate,version:(prior?.version||0)+1,items:clean,updatedAt:stamp()};
  state.checklistTemplates ||= [];
  if(prior)state.checklistTemplates[state.checklistTemplates.indexOf(prior)]=next;else state.checklistTemplates.push(next);
  // Existing per-student copies are deliberately not edited here.
  return next;
}
export function applyTemplate(state,requestId,actor){
  const r=state.requests.find(r=>r.id===requestId);
  if(!r)throw Error('Checkride unavailable.');
  examinerActor(state,r.examinerId,actor);
  if(r.status!=='accepted')throw Error('Templates can only be applied to a confirmed checkride.');
  const t=templateFor(state,r.examinerId,r.certificate);
  if(!t)throw Error('Create a template for this test first.');
  if(r.templateSource?.examinerId===t.examinerId&&r.templateSource?.certificate===t.certificate&&r.templateSource?.version===t.version)return r;
  const remaining=[...(r.checklist||[])];
  r.checklist=t.items.map(i=>{
    const priorIndex=remaining.findIndex(c=>c.text===i.text&&(c.group||'before')===i.group),prior=priorIndex>=0?remaining.splice(priorIndex,1)[0]:null;
    return {id:globalThis.crypto.randomUUID(),text:i.text,group:i.group,done:prior?.done===true};
  });
  r.templateSource={examinerId:t.examinerId,certificate:t.certificate,version:t.version};
  r.templateNoticeSeenVersion=t.version;
  r.checklistRevision=(r.checklistRevision||0)+1;
  return r;
}
export function templateUpdateAvailable(state,r){
  const t=r&&templateFor(state,r.examinerId,r.certificate);
  return Boolean(r?.status==='accepted'&&r.templateSource&&t&&t.version>Math.max(r.templateSource.version,r.templateNoticeSeenVersion||0));
}
export function acknowledgeTemplateUpdate(state,requestId,actor){
  const r=state.requests.find(r=>r.id===requestId);
  if(!r||actor?.role!=='student'||actor.id!==r.studentId)throw Error('Only the assigned student can review this template notice.');
  if(r.status!=='accepted'||!r.templateSource)throw Error('No active template copy is available.');
  const t=templateFor(state,r.examinerId,r.certificate);
  if(!t)throw Error('Template unavailable.');
  r.templateNoticeSeenVersion=t.version;
  return r;
}
