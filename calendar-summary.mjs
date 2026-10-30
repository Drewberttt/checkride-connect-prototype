// Civil dates only: these are the demo's Eastern calendar dates, not instants.
const pad=n=>String(n).padStart(2,'0');
export function monthParts(month){
 if(!/^\d{4}-\d{2}$/.test(month))throw Error('Use YYYY-MM for a calendar month.');
 const [year,m]=month.split('-').map(Number);
 if(year<1||m<1||m>12)throw Error('Invalid calendar month.');
 return {year,month:m};
}
export function daysInMonth(month){const {year,month:m}=monthParts(month);return [31,year%4===0&&(year%100!==0||year%400===0)?29:28,31,30,31,30,31,31,30,31,30,31][m-1]}
export function shiftMonth(month,offset){const {year,month:m}=monthParts(month);if(!Number.isInteger(offset))throw Error('Use a whole month offset.');const index=(year-1)*12+m-1+offset;if(index<0||index>=9999*12)return month;return `${String(Math.floor(index/12)+1).padStart(4,'0')}-${pad(index%12+1)}`}
export function monthLabel(month){const {year,month:m}=monthParts(month);return `${['January','February','March','April','May','June','July','August','September','October','November','December'][m-1]} ${year}`}
export function monthCells(month){
 const {year,month:m}=monthParts(month),y=m<3?year-1:year;
 const weekday=(y+Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400)+[0,3,2,5,0,3,5,1,4,6,2,4][m-1]+1)%7;
 const cells=Array(weekday).fill(null);for(let day=1;day<=daysInMonth(month);day++)cells.push(`${month}-${pad(day)}`);
 while(cells.length%7)cells.push(null);return cells;
}
export function initialCalendarDate(examiner,requests=[]){return [...examiner.slots.map(s=>s.date),...requests.filter(r=>r.examinerId===examiner.id&&['pending','accepted'].includes(r.status)).map(r=>r.date)].sort()[0]||new Date().toISOString().slice(0,10)}
export function summarizeDay(examiner,requests,date){
 const own=requests.filter(r=>r.examinerId===examiner.id),confirmed=own.filter(r=>r.date===date&&r.status==='accepted'),pending=own.filter(r=>r.date===date&&r.status==='pending');
 const proposals=own.filter(r=>r.status==='accepted'&&r.rescheduleProposal?.status==='pending'&&r.rescheduleProposal.to.date===date);
 const slots=examiner.slots.filter(s=>s.date===date).slice().sort((a,b)=>a.time.localeCompare(b.time)||a.id.localeCompare(b.id)).map(slot=>{
  const booked=confirmed.some(r=>r.slotId===slot.id),waiting=pending.filter(r=>r.slotId===slot.id);
  return {...slot,confirmed:booked,blocked:confirmed.length>0&&!booked,pending:waiting.length,removable:confirmed.length===0&&waiting.length===0};
 });
 return {date,slots,confirmed,pending,proposals,openings:confirmed.length?0:slots.length};
}
