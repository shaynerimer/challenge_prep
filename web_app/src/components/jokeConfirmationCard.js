'use client'
import React, { useState, useActionState } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
 
export function JokeConfirmationCard({ joke, swapCard }) {

    const handleSave = async () => {
        console.log('Saving joke:', joke);
    }

    return (
        <div className='p-6 flex flex-col h-full justify-center'>
            {/* Close Icon */}
            <button
                className="absolute top-4 right-4 btn btn-ghost"
                aria-label="Close"
                onClick={swapCard}
                type="button"
            >
                <XMarkIcon className="h-6 w-6 text-base-content hover:text-base-content" />
            </button>

            {/* Green Checkmark Circle */}
            <div className="flex justify-center items-end mb-5">
                <CheckCircleIcon className="h-45 w-45 text-success drop-shadow-lg" />
            </div>

            {/* Joke Text */}
            <div className="text-center py-0 px-10">
                <span className="block text-4xl font-extrabold text-base-content leading-snug mb-2 tracking-tight">
                    {joke}
                </span>
                <span className="block text-base text-base-content italic">
                    (Ready to save this joke?)
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 place-self-end mt-4">
                <button className="btn btn-outline" onClick={swapCard} type="button">
                    Let's Try Again
                </button>
                <button className="btn btn-success" onClick={handleSave} type="button">
                    Keep It!
                </button>
            </div>
        </div>
)

}