'use client'
import React, { useState, useActionState } from 'react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { invokeCreateJoke } from '@/lib/graphqlClient';
import { Alert } from '@/components/alert';
 
export function JokeConfirmationCard({ joke, swapCard }) {

    const [saving, setSaving] = useState(false);
    const [saveState, setSaveState] = useState(null) // 'success' or 'error'
    const [returning, setReturning] = useState(false); // State to track if we're returning to the generator card

    const handleSave = async () => {
        setSaving(true);
        setSaveState(null); // Reset save state
        
        try {
            const response = await invokeCreateJoke(joke);
            
            // Check if response indicates success
            if (response && !response.error) {
                setSaveState('success');
                setSaving(false);
                setReturning(true);
                setTimeout(() => {
                    setSaving(false)
                    swapCard(); // Notify parent to swap card back to generator after success
                }, 3000);
            } else {
                setSaveState('error');
                setSaving(false);
            }
        }
        catch(error) {
            setSaveState('error');
            setSaving(false);
        }
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
                    {joke.joke}
                </span>
                <span className="block text-base text-base-content italic">
                    (Ready to save this joke?)
                </span>
            </div>

            {/* Action Buttons */}
            { !returning &&
                <div className="flex gap-4 place-self-end mt-4">
                    <button className="btn btn-outline" onClick={swapCard} type="button" disabled={saving}>
                        Let's Go Back
                    </button>
                    <button className="btn btn-success" onClick={handleSave} type="button" disabled={saving}>
                        {saving ? <span className='loading loading-spinner'></span> : 'Keep It!'}
                    </button>
                </div>
            }
            { returning && 
                <div className="flex gap-4 place-self-end mt-4">
                    <button className="btn btn-outline" type="button" disabled={true}>
                        Returning to Generator...
                    </button>
                </div>
            }

            {/* Submission success and error alerts */}
            {saveState ==='success' && <Alert variant='success' TTL={3}>
                <CheckCircleIcon width={30}/>
                Joke saved successfully!
            </Alert>
            }
            {!saving && saveState ==='error' && <Alert variant='error' TTL={3}>
                <XCircleIcon width={30}/>
                Error saving joke. Please try again.
            </Alert>
            }
        </div>
)
}