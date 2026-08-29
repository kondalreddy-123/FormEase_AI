# FormEase AI

FormEase AI is an independent civic-tech prototype that helps citizens understand, fill, and check long government-style forms.

## What works in this prototype

- Natural-language request understanding (demo AI fallback)
- Income Certificate demo journey
- Simple step-by-step form
- "Explain" AI-style field explanations
- Document checklist
- Mistake detection
- Contradiction detection (age vs date of birth)
- Missing-field and format validation
- Final review
- Simulated submission and tracking
- Demo data with intentional mistakes
- Mobile responsive UI
- Browser text-to-speech
- Synthetic data only

## Run locally

Requirements: Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production AI integration

The included `src/aiService.js` is intentionally safe for a frontend demo and does not contain an API key. For a real OpenAI integration, create a server-side endpoint and call the OpenAI API there. Never expose an OpenAI API key in browser JavaScript.

## Hackathon disclosure

This is an independent prototype. It does not connect to or interfere with any live government system. All example identities and application data are synthetic. AI assistance does not guarantee official eligibility, acceptance, or approval.

## Demo flow

On the home page, click **Try mistake-check demo**. The preloaded demo intentionally contains:
- an invalid mobile number
- missing occupation
- ambiguous income frequency
- missing income proof
- an age/date-of-birth contradiction

Run **AI Form Check**, fix the issues, review, and submit.
