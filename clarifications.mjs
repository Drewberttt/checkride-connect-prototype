// Clarification state is derived from immutable message links, never inferred
// from message order alone. A note cannot answer an unrelated question.
const assigned=(r,m)=>['student','examiner'].includes(m?.actorRole)&&
  (m.actorId===(m.actorRole==='student'?r.studentId:r.examinerId)||
   (m.clarificationVersion!==1&&m.actorId==null));
export function clarificationThreads(r){
  const messages=Array.isArray(r?.messages)?r.messages:[],counts=new Map();
  for(const m of messages)if(typeof m?.id==='string')counts.set(m.id,(counts.get(m.id)||0)+1);
  const threads=[];
  for(const [index,m] of messages.entries()){
    if(!m||typeof m.id!=='string'||!m.id||counts.get(m.id)!==1||!assigned(r,m))continue;
    const legacy=m.clarificationVersion!==1;
    if(m.replyTo!=null||!(m.replyRequested===true||(legacy&&m.replyRequested===undefined)))continue;
    const reply=messages.slice(index+1).find(candidate=>candidate&&counts.get(candidate.id)===1&&
      assigned(r,candidate)&&candidate.actorRole!==m.actorRole&&candidate.replyTo===m.id&&candidate.replyRequested===false)||null;
    threads.push({id:m.id,question:m,reply,status:reply?'answered':'open',legacy});
  }
  return threads;
}
export function openClarifications(r){
  return r&&['pending','accepted'].includes(r.status)?clarificationThreads(r).filter(thread=>thread.status==='open'):[];
}
