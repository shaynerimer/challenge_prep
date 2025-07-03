const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const systemPrompt = require('./systemPrompt.js');


async function main() {
    const model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        temperature: 0.6,
        thinkingBudget: 0
    });

    prompt = ChatPromptTemplate.fromTemplate(systemPrompt)
    const chain = prompt.pipe(model);

    const response = await chain.invoke();
    console.log(response.text);
}

main();