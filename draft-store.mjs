// Memory is authoritative for this session, including unsuccessful writes and
// deletion tombstones. A durable snapshot is only a fallback on first access.
export function createDraftStore(storageProvider) {
  const memory=new Map(),pending=new Map(),submitted=new Map(),revisions=new Map(),submittedRevisions=new Map();
  const clone=fields=>fields.map(field=>({...field}));
  const valid=fields=>Array.isArray(fields)&&fields.length<=100&&fields.every(f=>f&&typeof f.id==='string'&&typeof f.value==='string'&&f.value.length<=2000&&typeof f.checked==='boolean');
  function attempt(key,operation){
    try{
      const storage=storageProvider();
      if(operation==='delete'){try{storage.removeItem(key)}catch{storage.setItem(key,'[]')}}
      else if(operation==='write')storage.setItem(key,JSON.stringify([...(memory.get(key)||[]),{id:'__draft_revision__',value:revisions.get(key),checked:false}]));
      else {const value=JSON.parse(storage.getItem(key)||'null');const fields=valid(value)?value:[];revisions.set(key,fields.find(f=>f.id==='__draft_revision__')?.value||null);memory.set(key,clone(fields.filter(f=>f.id!=='__draft_revision__')));}
      pending.delete(key);return true;
    }catch{pending.set(key,operation);return false;}
  }
  return {
    get failed(){return pending.size>0;},
    get failedKeys(){return [...pending.keys()];},
    read(key,receipt){if(!memory.has(key))attempt(key,'read');if(receipt&&revisions.get(key)===receipt){memory.set(key,[]);attempt(key,'delete');}return clone(memory.get(key)||[]);},
    save(key,fields){if(!revisions.get(key)||JSON.stringify(memory.get(key))!==JSON.stringify(fields))revisions.set(key,globalThis.crypto.randomUUID());memory.set(key,clone(fields));return attempt(key,'write');},
    discard(key){submitted.delete(key);submittedRevisions.delete(key);revisions.delete(key);memory.set(key,[]);return attempt(key,'delete');},
    // State and draft storage are separate writes. Keep the recovery snapshot
    // until the state containing its submission has actually been saved.
    stageSubmission(key,fields){submitted.set(key,clone(fields));const saved=this.save(key,fields);submittedRevisions.set(key,revisions.get(key));return saved;},
    isSubmitted(key,fields){return submitted.has(key)&&JSON.stringify(submitted.get(key))===JSON.stringify(fields);},
    get submissionReceipts(){return Object.fromEntries(submittedRevisions);},
    clearStagedSubmissions(){submitted.clear();submittedRevisions.clear();},
    commitSubmissions(){
      const committed=[];
      for(const [key,fields] of submitted){
        if(JSON.stringify(memory.get(key))===JSON.stringify(fields)){
          committed.push({key,fields:clone(fields)});memory.set(key,[]);attempt(key,'delete');
        }
      }
      submitted.clear();submittedRevisions.clear();return committed;
    },
    retry(){for(const [key,operation] of [...pending])attempt(key,operation);return pending.size===0;},
    keys(){return [...memory.keys()];}
  };
}
