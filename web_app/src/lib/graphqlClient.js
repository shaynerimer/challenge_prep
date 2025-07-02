'use server'
import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";
const DAPR_TIMEOUT = 2000; // 2 seconds

// Helper function to add timeout to any binding.send call
function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

export async function invokeQuery(query, variables) {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const bindingName = 'graphql';
    const operation = 'query';
    const metadata = {
        query: query
    }
    
    try {
        const response = await withTimeout(
            client.binding.send(bindingName, operation, {}, metadata),
            DAPR_TIMEOUT
        );
        return { success: true, data: response };
    }
    catch (error) {
        return { success: false, error: "Failed to fetch data from Dapr binding" };
    }

}

// Mutation to persist a joke in the database
export async function invokeCreateJoke(jokeObj) {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const bindingName = 'graphql';
    const operation = 'mutation';

    const metadata = {
        mutation: `
            mutation createJoke {
                createJoke(joke: ${JSON.stringify(jokeObj)}) {
                    joke
                    cheesiness
                    predictability
                    style
                }
            }
        `
    }

    try {
        const response = await withTimeout(
            client.binding.send(bindingName, operation, {}, metadata),
            DAPR_TIMEOUT
        );
        return { success: true, data: response };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}



// Specific mutation to delete jokes given an array of their ids.
export async function invokeDeleteMany(Ids) {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const bindingName = 'graphql';
    const operation = 'mutation';
    const idString = '[' + Ids.map(id => `"${id}"`).join(', ') + ']';
    const mutationSring = `
            mutation DeleteMultipleOrders {
                deleteOrders(ids: ${idString}) {
                    id
                }  
            }
        `
    const metadata = {
        mutation: mutationSring
    }
    
    try {
        const response = await withTimeout(
            client.binding.send(bindingName, operation, {}, metadata),
            DAPR_TIMEOUT
        );
        return response;
    }
    catch (error) {
        console.error("Dapr binding request failed:", error);
        throw new Error("Failed to invoke mutation via Dapr binding");
    }

}