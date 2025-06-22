const express = require('express');
const { createMachine, createActor, assign, setup, fromPromise } = require('xstate');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const SERVICE_APP_PORT = process.env.APP_PORT || 3000; // Port your Node.js app listens on


// Simulated order validation function
const validateOrder = async ({ productId, orderQty }) => {
    console.log('Validating order:', { productId, orderQty });
    // Simulate validation logic
    return new Promise((resolve, reject) => {
    if (!productId) {
        reject(new Error('Product ID not provided'))
    }
    else if (!orderQty) {
        reject(new Error('Order quantity not provided'))
    }
    else if ( orderQty <= 0) {
        reject(new Error('Order quantity must be greater than zero'))
    }
    resolve({ valid: true });
    })
};

const orderMachine = setup({
  actors: {
    validateOrder: fromPromise(async ({input: {productId, orderQty}}) => {
      const validated = await validateOrder(productId, orderQty);
      return validated;
    }),
  },
}).createMachine({
    context: ({ input }) => ({
        productId: input.productId || null,
        orderQty: input.orderQty || null,
        confirmationNumber: null,
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
                id: 'validateOrder',
                src: 'validateOrder',
                input: ({ context: { productId, orderQty } }) => ({ productId, orderQty }),
                onDone: {
                    target: 'confirming',
                },
                onError: {
                    target: 'failed',
                    actions: assign({
                        errorMessage: ({event}) => event.error || 'Validation failed'
                    })
                }
            }
        },
        confirming: {
            entry: assign({
                confirmationNumber: () => {
                    // Generate a new confirmation number using uuid    
                    const confirmation = uuidv4();
                    return confirmation;
                }
            }),
            always: 'completed'
        },
        completed: {
            type: 'final'
        },
        failed: {
            type: 'final'
        }
    }
});


app.post('/placeOrder', async (req, res) => {
    const { productId, orderQty } = req.body;

    // if (!productId || !orderQty) {
    //     return res.status(400).json({ error: 'productId and orderQty are required' });
    // }

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
            return res.status(500).json({ error: 'Unexpected state' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// Start listening for incoming requests
app.listen(SERVICE_APP_PORT, () => {
  console.log(`Order Processing Service listening on port ${SERVICE_APP_PORT}`);
});
