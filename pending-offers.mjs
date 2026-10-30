// Alternate openings stay on the original pending request. An offer reserves
// nothing; student consent changes requested details, not booking status.
const stamp=()=>new Date().toISOString();
const clone=value=>JSON.parse(JSON.stringify(value));
const appointment=r=>({slotId:r.slotId,date:r.date,time:r.time,airport:r.airport});
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const id=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(v);
const validAppointment=a=>a&&id(a.slotId)&&/^\d{4}-\d{2}-\d{2}$/.test(a.date)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(a.time)&&/^[A-Z0-9]{3,5}$/.test(a.airport);
const validStamp=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
function actor(r,role,actorId){if(!r||!['student','examiner'].includes(role)||(role==='student'?r.studentId:r.examinerId)!==actorId)throw Error('Only the assigned student or examiner may change this alternate opening.');}
function conflict(state,r,date){
 if(state.requests.some(x=>x.id!==r.id&&x.status==='accepted'&&x.date===date&&x.examinerId===r.examinerId))return 'This examiner already has a confirmed checkride that day. Request remains pending; ask for another opening or an examiner decision.';
 if(state.requests.some(x=>x.id!==r.id&&x.status==='accepted'&&x.date===date&&x.studentId===r.studentId))return 'This student already has a confirmed checkride that day. Request remains pending; consider another opening.';
 return '';
}
export function pendingRequestAvailability(state,r){
 if(!r||r.status!=='pending')return {available:false,reason:'This request is no longer pending.'};
 const e=state.examiners.find(x=>x.id===r.examinerId),slot=e?.slots.find(x=>x.id===r.slotId);
 const requestedDate=new Date(r.date+'T12:00:00Z');
 const elapsed=!Number.isFinite(requestedDate.getTime())||requestedDate.toISOString().slice(0,10)!==r.date||r.date<=new Date().toISOString().slice(0,10);
 const reason=elapsed?'The requested date is no longer a valid future opening. Keep this request pending and offer another opening or decline.':conflict(state,r,r.date)||(!slot||!equal(appointment({...slot,slotId:slot.id}),appointment(r))?'The requested opening has changed or is unavailable. Ask the examiner for another opening.':'');
 return {available:!reason,reason};
}
function target(state,r,slotId){
 const e=state.examiners.find(x=>x.id===r.examinerId),slot=e?.slots.find(x=>x.id===slotId),to=slot&&appointment({...slot,slotId:slot.id});
 if(!slot||slotId===r.slotId||!validAppointment(to)||!e.airports.includes(slot.airport)||!e.certificates.includes(r.certificate))throw Error('Choose a different available opening with this examiner.');
 const date=new Date(slot.date+'T12:00:00Z');
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==slot.date||slot.date<=new Date().toISOString().slice(0,10))throw Error('Choose a valid future opening.');
 if(conflict(state,r,slot.date))throw Error('That alternate day conflicts with a confirmed checkride. The original request is unchanged.');
 if(state.requests.some(x=>x.id!==r.id&&['pending','accepted'].includes(x.status)&&x.studentId===r.studentId&&x.examinerId===r.examinerId&&x.slotId===slotId))throw Error('This student already has a request for that opening.');
 return to;
}
export function pendingOfferOpenings(state,r){
 if(typeof r==='string')r=state.requests.find(x=>x.id===r);
 if(!r||r.status!=='pending')return [];
 return (state.examiners.find(x=>x.id===r.examinerId)?.slots||[]).filter(slot=>{try{target(state,r,slot.id);return true}catch{return false}});
}
function agreementDetails(state,r){
 if(r.agreement?.details)return clone(r.agreement.details);
 const e=state.examiners.find(x=>x.id===r.examinerId);
 return {requestId:r.id,certificate:r.certificate,aircraft:r.aircraft||'Not specified',airport:r.airport,date:r.date,time:r.time,timeZone:'America/New_York',fee:r.fee,terms:Object.fromEntries(['travel','cancellation','weather','continuation'].map(key=>[key,typeof e?.terms?.[key]==='string'?e.terms[key]:'']))};
}
export function proposePendingOffer(state,{requestId,actorRole,actorId,slotId,clientId}){
 const r=state.requests.find(x=>x.id===requestId);actor(r,actorRole,actorId);
 if(actorRole!=='examiner')throw Error('Only the assigned examiner can offer an alternate opening.');
 if(r.status!=='pending')throw Error('Only pending requests can receive alternate openings.');
 if(!id(clientId))throw Error('Refresh this alternate-opening form and try again.');
 const prior=(r.pendingOfferHistory||[]).find(p=>p.id===clientId);
 if(prior){if(prior.actorId!==actorId||prior.to.slotId!==slotId)throw Error('This offer identifier has already been used.');return prior;}
 if(r.pendingOffer)throw Error('Resolve or withdraw the existing alternate opening first.');
 const to=target(state,r,slotId),details={...agreementDetails(state,r),...to};delete details.slotId;
 const offer={id:clientId,actorRole:'examiner',actorId,from:appointment(r),to,status:'pending',createdAt:stamp(),fromAgreement:r.agreement?clone(r.agreement):null,agreement:{details,studentAcknowledgedAt:null,examinerAcknowledgedAt:null}};
 (r.pendingOfferHistory ||= []).push(offer);r.pendingOffer=offer;return offer;
}
function validateOfferAcceptance(state,r,p){
 const to=target(state,r,p.to.slotId);
 const originalDetails={...p.agreement.details,...p.from};delete originalDetails.slotId;
 const detailsChanged=r.agreement?.details?!equal(r.agreement.details,originalDetails):p.fromAgreement!==null;
 if(!equal(to,p.to)||!equal(appointment(r),p.from)||detailsChanged)throw Error('The offered opening or request details changed. Ask the examiner to withdraw and offer again.');
 return to;
}
export function pendingOfferAvailability(state,r){
 if(typeof r==='string')r=state.requests.find(x=>x.id===r);
 if(!r||r.status!=='pending'||!r.pendingOffer||r.pendingOffer.status!=='pending')return {available:false,reason:'There is no active alternate-opening offer.'};
 try{validateOfferAcceptance(state,r,r.pendingOffer);return {available:true,reason:''}}catch(error){return {available:false,reason:error.message};}
}
export function resolvePendingOffer(state,{requestId,offerId,actorRole,actorId,decision}){
 const r=state.requests.find(x=>x.id===requestId);actor(r,actorRole,actorId);
 if(r.status!=='pending')throw Error('This request is no longer pending.');
 const p=r.pendingOffer;if(!p||p.id!==offerId||p.status!=='pending')throw Error('This alternate opening has already changed.');
 if(!['accepted','declined','withdrawn'].includes(decision))throw Error('Choose a valid alternate-opening response.');
 if(decision==='withdrawn'?actorRole!=='examiner':actorRole!=='student')throw Error(decision==='withdrawn'?'Only the examiner can withdraw this offer.':'Only the assigned student can accept or decline this offer.');
 if(decision==='accepted'){
  const to=validateOfferAcceptance(state,r,p);
  if(r.agreement)(r.agreementHistory ||= []).push({offerId:p.id,archivedAt:stamp(),agreement:clone(r.agreement)});
  Object.assign(r,to);r.agreement={details:clone(p.agreement.details),studentAcknowledgedAt:stamp(),examinerAcknowledgedAt:null};
 }
 p.status=decision;p.resolvedAt=stamp();p.resolvedBy={actorRole,actorId};
 const index=(r.pendingOfferHistory||[]).findIndex(x=>x.id===p.id);
 if(index>=0)r.pendingOfferHistory[index]=p;else(r.pendingOfferHistory ||= []).push(p);
 r.pendingOffer=null;return p;
}
function validAgreement(a,r){const d=a?.details;return d&&d.requestId===r.id&&typeof d.certificate==='string'&&typeof d.aircraft==='string'&&typeof d.timeZone==='string'&&Number.isFinite(d.fee)&&validAppointment({slotId:'snapshot',...d})&&d.terms&&['travel','cancellation','weather','continuation'].every(key=>typeof d.terms[key]==='string'&&d.terms[key].length<=500);}
export function migratePendingOffers(state){
 for(const r of state.requests){
  const valid=p=>p&&id(p.id)&&p.actorRole==='examiner'&&p.actorId===r.examinerId&&validAppointment(p.from)&&validAppointment(p.to)&&['pending','accepted','declined','withdrawn'].includes(p.status)&&validStamp(p.createdAt)&&validAgreement(p.agreement,r)&&(p.fromAgreement===null||validAgreement(p.fromAgreement,r));
  r.pendingOfferHistory=Array.isArray(r.pendingOfferHistory)?r.pendingOfferHistory.filter(valid):[];
  r.pendingOffer=r.status==='pending'&&valid(r.pendingOffer)&&r.pendingOffer.status==='pending'?r.pendingOffer:null;
  if(r.pendingOffer){const index=r.pendingOfferHistory.findIndex(p=>p.id===r.pendingOffer.id);if(index>=0)r.pendingOfferHistory[index]=r.pendingOffer;else r.pendingOfferHistory.push(r.pendingOffer);}
  r.agreementHistory=Array.isArray(r.agreementHistory)?r.agreementHistory.filter(h=>h&&id(h.offerId)&&validStamp(h.archivedAt)&&validAgreement(h.agreement,r)):[];
 }
 return state;
}
