import {openClarifications} from './clarifications.mjs';
export const seed = () => ({version:1, examiners:[
{id:'elena',name:'Elena Morgan',initials:'EM',location:'Concord, NC',bio:'A clear plan, a calm checkride.',airports:['KJQF','KRUQ'],certificates:['Private pilot','Instrument rating'],fee:850,retestFee:400,notice:'Request at least 7 days ahead. Aircraft and eligibility reviewed before acceptance.',slots:[{id:'e1',date:'2026-11-09',time:'08:00',airport:'KJQF'},{id:'e2',date:'2026-11-12',time:'09:00',airport:'KJQF'},{id:'e3',date:'2026-11-17',time:'08:00',airport:'KRUQ'}]},
{id:'james',name:'James Bennett',initials:'JB',location:'Monroe, NC',bio:'Thoughtful preparation. Straightforward coordination.',airports:['KEQY','KUZA'],certificates:['Private pilot','Commercial pilot'],fee:900,retestFee:450,notice:'Daylight appointments preferred. Discuss aircraft suitability before confirming.',slots:[{id:'j1',date:'2026-11-11',time:'08:30',airport:'KEQY'},{id:'j2',date:'2026-11-16',time:'08:30',airport:'KUZA'}]},
{id:'riley',name:'Riley Brooks',initials:'RB',location:'Salisbury, NC',bio:'Helping your next chapter take flight.',airports:['KRUQ','KJQF'],certificates:['Instrument rating','Commercial pilot'],fee:950,retestFee:475,notice:'Weather and aircraft availability may require a new date. No fee is collected in this demo.',slots:[{id:'r1',date:'2026-11-10',time:'09:00',airport:'KRUQ'},{id:'r2',date:'2026-11-19',time:'09:00',airport:'KJQF'}]}
],students:[{id:'maya',name:'Maya Chen',initials:'MC',certificate:'Private pilot',airport:'KJQF'},{id:'alex',name:'Alex Rivera',initials:'AR',certificate:'Instrument rating',airport:'KRUQ'},{id:'sam',name:'Sam Taylor',initials:'ST',certificate:'Commercial pilot',airport:'KEQY'}],requests:[{id:'sample-request',studentId:'alex',examinerId:'riley',slotId:'r1',certificate:'Instrument rating',fee:950,date:'2026-11-10',time:'09:00',airport:'KRUQ',status:'pending',source:'Flight school',checklist:[]} ]});
export const defaultChecklist = () => ['Confirm application and IACRA status with your examiner','Review required eligibility documents and endorsements','Confirm aircraft documents and maintenance records','Confirm any navigation logs, references, and equipment requested by the examiner'].map((text,i)=>({id:'item-'+i,text,done:false}));
export function requestSlot(state,{studentId,examinerId,slotId,certificate,source='Student',aircraft='Not specified',readiness='Not provided',notes=''}) {const examiner=state.examiners.find(x=>x.id===examinerId),student=state.students.find(x=>x.id===studentId),slot=examiner?.slots.find(x=>x.id===slotId);if(!examiner||!student||!slot)throw Error('This slot is no longer available. Choose another.');if(!examiner.certificates.includes(certificate))throw Error('Choose a certificate offered by this examiner.');if(state.requests.some(r=>r.examinerId===examinerId&&r.date===slot.date&&r.status==='accepted'))throw Error('This examiner already has a confirmed checkride that day.');if(state.requests.some(r=>r.studentId===studentId&&r.examinerId===examinerId&&r.slotId===slotId&&['pending','accepted'].includes(r.status)))throw Error('You already have a request for this slot.');if(state.requests.some(r=>r.studentId===studentId&&r.date===slot.date&&r.status==='accepted'))throw Error('This student already has a confirmed checkride that day.');const details=validateRequestDetails({aircraft,readiness,notes});const request={...details,coordination:'scheduled',lifecycleHistory:[],checklistRevision:0,checklistSeenRevision:0,messages:[],createdAt:new Date().toISOString(),id:globalThis.crypto?.randomUUID?.()||'r'+Date.now()+Math.random(),studentId,examinerId,slotId,certificate,source,fee:examiner.fee,...slot,status:'pending',checklist:[]};request.id=globalThis.crypto?.randomUUID?.()||'r'+Date.now()+Math.random();state.requests.push(request);return request;}
export function decideRequest(state,id,decision) {const r=state.requests.find(x=>x.id===id);if(!r||r.status!=='pending')throw Error('This request has already changed.');if(!['accepted','declined'].includes(decision))throw Error('Invalid decision.');if(decision==='accepted'){if(state.requests.some(x=>x.id!==id&&x.status==='accepted'&&((x.examinerId===r.examinerId&&x.date===r.date)||(x.studentId===r.studentId&&x.date===r.date))))throw Error('There is a conflicting confirmed checkride.');r.checklist=defaultChecklist();}r.status=decision;if(decision==='accepted')markAvailabilityChanged(state.examiners.find(e=>e.id===r.examinerId));return r;}
export function cancelRequest(state,id){const r=state.requests.find(x=>x.id===id);if(!r||!['pending','accepted'].includes(r.status))throw Error('This request is no longer active.');if(r.rescheduleProposal){const p=r.rescheduleProposal;p.status='cancelled';p.resolvedAt=new Date().toISOString();const i=(r.rescheduleHistory||[]).findIndex(x=>x.id===p.id);if(i>=0)r.rescheduleHistory[i]=p;else (r.rescheduleHistory ||= []).push(p);r.rescheduleProposal=null;}r.status='cancelled';markAvailabilityChanged(state.examiners.find(e=>e.id===r.examinerId));}
export function addSlot(state,examinerId,slot){const e=state.examiners.find(x=>x.id===examinerId);if(!e||!e.airports.includes(slot.airport)||!/^\d{4}-\d{2}-\d{2}$/.test(slot.date)||!/^\d{2}:\d{2}$/.test(slot.time))throw Error('Enter a valid date, time, and operating airport.');const parsed=new Date(slot.date+'T12:00:00Z');const [h,m]=slot.time.split(':').map(Number);if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==slot.date||h>23||m>59||slot.date<=new Date().toISOString().slice(0,10))throw Error('Choose a valid future date and time.');if(e.slots.some(x=>x.date===slot.date&&x.time===slot.time))throw Error('An opening already exists at that date and time.');e.slots.push({id:globalThis.crypto?.randomUUID?.()||'s'+Date.now(),...slot});e.slots.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));markAvailabilityChanged(e);}
export function removeSlot(state,examinerId,slotId){
 if(state.requests.some(r=>r.examinerId===examinerId&&r.slotId===slotId&&['accepted','pending'].includes(r.status)))throw Error('Resolve or cancel active requests before removing this opening.');
 if(state.requests.some(r=>r.examinerId===examinerId&&r.status==='accepted'&&r.rescheduleProposal?.status==='pending'&&r.rescheduleProposal.to.slotId===slotId))throw Error('Resolve or withdraw the pending rescheduling proposal before removing this opening.');
 const e=state.examiners.find(e=>e.id===examinerId);if(!e?.slots.some(s=>s.id===slotId))throw Error('This opening has already changed.');e.slots=e.slots.filter(s=>s.id!==slotId);markAvailabilityChanged(e);
}

export const readinessOptions = ['Ready for examiner review','Final instructor review pending','Still preparing','Not provided'];
export function validateRequestDetails({aircraft,readiness,notes=''}) {
 if(typeof aircraft!=='string'||!aircraft.trim()||aircraft.trim().length>80)throw Error('Enter an aircraft make/model, up to 80 characters.');
 if(!readinessOptions.includes(readiness))throw Error('Select a valid readiness status.');
 if(typeof notes!=='string'||notes.trim().length>1000)throw Error('Keep request notes to 1,000 characters or fewer.');
 return {aircraft:aircraft.trim(),readiness,notes:notes.trim()};
}
export function migrateState(input) {
 if(!input||input.version!==1||!Array.isArray(input.examiners)||!Array.isArray(input.students)||!Array.isArray(input.requests))return seed();
 const baseline=seed();
 const text=v=>typeof v==='string'&&v.length>0;
 const validId=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(v);
 const validAirport=v=>typeof v==='string'&&/^[A-Z0-9]{3,5}$/.test(v);
 const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(new Date(v+'T12:00:00Z').getTime())&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
 const validTime=v=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
 const validAppointment=a=>a&&validId(a.slotId)&&validDate(a.date)&&validTime(a.time)&&validAirport(a.airport);
 // The preview selects these built-in identities directly. Reject corrupted base
 // records rather than rendering a half-valid state or inventing relationships.
 if(!baseline.examiners.every(e=>input.examiners.some(x=>x?.id===e.id))||!baseline.students.every(s=>input.students.some(x=>x?.id===s.id)))return seed();
 if(!input.examiners.every(e=>e&&validId(e.id)&&['id','name','initials','location','bio','notice'].every(k=>text(e[k]))&&Array.isArray(e.airports)&&e.airports.every(validAirport)&&Array.isArray(e.certificates)&&e.certificates.every(text)&&Number.isFinite(e.fee)&&Number.isFinite(e.retestFee)&&Array.isArray(e.slots)&&e.slots.every(a=>a&&validId(a.id)&&validDate(a.date)&&validTime(a.time)&&validAirport(a.airport))))return seed();
 if(!input.students.every(s=>s&&validId(s.id)&&['id','name','initials','certificate','airport'].every(k=>text(s[k]))))return seed();
 if(!input.requests.every(r=>r&&validId(r.id)&&input.examiners.some(e=>e.id===r.examinerId)&&input.students.some(s=>s.id===r.studentId)&&validAppointment(r)&&text(r.certificate)&&Number.isFinite(r.fee)&&['pending','accepted','declined','cancelled'].includes(r.status)))return seed();
 const validProposal=p=>p&&text(p.id)&&['student','examiner'].includes(p.actorRole)&&text(p.actorId)&&validAppointment(p.from)&&validAppointment(p.to)&&['pending','accepted','declined','withdrawn','cancelled'].includes(p.status)&&typeof p.createdAt==='string'&&Number.isFinite(Date.parse(p.createdAt));
 if(input.requests.some(r=>(r.rescheduleProposal&&!validProposal(r.rescheduleProposal))||(Array.isArray(r.rescheduleHistory)&&!r.rescheduleHistory.every(validProposal))))return seed();
 for(const r of input.requests){
  r.aircraft=typeof r.aircraft==='string'?r.aircraft:'Not specified';
  r.readiness=readinessOptions.includes(r.readiness)?r.readiness:'Not provided';
  r.notes=typeof r.notes==='string'?r.notes:'';
  r.messages=Array.isArray(r.messages)?r.messages.filter(m=>m&&text(m.id)&&['student','examiner'].includes(m.actorRole)&&typeof m.text==='string'&&Number.isFinite(Date.parse(m.createdAt))):[];
  r.checklist=Array.isArray(r.checklist)?r.checklist.filter(c=>c&&validId(c.id)&&typeof c.text==='string'):[];
  r.rescheduleHistory=Array.isArray(r.rescheduleHistory)?r.rescheduleHistory:[];
  r.rescheduleProposal=r.rescheduleProposal||null;
 }
 return input;
}
export function addMessage(state,{requestId,actorRole,actorId,text,clientId,replyRequested=true,replyTo=null}) {
 const r=state.requests.find(x=>x.id===requestId);
 if(!r||!['pending','accepted'].includes(r.status))throw Error('Demo conversation is available only for active requests.');
 if(!['student','examiner'].includes(actorRole)||(actorRole==='student'?actorId!==r.studentId:actorId!==r.examinerId))throw Error('Choose the student or examiner assigned to this checkride.');
 if(typeof text!=='string'||!text.trim()||text.trim().length>1000)throw Error('Write a message between 1 and 1,000 characters.');
 if(typeof clientId!=='string'||!clientId||clientId.length>100)throw Error('Refresh the conversation and try again.');
 if(typeof replyRequested!=='boolean')throw Error('Choose whether a reply is needed.');
 if(replyTo!==null&&(typeof replyTo!=='string'||!replyTo||replyTo.length>100))throw Error('Choose a valid clarification question.');
 if(replyTo!==null&&replyRequested)throw Error('Reply to one question or ask a new question, not both.');
 r.messages ||= [];
 const prior=r.messages.find(m=>m.id===clientId);if(prior){if(prior.actorRole!==actorRole||prior.actorId!==actorId||prior.text!==text.trim()||(prior.replyRequested!==false)!==replyRequested||(prior.replyTo??null)!==replyTo)throw Error('This message identifier has already been used.');return prior;}
 if(replyTo!==null){const target=openClarifications(r).find(thread=>thread.id===replyTo);if(!target||target.question.actorRole===actorRole)throw Error('This question is no longer open for your reply. Choose another question or save this text as a note.');}
 const message={id:clientId,actorRole,actorId,text:text.trim(),replyRequested,replyTo,clarificationVersion:1,createdAt:new Date().toISOString()};r.messages.push(message);return message;
}

// A proposal never reserves its destination. All checks run again before mutation.
const appointment = r => ({slotId:r.slotId,date:r.date,time:r.time,airport:r.airport});
function rescheduleActor(r,actorRole,actorId) {
 if(!r||!['student','examiner'].includes(actorRole)||(actorRole==='student'?r.studentId:r.examinerId)!==actorId)throw Error('Only the assigned student or examiner can change this appointment.');
}
function assertSchedulingActive(r){if(r.coordination&&r.coordination!=='scheduled')throw Error('This appointment has a post-test coordination report. To correct an ongoing appointment, explicitly change coordination to Scheduled / correction before proposing or accepting a new time.');}
function rescheduleTarget(state,r,slotId) {
 assertSchedulingActive(r);
 const e=state.examiners.find(x=>x.id===r.examinerId),s=e?.slots.find(x=>x.id===slotId);
 if(!s||s.id===r.slotId||!/^\d{4}-\d{2}-\d{2}$/.test(s.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time)||!e.airports.includes(s.airport)||!e.certificates.includes(r.certificate))throw Error('Choose a different available opening with the same examiner.');
 const parsed=new Date(s.date+'T12:00:00Z');
 if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==s.date||s.date<=new Date().toISOString().slice(0,10))throw Error('Choose a valid future opening.');
 if(state.requests.some(x=>x.id!==r.id&&x.status==='accepted'&&x.date===s.date&&(x.examinerId===r.examinerId||x.studentId===r.studentId)))throw Error('The proposed day now conflicts with a confirmed checkride. Your original appointment is unchanged.');
 return {slotId:s.id,date:s.date,time:s.time,airport:s.airport};
}
export function rescheduleOpenings(state,id) {
 const r=state.requests.find(x=>x.id===id);if(!r||r.status!=='accepted')return [];
 return (state.examiners.find(x=>x.id===r.examinerId)?.slots||[]).filter(s=>{try{rescheduleTarget(state,r,s.id);return true}catch{return false}});
}
export function proposeReschedule(state,{requestId,actorRole,actorId,slotId,clientId}) {
 const r=state.requests.find(x=>x.id===requestId);rescheduleActor(r,actorRole,actorId);
 if(r.status!=='accepted')throw Error('Only confirmed checkrides can be rescheduled.');
 assertSchedulingActive(r);
 if(typeof clientId!=='string'||!clientId||clientId.length>100)throw Error('Refresh and try again.');
 const previous=(r.rescheduleHistory||[]).find(p=>p.id===clientId);
 if(previous){if(previous.actorRole!==actorRole||previous.actorId!==actorId||previous.to.slotId!==slotId)throw Error('This proposal identifier has already been used.');return previous;}
 if(r.rescheduleProposal)throw Error('Resolve the existing proposal before suggesting another opening.');
 const to=rescheduleTarget(state,r,slotId);
 const proposal={id:clientId,actorRole,actorId,from:appointment(r),to,status:'pending',createdAt:new Date().toISOString()};
 r.rescheduleHistory ||= [];r.rescheduleHistory.push(proposal);r.rescheduleProposal=proposal;return proposal;
}
export function resolveReschedule(state,{requestId,proposalId,actorRole,actorId,decision}) {
 const r=state.requests.find(x=>x.id===requestId);rescheduleActor(r,actorRole,actorId);
 if(r.status!=='accepted')throw Error('This checkride is no longer confirmed.');
 const p=r.rescheduleProposal;
 if(!p||p.id!==proposalId)throw Error('This proposal has already changed.');
 if(!['accepted','declined','withdrawn'].includes(decision))throw Error('Invalid proposal decision.');
 if((decision==='withdrawn')!==(p.actorRole===actorRole))throw Error(decision==='withdrawn'?'Only the proposer can withdraw this change.':'The other participant must accept or decline this change.');
 if(decision==='accepted'){
  const to=rescheduleTarget(state,r,p.to.slotId);
  if(JSON.stringify(to)!==JSON.stringify(p.to)||JSON.stringify(appointment(r))!==JSON.stringify(p.from))throw Error('Appointment details have changed. Withdraw this proposal and try again.');
  Object.assign(r,to);markAvailabilityChanged(state.examiners.find(e=>e.id===r.examinerId));
 }
 p.status=decision;p.resolvedAt=new Date().toISOString();p.resolvedBy={actorRole,actorId};
 // Migration may have deserialized the pending pointer separately from history.
 const index=(r.rescheduleHistory||[]).findIndex(x=>x.id===p.id);
 if(index>=0)r.rescheduleHistory[index]=p;else (r.rescheduleHistory ||= []).push(p);
 r.rescheduleProposal=null;return p;
}

// Revisions distinguish mutations within one clock tick and after clock rollback.
function markAvailabilityChanged(e){
 e.availabilityChangedAt=new Date().toISOString();
 e.availabilityRevision=Number.isSafeInteger(e.availabilityRevision)&&e.availabilityRevision>=0&&e.availabilityRevision<Number.MAX_SAFE_INTEGER?e.availabilityRevision+1:1;
 // Explicitly invalidate even if an imported revision wrapped or was malformed.
 e.availabilityConfirmedRevision=null;
}
