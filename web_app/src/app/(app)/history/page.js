'use client'
import { useState } from 'react';

import useSWR from 'swr';
import { SWRConfig } from 'swr';
import { invokeQuery } from '@/lib/graphqlClient';

export default function HelpPage() {
    const [selectedOrders, setSelectedOrders] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Use SWR to interact with Dapr binding to fetch GraphQL data
    const fetcher = (query, variables) => invokeQuery(query, variables);
    const orderQuery = `
        query {
            orders {
                id,
                productId,
                orderQty,
                createdAt,
                confirmationNumber
            }
        }`
    const { data, error } = useSWR(orderQuery, fetcher);
    
    // Extract orders from GraphQL response
    const orders = data?.orders || [];

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(orders.map(order => order.id)));
        }
        setSelectAll(!selectAll);
    };

    const handleOrderSelect = (orderId) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
        } else {
            newSelected.add(orderId);
        }
        setSelectedOrders(newSelected);
        setSelectAll(newSelected.size === orders.length);
    };

    // Show loading state
    if (!data && !error) {
        return (
            <div className='bg-transparent h-full w-full flex flex-col p-6'>
                <h1 className='mb-10 text-4xl font-bold text-left'>Order History</h1>
                <div className="flex justify-center items-center h-32">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className='bg-transparent h-full w-full flex flex-col p-6'>
                <h1 className='mb-10 text-4xl font-bold text-left'>Order History</h1>
                <div className="alert alert-error">
                    <span>Error loading orders: {error.message}</span>
                </div>
            </div>
        );
    }

    return (
        <SWRConfig value={{ fetcher }}>
            <div className='bg-transparent h-full w-full flex flex-col p-6'>
                <h1 className='mb-10 text-4xl font-bold text-left'>Order History</h1>
                <div className="overflow-x-auto w-full max-w-3xl shadow-lg">
                    <table className="table table-zebra w-full border border-gray-300">
                        <thead className="bg-accent">
                            <tr className="border-b border-gray-300 h-10 text-accent-content">
                                <th className="border-r border-gray-300 py-2 px-3">
                                    <input 
                                        type="checkbox" 
                                        className="checkbox checkbox-sm" 
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="border-r border-gray-300 py-2 px-3 text-sm">Product</th>
                                <th className="border-r border-gray-300 py-2 px-3 text-sm">Qty.</th>
                                <th className="border-r border-gray-300 py-2 px-3 text-sm">Confirmation Number</th>
                                <th className="py-2 px-3 text-sm">Order Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-b border-gray-200 h-10 hover:bg-gray-50">
                                    <td className="border-r border-gray-200 py-1 px-3">
                                        <input 
                                            type="checkbox" 
                                            className="checkbox checkbox-sm" 
                                            checked={selectedOrders.has(order.id)}
                                            onChange={() => handleOrderSelect(order.id)}
                                        />
                                    </td>
                                    <td className="border-r border-gray-200 py-1 px-3 text-sm">{order.productId}</td>
                                    <td className="border-r border-gray-200 py-1 px-3 text-sm">{order.orderQty}</td>
                                    <td className="border-r border-gray-200 py-1 px-3 text-sm">{order.confirmationNumber}</td>
                                    <td className="py-1 px-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SWRConfig>
    )
}