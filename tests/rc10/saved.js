const fs=require('fs'),{chromium,firefox}=require('/workspace/checkride-test-tools/node_modules/playwright');
const OUT=process.env.OUT,SH=process.env.SHOTS;if(!OUT||!SH)throw Error('fresh OUT and SHOTS required');
fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(SH,{recursive:true});
let pass=0,fail=0;const results=[];
const ck=(browser,name,c,data)=>{results.push({browser,name,pass:!!c,data});c?pass++:fail++;console.log(c?'PASS':'FAIL',browser,name,c?'':JSON.stringify(data))};
(async()=>{
for(const[name,type]of[['chromium',chromium],['firefox',firefox]]){
  const b=await type.launch(),ctx=await b.newContext({timezoneId:'America/New_York',viewport:{width:1280,height:1000},reducedMotion:'reduce'}),p=await ctx.newPage();
  const errors=[],external=[];p.on('pageerror',e=>errors.push(String(e)));p.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8020/')&&!r.url().startsWith('data:'))external.push(r.url())});
  const base='http://127.0.0.1:8020/?demo=promo';
  const go=async h=>{await p.goto(base+h);await p.waitForTimeout(120)};
  const state=()=>p.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('cc-connect-proto-v3'));return k?JSON.parse(localStorage[k]):null});
  const signup=async()=>{await go('#/signup');await p.locator('#signup-name').fill('Example Saved');await p.locator('#signup-email').fill('saved@example.invalid');await p.locator('#signup-password').fill('ExampleOnly123');await p.locator('#signup-goal').selectOption('ir');await p.locator('#signup-age').check();await p.locator('#signup-submit').click();await p.waitForURL('**#/home')};
  await go('#/signup');await p.evaluate(()=>localStorage.clear());await p.reload();await signup();await p.locator('#home-saved').waitFor();
  ck(name,'home shows empty saved section',await p.locator('#home-saved [data-saved-empty-searches]').count()===1&&await p.locator('#home-saved [data-saved-empty-examiners]').count()===1);
  await go('#/more');
  ck(name,'More links to Saved under Your checkride',await p.locator('a[href="#/saved"]').count()>=1&&await p.locator('#nav a').count()===5);
  await go('#/find');
  const firstToggle=p.locator('[data-action=toggle-save-examiner]').first();
  const dpeId=await firstToggle.getAttribute('data-dpe');
  const toggleText=(await firstToggle.locator('.saved-toggle-label').innerText()).trim();
  ck(name,'save toggle labeled Save and aria-pressed false',toggleText==='Save'&&await firstToggle.getAttribute('aria-pressed')==='false');
  await firstToggle.focus();await p.keyboard.press('Enter');
  ck(name,'keyboard save sets aria-pressed true and persists',await p.locator(`[data-action=toggle-save-examiner][data-dpe="${dpeId}"]`).getAttribute('aria-pressed')==='true'&&(await state()).savedExaminers.some(x=>x.dpeId===dpeId));
  await p.waitForTimeout(80);ck(name,'polite live region announces save',await p.locator('#saved-live').innerText().then(t=>/Saved .+\./.test(t)));
  await go(`#/dpe/${dpeId}`);
  ck(name,'profile shows saved pressed state',await p.locator(`[data-action=toggle-save-examiner][data-dpe="${dpeId}"][aria-pressed=true]`).count()===1);
  await go('#/find');
  await p.locator('#find-before').fill('2026-12-31');
  await p.locator('#find-before').evaluate(el=>{el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('input',{bubbles:true}))});
  await p.waitForTimeout(300);
  await p.locator('[data-action=save-search]').evaluate((el,v)=>el.setAttribute('data-before',v),'2026-12-31');
  await p.locator('[data-action=save-search]').click();
  ck(name,'save search stores cert/near/radius/before',await state().then(s=>s.savedSearches.length===1&&s.savedSearches[0].cert==='ir'&&s.savedSearches[0].before==='2026-12-31'&&s.savedSearches[0].radius>0));
  await p.locator('[data-action=save-search]').click();
  ck(name,'duplicate save is idempotent', (await state()).savedSearches.length===1);
  await go('#/home');
  ck(name,'home lists saved search and examiner',await p.locator('#home-saved [data-saved-search]').count()===1&&await p.locator(`#home-saved [data-saved-examiner="${dpeId}"]`).count()===1);
  const cleared=await p.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('cc-connect-proto-v3'));const s=JSON.parse(localStorage[k]);if(!s.savedSearches||!s.savedSearches[0])return {ok:false,s};s.savedSearches[0].seenKeys=[];localStorage[k]=JSON.stringify(s);return {ok:true,n:s.savedSearches.length,row:s.savedSearches[0]}});
  if(!cleared.ok) throw Error('missing saved search before unseen mark '+JSON.stringify(cleared));
  await go('#/home');await p.reload();await p.locator('#home-saved [data-saved-search]').waitFor();
  const nNew=Number(await p.locator('#home-saved [data-saved-new]').first().getAttribute('data-saved-new'));
  ck(name,'new-since count from sample openings when unseen',nNew>0&&await p.locator('#home-saved').innerText().then(t=>t.includes('new since your last visit')||t.includes('new openings for this search')));
  await p.locator('#home-saved [data-action=open-saved-search]').first().click();
  await p.waitForURL(/#\/search\?.*cert=ir/);
  const certSel=p.locator('form[data-form=search] select[name=cert]');
  await certSel.waitFor();
  await p.waitForFunction(()=>document.querySelector('form[data-form=search] select[name=cert]')?.value==='ir');
  const openUrl=p.url();
  const certVal=await certSel.inputValue();
  const beforeVal=await p.locator('form[data-form=search] input[name=before]').inputValue();
  ck(name,'opening saved search uses #/search URL params',/#\/search\?/.test(openUrl)&&openUrl.includes('cert=ir')&&openUrl.includes('before=2026-12-31')&&certVal==='ir'&&beforeVal==='2026-12-31',{openUrl,certVal,beforeVal});
  ck(name,'visit marks openings seen so home new count clears',await state().then(s=>s.savedSearches[0].seenKeys.length>0));
  await go('#/home');
  ck(name,'after visit new count is zero',Number(await p.locator('#home-saved [data-saved-new]').first().getAttribute('data-saved-new'))===0);
  await go('#/saved');
  ck(name,'Saved route §8 headline and lists both',await p.locator('.eyebrow').innerText().then(t=>t.includes('YOUR SHORTLIST'))&&await p.locator('h1.paired').innerText().then(t=>t.includes('Examiners you keep'))&&await p.locator('[data-saved-search]').count()===1&&await p.locator(`[data-saved-examiner="${dpeId}"]`).count()===1);
  await p.locator('[data-action=remove-saved-search]').first().click();
  ck(name,'remove search with undo available',(await state()).savedSearches.length===0&&await p.locator('.toast button:text-is("Undo")').count()===1);
  await p.locator('.toast button:text-is("Undo")').click({force:true});
  ck(name,'undo restores search',(await state()).savedSearches.length===1);
  await p.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('cc-connect-proto-v3'));const s=JSON.parse(localStorage[k]);s.savedExaminers=[{bad:true},{dpeId:'nope'},s.savedExaminers[0]];s.savedSearches=[null,{cert:'ppl',near:'XNC01',radius:50,before:''},s.savedSearches[0],s.savedSearches[0]];localStorage[k]=JSON.stringify(s)});
  await go('#/saved');await p.reload();
  const st=await state();
  ck(name,'corrupt rows cleared/deduped safely',Array.isArray(st.savedExaminers)&&st.savedExaminers.length===1&&st.savedExaminers.every(x=>x&&x.dpeId&&x.dpeId!=='nope')&&Array.isArray(st.savedSearches)&&st.savedSearches.length===2&&st.savedSearches.every(x=>x&&x.cert&&x.near));
  await go('#/alerts');
  await p.locator('#digest-preview summary').click();
  ck(name,'digest exact label unchanged',await p.locator('#digest-preview [data-copy-key="digest.label"]').innerText()==='Preview, nothing is sent');
  ck(name,'digest includes saved search and examiner',await p.locator('[data-digest-saved-search]').count()>=1&&await p.locator(`[data-digest-saved-examiner="${dpeId}"]`).count()===1);
  await go('#/find?cert=atp');
  ck(name,'ATP remains info-only no estimate',await p.locator('[data-info-cert=atp]').innerText().then(t=>t.includes('No estimate yet for this certificate.')));
  ck(name,'no save-search on ATP info panel',await p.locator('[data-action=save-search]').count()===0);
  await go('#/search?cert=ir');
  ck(name,'Search page has Save this search and card toggles',await p.locator('[data-action=save-search]').count()>=1&&await p.locator('[data-action=toggle-save-examiner]').count()>=1);
  for(const theme of['light','dark']){
    await p.evaluate(t=>localStorage.setItem('cc-theme',t),theme);
    for(const width of[360,390,768,1440]){
      await p.setViewportSize({width,height:width<=390?844:1000});
      await go('#/saved');await p.reload();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(width===360?1600:200);
      ck(name,`${theme} ${width} saved no overflow`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      if(width===360){
        await p.addScriptTag({path:'/workspace/checkride-test-tools/node_modules/axe-core/axe.min.js'});
        const ax=await p.evaluate(async()=>(await axe.run(document.querySelector('#app'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
        ck(name,`${theme} settled360 saved axe`,ax.length===0,ax);
        await p.screenshot({path:`${SH}/${name}-${theme}-saved-360.png`,fullPage:true});
        await go('#/home');await p.waitForTimeout(200);await p.screenshot({path:`${SH}/${name}-${theme}-home-saved-360.png`,fullPage:true});
      }
    }
  }
  ck(name,'no crash/external',errors.length===0&&external.length===0,{errors,external});
  await b.close();
}
fs.writeFileSync(OUT+'/saved.json',JSON.stringify({pass,fail,results},null,2));
console.log(`SAVED RESULT ${pass} passed, ${fail} failed`);
process.exitCode=fail?1:0;
})().catch(e=>{fs.writeFileSync(OUT+'/partial-failure.json',JSON.stringify({pass,fail,results,error:String(e)},null,2));console.error(e);process.exit(2)});
