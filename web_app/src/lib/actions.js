'use server'
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from "@dapr/dapr";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";

export async function orderProduct(prevState, formData) {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);

    // Format Payload
    const payload = {
            productId: formData.get('productId'),
            orderQty: formData.get('qty')
    };

    // Invoke Service
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000); // 7 seconds timeout

        // Patch DaprClient to support abort signal (if not natively supported, wrap in Promise.race)
        const invokePromise = client.invoker.invoke("order-processor", "placeOrder", HttpMethod.POST, payload);

        const response = await Promise.race([
            invokePromise,
            new Promise((_, reject) =>
                controller.signal.addEventListener('abort', () =>
                    reject(new Error(JSON.stringify('Ordering service Unreachable' )))
                )
            )
        ]);
        clearTimeout(timeout);
        return {
            status: 'success',
            confirmationNumber: response.confirmationNumber,
            message: 'Success!  Order Placed'
        }
    } catch (error) {
        let error_msg;
        try {
            const parsed = JSON.parse(error.message);
            if (parsed && parsed.error && parsed.error.message) {
            error_msg = 'Order Error: ' + parsed.error.message;
            } else {
            error_msg = 'Order Error: ' + error.message;
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