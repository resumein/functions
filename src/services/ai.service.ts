import { ReadableStream } from 'stream/web';
import { Groq } from 'groq-sdk';

const SYSTEM_PROMPT = `You are an expert resume parser. You will extract and classify all sections from the provided resume text into these 5 categories: "education", "project", "experience", "certification", and "award".
For each category, extract the relevant fields exactly as specified below:

1. "education":
   - school (string, name of the institution)
   - degree (string, e.g., Bachelor of Science, High School Diploma, etc.)
   - field (string, major/field of study, e.g., Computer Science, Biology)
   - fromDate (string, format YYYY-MM-DD or YYYY-MM)
   - toDate (string, format YYYY-MM-DD or YYYY-MM, or omit if current/present)
   - grade (string, GPA or marks, e.g., "3.8/4.0", "92%", optional)
   - location (string, city/state/country, optional)

2. "project":
   - name (string, name of the project)
   - github (string, URL of github repo or empty string if not found)
   - url (string, project homepage/demo URL, optional)
   - description (string, overview of what the project is and what you built)
   - fromDate (string, format YYYY-MM-DD or YYYY-MM)
   - toDate (string, format YYYY-MM-DD or YYYY-MM, optional)
   - technologiesUsed (string, comma-separated list of technologies, e.g., "React, Node.js, MongoDB")

3. "experience":
   - title (string, job title/role)
   - company (string, name of the company/employer)
   - fromDate (string, format YYYY-MM-DD or YYYY-MM)
   - toDate (string, format YYYY-MM-DD or YYYY-MM, or omit if current/present)
   - description (string, summary of job context, optional)
   - role (array of strings, bullet points of key responsibilities, accomplishments, and metrics, default to empty array)
   - location (string, city/state/country, optional)

4. "certification":
   - title (string, name of certification)
   - platform (string, issuing organization/platform, e.g. Coursera, AWS, Google)
   - description (string, optional)
   - url (string, verification link, optional)
   - completedOn (string, format YYYY-MM-DD or YYYY-MM, optional)
   - role (array of strings, bullet points or details about the certification, default to empty array)

5. "award":
   - title (string, name of the award/recognition)
   - issuer (string, organization that awarded it)
   - awardType (string, category of award, e.g. Academic, Professional, Hackathon)
   - description (string, optional)
   - date (string, format YYYY-MM-DD or YYYY-MM, optional)
   - role (array of strings, any additional details, default to empty array)

CRITICAL RULES:
- Do NOT rewrite, paraphrase, edit, clean up, polish, or summarize any extracted text.
- Preserve the exact verbatim wording from the input resume text for all descriptions, names, titles, and role bullet points.
- If the original resume text has multiple bullet points or descriptions for a single item, and the target field expects a single string (like the "description" field in projects or experience), concatenate them using a space, preserving all text verbatim.
- Your ONLY job is to structure and classify; do not attempt to improve or modify any wording.

Output MUST be a single JSON object with the following structure:
{
  "items": [
     // Array of extracted items, each item must have a "type" field matching one of the 5 categories.
  ]
}
Ensure all dates are converted to YYYY-MM-DD or YYYY-MM format. If only a year is available, default to YYYY-01-01. Do not include formatting wrappers or markdown code blocks around the JSON output.`;

// Lazy initialize Groq SDK client
let groqClient: Groq | null = null;
function getGroqClient(): Groq {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY is not configured");
        }
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

export async function scanResumeText(text: string): Promise<any> {
    const groq = getGroqClient();

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("Failed to get response from Groq API");
    }

    return JSON.parse(content);
}

export async function streamGroqCompletion(prompt: string): Promise<ReadableStream<Uint8Array>> {
    const groq = getGroqClient();

    const chatCompletionStream = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: 'send an example JSON' },
            { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        stream: true
    });

    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of chatCompletionStream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                }
                controller.close();
            } catch (err) {
                controller.error(err);
            }
        }
    });
}
