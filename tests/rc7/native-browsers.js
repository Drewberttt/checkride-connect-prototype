// D44 portable Chromium/Firefox definition; Recovered local Playwright execution; see evidence for actual results. Derived from rc6 suite; its >2-place expectations are explicitly superseded. No dependencies added to runtime.
const {chromium,firefox}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs');const path=require('path');
const OUT=process.env.OUT||'/tmp/t5/rc7-20261107/browser-portable';const SH=process.env.SHOTS||'/workspace/checkride-connect-shots/v4-rc7/portable-unrun/';
fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(SH,{recursive:true});
let passed=0,failed=0;const results=[];
function check(browser,name,yes,data){const r={browser,name,pass:!!yes,data};results.push(r);yes?passed++:failed++;console.log(yes?'PASS':'FAIL',browser,name,yes?'':JSON.stringify(data));}
(async()=>{for(const [name,type] of [['chromium',chromium],['firefox',firefox]]){
 const b=await type.launch(name==='chromium'?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']} : {firefoxUserPrefs:{'dom.events.testing.asyncClipboard':true}});
 const ctx=await b.newContext({timezoneId:'America/New_York',viewport:{width:1280,height:1100}});const p=await ctx.newPage();const errors=[],ext=[];
 p.on('pageerror',e=>errors.push(String(e)));p.on('request',r=>{if(!r.url().startsWith('http://localhost:8020/')&&!r.url().startsWith('data:'))ext.push(r.url())});
 await p.goto('http://localhost:8020/?demo=promo#/readiness');await p.evaluate(()=>localStorage.clear());await p.reload();
 const go=async h=>{await p.evaluate(h=>location.hash=h,h);await p.waitForTimeout(250)};
 const more=async()=>{await go('#/readiness');const d=p.locator('#clock-more');if((await d.getAttribute('open'))===null)await d.locator('summary').click()};
 await more();await p.locator('#clock-prep-d0').fill('2026-10-20');await p.locator('#clock-prep-d0').press('Tab');
 const h=i=>p.locator('#clock-prep-h'+i);
 const snap=async()=>p.evaluate(()=>{const i=document.querySelector('#clock-prep-h0');const r=document.querySelector('[data-rule="prep_3h"]');const k=Object.keys(localStorage).find(k=>k.startsWith('cc-connect-proto-v3'));return {value:i&&i.value,bad:i&&i.validity.badInput,aria:i&&i.getAttribute('aria-invalid'),desc:i&&i.getAttribute('aria-describedby'),err:document.querySelector('#clock-prep-h0-err')?.textContent||null,reason:r?.dataset.reason,ack:r?.dataset.cfiAck||'',text:r?.textContent,ignored:document.querySelector('[data-prep-ignored]')?.dataset.prepIgnored||null,stored:k&&JSON.parse(localStorage[k]).clock?.prep}});
 const typed=async(text,i=0)=>{await h(i).fill('');if(text)await h(i).pressSequentially(text,{delay:35});return snap()};
 const blur=async()=>{await h(0).press('Tab');await p.waitForTimeout(100)};
 const tick=async expected=>{await go('#/dpe/d1?cert=ppl');await p.locator('[data-action=request], .slot-row button').first().click();await p.waitForTimeout(400);const present=await p.locator('#req-cfi-reviewed').count();check(name,'tick='+expected,!!present===expected,{present});if(present)check(name,'tick optional; send not disabled',!(await p.locator('#req-cfi-reviewed').getAttribute('required'))&&!(await p.locator('form[data-form=request] button[type=submit]').isDisabled()));await p.keyboard.press('Escape');await p.waitForTimeout(350);await more()};
 let s=await snap();check(name,'date-only is missing',s.reason==='missing'&&!s.err,s);await tick(false);
 const cases=[['0.05',true,'fails'],['0.09',true,'fails'],['0.099999',true,'fails'],['0.1',false,'fails'],['0',true,'fails'],['-5',true,'fails'],['24',false,'ok'],['24.1',true,'fails'],['1000000',true,'fails'],['2.996',true,'fails'],['2.9999999',true,'fails'],['2.9999999999999999',true,'fails'],['3.000',true,'fails'],['3e0',true,'fails'],['3.00',false,'ok'],['1.00',false,'fails'],['3',false,'ok']];
 for(const [v,bad,reason] of cases){s=await typed(v);await blur();s=await snap();check(name,`typed ${v}: bound/error/status`,s.value===v&&(s.aria==='true')===bad&&!!s.err===bad&&s.reason===reason&&(bad?s.ignored==='1':s.ignored===null),s);if(v==='2.996')check(name,'2.996 excluded with precision error',s.aria==='true'&&s.text.includes('logged 0 of 3'),s);if(v==='24.1'){await p.screenshot({path:path.join(SH,name+'-invalid-only-24.1.png'),fullPage:true});await tick(true)}}
 // Actual native clipboard paste, never synthetic insertText.
 await typed('');await h(0).focus();await p.evaluate(()=>{document.querySelector('#clock-prep-h0').addEventListener('beforeinput',e=>window.rc7PasteType=e.inputType)});
 if(name==='chromium')await ctx.grantPermissions(['clipboard-read','clipboard-write']);
 await p.evaluate(()=>navigator.clipboard.writeText('2.9999999999999999'));await h(0).press('Control+V');await blur();s=await snap();check(name,'actual precision clipboard paste/ARIA',s.value==='2.9999999999999999'&&s.aria==='true'&&s.reason==='fails'&&await p.evaluate(()=>window.rc7PasteType)==='insertFromPaste',s);
 await p.screenshot({path:path.join(SH,name+'-precision-pasted-invalid.png'),fullPage:true});
 await p.reload();await more();s=await snap();check(name,'precision clipboard persistence',s.value==='2.9999999999999999'&&s.aria==='true'&&s.reason==='fails',s);
 // blank -> malformed must produce input-time feedback even though native value is empty and change may never fire.
 // D44 / RC7-I01: hours are type=text inputmode=decimal (not number). QA rc10 confirmed prior badInput/empty-value
 // expectations were a stale fixture, not an app regression (qa-report-20261109-1148.md). Align with text-precision-regression.js.
 for(const v of ['e','1e','1,5']){s=await typed(v);const native={value:s.value,badInput:s.bad};await blur();s=await snap();
   {check(name,`typed ${v}: raw text malformed feedback captured immediately`,native.value===v&&!native.badInput&&s.aria==='true'&&!!s.err&&s.reason==='fails'&&s.ignored==='1',{native,s});
    await p.screenshot({path:path.join(SH,name+'-malformed-'+v.replace(/\W/g,'_')+'.png'),fullPage:true});
    await p.reload();await more();s=await snap();check(name,`malformed ${v} survives reload`,s.aria==='true'&&s.stored[0].hours===v&&!s.stored[0].hoursBad&&s.reason==='fails',s);
    await tick(true);
   }
   s=await typed('3');await blur();s=await snap();check(name,`corrected ${v} clears error`,!s.err&&!s.aria&&s.reason==='ok'&&!s.stored[0].hoursBad,s);
 }
 s=await typed('');await blur();s=await snap();check(name,'intentionally cleared = missing, error removed',!s.err&&!s.aria&&s.reason==='missing',s);await tick(false);
 // mixed lower bound, valid evidence, invalid-only, sim and decimal boundary.
 await p.locator('#clock-prep-d1').fill('2026-10-21');await p.locator('#clock-prep-d1').press('Tab');
 await typed('0.09');await typed('2.95',1);await blur();s=await snap();check(name,'0.09+2.95 = 2.95 fails',s.reason==='fails'&&s.text.includes('2.95 of 3')&&s.ignored==='1',s);await tick(true);
 await typed('0.1');await typed('2.9',1);await blur();s=await snap();check(name,'0.1+2.9 = 3 ok',s.reason==='ok'&&!s.ignored,s);
 await typed('30');await typed('3',1);await blur();s=await snap();check(name,'3 valid + invalid 30 = ok with ignored note',s.reason==='ok'&&s.ignored==='1',s);await tick(false);
 await typed('-1',1);await blur();s=await snap();check(name,'two invalid = fails, 2 ignored',s.reason==='fails'&&s.ignored==='2',s);await tick(true);
 await p.reload();await more();s=await snap();check(name,'invalid-only numeric state survives reload',s.reason==='fails'&&s.ignored==='2'&&s.value==='30',s);
 await typed('1.00');await typed('1.9999999999999999',1);await blur();s=await snap();check(name,'raw mixed precision is logged 1 not 3',s.reason==='fails'&&s.text.includes('logged 1 of 3')&&s.ignored==='1',s);await typed('2.00',1);await blur();s=await snap();check(name,'raw mixed corrected =3',s.reason==='ok',s);
 // Decimal triples that binary addition alone can incorrectly leave below 3.
 await p.locator('#clock-prep-d2').fill('2026-10-22');await p.locator('#clock-prep-d2').press('Tab');
 for(const hs of [['0.3','2.3','0.4'],['0.7','1.4','0.9']]){for(let i=0;i<3;i++)await typed(hs[i],i);await blur();s=await snap();check(name,'decimal triple '+hs.join('+')+' = exactly 3',s.reason==='ok'&&!s.ignored,s);}
 await typed('30');await typed('-1',1);await typed('',2);await blur();
 // Accessibility of settled invalid form, keyboard stays live and no replaced input while editing.
 for(const theme of ['light','dark']){await p.evaluate(t=>{localStorage.setItem('cc-theme',t)},theme);await p.reload();await more();await p.waitForTimeout(1600);
 await p.addScriptTag({path:require.resolve(process.env.AXE_MODULE||'axe-core/axe.min.js')});const ax=await p.evaluate(async()=> (await axe.run(document.querySelector('#clock-more'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.map(v=>({id:v.id,n:v.nodes.length})));check(name,`settled invalid form axe ${theme}`,ax.length===0,ax);}
 await typed('');await typed('',1);await blur();s=await snap();check(name,'all blank after correcting invalid = missing',s.reason==='missing'&&!s.ignored,s);
 await p.reload();await more();s=await snap();check(name,'blank persists as missing',s.reason==='missing'&&!s.ignored,s);
 // Actual Send in invalid-only state: optional checked/unchecked, persistence and no native form block.
 for(const checked of [false,true]){
   await p.evaluate(()=>localStorage.clear());await go('#/readiness');await p.reload();await more();await p.locator('#clock-prep-d0').fill('2026-10-20');await p.locator('#clock-prep-d0').press('Tab');await typed('2.9999999999999999');await blur();
   await go('#/dpe/d1?cert=ppl');await p.locator('[data-action=request], .slot-row button').first().click();await p.waitForTimeout(450);
   check(name,`invalid-only Send ${checked}: tick present`,await p.locator('#req-cfi-reviewed').count()===1);
   if(checked)await p.locator('#req-cfi-reviewed').check();
   await p.evaluate(()=>{const f=document.querySelector('form[data-form=request]');f.querySelectorAll('input').forEach(i=>{if(i.type==='hidden'||i.name==='cfiReviewed')return;if(i.type==='checkbox')i.checked=true;else if(i.type==='number')i.value='999';else if(i.type==='date')i.value='2026-10-15';else if(i.type!=='radio'&&!i.value)i.value=i.name==='aircraft'?'N12345 Cessna':'Sample';i.dispatchEvent(new Event('change',{bubbles:true}));i.dispatchEvent(new Event('input',{bubbles:true}))})});
   check(name,`invalid-only Send ${checked}: Send enabled`,!(await p.locator('form[data-form=request] button[type=submit]').isDisabled()));await p.locator('form[data-form=request] button[type=submit]').click();await p.waitForTimeout(600);
   const saved=await p.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('cc-connect-proto-v3'));const s=JSON.parse(localStorage[k]);return {flags:s.bookings.filter(b=>b.mine).map(b=>b.cfiReviewed),raw:s.clock.prep[0].hours}});
   check(name,`invalid-only Send ${checked}: completed and stored`,!(await p.locator('form[data-form=request]').count())&&saved.flags.includes(checked)&&saved.raw==='2.9999999999999999',saved);
 }
 check(name,'normal usage page exceptions / external runtime requests',!errors.length&&!ext.length,{errors,ext});
 await b.close();
 }
 fs.writeFileSync(path.join(OUT,'typed-prep.json'),JSON.stringify({passed,failed,results},null,2));console.log(`TYPED RESULT ${passed} passed, ${failed} failed`);process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=2});
