const { assign, setup, fromCallback } = require('xstate');
const { v4: uuidv4 } = require('uuid');
const { DaprClient, HttpMethod, CommunicationProtocolEnum } = require("@dapr/dapr");


/* ---- Begin State Actor Implementations  ---- */


const validateParams = fromCallback(({ sendBack, input: { cheesiness, predictability, style }}) => {
    if (!cheesiness) {
        sendBack({ type: 'error', data: { error: 'Cheesiness not provided'}})
    }
    else if (!predictability) {
        sendBack({ type: 'error', data: { error: 'Predictability not provided'}})
    }
    else if (!style) {
        sendBack({ type: 'error', data: { error: 'Style not provided'}})
    }
    else {
        sendBack({ type: 'done', data: { validated: true } });
    }
});

const generateJoke = fromCallback(async ({ sendBack, input: { cheesiness, predictability, style }}) => {
   
    try {
        // Implement joke generation here
        sendBack({ type: 'done', data: { joke: 'This is a funny joke!' } });
    } catch (error) {
       sendBack({ type: 'error', data: { error: 'Unable to generate joke.', error_msg: error.message } });
   }
});

/* ---- End State Actor Implementations  ---- */




/**
 * State machine for generating jokes.
 *
 * States:
 * - received: Initial state where the joke request is received. Waits for the 'VALIDATE' event to transition to 'validating'.
 * - validating: Invokes the 'validateJokeRequest' actor to validate the joke request parameters (cheesiness, predictability, style).
 *     - On success ('done'), transitions to 'generating' and updates context with validation result.
 *     - On failure ('error'), transitions to 'failed'.
 * - generating: Utilizes langchain and Google Gemini to generate a joke based on the validated parameters.
 * - completed: Final state indicating the joke has been successfully generated.
 * - failed: Final state indicating the joke generation failed. Updates context with the error message.
 */
const jokeMachine = setup({
  actors: {
    validateParams,
    generateJoke
  },
}).createMachine({
    context: ({ input }) => ({
        cheesiness: input.cheesiness || null,
        predictability: input.predictability || null,
        style: input.style || null,
        joke: null,
        errorMessage: null,
        validated: false
    }),
    initial: 'received',
    states: {
        received: {
            on: {
                VALIDATE: 'validating'
            }
        },
        validating: {
            invoke: {
                src: 'validateParams',
                input: ({ context: { cheesiness, predictability, style } }) => ({ cheesiness, predictability, style }),
            },
            on: {
                done: {
                    target: 'generating',
                    actions: assign({
                        // Update context with validation result
                        validated: ({ event }) => { return event.data.validated },
                    })
                },
                error: {
                    target: 'failed',
                }
            }
        },
        generating: {
            invoke: {
                src: 'generateJoke',
                input: ({ context: { cheesiness, predictability, style } }) => ({ cheesiness, predictability, style }),
            },
            on: {
                done: {
                    target: 'completed',
                    actions: assign({
                        joke: ({ event }) => { return event.data.joke }
                    })
                },
                error: {
                    target: 'failed',
                }
            }
        },
        completed: {
            type: 'final'
        },
        failed: {
            type: 'final',
            entry: assign({
                    errorMessage: ({ event }) => { return event.data.error }
            })
        }
    }
});



module.exports = { jokeMachine };
