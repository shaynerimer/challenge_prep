const express = require('express');
const { createActor, waitFor } = require('xstate');

const { orderMachine } = require('./orderMachine');
const { logger } = require('./logger');


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
            input: { productId, orderQty: parseInt(orderQty) }
        });
        actor.start();
        actor.send({ type: 'VALIDATE' });

        // Wait for the actor to reach a final state
        const finalState = await waitFor(actor, (state) => {
            return state.value === 'completed' || state.value === 'failed';
        });

        if (finalState.value === 'completed') {
            logger.info({
                message: 'Order Processed',
                orderDetails: {
                    productId: productId,
                    orderQty: orderQty
                },
                confirmationNumber: finalState.context.confirmationNumber,
                trace: req.headers['traceparent']
            });
            return res.status(200).json({
                confirmationNumber: finalState.context.confirmationNumber
            });
        } else if (finalState.value === 'failed') {
            return res.status(500).json({
                error: finalState.context.errorMessage || 'Order processing failed'
            });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// Start listening for incoming requests
app.listen(SERVICE_APP_PORT, () => {
  logger.info({ message: `Order Processing Service listening on port ${SERVICE_APP_PORT}` });
});
