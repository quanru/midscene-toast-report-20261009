import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const repo=process.env.GITHUB_REPOSITORY,sha=process.env.GITHUB_SHA;
if(repo!=='quanru/midscene-toast-report-20261009'||!/^\w{40}$/.test(sha))throw Error('Unexpected source');
const origin='https://midscene-verify-live.quanru.workers.dev';
const source=await fs.readFile('index.html','utf8');
const html=source.replace('<meta charset="utf-8">',`<meta charset="utf-8"><base href="https://raw.githubusercontent.com/${repo}/${sha}/">`);
for(const [name,body,type] of [['index.html',html,'text/html; charset=utf-8'],['__revision.json',JSON.stringify({sha}),'application/json']]){
 const r=await fetch(`${origin}/preview/${name}`,{method:'PUT',headers:{authorization:`Bearer ${process.env.VERIFY_RELAY_TOKEN}`,'content-type':type},body,signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Upload ${r.status}`);
}
for(let i=0;i<30;i++){const r=await fetch(origin+'/preview/__revision.json');if(r.ok&&(await r.json()).sha===sha)break;if(i===29)throw Error('Revision propagation');await new Promise(r=>setTimeout(r,2000));}
await fs.writeFile('.verify-app-engine/preview-receipt.json',JSON.stringify({repository:repo,sha,runnerEnvironment:'github-actions',workflowRun:`https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`,sourceDigest:createHash('sha256').update(source).digest('hex'),previewDigest:createHash('sha256').update(html).digest('hex')},null,2));
