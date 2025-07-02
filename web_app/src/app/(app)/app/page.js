'use client'
import { useState } from 'react';
import { JokeGeneratorCard } from '@/components/jokeGeneratorCard';
import { JokeConfirmationCard } from '@/components/jokeConfirmationCard';

export default function AppPage() {

    const [jokeNeedsConfirmation, setJokeNeedsConfirmation] = useState(false);
    const [joke, setJoke] = useState(null);


    return (
        
        <div className='bg-transparent h-full p-10 w-full flex flex-col justify-center items-center'>
           
           {/* Page Title */}
           <h1 className='text-3xl font-bold mb-4'>Dad Joke Generator</h1>

            <div className="card w-4xl h-full mx-auto mt-8 bg-base-100 shadow-xl">
            {/* this hidden checkbox controls the state */}
                {/* <input type="checkbox" checked={jokeNeedsConfirmation} readOnly/> */}

                {/* Joke Generator UI */}
                {!jokeNeedsConfirmation &&
                    <JokeGeneratorCard swapCard={(joke) => {
                        setJoke(joke)
                        setJokeNeedsConfirmation(true)
                    }} />
                }
                    

                {/* Placeholder for swap-off content */}
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