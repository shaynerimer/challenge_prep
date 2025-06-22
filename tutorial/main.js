const { createActor } = require('xstate');
const { toggleMachine } = require('./toggleMachine');


// Main Execution -> Create Actor and run as much as possible
const actor = createActor(toggleMachine, {
    input: { maxCount: 10}
});

actor.subscribe((snapshot) => {
    console.log('Value:', snapshot.value, 'Count:', snapshot.context.count);
});

actor.start();

for (let i = 0; i < 10; i++) {
    actor.send({ type: 'toggle' });
}