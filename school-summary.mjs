// Read-only coordination facts: accepted is not a claim that a test is upcoming or eligibility verified.
export const schoolViews = [['all','All students'],['unassigned','No active request'],['pending','Awaiting examiner'],['confirmed','Confirmed'],['change','Schedule change proposed'],['preparation','Preparation remaining']];
export function schoolSummaries(state) {
 return state.students.map(student=>{
  const requests=state.requests.filter(r=>r.studentId===student.id);
  const accepted=requests.filter(r=>r.status==='accepted').slice().sort((a,b)=>(a.date+a.time+a.id).localeCompare(b.date+b.time+b.id));
  const pending=requests.filter(r=>r.status==='pending');
  const history=requests.filter(r=>!['pending','accepted'].includes(r.status));
  const confirmed=accepted.map(request=>({request,done:request.checklist.filter(c=>c.done).length,total:request.checklist.length,respondingRole:request.rescheduleProposal?.status==='pending'?(request.rescheduleProposal.actorRole==='student'?'examiner':'student'):null}));
  return {student,pending,history,confirmed,unassigned:!accepted.length&&!pending.length,change:confirmed.some(c=>c.respondingRole),preparation:confirmed.some(c=>c.total===0||c.done<c.total)};
 });
}
export function matchesSchoolView(row,view) {
 return view==='unassigned'?row.unassigned:view==='pending'?row.pending.length>0:view==='confirmed'?row.confirmed.length>0:view==='change'?row.change:view==='preparation'?row.preparation:true;
}
export function filterSchoolSummaries(rows,{query='',view='all'}={}) {
 const q=query.trim().toLocaleLowerCase();return rows.filter(row=>matchesSchoolView(row,view)&&(!q||row.student.name.toLocaleLowerCase().includes(q)));
}
