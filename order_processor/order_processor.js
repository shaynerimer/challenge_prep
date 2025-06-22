const express = require('express');
const { orderMachine } = require('./orderMachine');
const { createActor } = require('xstate');


const app = express();
app.use(express.json());

const SERVICE_APP_PORT = process.env.APP_PORT || 3000; // Port your Node.js app listens on


/* /placeOrder endpoint
 * This endpoint receives an order request with productId and orderQty,
 * processes the order using the orderMachine, and returns a confirmation number
 * or an error message.
 */
app.post('/placeOrder', async (req, res) => {
    const { productId, orderQty } = req.body;

    try {
        const actor = createActor(orderMachine, {
            input: { productId, orderQty }
        });
        actor.start();
        actor.send({ type: 'VALIDATE' });

        // Wait for the actor to reach a final state
        await actor.getSnapshot();

        const state = actor.getSnapshot();
        if (state.value === 'completed') {
            return res.status(200).json({
                confirmationNumber: state.context.confirmationNumber
            });
        } else if (state.value === 'failed') {
            return res.status(500).json({
                error: state.context.errorMessage || 'Order processing failed'
            });
        } else {
            throw new Error('Unexpected state: ' + state.value);
        }
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// Start listening for incoming requests
app.listen(SERVICE_APP_PORT, () => {
  console.log(`Order Processing Service listening on port ${SERVICE_APP_PORT}`);
});
