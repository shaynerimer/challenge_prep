'use client'
import { useState } from 'react';
import { JokeGeneratorCard } from '@/components/jokeGeneratorCard';
import { JokeConfirmationCard } from '@/components/jokeConfirmationCard';

export default function HomePage() {

    const [jokeNeedsConfirmation, setJokeNeedsConfirmation] = useState(false);
    const [joke, setJoke] = useState(null);
    const [recentJokes, setRecentJokes] = useState([]);


    return (
        
        <div className='bg-transparent h-full p-10 w-full flex flex-col justify-center items-center'>
           
           {/* Page Title */}
           <h1 className='text-3xl font-bold mb-4'>Dad Joke Generator</h1>

            {/* Main card container */}
            {/* This card will swap between the joke generator and confirmation card UIs based on jokeNeedsConfirmation state */}
            <div className="card w-4xl h-full mx-auto mt-8 bg-base-100 shadow-xl">
                {/* Joke Generator card front */}
                {!jokeNeedsConfirmation &&
                    <JokeGeneratorCard swapCard={(joke) => {
                        setJoke(joke)
                        setRecentJokes([...recentJokes.slice(-4), joke])
                        setJokeNeedsConfirmation(true)
                    }} />
                }
                {/* Confirmation card front */}
                {jokeNeedsConfirmation &&
                    <JokeConfirmationCard joke={joke} swapCard={() => {
                        // Reset state when save is complete or user closes card
                        setJokeNeedsConfirmation(false)
                        setJoke(null)
                    }}
                    />
                }
            </div>

        </div>
    )
}