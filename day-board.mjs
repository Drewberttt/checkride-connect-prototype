import {canSchool} from './workflows.mjs';

// Invented planning inventory, not aircraft dispatch or airworthiness data.
export const syntheticAircraft = () => [
 {id:'demo-172',name:'Demo Cessna 172',airports:['KJQF','KRUQ'],unavailableDates:['2026-11-12']},
 {id:'demo-pa28',name:'Demo Piper PA-28',airports:['KEQY','KUZA'],unavailableDates:['2026-11-16']}
];
const appointment=r=>({requestId:r.id,status:r.status,date:r.date,time:r.time,airport:r.airport,examinerId:r.examinerId,certificate:r.certificate,readiness:r.readiness||'Not provided',aircraft:r.aircraft||'Not specified'});
export function schoolBoard(state,{date}={}){
 const students=state.students.filter(s=>canSchool(state,s.id));
 const aircraft=syntheticAircraft();
 const openings=state.examiners.flatMap(e=>e.slots.filter(s=>(!date||s.date===date)&&!state.requests.some(r=>r.status==='accepted'&&r.examinerId===e.id&&r.date===s.date)).map(s=>({...s,examinerId:e.id,examinerName:e.name,certificates:[...e.certificates]})));
 const rows=students.map(s=>{
  const requests=state.requests.filter(r=>r.studentId===s.id&&['pending','accepted'].includes(r.status)&&(!date||r.date===date)).map(r=>{
   const candidates=aircraft.filter(a=>a.airports.includes(r.airport));
   const availableAircraft=candidates.filter(a=>!a.unavailableDates.includes(r.date));
   const conflicts=[];
   if(!availableAircraft.length)conflicts.push('No synthetic aircraft available at this airport/date');
   if(state.requests.some(x=>x.id!==r.id&&x.status==='accepted'&&x.date===r.date&&(x.studentId===s.id||x.examinerId===r.examinerId)))conflicts.push('Confirmed schedule conflict');
   if(r.status==='pending')conflicts.push('Request only — examiner acceptance still needed');
   return {...appointment(r),availableAircraft:availableAircraft.map(a=>({id:a.id,name:a.name})),conflicts};
  });
  return {studentId:s.id,name:s.name,certificate:s.certificate,airport:s.airport,requests,openings:openings.filter(o=>o.certificates.includes(s.certificate)).map(o=>({...o,aircraftAvailable:aircraft.some(a=>a.airports.includes(o.airport)&&!a.unavailableDates.includes(o.date)),studentConflict:state.requests.some(r=>r.studentId===s.id&&r.status==='accepted'&&r.date===o.date)}))};
 });
 return {rows,aircraft,disclaimer:'Synthetic planning only. Aircraft are not assigned or reserved; verify suitability, availability and examiner acceptance separately.'};
}
export function daySummary(state,requestId,actor){
 const r=state.requests.find(r=>r.id===requestId);
 if(!r||!actor||(actor.role==='student'?actor.id!==r.studentId:actor.role==='examiner'?actor.id!==r.examinerId:actor.role==='school'?actor.id!=='piedmont'||!canSchool(state,r.studentId):true))throw Error('This preview cannot access the checkride summary.');
 if(r.status!=='accepted')throw Error('Day-of summaries require an accepted appointment.');
 const examiner=state.examiners.find(e=>e.id===r.examinerId),student=state.students.find(s=>s.id===r.studentId);
 return {requestId:r.id,studentName:student.name,examinerName:examiner.name,certificate:r.certificate,date:r.date,time:r.time,timeZone:'America/New_York',location:r.airport,meetingPoint:'Exact meeting point not specified — confirm with examiner',fee:r.fee,currency:'USD',coordination:r.coordination||'scheduled',proposalPending:!!r.rescheduleProposal,contacts:[{name:examiner.name,email:r.examinerId+'@example.invalid'},{name:student.name,email:r.studentId+'@example.invalid'}],bring:r.checklist.filter(c=>c.group==='bring').map(c=>({text:c.text,done:c.done===true})),disclaimer:'Fictional browser-local summary. Contacts do not deliver messages. Checklist is coordination help, not an eligibility determination.'};
}
