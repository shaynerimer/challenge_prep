const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { systemPrompt, cheesinessDefinitions, predictabilityDefinitions, styleDefinitions } = require('./systemPrompt.js');

const SIMULATE_AI = process.env.SIMULATE_AI == 1;

const generateJoke = async (cheesiness, predictability, style) => {
    if (SIMULATE_AI) {
        // Simulate AI response for testing purposes
        return 'SIMULATED JOKE: Why did the scarecrow win an award? Because he was outstanding in his field!)';
    }

    const model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        temperature: 0.6,
        thinkingBudget: 0
    });

    prompt = ChatPromptTemplate.fromTemplate(systemPrompt)
    const chain = prompt.pipe(model);

    const response = await chain.invoke( {
        cheesiness: cheesinessDefinitions[cheesiness],
        predictability: predictabilityDefinitions[predictability],
        style: styleDefinitions[style]
    });

    return response.text;
}

module.exports = generateJoke;