const fs=require('fs');
const {chromium,firefox}=require('/workspace/checkride-test-tools/node_modules/playwright');
const OUT=process.env.OUT,SH=process.env.SHOTS;if(!OUT||!SH)throw Error('fresh outputs required');
fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(SH,{recursive:true});
const BASE=process.env.BASE_URL||'http://127.0.0.1:8020';
const APP=process.env.CC_APP||'/workspace/checkride-v4';
let pass=0,fail=0;const results=[];
const check=(name,yes,data)=>{results.push({name,pass:!!yes,data});yes?pass++:fail++;console.log(yes?'PASS':'FAIL',name,yes?'':JSON.stringify(data)?.slice(0,400));};

(async()=>{
  // Static: SVG lockups present; PNG no longer live-referenced
  const app=fs.readFileSync(APP+'/app.js','utf8');
  const idx=fs.readFileSync(APP+'/index.html','utf8');
  const sw=fs.readFileSync(APP+'/sw.js','utf8');
  check('BRAND_LOGO site uses SVG lockups', /checkride-connect-logo-light\.svg/.test(app)&&/checkride-connect-logo-dark\.svg/.test(app)&&!/checkride-connect-logo-light\.png/.test(app.split('BRAND_LOGO')[1].slice(0,500)));
  check('index.html SVG lockups 133x38 alt preserved', /src="brand\/checkride-connect-logo-light\.svg" width="133" height="38" alt="Checkride Connect"/.test(idx)&&/src="brand\/checkride-connect-logo-dark\.svg" width="133" height="38" alt="Checkride Connect"/.test(idx));
  check('SW v7.21.0', /const VERSION = "cc-proto-v7\.21\.0"/.test(sw));
  check('SW precaches SVG lockups + mark-on-navy', /brand\/checkride-connect-logo-light\.svg/.test(sw)&&/brand\/checkride-connect-mark-on-navy\.svg/.test(sw)&&!/brand\/checkride-connect-logo-light\.png/.test(sw));
  for (const rel of [
    'brand/checkride-connect-logo-light.svg','brand/checkride-connect-logo-dark.svg',
    'brand/checkride-connect-mark-on-navy.svg','brand/checkride-connect-mark-mono-white.svg',
    'icons/icon-512.png','icons/icon-192.png','icons/favicon.svg','favicon.ico'
  ]) {
    const st=fs.statSync(APP+'/'+rel);
    check('asset present '+rel, st.isFile()&&st.size>100, st.size);
  }
  // Contrast facts (non-text ≥3:1 on navy)
  const contrast=JSON.parse(fs.readFileSync(APP+'/brand/contrast-qa085.json','utf8'));
  const onNavy=contrast.measured.find(r=>r.label.includes('mark-on-navy'));
  const bad=contrast.measured.find(r=>r.label.includes('DO NOT USE'));
  check('mark-on-navy ≥3:1 on #15273F', onNavy&&onNavy.ratio>=3&&onNavy.pass_nontext_3, onNavy);
  check('standard #3860E3 on navy fails (<3)', bad&&bad.ratio<3&&!bad.pass_nontext_3, bad);

  // Brand Designer §8 exact strings
  const view=(app.match(/"saved\.view":\s*"([^"]*)"/)||[])[1];
  const corr=(app.match(/"saved\.corrupt_cleared":\s*"((?:\\.|[^"\\])*)"/)||[])[1];
  check('saved.view exact §8', view==='View Saved', view);
  check('saved.corrupt_cleared exact §8 U+0027', corr==="Some saved items couldn't be read, so they were removed from this browser. Nothing was sent."&&corr.includes("'")&&!corr.includes("\u2019"), corr);

  for (const [name,type] of [['chromium',chromium],['firefox',firefox]]) {
    const b=await type.launch();
    for (const theme of ['light','dark']) {
      const ctx=await b.newContext({timezoneId:'America/New_York',colorScheme:theme==='dark'?'dark':'light',viewport:{width:1280,height:800}});
      const p=await ctx.newPage();
      const external=[];
      p.on('request',r=>{if(!r.url().startsWith(BASE)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url())});
      await p.goto(BASE+'/?demo=promo#/',{waitUntil:'networkidle'});
      await p.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
      await p.waitForTimeout(200);
      const light=await p.locator('.brand img.lockup-light').first();
      const dark=await p.locator('.brand img.lockup-dark').first();
      const lightSrc=await light.getAttribute('src');
      const darkSrc=await dark.getAttribute('src');
      const lightDisp=await light.evaluate(e=>getComputedStyle(e).display);
      const darkDisp=await dark.evaluate(e=>getComputedStyle(e).display);
      check(name+' '+theme+' light src SVG', lightSrc&&lightSrc.endsWith('checkride-connect-logo-light.svg'), lightSrc);
      check(name+' '+theme+' dark src SVG', darkSrc&&darkSrc.endsWith('checkride-connect-logo-dark.svg'), darkSrc);
      check(name+' '+theme+' visible lockup', theme==='dark'?darkDisp!=='none'&&lightDisp==='none':lightDisp!=='none'&&darkDisp==='none',{lightDisp,darkDisp});
      const box=await (theme==='dark'?dark:light).boundingBox();
      check(name+' '+theme+' lockup size ~133x38', box&&Math.abs(box.height-38)<4&&box.width>80,{box});
      const alt=await p.locator('.brand img.lockup-light').getAttribute('alt');
      check(name+' '+theme+' alt Checkride Connect', alt==='Checkride Connect', alt);
      // HTTP 200 for SVG assets, no external brand CDN
      for (const u of [lightSrc,darkSrc]) {
        const st=await p.evaluate(async u=>(await fetch(u)).status,u);
        check(name+' '+theme+' fetch '+u+' 200', st===200, st);
      }
      check(name+' '+theme+' no external requests', external.length===0, external);
      await p.screenshot({path:`${SH}/${name}-${theme}-header-logo.png`});
      // Auth landing logo
      await p.goto(BASE+'/?demo=promo#/login',{waitUntil:'networkidle'});
      await p.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
      await p.waitForTimeout(150);
      const authSrc=await p.locator('.v4-auth-logo img.lockup-light, .brand img.lockup-light').first().getAttribute('src').catch(()=>null)
        || await p.locator('img.lockup-light').first().getAttribute('src');
      check(name+' '+theme+' auth/login lockup SVG', authSrc&&authSrc.includes('checkride-connect-logo-light.svg'), authSrc);
      await p.screenshot({path:`${SH}/${name}-${theme}-login-logo.png`});
      await ctx.close();
    }
    await b.close();
  }
  fs.writeFileSync(OUT+'/logo-qa085.json',JSON.stringify({pass,fail,results,contrast},null,2));
  console.log(`LOGO QA-085 RESULT ${pass} passed, ${fail} failed`);
  process.exitCode=fail?1:0;
})().catch(e=>{console.error(e);process.exit(2);});
