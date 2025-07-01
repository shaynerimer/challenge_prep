const { assign, setup, fromCallback } = require('xstate');
const { v4: uuidv4 } = require('uuid');
const { DaprClient, HttpMethod, CommunicationProtocolEnum } = require("@dapr/dapr");


/* ---- Begin State Actor Implementations  ---- */


/** -- validateOrder() --
 * Validates the order details by checking the presence and validity of productId and orderQty.
 * 
 * This actor function is used by the state machine to asynchronously validate order input.
 * It sends back an error if:
 *   - productId is missing,
 *   - orderQty is missing,
 *   - orderQty is less than or equal to zero.
 * Otherwise, it sends back a success response indicating the order is validated.
 */
const validateOrder = fromCallback(({ sendBack, input: { productId, orderQty }}) => {
    if (!productId) {
        sendBack({ type: 'error', data: { error: 'Product ID not provided'}})
    }
    else if (!orderQty) {
        sendBack({ type: 'error', data: { error: 'Order Qty not provided'}})
    }
    else if ( orderQty <= 0) {
        sendBack({ type: 'error', data: { error: 'Order Qty must be grater than 0'}})
    }
    else {
        sendBack({ type: 'done', data: { validated: true } });
    }
});

const persistOrder = fromCallback(async ({ sendBack, input: { productId, orderQty, confirmationNumber }}) => {
   const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
   const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";

   const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const bindingName = 'graphql';
    const operation = 'mutation';
    const metadata = {
        mutation: `
            mutation CreateOrder($productId: String!, $confirmationNumber: String!) {
                createOrder(
                    productId: $productId
                    orderQty: ${parseInt(orderQty)}
                    confirmationNumber: $confirmationNumber
                ) {
                    id
                    productId
                    orderQty
                    confirmationNumber
                    status
                    createdAt
                }
            }
        `,
        'variable:productId': productId,
        // 'variable:orderQty': orderQty,
        'variable:confirmationNumber': confirmationNumber,
    }
    
    try {
        await client.binding.send(bindingName, operation, {}, metadata)
        sendBack({ type: 'done', data: {  } });
    } catch {(error) => {
       console.error(`Error persisting order: ${error.message}`);
       sendBack({ type: 'error', data: { error: 'Unable to save order.' } });
   }};
});

/* ---- End State Actor Implementations  ---- */




/**
 * State machine for processing orders.
 *
 * States:
 * - received: Initial state where the order is received. Waits for the 'VALIDATE' event to transition to 'validating'.
 * - validating: Invokes the 'validateOrder' actor to validate the order details (productId and orderQty).
 *     - On success ('done'), transitions to 'confirming' and updates context with validation result.
 *     - On failure ('error'), transitions to 'failed'.
 * - confirming: Generates a unique confirmation number (UUID) and immediately transitions to 'completed'.
 * - completed: Final state indicating the order has been successfully processed.
 * - failed: Final state indicating the order validation failed. Updates context with the error message.
 */
const orderMachine = setup({
  actors: {
    validateOrder,
    persistOrder
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
                src: 'validateOrder',
                input: ({ context: { productId, orderQty } }) => ({ productId, orderQty }),
            },
            on: {
                done: {
                    target: 'confirming',
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
        confirming: {
            entry: assign({
                confirmationNumber: () => {
                    // Generate a new confirmation number guid   
                    const confirmation = uuidv4();
                    return confirmation;
                }
            }),
            always: 'persisting'
        },
        persisting: {
            invoke: {
                src: 'persistOrder',
                input: ({ context: { productId, orderQty, confirmationNumber } }) => ({ productId, orderQty, confirmationNumber }),
            },
            on: {
                done: {
                    target: 'completed',
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



module.exports = { orderMachine };