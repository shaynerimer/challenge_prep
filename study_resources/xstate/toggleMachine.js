const { assign, setup, fromCallback } = require('xstate');

// Active Logic
const myCallback = fromCallback(({sendBack, input: {count}}) => {
    if (Math.random() < .8) {
        sendBack({ type: 'done', data: { count: count * 2 } });
    } else {
        sendBack({ type: 'error', data: { error: 'An error occurred' } });
    }
});


// State Machine Definition
const toggleMachine = setup({
    actors:{
        myCallback
    }
}).createMachine({
    id: 'toggle',
    initial: 'Inactive',
    context: ({ input }) => ({
        count: 1,
        maxCount: input.maxCount || 5,
    }),
    states: {
        Inactive: {
            on: { toggle: [
                {
                    guard: ({ context }) => context.count >= context.maxCount,
                    target: 'Complete',
                },
                {
                    target : 'Active'
                }
            ]}
        },
        Active: {
            invoke: {
                src: 'myCallback',
                input: ({ context: { count } }) => ({ count }),
            },
            on: { 
                toggle: 'Inactive',
                done: {
                    target: 'Inactive',
                    actions: assign({
                        count: ({ context, event }) => context.count  = event.data.count,
                    }),
                },
                error: {
                    target: 'Error'
                }

            },
            after: {2000: 'Inactive' },
        },
        Error: {
            type: 'final',
            entry: ({ event }) => {
                console.error('Error:', event.data.error);
            }
        },
        Complete: {
            type: 'final',
            entry: ({ context }) => {
                console.log('Max Count Acheived:', context.count);
            }
        }
    },
});

module.exports = { toggleMachine };