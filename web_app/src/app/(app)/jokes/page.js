'use client'
// ###############################
// ####### NEEDS REVIEW ##########
// ###############################

import { useState } from 'react';

import useSWR, { mutate } from 'swr';
import { SWRConfig } from 'swr';
import { invokeQuery, invokeDeleteMany } from '@/lib/graphqlClient';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function HelpPage() {
    const [selectedOrders, setSelectedOrders] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');

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

    // Function to handle deleting selected orders when "delete selected" button is clicked
    const handleDeleteSelected = async () => {
        if (selectedOrders.size === 0) return;

        const orderIds = Array.from(selectedOrders);   
        try {
            await invokeDeleteMany(orderIds);
            // Clear selected orders on success
            setSelectedOrders(new Set());
            setSelectAll(false);
        } catch (error) {
            console.error("Error deleting orders:", error);
        }

        // Revalidate the SWR cache to refresh the order list
        mutate(orderQuery)
    }

    // Function to handle deleting a single order
    const handleDeleteSingle = async (orderId) => {
        try {
            await invokeDeleteMany([orderId]);
            // Remove the deleted order from selected orders if it was selected
            const newSelected = new Set(selectedOrders);
            newSelected.delete(orderId);
            setSelectedOrders(newSelected);
            // Update selectAll state
            setSelectAll(false);
        } catch (error) {
            console.error("Error deleting order:", error);
        }

        // Revalidate the SWR cache to refresh the order list
        mutate(orderQuery)
    }
    
    // Function to handle editing an order (placeholder for future implementation)
    const handleEdit = (orderId) => {
        // TODO: Implement edit functionality
        console.log("Edit order:", orderId);
    }
    
    // Extract orders from GraphQL response
    const rawOrders = data?.orders || [];
    
    // Sort orders based on current sort settings
    const orders = [...rawOrders].sort((a, b) => {
        if (!sortField || !sortDirection) return 0;
        
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        // Handle date fields
        if (sortField === 'createdAt') {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
        }
        
        // Handle numeric fields
        if (sortField === 'orderQty') {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
        }
        
        // Handle string fields
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field) => {
        if (sortField === field) {
            // Cycle through: asc -> desc -> none
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortDirection(null);
                setSortField(null);
            }
        } else {
            // New field, start with ascending
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) {
            return (
                <span className="inline-flex flex-col opacity-50">
                    <span className="text-xs">▲</span>
                    <span className="text-xs -mt-1">▼</span>
                </span>
            );
        }
        
        if (sortDirection === 'asc') {
            return <span className="text-xs">▲</span>;
        } else if (sortDirection === 'desc') {
            return <span className="text-xs">▼</span>;
        }
        
        return (
            <span className="inline-flex flex-col opacity-50">
                <span className="text-xs">▲</span>
                <span className="text-xs -mt-1">▼</span>
            </span>
        );
    };

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

                <button className="btn btn-error mb-4 w-45 text-error-content" disabled={selectedOrders.size === 0} onClick={handleDeleteSelected}>
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Delete Selected
                </button>

                <div className="overflow-x-auto w-full max-w-4xl shadow-lg">
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
                                <th className="border-r border-gray-300 py-2 px-3 text-sm">
                                    <button 
                                        className="flex items-center justify-between w-full hover:bg-gray-200 rounded px-1 py-1 transition-colors"
                                        onClick={() => handleSort('productId')}
                                    >
                                        <span>Product</span>
                                        {getSortIcon('productId')}
                                    </button>
                                </th>
                                <th className="border-r border-gray-300 py-2 px-3 text-sm">
                                    <button 
                                        className="flex items-center justify-between w-full hover:bg-gray-200 rounded px-1 py-1 transition-colors"
                                        onClick={() => handleSort('orderQty')}
                                    >
                                        <span>Qty.</span>
                                        {getSortIcon('orderQty')}
                                    </button>
                                </th>
                                <th className="border-r border-gray-300 py-2 px-3 text-sm">
                                    <button 
                                        className="flex items-center justify-between w-full hover:bg-gray-200 rounded px-1 py-1 transition-colors"
                                        onClick={() => handleSort('confirmationNumber')}
                                    >
                                        <span>Confirmation Number</span>
                                        {getSortIcon('confirmationNumber')}
                                    </button>
                                </th>
                                <th className="border-r border-gray-300 py-2 px-3 text-sm">
                                    <button 
                                        className="flex items-center justify-between w-full hover:bg-gray-200 rounded px-1 py-1 transition-colors"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        <span>Ordered At</span>
                                        {getSortIcon('createdAt')}
                                    </button>
                                </th>
                                <th className="py-2 px-3 text-sm">
                                    <span>Actions</span>
                                </th>
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
                                    <td className="border-r border-gray-200 py-1 px-3 text-sm">{new Date(parseInt(order.createdAt)).toLocaleString()}</td>
                                    <td className="py-1 px-3">
                                        <div className="flex gap-2">
                                            <button 
                                                className="btn btn-sm btn-ghost p-1 hover:bg-blue-100"
                                                onClick={() => handleEdit(order.id)}
                                                title="Edit order"
                                            >
                                                <PencilIcon className="h-4 w-4 text-blue-600" />
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-ghost p-1 hover:bg-red-100"
                                                onClick={() => handleDeleteSingle(order.id)}
                                                title="Delete order"
                                            >
                                                <TrashIcon className="h-4 w-4 text-red-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SWRConfig>
    )
}