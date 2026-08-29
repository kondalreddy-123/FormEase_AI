import React, { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Bot, Check, CheckCircle2, CircleHelp, FileCheck2,
  FileText, Home, Info, Languages, ListChecks, Menu, Mic, Pencil, Search,
  ShieldCheck, Sparkles, Volume2, X, Zap
} from "lucide-react";
import { checkForm, explainField, understandRequest } from "./aiService";

const STEPS = ["Need", "Service", "Documents", "Form", "AI Check", "Review", "Submitted"];
const demo = {
  name: "Ravi Kumar",
  dob: "2008-08-15",
  age: "25",
  mobile: "987654",
  occupation: "",
  income: "25000",
  incomeFrequency: "",
  purpose: "Education",
  documents: { identity: true, address: true, incomeProof: false, photo: true }
};

function App() {
  const [screen, setScreen] = useState("home");
  const [request, setRequest] = useState("");
  const [understanding, setUnderstanding] = useState(null);
  const [form, setForm] = useState(demo);
  const [issues, setIssues] = useState([]);
  const [checked, setChecked] = useState(false);
  const [docs, setDocs] = useState(demo.documents);
  const [language, setLanguage] = useState("English");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [explain, setExplain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState("");

  const stepIndex = Math.max(0, ["home","need","service","documents","form","check","review","submitted"].indexOf(screen) - 1);
  const progress = useMemo(() => Math.min(100, Math.round((stepIndex / 5) * 100)), [stepIndex]);

  const go = (s) => { setScreen(s); window.scrollTo({top:0, behavior:"smooth"}); };

  function update(key, value) {
    setForm(prev => ({...prev, [key]: value}));
    setChecked(false);
  }

  async function startAI() {
    setLoading(true);
    const result = await understandRequest(request);
    setUnderstanding(result);
    setLoading(false);
    go("service");
  }

  function loadDemo() {
    setForm({...demo, documents: {...demo.documents}});
    setDocs({...demo.documents});
    setChecked(false);
    setIssues([]);
    setRequest("I need an income certificate for college.");
    go("need");
  }

  async function runCheck() {
    setLoading(true);
    const result = await checkForm({...form, documents: docs});
    setIssues(result.issues);
    setChecked(true);
    setLoading(false);
  }

  function submit() {
    setAppId("FE-2026-" + Math.floor(10000 + Math.random() * 89999));
    go("submitted");
  }

  function speak(text) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  }

  return (
    <div className="app">
      <div className="demo-banner">
        <ShieldCheck size={16}/> DEMO MODE — Synthetic data only. No government system is connected.
      </div>

      <header className="topbar">
        <button className="brand" onClick={() => go("home")} aria-label="FormEase AI home">
          <span className="brand-mark"><Sparkles size={19}/></span>
          <span>FormEase <b>AI</b></span>
        </button>
        <nav className={mobileMenu ? "nav open" : "nav"}>
          <button onClick={() => go("home")}>Home</button>
          <button onClick={() => go("need")}>Try Demo</button>
          <button onClick={() => document.getElementById("how")?.scrollIntoView({behavior:"smooth"})}>How it works</button>
          <button onClick={() => setLanguage(language === "English" ? "తెలుగు" : "English")} className="lang"><Languages size={16}/>{language}</button>
        </nav>
        <button className="menu-btn" onClick={() => setMobileMenu(!mobileMenu)}><Menu/></button>
      </header>

      {screen !== "home" && screen !== "submitted" && (
        <div className="progress-wrap">
          <div className="progress-top"><span>Application journey</span><b>{progress}%</b></div>
          <div className="progress"><div style={{width:`${progress}%`}}/></div>
          <div className="step-labels">{STEPS.slice(0,6).map((s,i)=><span key={s} className={i <= stepIndex ? "active":""}>{i+1}. {s}</span>)}</div>
        </div>
      )}

      <main>
        {screen === "home" && <HomePage onStart={() => go("need")} onDemo={loadDemo}/>}
        {screen === "need" && (
          <PageShell eyebrow="STEP 1 · TELL US" title="What do you need help with?"
            subtitle="Describe your need in everyday language. You don't have to know the official form name."
            onBack={() => go("home")}>
            <div className="ai-input-card">
              <div className="ai-orb"><Bot/></div>
              <div className="grow">
                <label htmlFor="need">Tell FormEase what you need</label>
                <textarea id="need" value={request} onChange={e=>setRequest(e.target.value)}
                  placeholder="Example: I need an income certificate for my college scholarship."/>
                <div className="input-actions"><span><Sparkles size={14}/> AI will understand your request</span><button className="icon-btn" onClick={()=>speak(request || "Tell us what you need.")} title="Read aloud"><Volume2 size={18}/></button></div>
              </div>
            </div>
            <div className="suggestions">
              <span>Try an example:</span>
              <button onClick={()=>setRequest("I need an income certificate for college.")}>Income certificate for college</button>
              <button onClick={()=>setRequest("I need proof of family income for a scholarship.")}>Proof of income for scholarship</button>
            </div>
            <div className="actions"><button className="btn ghost" onClick={()=>go("home")}><ArrowLeft/> Back</button><button className="btn primary" disabled={!request.trim() || loading} onClick={startAI}>{loading ? "Understanding..." : "Understand my need"} <ArrowRight/></button></div>
          </PageShell>
        )}

        {screen === "service" && (
          <PageShell eyebrow="STEP 2 · AI GUIDANCE" title="Here's what we understood"
            subtitle="We turn your everyday description into a clear starting point."
            onBack={() => go("need")}>
            <div className="understand-card">
              <div className="check-circle"><Check/></div>
              <div><span className="muted">You may be looking for</span><h2>{understanding?.service || "Income Certificate"}</h2><p>{understanding?.explanation}</p></div>
            </div>
            <div className="two-col">
              <InfoCard icon={<Zap/>} title="Purpose" text={understanding?.purpose || "Education / Scholarship"}/>
              <InfoCard icon={<FileCheck2/>} title="What happens next" text="We'll guide you through the information and documents needed for this demo."/>
            </div>
            <div className="notice"><Info size={18}/><div><b>Guidance, not approval</b><p>This is an independent prototype. Eligibility and document requirements can vary by service and jurisdiction.</p></div></div>
            <div className="actions"><button className="btn ghost" onClick={()=>go("need")}><ArrowLeft/> Back</button><button className="btn primary" onClick={()=>go("documents")}>Continue <ArrowRight/></button></div>
          </PageShell>
        )}

        {screen === "documents" && (
          <PageShell eyebrow="STEP 3 · DOCUMENTS" title="Know what you need before you start"
            subtitle="A clear checklist prevents surprises halfway through an application."
            onBack={() => go("service")}>
            <div className="doc-list">
              {[
                ["identity","Identity proof","Helps identify the applicant."],
                ["address","Address proof","Supports the address entered in the application."],
                ["incomeProof","Income-related document","Supports the income information you report."],
                ["photo","Passport-size photograph","A sample supporting document for this prototype."]
              ].map(([key,title,text])=>(
                <div className="doc-item" key={key}>
                  <button className={"check-box "+(docs[key]?"selected":"")} onClick={()=>setDocs({...docs,[key]:!docs[key]})}>{docs[key] && <Check size={17}/>}</button>
                  <div className="grow"><b>{title}</b><p>{text}</p></div>
                  <button className="text-btn" onClick={()=>setExplain({title,text})}><CircleHelp size={17}/> Why?</button>
                </div>
              ))}
            </div>
            <div className="doc-summary"><FileText/><span><b>{Object.values(docs).filter(Boolean).length} of 4</b> demo documents ready</span></div>
            <div className="actions"><button className="btn ghost" onClick={()=>go("service")}><ArrowLeft/> Back</button><button className="btn primary" onClick={()=>go("form")}>Start guided form <ArrowRight/></button></div>
          </PageShell>
        )}

        {screen === "form" && (
          <PageShell eyebrow="STEP 4 · GUIDED FORM" title="Answer simple questions"
            subtitle="Instead of one long page, FormEase breaks the application into manageable sections."
            onBack={() => go("documents")}>
            <div className="form-card">
              <FormField label="Full name" required value={form.name} onChange={v=>update("name",v)} field="name" onExplain={setExplain}/>
              <FormField label="Date of birth" required type="date" value={form.dob} onChange={v=>update("dob",v)} field="dob" onExplain={setExplain}/>
              <FormField label="Age" type="number" value={form.age} onChange={v=>update("age",v)} field="age" onExplain={setExplain}/>
              <FormField label="Mobile number" required value={form.mobile} onChange={v=>update("mobile",v.replace(/\D/g,"").slice(0,10))} placeholder="10 digits" field="mobile" onExplain={setExplain}/>
              <div className="field">
                <div className="label-row"><label>Occupation <span className="required">*</span></label><button className="explain-btn" onClick={()=>setExplain({title:"Occupation",text:explainField("occupation")})}><CircleHelp size={15}/> Explain</button></div>
                <select value={form.occupation} onChange={e=>update("occupation",e.target.value)}>
                  <option value="">Select an option</option><option>Student</option><option>Government employee</option><option>Private employee</option><option>Business</option><option>Farmer</option><option>Other</option>
                </select>
              </div>
              <div className="field">
                <div className="label-row"><label>Family income <span className="required">*</span></label><button className="explain-btn" onClick={()=>setExplain({title:"Family income",text:explainField("income")})}><CircleHelp size={15}/> Explain</button></div>
                <div className="income-row"><input value={form.income} onChange={e=>update("income",e.target.value.replace(/\D/g,""))} placeholder="e.g. 240000"/><select value={form.incomeFrequency} onChange={e=>update("incomeFrequency",e.target.value)}><option value="">Monthly or yearly?</option><option>Monthly</option><option>Yearly</option></select></div>
                {!form.incomeFrequency && <small className="hint">Please choose the frequency so the amount is not ambiguous.</small>}
              </div>
              <div className="field"><div className="label-row"><label>Purpose <span className="required">*</span></label><button className="explain-btn" onClick={()=>setExplain({title:"Purpose",text:explainField("purpose")})}><CircleHelp size={15}/> Explain</button></div>
                <div className="choice-grid">{["Education","Scholarship","Other"].map(x=><button key={x} className={form.purpose===x?"choice selected": "choice"} onClick={()=>update("purpose",x)}>{form.purpose===x?<Check size={16}/>:<CircleHelp size={16}/>} {x}</button>)}</div>
              </div>
            </div>
            <div className="ai-tip"><Bot size={21}/><div><b>Need help answering?</b><p>Use “Explain” beside a question to translate formal wording into plain language.</p></div></div>
            <div className="actions"><button className="btn ghost" onClick={()=>go("documents")}><ArrowLeft/> Back</button><button className="btn primary" onClick={()=>go("check")}>Check my form <Sparkles/></button></div>
          </PageShell>
        )}

        {screen === "check" && (
          <PageShell eyebrow="STEP 5 · AI FORM CHECK" title="Let's catch mistakes before you submit"
            subtitle="FormEase checks required fields, formats, missing documents and obvious inconsistencies."
            onBack={() => go("form")}>
            {!checked ? (
              <div className="check-start">
                <div className="big-ai"><Bot size={42}/></div>
                <h2>Ready for an AI-assisted check?</h2>
                <p>We'll inspect your synthetic demo application and explain anything that needs attention.</p>
                <button className="btn primary large" onClick={runCheck} disabled={loading}>{loading ? "Checking your form..." : "Run AI Form Check"} <Sparkles/></button>
              </div>
            ) : (
              <>
                <div className={"check-result "+(issues.length ? "has-issues":"ready")}><div className="result-icon">{issues.length ? <Info/>:<CheckCircle2/>}</div><div><span className="muted">{issues.length ? "AI CHECK COMPLETE":"AI CHECK COMPLETE"}</span><h2>{issues.length ? `${issues.length} ${issues.length===1?"issue":"issues"} found` : "Your application looks ready"}</h2><p>{issues.length ? "Let's fix these before you submit. AI assistance does not guarantee official approval." : "No obvious issues were detected in this prototype."}</p></div></div>
                {issues.length ? <div className="issues">{issues.map((i,idx)=><div className="issue" key={i.field}><div className="issue-num">{idx+1}</div><div className="grow"><b>{i.title}</b><p>{i.message}</p><div className="fix"><Sparkles size={14}/><span><b>How to fix:</b> {i.fix}</span></div></div><button className="text-btn" onClick={()=>go("form")}><Pencil size={16}/> Fix</button></div>)}</div>
                : <div className="passed-list">{["Required fields complete","Phone number format checked","Income frequency confirmed","Demo documents checked","No obvious contradictions detected"].map(x=><div key={x}><CheckCircle2 size={19}/>{x}</div>)}</div>}
                <div className="actions"><button className="btn ghost" onClick={()=>go("form")}><ArrowLeft/> Edit form</button>{issues.length ? <button className="btn primary" onClick={()=>{setChecked(false);go("form")}}>Fix issues <Pencil/></button> : <button className="btn primary" onClick={()=>go("review")}>Review application <ArrowRight/></button>}</div>
              </>
            )}
          </PageShell>
        )}

        {screen === "review" && (
          <PageShell eyebrow="STEP 6 · FINAL REVIEW" title="Everything in one clear view"
            subtitle="Review your answers before the simulated submission."
            onBack={() => go("check")}>
            <div className="review-grid">
              <ReviewCard title="Personal information" onEdit={()=>go("form")} rows={[["Full name",form.name],["Date of birth",form.dob],["Mobile",form.mobile],["Age",form.age]]}/>
              <ReviewCard title="Application" onEdit={()=>go("form")} rows={[["Service","Income Certificate"],["Purpose",form.purpose],["Occupation",form.occupation]]}/>
              <ReviewCard title="Income" onEdit={()=>go("form")} rows={[["Amount",`₹${form.income}`],["Frequency",form.incomeFrequency]]}/>
              <ReviewCard title="Documents" onEdit={()=>go("documents")} rows={Object.entries(docs).map(([k,v])=>[k==="incomeProof"?"Income proof":k[0].toUpperCase()+k.slice(1),v?"Ready":"Missing"])}/>
            </div>
            <div className="ready-banner"><CheckCircle2/><div><b>Ready to review</b><p>The prototype checks have passed. This is not an official approval.</p></div></div>
            <div className="actions"><button className="btn ghost" onClick={()=>go("check")}><ArrowLeft/> Back</button><button className="btn primary large" onClick={submit}>Submit Demo Application <ArrowRight/></button></div>
          </PageShell>
        )}

        {screen === "submitted" && (
          <div className="submitted page">
            <div className="success-orb"><CheckCircle2 size={52}/></div>
            <span className="eyebrow">DEMO SUBMISSION COMPLETE</span>
            <h1>Application submitted successfully</h1>
            <p className="lead">Your simulated application has been created. Nothing was sent to a government system.</p>
            <div className="app-id"><span>Demo application ID</span><b>{appId}</b></div>
            <div className="timeline">
              {[["Application created",true],["Information submitted",true],["Document verification",true],["Certificate processing",false],["Certificate ready",false]].map(([x,on],i)=><div className={"timeline-row "+(on?"done":"")} key={x}><div className="timeline-dot">{on?<Check size={14}/>:i+1}</div><div><b>{x}</b>{i===2&&<p>Current status · No action is required from you right now.</p>}</div></div>)}
            </div>
            <div className="notice"><ShieldCheck size={18}/><div><b>Prototype disclosure</b><p>This is a simulated journey using synthetic data. FormEase AI is not an official government service.</p></div></div>
            <button className="btn primary" onClick={()=>go("home")}>Back to FormEase <Home/></button>
          </div>
        )}
      </main>

      {explain && <div className="modal-backdrop" onClick={()=>setExplain(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setExplain(null)}><X/></button><div className="modal-ai"><Bot/></div><span className="eyebrow">AI EXPLANATION</span><h2>{explain.title}</h2><p>{explain.text}</p><button className="btn secondary" onClick={()=>speak(explain.text)}><Volume2/> Read aloud</button></div></div>}

      <footer><div><span className="brand"><span className="brand-mark"><Sparkles size={15}/></span> FormEase <b>AI</b></span><p>An independent civic-tech prototype.</p></div><div><b>Not official</b><p>All demo information is synthetic. No government system is connected.</p></div></footer>
    </div>
  );
}

function HomePage({onStart,onDemo}) {
  return <div className="home">
    <section className="hero">
      <div className="hero-copy">
        <div className="pill"><Sparkles size={15}/> AI-powered form companion</div>
        <h1>Government forms,<br/><span>made simple.</span></h1>
        <p className="hero-lead">Understand complicated questions, fill forms step-by-step, and catch mistakes before you submit.</p>
        <div className="hero-actions"><button className="btn primary large" onClick={onStart}>Start a form <ArrowRight/></button><button className="btn secondary large" onClick={onDemo}><Zap/> Try mistake-check demo</button></div>
        <div className="trust"><ShieldCheck size={18}/><span>Designed for real people · Mobile-first · Plain language</span></div>
      </div>
      <div className="hero-card">
        <div className="mock-top"><span>FormEase AI</span><span className="live"><i/> Demo</span></div>
        <div className="mock-progress"><span style={{width:"72%"}}/></div>
        <div className="mock-label">AI FORM CHECK</div>
        <h3>Let's catch mistakes before you submit.</h3>
        <div className="mock-issue"><span className="warning">!</span><div><b>Mobile number</b><p>Only 6 digits entered.</p></div><span className="fix-tag">Fix</span></div>
        <div className="mock-issue"><span className="warning">!</span><div><b>Income</b><p>Please confirm monthly or yearly.</p></div><span className="fix-tag">Fix</span></div>
        <div className="mock-ready"><CheckCircle2/><span><b>We'll guide you.</b><small>Simple explanations, not technical errors.</small></span></div>
      </div>
    </section>
    <section className="features" id="how">
      <div className="section-heading"><span className="eyebrow">HOW IT HELPS</span><h2>One assistant. Every confusing step.</h2><p>FormEase is designed around the citizen journey—not the structure of a government portal.</p></div>
      <div className="feature-grid">
        <InfoCard icon={<CircleHelp/>} title="Understand" text="AI translates formal questions into everyday language and explains why a field is needed."/>
        <InfoCard icon={<FileText/>} title="Fill" text="Break long forms into small steps with clear choices, examples and progress."/>
        <InfoCard icon={<Sparkles/>} title="Check" text="Find missing information, formatting mistakes and obvious contradictions before submission."/>
      </div>
    </section>
    <section className="journey"><div className="journey-copy"><span className="eyebrow">THE JOURNEY</span><h2>From “I don't know where to start” to “I know what happens next.”</h2><p>Instead of expecting citizens to understand government terminology, FormEase starts with what they actually want to accomplish.</p></div><div className="journey-steps">{["Tell us what you need","Understand the service","Prepare documents","Fill step-by-step","AI checks your form","Review & submit"].map((x,i)=><div key={x}><span>{String(i+1).padStart(2,"0")}</span><b>{x}</b></div>)}</div></section>
  </div>
}

function PageShell({eyebrow,title,subtitle,children}) {
  return <section className="page"><div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="lead">{subtitle}</p></div>{children}</section>
}

function InfoCard({icon,title,text}) { return <div className="info-card"><div className="info-icon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div></div> }

function FormField({label,required,value,onChange,type="text",placeholder,field,onExplain}) {
  return <div className="field"><div className="label-row"><label>{label} {required&&<span className="required">*</span>}</label><button className="explain-btn" onClick={()=>onExplain({title:label,text:explainField(field)})}><CircleHelp size={15}/> Explain</button></div><input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div>
}

function ReviewCard({title,rows,onEdit}) { return <div className="review-card"><div className="review-head"><h3>{title}</h3><button className="text-btn" onClick={onEdit}><Pencil size={15}/> Edit</button></div>{rows.map(([a,b])=><div className="review-row" key={a}><span>{a}</span><b>{b||"—"}</b></div>)}</div> }

export default App;