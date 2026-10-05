import Groq from "groq-sdk";
import systemPrompt from "./aiPrompt.js";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
import cds from '@sap/cds';
export default function () {
    this.on("ask", async (req) => {
        const question = req.data.question;
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [{ role: "system", content: systemPrompt },
            { role: "user", content: question }], response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);

        const query = result.query?.trim();

        if (!query) {
            return "I can only answer questions related to the application.";
        }

        const upperQuery = query.toUpperCase();

        if (!upperQuery.startsWith("SELECT")) {
            return "Only read-only queries are allowed.";
        }

        const forbidden = [
            "INSERT",
            "UPDATE",
            "DELETE",
            "DROP",
            "ALTER",
            "CREATE",
            "TRUNCATE"
        ];

        if (forbidden.some(word => upperQuery.includes(word))) {
            return "Only read-only queries are allowed.";
        }
        console.log("Validated query:", query);

        const cqn = cds.parse.cql(query);
        const data = await cds.run(cqn);
        console.log("Query result:", data);

        const answer = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content: `
You are an assistant for a Daily Sales and Expense application.

Answer the user's question using ONLY the database result provided.

Do not invent or assume any data.
Keep the answer concise and clear.
Use INR (₹) when discussing money.
`
                },
                {
                    role: "user",
                    content: `
                            Question: ${question}
                            Database result: ${JSON.stringify(data)}`
                }
            ]
        });

        return answer.choices[0].message.content;

    });
}



