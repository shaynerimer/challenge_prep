'use server'
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from "@dapr/dapr";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";

export async function invokeQuery(query, variables) {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const bindingName = 'graphql';
    const operation = 'query';
    const metadata = {
        query: query
    }
    
    try {
        const response = await client.binding.send(bindingName, operation, {}, metadata);
        return response;
    }
    catch (error) {
        console.error("Dapr binding request failed:", error);
        throw new Error("Failed to fetch data from Dapr binding");
    }

}