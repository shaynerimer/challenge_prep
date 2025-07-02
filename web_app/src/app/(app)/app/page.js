'use client'
import { JokeGeneratorCard } from '@/components/jokeGeneratorCard';

export default function AppPage() {


    return (
        
        <div className='bg-transparent h-full w-full flex flex-col justify-center items-center'>
           
           {/* Page Title */}
           <h1 className='text-3xl font-bold mb-4'>Dad Joke Generator</h1>

           {/* Joke Generator Card */}
           <JokeGeneratorCard />

        </div>
    )
}