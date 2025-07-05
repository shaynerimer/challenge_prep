'use client'
import { useState } from 'react';

import useSWR, { mutate } from 'swr';
import { SWRConfig } from 'swr';
import { invokeQueryAll, invokeDeleteMany, invokeUpdateJoke } from '@/lib/graphqlClient';
import { TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function HelpPage() {
    const [selectedJokes, setSelectedJokes] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [filterStyle, setFilterStyle] = useState('all');

    // Use SWR to interact with Dapr binding to fetch GraphQL data
    const fetcher = () => invokeQueryAll();
    const { data, error } = useSWR("jokes", fetcher);

    // Handle deleting selected jokes when "delete selected" button is clicked
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

        // Trigger re-validation of the SWR cache
        mutate("jokes");
    }

    // Handle deleting a single joke
    const handleDeleteSingle = async (jokeId) => {
        try {
            const response = await invokeDeleteMany([jokeId]);
            if (response && !response.error) {
                // Remove the deleted joke from selected jokes if it was selected
                const newSelected = new Set(selectedJokes);
                newSelected.delete(jokeId);
                setSelectedJokes(newSelected);
                setSelectAll(false);
            } else {
                console.error("Error deleting joke:", response.error);
            }
        } catch (error) {
            console.error("Error deleting joke:", error);
        }

        // Trigger re-validation of the SWR cache
        mutate("jokes");
    }
    
    // Handle toggling favorite status
    const handleToggleFavorite = async (joke) => {
        const updatedJoke = {
            ...joke,
            favorite: !joke.favorite
        };
        try {
            const response = await invokeUpdateJoke(updatedJoke, 'favorite');
            if (response && response.error) {
                console.error("Error updating joke favorite status:", response.error);
                
            }

            // Trigger re-validation of the SWR cache
            mutate("jokes");
        } catch (error) {
            console.error("Error updating joke favorite status:", error);
        }
    }

    // Handle toggling favorite status
    const handleToggleTold = async (joke) => {
        const updatedJoke = {
            ...joke,
            told: !joke.told
        };
        try {
            const response = await invokeUpdateJoke(updatedJoke, 'told');
            if (response && response.error) {
                console.error("Error updating joke told status:", response.error);
            }

            // Trigger re-validation of the SWR cache
            mutate("jokes");
        } catch (error) {
            console.error("Error updating joke told status:", error);
        }
    }

    // Handle selecting/deselecting all jokes
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedJokes(new Set());
        } else {
            setSelectedJokes(new Set(filteredAndSortedJokes.map(joke => joke.id)));
        }
        setSelectAll(!selectAll);
    };

    // Handle selecting/deselecting individual jokes
    const handleJokeSelect = (jokeId) => {
        const newSelected = new Set(selectedJokes);
        if (newSelected.has(jokeId)) {
            newSelected.delete(jokeId);
        } else {
            newSelected.add(jokeId);
        }
        setSelectedJokes(newSelected);
        setSelectAll(newSelected.size === filteredAndSortedJokes.length && filteredAndSortedJokes.length > 0);
    };
    
    // Extract jokes from GraphQL response
    const rawJokes = data?.data?.jokes || [];

    // Get unique styles for filter dropdown
    const uniqueStyles = [...new Set(rawJokes.map(joke => joke.style).filter(Boolean))];

    // Filter jokes by style
    const filteredJokes = filterStyle === 'all' 
        ? rawJokes 
        : rawJokes.filter(joke => joke.style === filterStyle);
    
    // Specifiy Sort Rules for specific data types
    const filteredAndSortedJokes = [...filteredJokes].sort((a, b) => {
        if (!sortField || !sortDirection) return 0;
        
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        // Handle date fields
        if (sortField === 'createdAt') {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
        }
        
        // Handle numeric fields
        if (sortField === 'cheesiness' || sortField === 'predictability') {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
        }
        
        // Handle boolean fields
        if (sortField === 'favorite') {
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
                <h1 className='mb-10 text-4xl font-bold text-left'>My Jokes</h1>
                <div className="alert alert-error">
                    <span>Error loading jokes: {error.message}</span>
                </div>
            </div>
        );
    }

    return (
        <SWRConfig value={{ fetcher }}>
            <div className='bg-transparent h-full w-full flex flex-col p-6'>
                <h1 className='mb-10 text-4xl font-bold text-left'>My Jokes</h1>

                {/* Controls section */}
                <div className="mb-6 space-y-4">
                    {/* Top row: Select All and Delete Selected */}
                    <div className="flex items-center gap-4">
                        <button 
                            className="btn btn-outline btn-sm"
                            onClick={handleSelectAll}
                        >
                            {selectAll ? 'Deselect All' : 'Select All'}
                        </button>
                        
                        <button 
                            className="btn btn-error btn-sm text-error-content" 
                            disabled={selectedJokes.size === 0} 
                            onClick={handleDeleteSelected}
                        >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete Selected ({selectedJokes.size})
                        </button>
                    </div>

                    {/* Filters and Sorting */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Style Filter */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text mr-5 font-medium">Filter by Style:</span>
                            </label>
                            <select 
                                className="select select-bordered select-sm w-48"
                                value={filterStyle}
                                onChange={(e) => setFilterStyle(e.target.value)}
                            >
                                <option value="all">All Styles</option>
                                {uniqueStyles.map(style => (
                                    <option key={style} value={style}>{style}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Field */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Sort by:</span>
                            </label>
                            <select 
                                className="select select-bordered select-sm w-40"
                                value={sortField || ''}
                                onChange={(e) => {
                                    const field = e.target.value;
                                    setSortField(field);
                                }}
                            >
                                <option value="style">Style</option>
                                <option value="cheesiness">Cheesiness</option>
                                <option value="predictability">Predictability</option>
                                <option value="favorite">Favorite</option>
                                <option value="createdAt">Date Created</option>
                            </select>
                        </div>

                        {/* Sort Direction */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Direction:</span>
                            </label>
                            <select 
                                className="select select-bordered select-sm w-32"
                                value={sortDirection || 'asc'}
                                onChange={(e) => setSortDirection(e.target.value)}
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Responsive grid of joke cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredAndSortedJokes.map(joke => (
                        <div key={joke.id} className="card bg-base-100 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow relative">
                            {/* Select Checkbox in top right corner */}
                            <div className="absolute top-2 right-2 z-10">
                                <input 
                                    type="checkbox" 
                                    className="checkbox checkbox-sm" 
                                    checked={selectedJokes.has(joke.id)}
                                    onChange={() => handleJokeSelect(joke.id)}
                                />
                            </div>

                            <div className="card-body p-4">
                                {/* Joke text */}
                                <p className="text-xl tracking-tight leading-snug font-bold text-base-content  mb-3 line-clamp-3 pr-8" title={joke.joke}>
                                    {joke.joke}
                                </p>
                                
                                {/* Joke Details */}
                                <div className="space-y-2 text-xs text-gray-600">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Style:</span>
                                        <span className="capitalize">{joke.style}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Cheesiness:</span>
                                        <span>{joke.cheesiness + 1}/4</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Predictability:</span>
                                        <span>{joke.predictability + 1}/3</span>
                                    </div>
                                </div>
                                
                                {/* Action buttons */}
                                <div className="card-actions justify-between items-center mt-4 pt-3 border-t border-gray-200">
                                    <div className='flex justify-between w-25'>
                                    {/* Toggle Favorite Status */}
                                    <button 
                                        className="btn btn-sm btn-ghost p-1 hover:bg-yellow-100"
                                        onClick={() => handleToggleFavorite(joke)}
                                        title={joke.favorite ? "Remove from favorites" : "Add to favorites"}
                                    >
                                        {joke.favorite ? (
                                            <StarIconSolid className="h-5 w-5 text-yellow-500" />
                                        ) : (
                                            <StarIcon className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
                                        )}
                                    </button>

                                    {/* Toggle Told Status */}
                                    <button
                                        className={`btn btn-sm ${!joke.told ? 'btn-base' : 'btn-success'} ${!joke.told ? 'btn-outline' : ''} w-16 p-1 hover:bg-blue-100`}
                                        onClick={() => handleToggleTold(joke)}
                                        title="Toggle Joke Told"
                                    >
                                        {!joke.told ? "Not Told" : "Told"}
                                    </button>
                                    </div>
                                    
                                    {/* Delete button */}
                                    <button 
                                        className="btn btn-sm btn-ghost p-1 hover:bg-red-100"
                                        onClick={() => handleDeleteSingle(joke.id)}
                                        title="Delete joke"
                                    >
                                        <TrashIcon className="h-5 w-5 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                {filteredAndSortedJokes.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            {filterStyle === 'all' ? 
                                "No jokes found. Add some jokes to get started!" : 
                                `No jokes found with style "${filterStyle}". Try a different filter.`
                            }
                        </p>
                    </div>
                )}
            </div>
        </SWRConfig>
    )
}