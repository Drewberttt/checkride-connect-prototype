// UI identity and revision checks are independent of the demo's business model.
export function focusKey(element) {
  if (!element) return null;
  if (element.id) return `id:${element.id}`;
  const d = element.dataset || {};
  if (d.checkRequest) return `check:${d.checkRequest}:${d.checkItem}`;
  if (d.action) return `action:${d.action}:${d.id || ''}:${d.proposal || ''}`;
  if (d.page) return `page:${d.page}`;
  if (element.form?.id) return `form:${element.form.id}:${element.name || element.type}`;
  return null;
}
export function revisionChanged(baseline, current) { return baseline !== current; }
export function canRestoreFocus(element) {
  return !!element && !element.disabled && element.isConnected && !element.closest('[hidden], [inert]');
}
export function captureForms(root) {
  return [...root.querySelectorAll('form[id]')].map(form => ({id:form.id, fields:[...form.querySelectorAll('input,select,textarea')].map(el=>({value:el.value,checked:el.checked}))}));
}
export function restoreForms(root, drafts, excluded = null) {
  for (const draft of drafts) {
    if (draft.id === excluded) continue;
    const form = [...root.querySelectorAll('form[id]')].find(f=>f.id === draft.id);
    if (!form) continue;
    [...form.querySelectorAll('input,select,textarea')].forEach((el,i)=>{const field=draft.fields[i];if(field){el.value=field.value;if('checked' in el)el.checked=field.checked;}});
  }
}

// Closed dialogs retain their old DOM until their close event runs. Those fields
// are no longer editable drafts and must not block later page navigation.
export function isActiveDraftForm(form) {
  if (['filters', 'school-filters'].includes(form.id)) return false;
  const dialog = form.closest('dialog');
  return !dialog || dialog.open;
}
