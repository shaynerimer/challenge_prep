'use server'
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from "@dapr/dapr";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";

export async function createJoke(prevState, formData) {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);

    // Format Payload
    const payload = {
            cheesiness: formData.get('cheesiness'),
            predictability: formData.get('predictability'),
            style: formData.get('style')
    };

    // Invoke Service
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 7 seconds timeout

        // Patch DaprClient to support abort signal (if not natively supported, wrap in Promise.race)
        // const invokePromise = client.invoker.invoke("joke-generator", "createJoke", HttpMethod.POST, payload);
        const simJokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "I used to be a baker, but I couldn't make enough dough.",
            "What do you call a sad strawberry? A blueberry.",
            "I'm reading a book on anti-gravity. It's impossible to put down!",
            "Did you hear about the restaurant on the moon? Great food, no atmosphere."
        ]
        const invokePromise = new Promise((resolve) => {
            const joke = simJokes[Math.floor(Math.random() * simJokes.length)];
            resolve(`{"joke": "${joke}"}`); // Simulate a successful response
        })

        const response = await Promise.race([
            invokePromise,
            new Promise((_, reject) =>
                controller.signal.addEventListener('abort', () =>
                    reject(new Error(JSON.stringify('Joke Service Unreachable' )))
                )
            )
        ]);
        clearTimeout(timeout);
        return {
            status: 'success',
            joke: JSON.parse(response).joke,
            message: 'Success!  Joke Created'
        }
    } catch (error) {
        let error_msg;
        try {
            const parsed = JSON.parse(error.message);
            if (parsed && parsed.error && parsed.error.message) {
            error_msg = 'Joke Creation Error: ' + parsed.error.message;
            } else {
            error_msg = 'Joke Creation Error: ' + error.message;
            }
        } catch {
            error_msg = error;
        }
        return {
            status: 'error',
            message: error_msg
        }
    }
}