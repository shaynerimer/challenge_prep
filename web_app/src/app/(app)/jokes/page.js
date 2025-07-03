'use client'
// ###############################
// ####### NEEDS REVIEW ##########
// ###############################

import { useState } from 'react';

import useSWR, { mutate } from 'swr';
import { SWRConfig } from 'swr';
import { invokeQueryAll, invokeDeleteMany } from '@/lib/graphqlClient';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function HelpPage() {
    const [selectedJokes, setSelectedJokes] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');

    // Use SWR to interact with Dapr binding to fetch GraphQL data
    const fetcher = () => invokeQueryAll();
    const { data, error } = useSWR("jokes", fetcher);

    // Function to handle deleting selected jokes when "delete selected" button is clicked
    const handleDeleteSelected = async () => {
        if (selectedJokes.size === 0) return;

        const jokeIds = Array.from(selectedJokes);   
        try {
            const response = await invokeDeleteMany(jokeIds);
            if (response && !response.error) {
                // Clear selected jokes on success
                setSelectedJokes(new Set());
                setSelectAll(false);
            } else {
                console.error("Error deleting jokes:", response.error);
            }
        } catch (error) {
            console.error("Error deleting jokes:", error);
        }

        // Revalidate the SWR cache to refresh the joke list
        mutate("jokes");
    }

    // Function to handle deleting a single joke
    const handleDeleteSingle = async (jokeId) => {
        try {
            const response = await invokeDeleteMany([jokeId]);
            if (response && !response.error) {
                // Remove the deleted joke from selected jokes if it was selected
                const newSelected = new Set(selectedJokes);
                newSelected.delete(jokeId);
                setSelectedJokes(newSelected);
                // Update selectAll state
                setSelectAll(false);
            } else {
                console.error("Error deleting joke:", response.error);
            }
        } catch (error) {
            console.error("Error deleting joke:", error);
        }

        // Revalidate the SWR cache to refresh the joke list
        mutate("jokes");
    }
    
    // Function to handle editing a joke (placeholder for future implementation)
    const handleEdit = (jokeId) => {
        // TODO: Implement edit functionality
        console.log("Edit joke:", jokeId);
    }
    
    // Extract jokes from GraphQL response
    const rawJokes = data?.data?.jokes || [];
    
    // Sort jokes based on current sort settings
    const jokes = [...rawJokes].sort((a, b) => {
        if (!sortField || !sortDirection) return 0;
        
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        // Handle date fields
        if (sortField === 'createdAt') {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
        }
        
        // Handle numeric fields
        if (sortField === 'cheesiness' || sortField === 'predictability' || sortField === 'eyeRollResponse' || sortField === 'groanResponse' || sortField === 'selfLaughResponse') {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
        }
        
        // Handle boolean fields
        if (sortField === 'told' || sortField === 'favorite') {
            aValue = aValue ? 1 : 0;
            bValue = bValue ? 1 : 0;
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
            setSelectedJokes(new Set());
        } else {
            setSelectedJokes(new Set(jokes.map(joke => joke.id)));
        }
        setSelectAll(!selectAll);
    };

    const handleJokeSelect = (jokeId) => {
        const newSelected = new Set(selectedJokes);
        if (newSelected.has(jokeId)) {
            newSelected.delete(jokeId);
        } else {
            newSelected.add(jokeId);
        }
        setSelectedJokes(newSelected);
        setSelectAll(newSelected.size === jokes.length);
    };

    // Show loading state
    if (!data && !error) {
        return (
            <div className='bg-transparent h-full w-full flex flex-col p-6'>
                <h1 className='mb-10 text-4xl font-bold text-left'>My Joke Collection</h1>
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
                <h1 className='mb-10 text-4xl font-bold text-left'>Joke Collection</h1>
                <div className="alert alert-error">
                    <span>Error loading jokes: {error.message}</span>
                </div>
            </div>
        );
    }

    return (
        <SWRConfig value={{ fetcher }}>
            <div className='bg-transparent h-full w-full flex flex-col p-6'>
                <h1 className='mb-10 text-4xl font-bold text-left'>Joke Collection</h1>

                <button className="btn btn-error mb-4 w-45 text-error-content" disabled={selectedJokes.size === 0} onClick={handleDeleteSelected}>
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
                                        onClick={() => handleSort('joke')}
                                    >
                                        <span>Joke</span>
                                        {getSortIcon('joke')}
                                    </button>
                                </th>
                                <th className="border-r border-gray-300 py-2 px-3 text-sm">
                                    <button 
                                        className="flex items-center justify-between w-full hover:bg-gray-200 rounded px-1 py-1 transition-colors"
                                        onClick={() => handleSort('style')}
                                    >
                                        <span>Style</span>
                                        {getSortIcon('style')}
                                    </button>
                                </th>
                                <th className="border-r border-gray-300 py-2 px-3 text-sm">
                                    <button 
                                        className="flex items-center justify-between w-full hover:bg-gray-200 rounded px-1 py-1 transition-colors"
                                        onClick={() => handleSort('cheesiness')}
                                    >
                                        <span>Cheesiness</span>
                                        {getSortIcon('cheesiness')}
                                    </button>
                                </th>
                                <th className="border-r border-gray-300 py-2 px-3 text-sm">
                                    <button 
                                        className="flex items-center justify-between w-full hover:bg-gray-200 rounded px-1 py-1 transition-colors"
                                        onClick={() => handleSort('predictability')}
                                    >
                                        <span>Predictability</span>
                                        {getSortIcon('predictability')}
                                    </button>
                                </th>
                                <th className="border-r border-gray-300 py-2 px-3 text-sm">
                                    <button 
                                        className="flex items-center justify-between w-full hover:bg-gray-200 rounded px-1 py-1 transition-colors"
                                        onClick={() => handleSort('favorite')}
                                    >
                                        <span>Favorite</span>
                                        {getSortIcon('favorite')}
                                    </button>
                                </th>
                                <th className="py-2 px-3 text-sm">
                                    <span>Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {jokes.map(joke => (
                                <tr key={joke.id} className="border-b border-gray-200 h-10 hover:bg-gray-50">
                                    <td className="border-r border-gray-200 py-1 px-3">
                                        <input 
                                            type="checkbox" 
                                            className="checkbox checkbox-sm" 
                                            checked={selectedJokes.has(joke.id)}
                                            onChange={() => handleJokeSelect(joke.id)}
                                        />
                                    </td>
                                    <td className="border-r border-gray-200 py-1 px-3 text-sm max-w-xs truncate" title={joke.joke}>
                                        {joke.joke}
                                    </td>
                                    <td className="border-r border-gray-200 py-1 px-3 text-sm">{joke.style}</td>
                                    <td className="border-r border-gray-200 py-1 px-3 text-sm">{joke.cheesiness}</td>
                                    <td className="border-r border-gray-200 py-1 px-3 text-sm">{joke.predictability}</td>
                                    <td className="border-r border-gray-200 py-1 px-3 text-sm">
                                        {joke.favorite ? (
                                            <span className="text-yellow-500">★</span>
                                        ) : (
                                            <span className="text-gray-300">☆</span>
                                        )}
                                    </td>
                                    <td className="py-1 px-3">
                                        <div className="flex gap-2">
                                            <button 
                                                className="btn btn-sm btn-ghost p-1 hover:bg-blue-100"
                                                onClick={() => handleEdit(joke.id)}
                                                title="Edit joke"
                                            >
                                                <PencilIcon className="h-4 w-4 text-blue-600" />
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-ghost p-1 hover:bg-red-100"
                                                onClick={() => handleDeleteSingle(joke.id)}
                                                title="Delete joke"
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