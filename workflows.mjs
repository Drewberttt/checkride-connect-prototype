import {pendingRequestAvailability,pendingOfferAvailability,migratePendingOffers} from './pending-offers.mjs';
import {clarificationThreads,openClarifications} from './clarifications.mjs';
import {decideRequest,cancelRequest} from './model.mjs';

export const termKeys=['travel','cancellation','weather','continuation'];
const stamp=()=>new Date().toISOString();
const validStamp=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const terms=value=>Object.fromEntries(termKeys.map(k=>[k,typeof value?.[k]==='string'?value[k].slice(0,500):'']));
export function migrateWorkflows(state){
  migratePendingOffers(state);
  state.draftReceipts=state.draftReceipts&&typeof state.draftReceipts==='object'&&!Array.isArray(state.draftReceipts)?Object.fromEntries(Object.entries(state.draftReceipts).filter(([key,value])=>key.startsWith('checkride-draft-v2:')&&key.length<=250&&typeof value==='string'&&/^[a-zA-Z0-9-]{1,100}$/.test(value))):{};
  for(const e of state.examiners){
    // Old updatedAt mixed profile changes with availability; never promote it.
    e.availabilityConfirmedAt=validStamp(e.availabilityConfirmedAt)?e.availabilityConfirmedAt:null;
    e.availabilityChangedAt=validStamp(e.availabilityChangedAt)?e.availabilityChangedAt:null;
    const validAvailabilityRevision=Number.isSafeInteger(e.availabilityRevision)&&e.availabilityRevision>=0;
    e.availabilityRevision=validAvailabilityRevision?e.availabilityRevision:0;
    e.availabilityConfirmedRevision=validAvailabilityRevision&&Number.isSafeInteger(e.availabilityConfirmedRevision)&&e.availabilityConfirmedRevision>=0&&e.availabilityConfirmedRevision===e.availabilityRevision?e.availabilityConfirmedRevision:null;
    e.terms=terms(e.terms);
  }
  state.schoolGrants=Array.isArray(state.schoolGrants)?state.schoolGrants.filter(g=>g&&state.students.some(s=>s.id===g.studentId)&&g.schoolId==='piedmont'&&['overview','coordinate'].includes(g.scope)&&typeof g.active==='boolean').map(g=>({...g,conversation:g.active&&g.conversation===true})):[];
  state.activity=Array.isArray(state.activity)?state.activity.filter(a=>a&&typeof a.id==='string'&&typeof a.text==='string'&&validStamp(a.at)&&typeof a.requestId==='string').slice(-100):[];
  for(const r of state.requests){
    r.coordination=['scheduled','completed','discontinued','retest'].includes(r.coordination)?r.coordination:'scheduled';
    r.lifecycleHistory=Array.isArray(r.lifecycleHistory)?r.lifecycleHistory.filter(h=>h&&['completed','discontinued','retest','scheduled'].includes(h.value)&&validStamp(h.at)&&['student','examiner'].includes(h.actorRole)):[];
    r.checklistRevision=Number.isInteger(r.checklistRevision)&&r.checklistRevision>=0?r.checklistRevision:0;
    r.checklistSeenRevision=Number.isInteger(r.checklistSeenRevision)?Math.min(r.checklistSeenRevision,r.checklistRevision):0;
    r.checklist=r.checklist.map(c=>({...c,done:c.done===true,group:c.group==='bring'?'bring':'before'}));
    if(!r.agreement||typeof r.agreement!=='object'||!r.agreement.details||r.agreement.details.requestId!==r.id)r.agreement=null;
    else {
      const d=r.agreement.details;
      if(!['certificate','aircraft','airport','date','time','timeZone'].every(k=>typeof d[k]==='string')||!Number.isFinite(d.fee))r.agreement=null;
      else r.agreement={details:{...d,terms:terms(d.terms)},studentAcknowledgedAt:validStamp(r.agreement.studentAcknowledgedAt)?r.agreement.studentAcknowledgedAt:null,examinerAcknowledgedAt:validStamp(r.agreement.examinerAcknowledgedAt)?r.agreement.examinerAcknowledgedAt:null};
    }
  }
  return state;
}
export function availabilityFreshness(e,now=Date.now()){
  const at=e.availabilityConfirmedAt;
  if(!validStamp(at))return {stale:true,label:'Availability not yet reconfirmed'};
  if(!Number.isFinite(now)||Date.parse(at)>now)return {stale:true,label:'Availability confirmation is ahead of this clock — review and reconfirm'};
  const age=Math.floor((now-Date.parse(at))/86400000);
  // Legacy timestamps cannot establish ordering within the same millisecond.
  // A current revision is the explicit evidence that all mutations were reviewed.
  const revision=Number.isSafeInteger(e.availabilityRevision)&&e.availabilityRevision>=0?e.availabilityRevision:0;
  const revisionConfirmed=Number.isSafeInteger(e.availabilityConfirmedRevision)&&e.availabilityConfirmedRevision===revision;
  const changed=!revisionConfirmed&&(revision>0||(validStamp(e.availabilityChangedAt)&&Date.parse(e.availabilityChangedAt)>=Date.parse(at)));
  return {stale:changed||age>=7,label:changed?'Openings changed — reconfirm availability':`Availability confirmed ${age===0?'today':age+' days ago'}${age>=7?' · Reconfirmation needed':''}`};
}
export function reconfirmAvailability(state,examinerId,actor){
  if(actor?.role!=='examiner'||actor.id!==examinerId)throw Error('Only this examiner can reconfirm availability.');
  const e=state.examiners.find(e=>e.id===examinerId);if(!e)throw Error('Examiner unavailable.');
  e.availabilityConfirmedAt=stamp();
  e.availabilityRevision=Number.isSafeInteger(e.availabilityRevision)&&e.availabilityRevision>=0?e.availabilityRevision:0;
  e.availabilityConfirmedRevision=e.availabilityRevision;
}
export function canSchool(state,studentId,scope='overview'){
  return state.schoolGrants?.some(g=>g.studentId===studentId&&g.schoolId==='piedmont'&&g.active&&(scope==='overview'||(scope==='coordinate'&&g.scope==='coordinate')||(scope==='conversation'&&g.conversation===true)))===true;
}
export function setSchoolGrant(state,studentId,scope,actor,conversation=false){
  if(actor.role!=='student'||actor.id!==studentId||!state.students.some(s=>s.id===studentId))throw Error('Only this student can change their demo school grant.');
  if(!['none','overview','coordinate'].includes(scope)||typeof conversation!=='boolean')throw Error('Choose a valid scope.');
  state.schoolGrants=state.schoolGrants.filter(g=>g.studentId!==studentId);
  state.schoolGrants.push({studentId,schoolId:'piedmont',scope:scope==='none'?'overview':scope,active:scope!=='none',conversation:scope!=='none'&&conversation,updatedAt:stamp()});
}
export function assertRequestActor(r,actor){
  if(!r||!['student','examiner'].includes(actor.role)||(actor.role==='student'?r.studentId:r.examinerId)!==actor.id)throw Error('Only the assigned student or examiner can make this change.');
}
export function reviewDetails(state,r){
  return {requestId:r.id,certificate:r.certificate,aircraft:r.aircraft,airport:r.airport,date:r.date,time:r.time,timeZone:'America/New_York',fee:r.fee,terms:terms(state.examiners.find(e=>e.id===r.examinerId)?.terms)};
}
export function snapshotAgreement(state,r,acknowledged=false){
  r.agreement={details:reviewDetails(state,r),studentAcknowledgedAt:acknowledged?stamp():null,examinerAcknowledgedAt:null};return r.agreement;
}
export function acknowledgeAgreement(state,id,actor){
  const r=state.requests.find(r=>r.id===id);assertRequestActor(r,actor);
  if(r.status!=='pending')throw Error('This request has already changed.');
  if(!r.agreement)snapshotAgreement(state,r);
  r.agreement[actor.role+'AcknowledgedAt']=stamp();
}
export function activity(state,r,text){
  state.activity ||= [];state.activity.push({id:globalThis.crypto.randomUUID(),requestId:r.id,at:stamp(),text});state.activity=state.activity.slice(-100);
}
export function decideAs(state,id,decision,actor,ack=false){
  const r=state.requests.find(r=>r.id===id);assertRequestActor(r,actor);
  if(actor.role!=='examiner')throw Error('Only the assigned examiner can accept or decline.');
  if(decision==='accepted'&&!pendingRequestAvailability(state,r).available)throw Error('The requested opening is unavailable. Keep this request pending, offer another opening, or decline.');
  if(decision==='accepted'&&r.pendingOffer?.status==='pending')throw Error('Resolve or withdraw the alternate-opening offer before accepting this request.');
  if(decision==='accepted'&&(!ack||!r.agreement?.studentAcknowledgedAt))throw Error('Student acknowledgement and your review are needed before accepting.');
  decideRequest(state,id,decision);
  if(decision==='accepted')r.agreement.examinerAcknowledgedAt=stamp();
  activity(state,r,decision==='accepted'?'Examiner confirmed this demo request.':'Examiner declined this demo request.');return r;
}
export function cancelAs(state,id,actor){
  const r=state.requests.find(r=>r.id===id);assertRequestActor(r,actor);
  if(r.status==='pending'&&actor.role!=='student')throw Error('Use Decline for an examiner decision. Only the student can withdraw a pending request.');
  cancelRequest(state,id);activity(state,r,'Arrangement closed by '+actor.role+'.');
}
export function setLifecycle(state,id,value,actor){
  const r=state.requests.find(r=>r.id===id);assertRequestActor(r,actor);
  if(r.status!=='accepted'||!['scheduled','completed','discontinued','retest'].includes(value))throw Error('Choose a coordination state for a confirmed checkride.');
  if(r.coordination===value)throw Error('This coordination state is already recorded.');
  if(r.rescheduleProposal)throw Error('Resolve the schedule proposal before changing follow-up status.');
  r.coordination=value;(r.lifecycleHistory ||= []).push({value,actorRole:actor.role,actorId:actor.id,at:stamp()});
  activity(state,r,'User-reported coordination: '+value+'. No certification decision recorded.');
}
// Compatibility helper for status/advisory copy; queue uses every open question.
export function pendingClarification(r){return openClarifications(r)[0]?.question||null;}
export function actionItems(state,role,personId,now=Date.now()){
  const rs=state.requests.filter(r=>role==='student'?r.studentId===personId:role==='examiner'?r.examinerId===personId:role==='school'&&canSchool(state,r.studentId));
  return rs.flatMap(r=>{
    const items=[],put=(title,owner,kind='action',questionId=null)=>items.push({requestId:r.id,title,owner,studentId:r.studentId,questionId,kind,disposition:kind==='info'?'info':role===owner?'action':'waiting'});
    if(r.status==='pending'){
      const age=validStamp(r.createdAt)?Math.max(0,Math.floor((now-Date.parse(r.createdAt))/86400000))+' days waiting':'Request age unavailable';
      const availability=pendingRequestAvailability(state,r);
      if(r.pendingOffer?.status==='pending'){const offered=pendingOfferAvailability(state,r);put(offered.available?'Review the alternate opening offer · request stays pending':'Alternate offer is stale or unavailable · withdraw it and offer another opening',offered.available?'student':'examiner');}
      if(!availability.available&&!r.pendingOffer)put('Requested opening unavailable · offer another opening or decline · '+age,'examiner');
      else if(r.agreement?.studentAcknowledgedAt&&!r.pendingOffer)put('Review pending request · '+age,'examiner');
      if(!r.agreement?.studentAcknowledgedAt)put('Review the request snapshot · '+age,'student');
      if(rs.some(x=>x.studentId===r.studentId&&x.status==='accepted'))put('Another request is confirmed; keep or withdraw this request individually','student');
    }
    if(r.status==='accepted'){
      if(r.rescheduleProposal)put('Respond to the proposed schedule change',r.rescheduleProposal.actorRole==='student'?'examiner':'student');
      if(r.coordination==='retest'||r.coordination==='discontinued')put('Coordinate '+r.coordination+' follow-up; a new request is still required','student');
      else if(r.coordination!=='completed'){
        if(!r.checklist.length)put('Add preparation items','examiner');
        else if(r.checklist.some(c=>!c.done))put(r.checklist.filter(c=>!c.done).length+' preparation items remaining','student');
        if(r.checklistRevision>r.checklistSeenRevision)put('Review changed preparation requirements','student');
      }
    }
    for(const thread of openClarifications(r)){const number=clarificationThreads(r).findIndex(t=>t.id===thread.id)+1;put('Reply to '+thread.question.actorRole+' clarification Q'+number+(thread.legacy?' · Legacy question: review needed':''),thread.question.actorRole==='examiner'?'student':'examiner','action',thread.id);}
    if(!items.length)put(r.status==='accepted'?(r.coordination==='completed'?'User-reported completed · review history; no action required':'Preparation is up to date · review the plan before test day'):r.status==='declined'?'Request declined · browse openings if you still need a checkride':'Request withdrawn or cancelled · review history',null,'info');
    return items;
  }).sort((a,b)=>({action:0,waiting:1,info:2}[a.disposition]-{action:0,waiting:1,info:2}[b.disposition]));
}

export const pagesByRole={student:['dashboard','find','requests','workspace'],examiner:['dashboard','requests','availability','workspace'],school:['dashboard','school','find','requests','workspace']};
export function parseRoute(search,state){
  const p=new URLSearchParams(search),role=Object.hasOwn(pagesByRole,p.get('role'))?p.get('role'):'student';
  const studentId=state.students.some(s=>s.id===p.get('student'))?p.get('student'):'maya';
  const examinerId=state.examiners.some(e=>e.id===p.get('examiner'))?p.get('examiner'):'elena';
  let page=pagesByRole[role].includes(p.get('page'))?p.get('page'):'dashboard',workspaceId=p.get('request');
  const r=state.requests.find(r=>r.id===workspaceId);
  if(page==='workspace'&&(!r||(role==='student'?r.studentId!==studentId:role==='examiner'?r.examinerId!==examinerId:!canSchool(state,r.studentId)))){page='dashboard';workspaceId=null;}
  return {role,page,studentId,examinerId,workspaceId};
}
export function routeSearch({role,page,studentId,examinerId,workspaceId}){
  const p=new URLSearchParams({role,page,student:studentId,examiner:examinerId});if(page==='workspace'&&workspaceId)p.set('request',workspaceId);return '?'+p;
}
export function storeValue(storage,key,value){try{storage.setItem(key,JSON.stringify(value));return true}catch{return false}}
export function loadDraft(storage,key){try{const value=JSON.parse(storage.getItem(key));return Array.isArray(value)&&value.length<=100&&value.every(f=>f&&typeof f.id==='string'&&typeof f.value==='string'&&f.value.length<=2000&&typeof f.checked==='boolean')?value:[]}catch{return []}}
