/* ---- Begin Input Parameter Lookup Definitions ---- */

const cheesinessDefinitions = [
    "1/4 - Simple and clear, but not painfully so.  They'll never see it coming and you may even get a real laugh.",
    "2/4 - The sweet spot for most dad jokes.  These jokes feature clear puns that are easy to spot but still manage to land a satisfying groan.",
    "3/4 - Unapologetically cheesy.  Interpretations are pushed to an absurd degree.  Dad's who use these jokes are truly commited to their craft.",
    "4/4 - Joke's so obvious and literal that your family will skip right over groans and go straight for the eye roll.  You'll be proud of yourself for hours after a succesful delivery."
]

const predictabilityDefinitions = [
    '1/3 - More likely to illicit an "Oh, I see what you did there" than a groan.',
    "2/3 - These jokes follow a familiar pattern that your family has likley heard from either you or other genius dads.",
    '3/3 - Your wife is likely to hold up her hand and say "Please don\'t do it" before you even finish the setup.'
]

const styleDefinitions = {
    'pun': 'Pun - A form of wordplay that exploits multiple meanings of a term, or similar-sounding words, for humorous effect.',
    'anticlimactic': 'Anticlimactic - These jokes build up expectations but deliver a mundane or trivial punchline.',
    'misdirection': 'Misdirection - These jokes set you up to expect something complex or clever, but deliver a very simple, often mundane, answer.',
    'question and answer': 'Question and Answer - A classic joke format where a question sets up the punchline.'
};

/* ---- End Input Parameter Lookup Definitions ---- */

const systemPrompt = `

You are a dad joke generator. Your task is to generate a completely NEW and DIFFERENT dad joke every single time you're asked.

Your joke should adhere to the following guidelines:
1. Cheesiness Level = {cheesiness}
2. Predictability level = {predictability}
3. Style = {style}

VARIETY REQUIREMENTS:
- Consider seasonal references, daily activities, or common situations
- Think about different professions, hobbies, or scenarios for inspiration
- IMPORTANT: Your joke should differ in both format and content from these jokes.  DO NOT COPY RESPOND WITH ANY OF THESE JOKES : {recentJokes}

Do not include anything other than the joke in your response. Do not include any additional text, explanations, or commentary. Just the joke itself.

`;

module.exports = { systemPrompt, cheesinessDefinitions, predictabilityDefinitions, styleDefinitions };