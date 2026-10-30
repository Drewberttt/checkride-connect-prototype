// Calendar dates are Eastern local dates, not UTC instants. No clock or network dependency.
export const emptyFilters = () => ({query:'',certificate:'',airport:'',start:'',end:'',maxFee:'',sort:'earliest'});
const compare = (a,b) => a < b ? -1 : a > b ? 1 : 0;
const validDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value;
};
export function validateFilters(filters) {
  for (const key of ['start','end']) if (filters[key] && !validDate(filters[key])) throw Error('Choose a valid calendar date.');
  if (filters.start && filters.end && filters.start > filters.end) throw Error('The end date must be on or after the start date.');
  if (filters.maxFee !== '' && filters.maxFee != null && (!Number.isFinite(Number(filters.maxFee)) || Number(filters.maxFee) < 0)) throw Error('Enter a maximum sample fee of zero or more.');
}
export function discoverExaminers(state, input = {}, airportNames = {}) {
  const f = {...emptyFilters(),...input}; validateFilters(f);
  const terms = f.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const rows = state.examiners.filter(e => {
    const text = [e.name,e.location,...e.airports,...e.airports.map(a=>airportNames[a] || '')].join(' ').toLowerCase();
    return terms.every(term=>text.includes(term)) && (!f.certificate || e.certificates.includes(f.certificate)) && (!f.airport || e.airports.includes(f.airport)) && (f.maxFee === '' || e.fee <= Number(f.maxFee));
  }).map(examiner => ({examiner,slots:examiner.slots.filter(slot =>
    (!f.airport || slot.airport === f.airport) && (!f.start || slot.date >= f.start) && (!f.end || slot.date <= f.end) &&
    !state.requests.some(r=>r.status === 'accepted' && r.examinerId === examiner.id && r.date === slot.date)
  ).slice().sort((a,b)=>compare(a.date,b.date)||compare(a.time,b.time)||compare(a.id,b.id))}));
  // Keep browsable profiles without openings unless a date window explicitly requests availability.
  return rows.filter(row=>!(f.start || f.end) || row.slots.length).sort((a,b)=> {
    const nameOrder = compare(a.examiner.name,b.examiner.name)||compare(a.examiner.id,b.examiner.id);
    if (f.sort === 'name') return nameOrder;
    if (f.sort === 'fee') return a.examiner.fee-b.examiner.fee || nameOrder;
    const first = row=>row.slots.length ? `${row.slots[0].date}T${row.slots[0].time}` : '~';
    return compare(first(a),first(b)) || nameOrder;
  });
}
