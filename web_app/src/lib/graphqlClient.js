'use server'
import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";
import winston from 'winston';
import { auth } from '@clerk/nextjs/server';

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";
const DAPR_TIMEOUT = 2000; // 2 seconds

/* --- Begin Logging Config --- */

const addLogType = winston.format((info) => {
    info.logType = 'Application';
    return info;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        addLogType(),
        winston.format.json()
    ),
    transports: [new winston.transports.Console()]
});

/* --- End Logging Config --- */

// Obtain current user from Clerk
async function getCurrentUser() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return 'unauthenticated_user';
        }
        return userId;
    } catch (error) {
        logger.warn('Failed to get current User', { error: error.message });
        return 'unauthenticated_user';
    }
}

// Helper function to add timeout to any binding.send call
function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

export async function invokeQueryAll() {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const bindingName = 'graphql';
    const operation = 'query';
    const metadata = {
        query: `
        query {
            jokes {
                id
                joke
                cheesiness
                predictability
                style
                told
                favorite
                eyeRollResponse
                groanResponse
                selfLaughResponse
                createdAt
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
        return { success: false, error: "Failed to fetch data from Dapr binding", error_msg: error };
    }

}

// Mutation to persist a joke in the database
export async function invokeCreateJoke(jokeObj) {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const bindingName = 'graphql';
    const operation = 'mutation';

    let metadata = {
        mutation: `
            mutation {
                createJoke(
                    joke: ${JSON.stringify(jokeObj.joke)},
                    cheesiness: ${jokeObj.cheesiness},
                    predictability: ${jokeObj.predictability},
                    style: ${JSON.stringify(jokeObj.style)}
                ) {
                    id
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
        
        const currentUser = await getCurrentUser();
        logger.info({
            user: currentUser,
            action: 'Saved Joke',
            joke: {
                id: response.createJoke.id,
                text: JSON.stringify(jokeObj.joke)
            }
        });
        return { success: true, data: response };
    }
    catch (error) {
        return { success: false, error: error };
    }
}

// Mutation to update a joke in the database
export async function invokeUpdateJoke(jokeObj, action) {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const bindingName = 'graphql';
    const operation = 'mutation';
    const metadata = {
        mutation: `
            mutation {
                updateJoke(
                    id: "${jokeObj.id}",
                    joke: ${JSON.stringify(jokeObj.joke)},
                    cheesiness: ${jokeObj.cheesiness},
                    predictability: ${jokeObj.predictability},
                    style: ${JSON.stringify(jokeObj.style)},
                    told: ${jokeObj.told},
                    favorite: ${jokeObj.favorite},
                    eyeRollResponse: ${jokeObj.eyeRollResponse},
                    groanResponse: ${jokeObj.groanResponse},
                    selfLaughResponse: ${jokeObj.selfLaughResponse}
                ) {
                    id
                }
            }
        `
    }

    try {
        const response = await withTimeout(
            client.binding.send(bindingName, operation, {}, metadata),
            DAPR_TIMEOUT
        );
        
        const currentUser = await getCurrentUser();
        logger.info({
            user: currentUser,
            action: action === 'told' ? 'Toggled Told Status' : 'Toggled Favorite Status',
            joke: {
                id: jokeObj.id,
                text: JSON.stringify(jokeObj.joke)
            }
        });
        return { success: true, data: response };
    }
    catch (error) {
        return { success: false, error: error };
    }
}


// Specific mutation to delete jokes given an array of their ids.
export async function invokeDeleteMany(Ids) {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const bindingName = 'graphql';
    const operation = 'mutation';
    const idString = '[' + Ids.map(id => `"${id}"`).join(', ') + ']';
    const mutationString = `
            mutation DeleteMultipleJokes {
                deleteJokes(ids: ${idString}) {
                    id
                }  
            }
        `
    const metadata = {
        mutation: mutationString
    }
    
    try {
        const response = await withTimeout(
            client.binding.send(bindingName, operation, {}, metadata),
            DAPR_TIMEOUT
        );
        
        const currentUser = await getCurrentUser();
        logger.info({
            user: currentUser,
            action: 'Deleted Jokes',
            jokes: {
                ids: Ids,
            }
        });
        return { success: true, data: response };
    }
    catch (error) {
        return { success: false, error: error };
    }

}