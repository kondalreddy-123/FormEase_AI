// Demo AI helpers. For production, call your secure server-side AI endpoint here.
// Never expose an OpenAI API key in the browser.
export async function understandRequest(text) {
  await new Promise(r => setTimeout(r, 450));
  const t = String(text || "").toLowerCase();
  if (t.includes("driving") || t.includes("licence") || t.includes("license")) return {service:"Driving Licence",purpose:"Transport",explanation:"You appear to be looking for a driving licence service. FormEase can guide you through the usual preparation steps."};
  if (t.includes("birth")) return {service:"Birth Certificate",purpose:"Family & Certificates",explanation:"You appear to need a birth certificate service. We can help you understand the information and supporting documents involved."};
  if (t.includes("passport")) return {service:"Passport",purpose:"Passport & Travel",explanation:"You appear to need a passport service. We'll help you prepare the information and document checklist."};
  if (t.includes("voter") || t.includes("vote")) return {service:"Voter Services",purpose:"Voting & Civic",explanation:"You appear to need a voter service. We can help identify the relevant application or correction flow."};
  if (t.includes("scholarship") || t.includes("college") || t.includes("income")) return {service:t.includes("scholarship")||t.includes("college")?"Scholarship Assistance":"Income Certificate",purpose:"Education / Scholarship",explanation:"You appear to need support for education or proof of income. We'll help you identify the likely service and prepare the next steps."};
  return {service:"Government Service",purpose:"Needs clarification",explanation:"I understand that you need help with a government service. We can narrow it down by asking a few simple questions."};
}
export function explainField(field){const x={name:"Your full legal name as it should appear on the application.",dob:"Your date of birth. FormEase calculates your age automatically from this date.",mobile:"A 10-digit mobile number used for communication where the service requires one.",occupation:"The type of work or main activity that best describes you.",income:"The income amount you are reporting. Always confirm whether the form asks for monthly or yearly income.",purpose:"The reason you are applying for the service."};return x[field]||"This field provides information needed to process the application. Enter only information that is actually requested."}
export async function checkForm(data){
  await new Promise(r=>setTimeout(r,500)); const issues=[]; const mobile=String(data.mobile||"").replace(/\D/g,"");
  if(!data.name?.trim())issues.push({field:"name",title:"Full name",message:"Your name is missing.",fix:"Enter the applicant's full name."});
  if(!data.dob)issues.push({field:"dob",title:"Date of birth",message:"Date of birth is missing.",fix:"Select a valid date."});
  if(mobile.length!==10)issues.push({field:"mobile",title:"Mobile number",message:"The mobile number should contain 10 digits.",fix:"Enter a valid 10-digit mobile number."});
  if(!data.occupation)issues.push({field:"occupation",title:"Occupation",message:"Occupation has not been provided.",fix:"Choose the closest option or Other."});
  if(!data.income)issues.push({field:"income",title:"Income",message:"Income amount is missing.",fix:"Enter the reported income amount."});
  if(!data.incomeFrequency)issues.push({field:"incomeFrequency",title:"Income frequency",message:"Please confirm whether the income is monthly or yearly.",fix:"Choose Monthly or Yearly."});
  if(data.documents && !data.documents.incomeProof)issues.push({field:"documents",title:"Income certificate",message:"The income certificate is marked as missing.",fix:"Resolve the missing document or confirm that it is not required for your service."});
  if(data.dob){const b=new Date(data.dob+"T00:00:00"),n=new Date();let a=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--;if(data.age&&Number(data.age)!==a)issues.push({field:"age",title:"Age and date of birth",severity:"warning",message:`Your date of birth suggests an age of ${a}, but the form says ${data.age}.`,fix:"Check the date of birth; age is calculated automatically."});}
  return {issues,ready:issues.length===0,summary:issues.length?`Let's fix ${issues.length} ${issues.length===1?"thing":"things"}.`:"Your application passed the prototype checks."};
}
