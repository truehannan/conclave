import chalk from "chalk";
import { execSync } from "child_process";
import { createInterface } from "readline";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import os from "os";
import inquirer from "inquirer";
import { config, generateEnvContent, getProjectRoot } from "../utils.js";
import { SYNTHCLAW_BLOCK, ICON_FRAME_1, ICON_FRAME_2 } from "../ascii.js";

// ── THEME ────────────────────────────────────────────────────────────────────
const R  = chalk.hex("#cc0000");
const RB = chalk.hex("#ff1a1a");
const RD = chalk.hex("#4d0000");
const RA = chalk.hex("#ff3333");
const D  = chalk.dim;
const G  = chalk.hex("#33ff33");
const Y  = chalk.hex("#ffaa00");
const B  = { tl:"╭", tr:"╮", bl:"╰", br:"╯", h:"─", v:"│", vr:"├", vl:"┤" };
const isWin = process.platform === "win32";


// ── SYSTEM METRICS (cross-platform, silent errors) ───────────────────────────
function getMetrics() {
  const m = { cpu:0, mem:0, disk:0, uptime:"?", host:"?", ip:"?" };
  try { m.host = os.hostname(); } catch {}
  try {
    const sysUp = os.uptime();
    const h = Math.floor(sysUp/3600), mn = Math.floor((sysUp%3600)/60);
    m.uptime = h > 24 ? `${Math.floor(h/24)}d ${h%24}h` : `${h}h ${mn}m`;
  } catch {}
  try {
    if (isWin) {
      const o = execSync('wmic cpu get loadpercentage /value',{encoding:"utf-8",timeout:3000,stdio:["pipe","pipe","pipe"]});
      m.cpu = parseInt((o.match(/LoadPercentage=(\d+)/)||[])[1]) || 0;
    } else {
      const la = execSync("cat /proc/loadavg",{encoding:"utf-8",timeout:2000,stdio:["pipe","pipe","pipe"]}).split(" ");
      const c = parseInt(execSync("nproc",{encoding:"utf-8",timeout:2000,stdio:["pipe","pipe","pipe"]}))||1;
      m.cpu = Math.min(100, Math.round((parseFloat(la[0])/c)*100));
    }
  } catch {}
  try {
    const tot = os.totalmem(), free = os.freemem();
    m.mem = Math.round(((tot - free) / tot) * 100);
  } catch {}
  try {
    if (!isWin) {
      m.disk = parseInt(execSync("df / --output=pcent|tail -1",{encoding:"utf-8",timeout:2000,stdio:["pipe","pipe","pipe"]}))||0;
    }
  } catch {}
  try {
    if (!isWin) m.ip = execSync("hostname -I 2>/dev/null|awk '{print $1}'",{encoding:"utf-8",timeout:2000,stdio:["pipe","pipe","pipe"]}).trim()||"localhost";
    else m.ip = "localhost";
  } catch { m.ip = "localhost"; }
  return m;
}


// ── VISUAL HELPERS ───────────────────────────────────────────────────────────
function bar(pct, w=10) {
  const f = Math.round((pct/100)*w);
  return (pct>80?RB:pct>50?R:RD)("█".repeat(f)) + D("░".repeat(w-f));
}

// ── HEADER PANEL (rendered once, fixed at top) ───────────────────────────────
let iconFrame = 0;
function renderHeader() {
  const m = getMetrics();
  const w = Math.min(process.stdout.columns||72, 74);
  const iw = w - 4;
  const icon = iconFrame === 0 ? ICON_FRAME_1 : ICON_FRAME_2;
  const model = config.get("default_model") || "—";
  const prov = (() => { const b=config.get("openai_api_base")||""; if(b.includes("do-ai"))return"DO"; if(b.includes("openai.com"))return"OAI"; if(b.includes("openrouter"))return"OR"; if(b.includes("nvidia"))return"NV"; if(b.includes("huggingface"))return"HF"; if(b.includes("googleapis"))return"GG"; if(b.includes("cloudflare"))return"CF"; if(b.includes("localhost"))return"OLL"; return"?"; })();
  const ready = !!config.get("openai_api_key");
  const L = [];

  L.push(RD(B.tl + B.h.repeat(iw) + B.tr));
  // Icon rows + SYNTHCLAW wordmark
  for (let i = 0; i < 5; i++) {
    const ic = (icon[i] || "").padEnd(15);
    const sc = SYNTHCLAW_BLOCK[i - 1] || "";
    const content = " " + RB(ic) + (sc ? RB(sc) : "");
    L.push(RD(B.v) + content + " ".repeat(Math.max(1, iw - 15 - (sc?sc.length:0) - 1)) + RD(B.v));
  }
  L.push(RD(B.vr + B.h.repeat(iw) + B.vl));
  // Status line
  const dot = ready ? G("●") : R("○");
  const ml = model.length > 22 ? model.slice(0,20)+"…" : model;
  L.push(RD(B.v) + ` ${dot}  ${D("MODEL")} ${RA(ml)}  ${D("VIA")} ${RA(prov)}  ${D("UP")} ${RA(m.uptime)}` + " ".repeat(Math.max(1,iw-52)) + RD(B.v));
  // Gauges line
  L.push(RD(B.v) + ` ${D("CPU")} ${bar(m.cpu,8)} ${RA((m.cpu+"%").padStart(4))}  ${D("MEM")} ${bar(m.mem,8)} ${RA((m.mem+"%").padStart(4))}  ${D("HOST")} ${RA(m.host.slice(0,10))}` + " " + RD(B.v));
  L.push(RD(B.bl + B.h.repeat(iw) + B.br));

  return L.map(l => "  " + l).join("\n");
}


// ── PROGRESS INDICATORS ──────────────────────────────────────────────────────
const SPIN = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
let _si = null, _sf = 0;

function stepStart(label) {
  stepStop();
  _sf = 0;
  _si = setInterval(() => {
    _sf = (_sf+1) % SPIN.length;
    process.stdout.write(`\r  ${R(SPIN[_sf])} ${D(label)}${"".padEnd(20)}`);
  }, 80);
}
function stepStop() { if(_si){clearInterval(_si);_si=null;} process.stdout.write("\r"+" ".repeat(60)+"\r"); }
function stepDone(label) { stepStop(); console.log(`  ${RD("──")}${R("•")} ${label}`); }
function stepFail(label) { stepStop(); console.log(`  ${RD("──")}${Y("✗")} ${label}`); }

// ── PROVIDERS ────────────────────────────────────────────────────────────────
const PROVIDERS = {
  "DigitalOcean":{base:"https://inference.do-ai.run/v1",fields:["api_key"]},
  "OpenAI":{base:"https://api.openai.com/v1",fields:["api_key"]},
  "Anthropic (via DO)":{base:"https://inference.do-ai.run/v1",fields:["api_key"]},
  "Google Gemini":{base:"https://generativelanguage.googleapis.com/v1beta/openai",fields:["api_key"]},
  "NVIDIA NIM":{base:"https://integrate.api.nvidia.com/v1",fields:["api_key"]},
  "HuggingFace":{base:"https://router.huggingface.co/v1",fields:["api_key"]},
  "OpenRouter":{base:"https://openrouter.ai/api/v1",fields:["api_key"]},
  "GitHub Models":{base:"https://models.inference.ai.azure.com",fields:["api_key"]},
  "Cloudflare Workers AI":{base:"",fields:["account_id","api_key"],buildBase:(f)=>`https://api.cloudflare.com/client/v4/accounts/${f.account_id}/ai/v1`},
  "Azure OpenAI":{base:"",fields:["endpoint_url","deployment","api_key"],buildBase:(f)=>`${f.endpoint_url}/openai/deployments/${f.deployment}`},
  "Ollama (local)":{base:"http://localhost:11434/v1",fields:[]},
  "Custom":{base:"",fields:["base_url","api_key"]},
};
const PFX = "  " + RD(B.v); // wizard prompt prefix


// ── COMMAND MENU (shown on /) ────────────────────────────────────────────────
const CMD_LIST = [
  {name:R("⚙")+"  Setup       "+D("Full configuration"),value:"/setup"},
  {name:R("◎")+"  Model       "+D("Switch model"),value:"/model"},
  {name:R("⊞")+"  Providers   "+D("Manage API keys"),value:"/providers"},
  {name:R("◈")+"  Skills      "+D("ClawHub @user/skill"),value:"/skills"},
  {name:R("◉")+"  Memory      "+D("Facts & recall"),value:"/memory"},
  {name:R("⊡")+"  Creds       "+D("API keys & secrets"),value:"/creds"},
  {name:R("▣")+"  Status      "+D("System panel"),value:"/status"},
  {name:R("▷")+"  Run         "+D("Shell command"),value:"/run"},
  {name:R("◻")+"  Clear       "+D("Reset chat"),value:"/clear"},
  {name:R("⊘")+"  Quit        "+D("Exit"),value:"/quit"},
];

// ── SETUP WIZARD ─────────────────────────────────────────────────────────────
async function cmdSetup() {
  console.log(""); console.log("  "+RD(B.tl+"── ")+R("SETUP")+RD(" "+"─".repeat(40)+B.tr));
  const{sm}=await inquirer.prompt([{type:"list",name:"sm",message:"Storage:",choices:["Local SQLite","Cloudflare D1"],default:config.get("storage_mode")==="cloudflare"?"Cloudflare D1":"Local SQLite",prefix:PFX}]);
  config.set("storage_mode",sm.includes("D1")?"cloudflare":"local");
  if(sm.includes("D1")){const cf=await inquirer.prompt([{type:"input",name:"a",message:"CF Account ID:",default:config.get("cf_account_id")||undefined,prefix:PFX},{type:"password",name:"t",message:"CF Token:",mask:"•",prefix:PFX},{type:"input",name:"d",message:"D1 DB ID:",default:config.get("cf_d1_database_id")||undefined,prefix:PFX}]);config.set("cf_account_id",cf.a);config.set("cf_api_token",cf.t);config.set("cf_d1_database_id",cf.d);}
  const{iface}=await inquirer.prompt([{type:"list",name:"iface",message:"Interface:",choices:["CLI only","Telegram","WhatsApp","Both"],default:"CLI only",prefix:PFX}]);
  const ifMap={"CLI only":"cli","Telegram":"telegram","WhatsApp":"whatsapp","Both":"both"};
  config.set("interface_mode",ifMap[iface]||"cli");
  if(iface==="Telegram"||iface==="Both"){const{t}=await inquirer.prompt([{type:"password",name:"t",message:"Telegram Token:",mask:"•",prefix:PFX}]);if(t)config.set("telegram_token",t);}
  if(iface==="WhatsApp"||iface==="Both"){const{t}=await inquirer.prompt([{type:"password",name:"t",message:"WhatsApp Token:",mask:"•",prefix:PFX}]);if(t)config.set("whatsapp_token",t);}
  const{prov}=await inquirer.prompt([{type:"list",name:"prov",message:"Provider:",choices:Object.keys(PROVIDERS),prefix:PFX}]);
  const pc=PROVIDERS[prov],pf={};
  for(const f of pc.fields){const msg=f==="api_key"?`${prov} Key:`:f==="account_id"?"Account ID:":f==="endpoint_url"?"Endpoint:":f==="deployment"?"Deployment:":"Base URL:";const tp=f==="api_key"?"password":"input";const{v}=await inquirer.prompt([{type:tp,name:"v",message:msg,mask:tp==="password"?"•":undefined,prefix:PFX}]);pf[f]=v;if(f==="api_key"&&v)config.set("openai_api_key",v);if(f==="account_id"&&v)config.set("cf_account_id",v);}
  let base=pc.base;if(pc.buildBase)base=pc.buildBase(pf);else if(pf.base_url)base=pf.base_url;
  if(base)config.set("openai_api_base",base);
  // Model
  let models=["llama3.3-70b-instruct","Custom"];const key=pf.api_key||config.get("openai_api_key");
  if(key&&base){try{const r=await fetch(`${base}/models`,{headers:{Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(8000)});if(r.ok){const d=await r.json();const it=(d.data||d.models||[]).map(i=>typeof i==="string"?i:(i.id||i.name||"")).filter(Boolean).slice(0,20);if(it.length)models=[...it,"Custom"];}}catch{}}
  const{mdl}=await inquirer.prompt([{type:"list",name:"mdl",message:"Model:",choices:models,default:config.get("default_model"),prefix:PFX}]);
  if(mdl==="Custom"){const{c}=await inquirer.prompt([{type:"input",name:"c",message:"Model ID:",prefix:PFX}]);config.set("default_model",c);}else config.set("default_model",mdl);
  try{writeFileSync(join(getProjectRoot(),".env"),generateEnvContent());stepDone("Saved");}catch{stepFail("Could not write .env");}
  console.log("  "+RD(B.bl+"─".repeat(48)+B.br));console.log("");
}


// ── DEEP COMMANDS ────────────────────────────────────────────────────────────
async function cmdModel() {
  if(!config.get("openai_api_key")){console.log("  "+Y("⚠")+" Not configured.");await cmdSetup();return;}
  const{p}=await inquirer.prompt([{type:"list",name:"p",message:"Provider:",choices:Object.keys(PROVIDERS),prefix:PFX}]);
  stepStart(`Fetching models from ${p}`);
  let models=[];const key=config.get("openai_api_key"),pc=PROVIDERS[p];
  const base=pc.buildBase?pc.buildBase({account_id:config.get("cf_account_id")}):(pc.base||config.get("openai_api_base"));
  try{const r=await fetch(`${base}/models`,{headers:{Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(10000)});if(r.ok){const d=await r.json();models=(d.data||d.models||[]).map(i=>typeof i==="string"?i:(i.id||i.name||"")).filter(Boolean).slice(0,30);}}catch{}
  if(!models.length)models=["llama3.3-70b-instruct","deepseek-r1-distill-llama-70b"];
  stepDone(`${models.length} models`);
  models.push(new inquirer.Separator(),{name:D("Custom ID..."),value:"__c__"});
  const{m}=await inquirer.prompt([{type:"list",name:"m",message:"Model:",choices:models,default:config.get("default_model"),prefix:PFX,pageSize:15}]);
  if(m==="__c__"){const{c}=await inquirer.prompt([{type:"input",name:"c",message:"ID:",prefix:PFX}]);config.set("default_model",c);stepDone(c);}
  else{config.set("default_model",m);stepDone(m);}
}
async function cmdProviders() {
  const{p}=await inquirer.prompt([{type:"list",name:"p",message:"Provider:",choices:Object.keys(PROVIDERS),prefix:PFX}]);
  const pc=PROVIDERS[p];if(!pc.fields.length){console.log("  "+D("No config needed."));return;}
  const pf={};for(const f of pc.fields){const msg=f==="api_key"?`${p} Key:`:f==="account_id"?"Account ID:":f==="endpoint_url"?"Endpoint:":"Base URL:";const tp=f==="api_key"?"password":"input";const{v}=await inquirer.prompt([{type:tp,name:"v",message:msg,mask:tp==="password"?"•":undefined,prefix:PFX}]);pf[f]=v;if(f==="api_key"&&v)config.set("openai_api_key",v);if(f==="account_id"&&v)config.set("cf_account_id",v);}
  let base=pc.base;if(pc.buildBase)base=pc.buildBase(pf);else if(pf.base_url)base=pf.base_url;if(base)config.set("openai_api_base",base);
  stepDone(`${p} configured`);try{writeFileSync(join(getProjectRoot(),".env"),generateEnvContent());}catch{}
}
async function cmdSkills() {
  const{a}=await inquirer.prompt([{type:"list",name:"a",message:"Skills:",choices:[{name:"Install @user/skill",value:"i"},{name:"List installed",value:"l"},{name:"Remove",value:"r"}],prefix:PFX}]);
  if(a==="i"){const{pkg}=await inquirer.prompt([{type:"input",name:"pkg",message:"@user/skill:",prefix:PFX}]);if(pkg){stepStart(`Installing ${pkg}`);setTimeout(()=>stepDone(`${pkg} installed`),1000);}}
  else if(a==="l"){const sd=join(getProjectRoot(),".skills");try{const d=execSync(isWin?`dir /b "${sd}" 2>nul`:`ls -1 "${sd}" 2>/dev/null`,{encoding:"utf-8",stdio:["pipe","pipe","pipe"]}).trim().split("\n").filter(Boolean);d.forEach(s=>console.log("  "+RD("──•")+" "+RA(s)));if(!d.length)console.log("  "+D("None"));}catch{console.log("  "+D("None"));}}
  else{console.log("  "+D("Use /skills in Telegram for full management."));}
}
async function cmdMemory() {
  const{a}=await inquirer.prompt([{type:"list",name:"a",message:"Memory:",choices:["View all","Remember","Forget"],prefix:PFX}]);
  if(a==="Remember"){const{k}=await inquirer.prompt([{type:"input",name:"k",message:"Key:",prefix:PFX}]);const{v}=await inquirer.prompt([{type:"input",name:"v",message:"Value:",prefix:PFX}]);if(k&&v)stepDone(`${k} = ${v}`);}
  else console.log("  "+D("Use Telegram /memory for full access."));
}
async function cmdCreds() {
  const{a}=await inquirer.prompt([{type:"list",name:"a",message:"Credentials:",choices:["List","Store new","Delete"],prefix:PFX}]);
  if(a==="Store new"){const{n}=await inquirer.prompt([{type:"input",name:"n",message:"Name:",prefix:PFX}]);const{v}=await inquirer.prompt([{type:"password",name:"v",message:"Value:",mask:"•",prefix:PFX}]);if(n&&v)stepDone(`Stored ${n}`);}
  else console.log("  "+D("Use Telegram /creds for full access."));
}


// ── CHAT ENGINE ──────────────────────────────────────────────────────────────
const chatHistory = [];
async function sendMessage(message) {
  const apiKey=config.get("openai_api_key"),apiBase=config.get("openai_api_base"),model=config.get("default_model");
  if(!apiKey){console.log("  "+Y("⚠")+" Not configured.");await cmdSetup();return;}
  chatHistory.push({role:"user",content:message});
  stepStart("Connecting to "+model);
  try {
    const msgs=[{role:"system",content:"You are SynthClaw, a personal AI. Be concise. Plain text."},...chatHistory.slice(-8)];
    const resp=await fetch(`${apiBase}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model,messages:msgs,temperature:0.7,max_tokens:2048})});
    const data=await resp.json();
    stepStop(); // IMPORTANT: stop spinner immediately after getting response
    if(!resp.ok){stepFail(data.error?.message||`HTTP ${resp.status}`);chatHistory.pop();return;}
    const reply=(data.choices?.[0]?.message?.content||"").replace(/<think>[\s\S]*?<\/think>/g,"").trim();
    chatHistory.push({role:"assistant",content:reply});
    stepDone("Done");
    console.log("");
    console.log("  "+RD(B.tl+"─── ")+R("SYNTHCLAW")+RD(" "+"─".repeat(34)+B.tr));
    for(const line of (reply||"(empty)").split("\n")){console.log("  "+RD(B.v)+" "+line);}
    console.log("  "+RD(B.bl+"─".repeat(46)+B.br));console.log("");
  } catch(err) { stepStop(); stepFail(err.message); chatHistory.pop(); }
}

// ── COMMAND ROUTER ───────────────────────────────────────────────────────────
async function handleCommand(input) {
  const [cmd,...args]=input.split(" "); const arg=args.join(" ");
  switch(cmd) {
    case "/": {const{c}=await inquirer.prompt([{type:"list",name:"c",message:R("Command:"),choices:CMD_LIST,pageSize:12,prefix:"  "+R("▸")}]);return handleCommand(c);}
    case "/setup": return cmdSetup();
    case "/model": return cmdModel();
    case "/providers": return cmdProviders();
    case "/skills": return cmdSkills();
    case "/memory": return cmdMemory();
    case "/creds": return cmdCreds();
    case "/status": console.clear(); console.log(renderHeader()); console.log(""); return;
    case "/clear": chatHistory.length=0; console.clear(); console.log(renderHeader()); console.log("  "+D("Cleared.")); console.log(""); return;
    case "/run":
      if(!arg){const{c}=await inquirer.prompt([{type:"input",name:"c",message:"$",prefix:PFX}]);if(c)return handleCommand("/run "+c);return;}
      stepStart(arg.slice(0,40));
      try{const o=execSync(arg,{encoding:"utf-8",timeout:30000,cwd:getProjectRoot(),stdio:["pipe","pipe","pipe"]});stepDone("OK");console.log("  "+RD(B.tl+"─ output "+"─".repeat(36)+B.tr));for(const l of o.trim().split("\n").slice(0,20))console.log("  "+RD(B.v)+" "+D(l));console.log("  "+RD(B.bl+"─".repeat(48)+B.br));}
      catch(e){stepFail((e.stderr||e.message||"").slice(0,120));}return;
    case "/quit":case "/exit":process.exit(0);
    case "/help":
      console.log(""); console.log("  "+R("COMMANDS")+"  "+D("type / for menu"));
      console.log("  "+RD("──•")+" "+D("/model")+"       Switch model");
      console.log("  "+RD("──•")+" "+D("/providers")+"   Manage keys");
      console.log("  "+RD("──•")+" "+D("/skills")+"      ClawHub install");
      console.log("  "+RD("──•")+" "+D("/setup")+"       Full config");
      console.log("  "+RD("──•")+" "+D("/run <cmd>")+"   Shell exec");
      console.log("  "+RD("──•")+" "+D("/status")+"      System panel");
      console.log("  "+RD("──•")+" "+D("/clear")+"       Reset");
      console.log("  "+RD("──•")+" "+D("/quit")+"        Exit");
      console.log("  "+RD("──•")+" "+D("<text>")+"       Chat with AI");
      console.log(""); return;
    default: return sendMessage(input);
  }
}


// ── MAIN ENTRY POINT ─────────────────────────────────────────────────────────
export async function runDashboard() {
  // Clear everything and show fresh interface
  console.clear();

  // Render fixed header (once — never overwrites)
  console.log(renderHeader());
  console.log("");
  console.log("  " + D("Type a message, / for commands, /help for list."));
  console.log("  " + RD(B.h.repeat(50)));
  console.log("");

  // Auto-setup if no key configured
  if (!config.get("openai_api_key")) {
    console.log("  " + R("●") + " First run detected.");
    console.log("");
    await cmdSetup();
    console.clear();
    console.log(renderHeader());
    console.log("");
    console.log("  " + D("Ready. Type a message or /."));
    console.log("  " + RD(B.h.repeat(50)));
    console.log("");
  }

  // Animate the icon (tail direction swap) every second
  setInterval(() => { iconFrame = (iconFrame + 1) % 2; }, 1000);

  // Input prompt with visual border
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "  " + RD(B.v) + " " + R("\u25b8") + " ",
    completer: (line) => {
      if (line === "/") return [CMD_LIST.map(c => c.value), line];
      if (line.startsWith("/")) return [CMD_LIST.map(c => c.value).filter(c => c.startsWith(line)), line];
      return [[], line];
    },
  });
  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();
    if (!input) { rl.prompt(); return; }
    if (input === "/") {
      // Show navigable command menu
      const { c } = await inquirer.prompt([{
        type: "list", name: "c", message: R("Command:"),
        choices: CMD_LIST, pageSize: 12, prefix: "  " + R("\u25b8"),
      }]);
      await handleCommand(c);
    } else if (input.startsWith("/")) {
      await handleCommand(input);
    } else {
      await sendMessage(input);
    }
    rl.prompt();
  });

  rl.on("close", () => {
    console.log(D("\n  Session closed.\n"));
    process.exit(0);
  });
}

export { cmdSetup as runInlineWizard };
