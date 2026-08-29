// Demo AI service. Replace these functions with a secure server-side
// OpenAI integration for production. Never expose an API key in the browser.

export async function understandRequest(text) {
  const t = text.toLowerCase();
  if (t.includes("income") || t.includes("scholarship") || t.includes("college")) {
    return {
      service: "Income Certificate",
      purpose: t.includes("scholarship") || t.includes("college") ? "Education / Scholarship" : "General",
      explanation: "You appear to be looking for an Income Certificate because you mentioned proof of family income."
    };
  }
  return {
    service: "Income Certificate",
    purpose: "General",
    explanation: "For this demo, I’ll guide you through an Income Certificate application."
  };
}

export function explainField(field) {
  const explanations = {
    name: "This identifies the person submitting the application.",
    dob: "Your date of birth is used to identify you and check that related details are consistent.",
    mobile: "A 10-digit mobile number is commonly used for communication. This demo does not send OTPs.",
    occupation: "This describes the type of work or main activity of the person.",
    income: "This is the amount of income you are reporting. Choose monthly or yearly so the amount is not ambiguous.",
    purpose: "This tells the service why you need the certificate."
  };
  return explanations[field] || "This information helps complete the application. Only enter information that is actually requested.";
}

export async function checkForm(data) {
  const issues = [];
  const mobile = String(data.mobile || "").replace(/\D/g, "");
  if (!data.name?.trim()) issues.push({field:"name", title:"Full name", message:"Your name is missing.", fix:"Enter the applicant's full name."});
  if (!data.dob) issues.push({field:"dob", title:"Date of birth", message:"Date of birth is missing.", fix:"Select a valid date."});
  if (mobile.length !== 10) issues.push({field:"mobile", title:"Mobile number", message:"The mobile number should contain 10 digits.", fix:"Enter a 10-digit demo mobile number."});
  if (!data.occupation) issues.push({field:"occupation", title:"Occupation", message:"Occupation has not been provided.", fix:"Choose the closest option or Other."});
  if (!data.income) issues.push({field:"income", title:"Income", message:"Income amount is missing.", fix:"Enter the reported income amount."});
  if (!data.incomeFrequency) issues.push({field:"incomeFrequency", title:"Income frequency", message:"Please confirm whether the income is monthly or yearly.", fix:"Choose Monthly or Yearly."});
  if (!data.documents?.incomeProof) issues.push({field:"documents", title:"Income proof", message:"The income-proof document is not marked as available.", fix:"Mark the demo document as available."});

  // Intentional contradiction check for the demo.
  if (data.dob) {
    const birth = new Date(data.dob);
    const now = new Date("2026-08-29");
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    if (data.age && Number(data.age) !== age) {
      issues.push({
        field:"age", title:"Age and date of birth", severity:"warning",
        message:`Your date of birth suggests an age of about ${age}, but the form says ${data.age}.`,
        fix:"Check your date of birth and age."
      });
    }
  }

  return {
    issues,
    ready: issues.length === 0,
    summary: issues.length
      ? `Let's fix ${issues.length} ${issues.length === 1 ? "thing" : "things"} before you submit.`
      : "Your application passed the prototype checks and is ready for review."
  };
}