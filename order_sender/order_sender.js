const { DaprClient } = require('@dapr/dapr');

const daprClient = new DaprClient();

const SERVICE_APP_ID = 'order-processor'; // The app-id of your order processor service
const METHOD_NAME = 'placeOrder';

async function placeOrder() {
    try {
        console.log('Sending order request...');
        
        const orderData = {
            productId: 'laptop-123',
            orderQty: 2
        };

        console.log('Order data:', JSON.stringify(orderData, null, 2));

        const response = await daprClient.invoker.invoke(
            SERVICE_APP_ID,
            METHOD_NAME,
            'POST',
            orderData
        );

        console.log('✅ Order placed successfully!');
        console.log('Response:', JSON.stringify(response, null, 2));

        if (response.confirmationNumber) {
            console.log(`🎉 Confirmation Number: ${response.confirmationNumber}`);
        }

    } catch (error) {
        console.error('❌ Error placing order:', error.message);
        
        if (error.response && error.response.data) {
            console.error('Error details:', error.response.data);
        }
    } finally {
        // Clean up the Dapr client
        await daprClient.close();
    }
}

async function placeMultipleOrders() {
    const orders = [
        { productId: 'laptop-123', orderQty: 1 },
        { productId: 'phone-456', orderQty: 3 },
        { productId: 'tablet-789', orderQty: 2 }
    ];

    function randomDelay(minMs, maxMs) {
        return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs));
    }

    let orderCount = 1;
    while (true) {
        const order = orders[Math.floor(Math.random() * orders.length)];
        console.log(`\n--- Placing Order ${orderCount} ---`);
        try {
            const response = await daprClient.invoker.invoke(
                SERVICE_APP_ID,
                METHOD_NAME,
                'POST',
                order
            );
            console.log(`✅ Order ${orderCount} successful:`, response);
        } catch (error) {
            console.error(`❌ Order ${orderCount} failed:`, error.message);
        }
        orderCount++;
        await randomDelay(1000, 5000); // Random delay between 1s and 5s
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting Order Sender...\n');
    
    // Uncomment to test multiple orders
    await placeMultipleOrders();
}

// Run the application
main().catch(console.error);