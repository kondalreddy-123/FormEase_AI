import express from "express";
import OpenAI from "openai";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: "50kb" }));

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(openai)
  });
});

// AI understands citizen request
app.post("/api/ai/understand", async (req, res) => {
  try {
    const text = String(req.body?.text || "").trim();

    if (!text) {
      return res.status(400).json({
        error: "Please describe what you need."
      });
    }

    if (!openai) {
      return res.json({
        service: "Income Certificate",
        purpose: "General",
        explanation:
          "This demo will guide you through an Income Certificate application."
      });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      store: false,

      safety_identifier: crypto
        .createHash("sha256")
        .update(req.ip || "anonymous")
        .digest("hex"),

      instructions: `
You are FormEase AI.

You help Indian citizens understand complicated
government-style forms.

Use very simple language.

Do not claim to be an official government service.
Do not determine legal eligibility.
Do not request sensitive information.

Return JSON only.
`,

      input: text,

      text: {
        format: {
          type: "json_schema",
          name: "service_understanding",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              service: {
                type: "string"
              },
              purpose: {
                type: "string"
              },
              explanation: {
                type: "string"
              }
            },
            required: [
              "service",
              "purpose",
              "explanation"
            ]
          }
        }
      }
    });

    res.json(JSON.parse(response.output_text));

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI service is temporarily unavailable."
    });
  }
});

// AI checks application
app.post("/api/ai/check", async (req, res) => {
  try {
    const data = req.body?.data;

    if (!data) {
      return res.status(400).json({
        error: "Form data is required."
      });
    }

    const issues = [];

    // Basic deterministic checks
    if (!data.name?.trim()) {
      issues.push({
        field: "name",
        title: "Full name",
        severity: "error",
        message: "Your name is missing.",
        fix: "Enter the applicant's full name."
      });
    }

    const mobile = String(data.mobile || "")
      .replace(/\D/g, "");

    if (mobile.length !== 10) {
      issues.push({
        field: "mobile",
        title: "Mobile number",
        severity: "error",
        message: "Mobile number should contain 10 digits.",
        fix: "Enter a 10-digit demo mobile number."
      });
    }

    if (!data.occupation) {
      issues.push({
        field: "occupation",
        title: "Occupation",
        severity: "error",
        message: "Occupation is missing.",
        fix: "Select your occupation."
      });
    }

    if (!data.income) {
      issues.push({
        field: "income",
        title: "Income",
        severity: "error",
        message: "Income amount is missing.",
        fix: "Enter the reported income amount."
      });
    }

    if (!data.incomeFrequency) {
      issues.push({
        field: "incomeFrequency",
        title: "Income frequency",
        severity: "error",
        message: "Income frequency is missing.",
        fix: "Select Monthly or Yearly."
      });
    }

    if (!data.documents?.incomeProof) {
      issues.push({
        field: "documents",
        title: "Income proof",
        severity: "error",
        message: "Income proof is missing.",
        fix: "Add the synthetic income-proof document."
      });
    }

    // If no API key, return safe demo validation
    if (!openai) {
      return res.json({
        issues,
        summary: issues.length
          ? `Let's fix ${issues.length} ${
              issues.length === 1 ? "thing" : "things"
            } before you submit.`
          : "Your application is ready for review."
      });
    }

    // Send only synthetic/demo form data to AI
    const safeData = {
      name: data.name || "",
      dob: data.dob || "",
      age: data.age || "",
      mobile: mobile,
      occupation: data.occupation || "",
      income: data.income || "",
      incomeFrequency: data.incomeFrequency || "",
      purpose: data.purpose || "",
      documents: data.documents || {}
    };

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      store: false,

      safety_identifier: crypto
        .createHash("sha256")
        .update(req.ip || "anonymous")
        .digest("hex"),

      instructions: `
You are FormEase AI.

Check a synthetic government-style application.

Find:
- missing information
- inconsistent information
- unclear information
- obvious formatting mistakes

Do NOT decide legal eligibility.

Give short explanations and practical fixes.
Return JSON only.
`,

      input: JSON.stringify(safeData),

      text: {
        format: {
          type: "json_schema",
          name: "form_check",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              issues: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    field: {
                      type: "string"
                    },
                    title: {
                      type: "string"
                    },
                    severity: {
                      type: "string",
                      enum: [
                        "error",
                        "warning"
                      ]
                    },
                    message: {
                      type: "string"
                    },
                    fix: {
                      type: "string"
                    }
                  },
                  required: [
                    "field",
                    "title",
                    "severity",
                    "message",
                    "fix"
                  ]
                }
              },
              summary: {
                type: "string"
              }
            },
            required: [
              "issues",
              "summary"
            ]
          }
        }
      }
    });

    const aiResult = JSON.parse(
      response.output_text
    );

    // Keep deterministic checks as well
    const allIssues = [
      ...issues,
      ...(aiResult.issues || [])
    ];

    res.json({
      issues: allIssues,
      summary: allIssues.length
        ? `Let's fix ${allIssues.length} ${
            allIssues.length === 1
              ? "thing"
              : "things"
          } before you submit.`
        : "Your application is ready for review."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI form checking is temporarily unavailable."
    });
  }
});

// Serve React production build
const distPath = path.join(
  __dirname,
  "dist"
);

app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(
    path.join(distPath, "index.html")
  );
});

app.listen(PORT, () => {
  console.log(
    `FormEase AI running on port ${PORT}`
  );
});
