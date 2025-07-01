'use client'
import { useActionState } from 'react';
import { orderProduct } from '@/lib/actions'
import { Alert } from '@/components/alert';

import { SWRConfig } from 'swr';
import useSWR from 'swr';
import { client } from '@/lib/graphqlClient';

import { CheckCircleIcon, XCircleIcon} from '@heroicons/react/24/outline';

export default function AppPage() {

    const handleSubmit = async (prevState, formData) => {
        // Call orderProduct action
        const res = await orderProduct(prevState, formData)
        // Need an error message returned here if the service is unreachable
        return res
    }
    const [state, orderProductAction, isPending] = useActionState(handleSubmit, {});

    const fetcher = (query, variables) => client.request(query, variables);
    const testQuery = `
        query {
            feed {
                id,
                description,
                url
            }
        }`
        const { data, error } = useSWR(testQuery, fetcher);

        if (data && !error) {
            console.log('GraphQL data loaded:', data);
        }

    return (
        <SWRConfig value={{ fetcher }}>
        <div className='bg-transparent h-full w-full flex flex-col justify-center items-center'>
            <h1 className='mb-10 text-4xl font-bold'>Products</h1>
            <div className="flex gap-8">

                {/* Product Card 1 */}
                <div className="bg-base-100 rounded-lg shadow-md p-6 flex flex-col items-center w-72">
                    <img
                        src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
                        alt="Product 1"
                        className="w-full h-40 object-cover rounded mb-4"
                    />
                    <h2 className="text-xl font-semibold mb-2">EcoSmart Water Bottle</h2>
                    <p className=" mb-4 text-center">
                        Stay hydrated on the go with this eco-friendly, insulated water bottle. Keeps drinks cold for 24 hours!
                    </p>
                    <div className="flex items-center mb-4">
                        <form action={orderProductAction}>
                            <fieldset>
                                <label htmlFor="qty" className="mr-2">Qty:</label>
                                <input id="qty" name='qty' type="number" min="1" defaultValue="1" className="input input-primary w-16" />
                                <input id="productId" name='productId' type='hidden' value="bottle-abc123" readOnly />
                                <button type='submit' className="btn btn-primary ml-5 w-20" disabled={isPending}>{isPending ? <span className='loading loading-spinner'></span> : 'Order'}</button>
                            </fieldset>
                        </form>
                    </div>
                </div>

                {/* Product Card 2 */}
                <div className="bg-base-100 rounded-lg shadow-md p-6 flex flex-col items-center w-72">
                    <img
                        src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80"
                        alt="Product 2"
                        className="w-full h-40 object-cover rounded mb-4"
                    />
                    <h2 className="text-xl font-semibold mb-2">Wireless Headphones</h2>
                    <p className=" mb-4 text-center">
                        Experience high-fidelity sound with these comfortable, long-lasting wireless headphones. Perfect for music lovers!
                    </p>
                    <div className="flex items-center mb-4">
                        <form action={orderProductAction}>
                            <fieldset>
                                <label htmlFor="qty" className="mr-2">Qty:</label>
                                <input id="qty" name='qty' type="number" min="1" defaultValue="1" className="input input-primary w-16" />
                                {/* <input id="productId" name='productId' type='hidden' value="headphones-abc123" readOnly /> */}
                                <button type='submit' className="btn btn-primary ml-5 w-20" disabled={isPending}>{isPending ? <span className='loading loading-spinner'></span> : 'Order'}</button>
                            </fieldset>
                        </form>
                    </div>
                </div>

            </div>

            {!isPending && state.status ==='success' && <Alert variant='success' TTL={3}>
                <CheckCircleIcon width={30}/>
                {state.message}
            </Alert>
            }
            
            {!isPending && state.status ==='error' && <Alert variant='error' TTL={3}>
                <XCircleIcon width={30}/>
                {state.message}
            </Alert>
            }

            {data && data.feed && data?.feed?.length > 0 ? (
                data.feed.map(item => (
                    <p key={item.id}>{item.description && item.description.formatted ? item.description.formatted : item.description}</p>
                ))
            ) : (
                <p>No feed data available.</p>
            )}
        </div>
        </SWRConfig>
    )
}