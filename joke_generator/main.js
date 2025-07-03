const express = require('express');
const { createActor, waitFor } = require('xstate');

const { jokeMachine } = require('./stateMachine');
const { logger } = require('./logger');


const app = express();
app.use(express.json());

const SERVICE_APP_PORT = process.env.APP_PORT || 3000; // Port your Node.js app listens on


app.post('/generateJoke', async (req, res) => {
    const { cheesiness, predictability, style } = req.body;

    try {
        const actor = createActor(jokeMachine, {
            input: { cheesiness, predictability, style }
        });
        actor.start();
        actor.send({ type: 'VALIDATE' });

        // Wait for the actor to reach a final state
        const finalState = await waitFor(actor, (state) => {
            return state.value === 'completed' || state.value === 'failed';
        });

        if (finalState.value === 'completed') {
            logger.info({
                message: 'Joke Generated',
                jokeDetails: {
                    cheesiness: cheesiness,
                    predictability: predictability,
                    style: style,
                    joke: finalState.context.joke
                },
                trace: req.headers['traceparent']
            });
            return res.status(200).json({
                joke: finalState.context.joke
            });
        } else if (finalState.value === 'failed') {
            return res.status(500).json({
                error: finalState.context.errorMessage || 'Joke generation failed'
            });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// Start listening for incoming requests
app.listen(SERVICE_APP_PORT, () => {
  logger.info({ message: `Joke Generation Service listening on port ${SERVICE_APP_PORT}` });
});
