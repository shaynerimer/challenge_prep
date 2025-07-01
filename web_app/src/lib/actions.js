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
        const response = await client.invoker.invoke("order-processor", "placeOrder", HttpMethod.POST, payload);
        return {
            status: 'success',
            confirmationNumber: response.confirmationNumber,
            message: 'Success!  Order Placed'
        }
    } catch (error) {
        const error_msg = 'Order Error: ' + JSON.parse(JSON.parse(error.message).error_msg).error;
        return {
            status: 'error',
            message: error_msg
        }
    }
}