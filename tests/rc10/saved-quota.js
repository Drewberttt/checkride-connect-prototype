const fs=require('fs');
const {chromium,firefox}=require('/workspace/checkride-test-tools/node_modules/playwright');
const OUT=process.env.OUT,SH=process.env.SHOTS;if(!OUT||!SH)throw Error('fresh outputs required');
fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(SH,{recursive:true});
const BASE=process.env.BASE_URL||'http://127.0.0.1:8020';
const QUOTA="Couldn't save on this device. Free some browser storage, or remove an older saved item, then try again.";
let pass=0,fail=0;const results=[];
const check=(name,yes,data)=>{results.push({name,pass:!!yes,data});yes?pass++:fail++;console.log(yes?'PASS':'FAIL',name,yes?'':JSON.stringify(data)?.slice(0,500));};

(async()=>{
  for(const [name,type] of [['chromium',chromium],['firefox',firefox]]){
    const b=await type.launch();
    const ctx=await b.newContext({timezoneId:'America/New_York',viewport:{width:1280,height:900}});
    const p=await ctx.newPage();
    await p.goto(BASE+'/?demo=promo#/search?cert=ppl&near=XNC01&radius=50',{waitUntil:'networkidle'});
    // Install QuotaExceeded monkeypatch (QA repro)
    await p.evaluate(()=>{
      const proto=Object.getPrototypeOf(localStorage);
      const orig=proto.setItem;
      proto.setItem=function(k,v){
        const e=new DOMException('quota','QuotaExceededError');
        throw e;
      };
      window.__ccOrigSetItem=orig;
    });
    // Save this search — must show quota toast, not success; list unchanged
    const before=await p.evaluate(()=>{
      const k=Object.keys(localStorage).find(x=>x.startsWith('cc-connect-proto-v3'));
      // note: setItem is broken so we read only
      try{const s=JSON.parse(localStorage.getItem(k)||'{}');return {nEx:(s.savedExaminers||[]).length,nSe:(s.savedSearches||[]).length,k};}
      catch(e){return {nEx:0,nSe:0,k:null};}
    });
    await p.locator('[data-action=save-search]').first().click();
    await p.waitForTimeout(400);
    const toast=await p.locator('#toasts .toast').last().textContent().catch(()=>'');
    const live=await p.locator('#saved-live').textContent().catch(()=>'');
    const pressedAfter=await p.locator('[data-action=save-search]').count();
    const mem=await p.evaluate(()=>{
      // in-memory via UI: View Saved link only if something saved
      return {
        viewSaved: !!document.querySelector('[data-copy-key="saved.view"]'),
        toastRole: document.querySelector('#toasts .toast:last-child')?.getAttribute('role')||null,
        liveRole: document.querySelector('#saved-live')?.getAttribute('role')||null,
        liveAria: document.querySelector('#saved-live')?.getAttribute('aria-live')||null,
      };
    });
    check(name+' save-search quota toast exact §8', toast===QUOTA, {toast});
    check(name+' save-search no success toast', !/Search saved/i.test(toast), {toast});
    check(name+' save-search toast role=status', mem.toastRole==='status', mem);
    check(name+' save-search live region polite', mem.liveRole==='status'&&mem.liveAria==='polite', mem);
    check(name+' save-search live announces quota', (live||'').includes("Couldn't save")||toast===QUOTA, {live,toast});
    check(name+' save-search View Saved not introduced', mem.viewSaved===false || before.nSe>0, mem);

    // Restore setItem to seed an examiner, then break again for toggle
    await p.evaluate(()=>{
      if(window.__ccOrigSetItem) Object.getPrototypeOf(localStorage).setItem=window.__ccOrigSetItem;
    });
    await p.goto(BASE+'/?demo=promo#/search?cert=ppl&near=XNC01&radius=50',{waitUntil:'networkidle'});
    // Save one examiner successfully first
    const toggle=p.locator('[data-action=toggle-save-examiner]').first();
    await toggle.waitFor();
    const dpe=await toggle.getAttribute('data-dpe');
    await toggle.click();
    await p.waitForTimeout(300);
    let aria=await p.locator(`[data-action=toggle-save-examiner][data-dpe="${dpe}"]`).getAttribute('aria-pressed');
    check(name+' examiner save works when storage ok', aria==='true', {aria});

    // Break storage again; try remove (toggle off) — should fail and stay saved
    await p.evaluate(()=>{
      const proto=Object.getPrototypeOf(localStorage);
      proto.setItem=function(){ throw new DOMException('quota','QuotaExceededError'); };
    });
    await p.locator(`[data-action=toggle-save-examiner][data-dpe="${dpe}"]`).click();
    await p.waitForTimeout(400);
    const toast2=await p.locator('#toasts .toast').last().textContent().catch(()=>'');
    aria=await p.locator(`[data-action=toggle-save-examiner][data-dpe="${dpe}"]`).getAttribute('aria-pressed');
    check(name+' examiner remove quota toast', toast2===QUOTA, {toast2});
    check(name+' examiner aria-pressed stays true (persisted truth)', aria==='true', {aria});
    check(name+' examiner no false removed success', !/Removed /i.test(toast2), {toast2});

    // Undo path: storage ok remove with undo, then quota on undo restore
    await p.evaluate(()=>{ if(window.__ccOrigSetItem) Object.getPrototypeOf(localStorage).setItem=window.__ccOrigSetItem; });
    await p.goto(BASE+'/?demo=promo#/search?cert=ppl&near=XNC01&radius=50',{waitUntil:'networkidle'});
    // ensure saved
    const t2=p.locator(`[data-action=toggle-save-examiner][data-dpe="${dpe}"]`);
    if((await t2.getAttribute('aria-pressed'))!=='true'){ await t2.click(); await p.waitForTimeout(200); }
    await t2.click(); // remove — success with undo
    await p.waitForTimeout(300);
    check(name+' remove shows undo', await p.locator('#toasts [data-action=saved-undo]').count()===1);
    await p.evaluate(()=>{
      Object.getPrototypeOf(localStorage).setItem=function(){ throw new DOMException('quota','QuotaExceededError'); };
    });
    await p.locator('#toasts [data-action=saved-undo]').click();
    await p.waitForTimeout(400);
    const toast3=await p.locator('#toasts .toast').last().textContent().catch(()=>'');
    const aria3=await p.locator(`[data-action=toggle-save-examiner][data-dpe="${dpe}"]`).getAttribute('aria-pressed');
    check(name+' undo quota shows error not Restored', toast3===QUOTA, {toast3});
    check(name+' undo quota leaves un-saved (disk truth)', aria3==='false', {aria3});

    await p.screenshot({path:`${SH}/${name}-quota.png`, fullPage:true});
    await ctx.close(); await b.close();
  }
  fs.writeFileSync(OUT+'/saved-quota.json',JSON.stringify({pass,fail,results,quota:QUOTA},null,2));
  console.log(`SAVED-QUOTA RESULT ${pass} passed, ${fail} failed`);
  process.exitCode=fail?1:0;
})().catch(e=>{console.error(e);process.exit(2);});
