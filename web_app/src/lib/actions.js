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
        const timeout = setTimeout(() => controller.abort(), 35000); // 35 seconds timeout

        const invokePromise = client.invoker.invoke("joke-generator", "generateJoke", HttpMethod.POST, payload);

        const response = await Promise.race([
            invokePromise,
            new Promise((_, reject) =>
                controller.signal.addEventListener('abort', () =>
                    reject(new Error(JSON.stringify('Joke Service Unreachable' )))
                )
            )
        ]);
        clearTimeout(timeout);
        console.log('Joke Creation Response:', response);
        return {
            status: 'success',
            joke: response.joke,
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