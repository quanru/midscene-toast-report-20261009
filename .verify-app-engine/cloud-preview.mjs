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
async function api(path,body){const r=await fetch(`https://api.github.com/repos/${repo}/${path}`,{method:'POST',headers:{authorization:`Bearer ${process.env.GITHUB_TOKEN}`,accept:'application/vnd.github+json','content-type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error(`GitHub ${r.status}`);return r.json();}
const dep=await api('deployments',{ref:sha,environment:'Verify Preview',auto_merge:false,required_contexts:[],description:'Exact unmerged PR commit built on GitHub Actions'});
await api(`deployments/${dep.id}/statuses`,{state:'success',environment:'Verify Preview',environment_url:origin+'/preview/index.html',auto_inactive:false});
await fs.writeFile('.verify-app-engine/preview-receipt.json',JSON.stringify({repository:repo,sha,deploymentId:dep.id,runnerEnvironment:'github-actions',workflowRun:`https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`,sourceDigest:createHash('sha256').update(source).digest('hex'),previewDigest:createHash('sha256').update(html).digest('hex')},null,2));
console.log(JSON.stringify({sha,deploymentId:dep.id}));
