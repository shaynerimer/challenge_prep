'use client'
import React, { useState, useActionState } from 'react';
import { createJoke } from '@/lib/actions';
import { Alert } from '@/components/alert';
import { CheckCircleIcon, XCircleIcon} from '@heroicons/react/24/outline';
 
export function JokeGeneratorCard({ swapCard }) {

    const [cheesiness, setCheesiness] = useState(2);
    const [predictability, setPredictability] = useState(1);
    const [style, setStyle] = useState('Classic');

    // Labels and definitions for slider UI and ease of use
    const cheesinessLabels = ["Subtle", "Classic Groan", "Audible Sigh", "Eye Roll"];
    const predictabilityLabels = ["Unexpected", "Familiar Setup", "Obvious"];
    const cheesinessDefinitions = [
        "Simple and clear, but not painfully so.  They'll never see it coming and you may even get a real laugh.",
        "The sweet spot for most dad jokes.  These jokes feature clear puns that are easy to spot but still manage to land a satisfying groan.",
        "Unapologetically cheesy.  Interpretations are pushed to an absurd degree.  Dad's who use these jokes are truly commited to their craft.",
        "Joke's so obvious and literal that your family will skip right over groans and go straight for the eye roll.  You'll be proud of yourself for hours after a succesful delivery."
    ]
    const predictabilityDefinitions = [
        'More likely to illicit an "Oh, I see what you did there" than a groan.',
        "These jokes follow a familiar pattern that your family has likley heard from either you or other genius dads.",
        'Your wife is likely to hold up her hand and say "Please don\'t do it" before you even finish the setup.'
    ]

    // Handle submission and call server action
    const handleSubmit = async (prevState, formData) => {
        // Call createJoke action
        const res = await createJoke(prevState, formData)
        console.log('Joke Creation Response:', res);
        
        // If joke generation was successful, notify parent component
        if (res.status === 'success' && swapCard) {
            swapCard(res.joke);
        }
        
        return res
    }
    const [state, createJokeAction, isPending] = useActionState(handleSubmit, {});

    return (
        <div>
            <div className="card-body">
                <form action={createJokeAction}>
                    <div className="mb-10 grid grid-cols-4 gap-10 items-center">
                        <label className="label flex flex-col items-start mr-5 col-span-2">
                            <span className="label-text text-3xl font-bold">Cheesiness</span>
                            <p className="label-text text-sm text-gray-500 text-wrap">
                                <span className='font-bold'>{cheesinessLabels[cheesiness]}: </span>{cheesinessDefinitions[cheesiness]}
                            </p>
                        </label>
                        <div className="flex flex-col items-center w-full col-span-2">
                            <input
                                type="range"
                                min={0}
                                max={3}
                                step={1}
                                value={cheesiness}
                                onChange={e => setCheesiness(Number(e.target.value))}
                                className="range range-primary w-full"
                            />
                            <div className="flex justify-between w-full mt-2 text-xs">
                                {cheesinessLabels.map((label, idx) => (
                                    <span
                                        key={label}
                                        className={`text-center w-1/4 ${cheesiness === idx ? "font-bold text-primary" : ""}`}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mb-10 grid grid-cols-4 gap-10 items-center">
                        <label className="label flex flex-col items-start mr-5 col-span-2">
                            <span className="label-text text-3xl font-bold">Predictability</span>
                            <p className="label-text text-sm text-gray-500 text-wrap">
                                <span className='font-bold'>{predictabilityLabels[predictability]}: </span>{predictabilityDefinitions[predictability]}
                            </p>
                        </label>
                        <div className="flex flex-col items-center w-full col-span-2">
                            <input
                                type="range"
                                min={0}
                                max={2}
                                step={1}
                                value={predictability}
                                onChange={e => setPredictability(Number(e.target.value))}
                                className="range range-secondary w-full"
                            />
                            <div className="flex justify-between w-full mt-2 text-xs">
                                {predictabilityLabels.map((label, idx) => (
                                    <span
                                        key={label}
                                        className={`text-center w-1/3 ${predictability === idx ? "font-bold text-secondary" : ""}`}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mb-4 grid grid-cols-4 gap-10 items-center">
                        <label className="label flex flex-col items-start mr-5 col-span-2">
                            <span className="label-text text-3xl font-bold">Style</span>
                            <p className="label-text text-sm text-gray-500">Pulling from the millions of dads who came before you.<br />Don't let them down.</p>
                        </label>
                        <select
                            className="select select-bordered w-full col-span-2"
                            value={style}
                            onChange={e => setStyle(e.target.value)}
                        >
                            <option>Pun</option>
                            <option>Anticlimactic</option>
                            <option>Misdirection</option>
                            <option>Question and Answer</option>
                        </select>
                    </div>
                    <div className="card-actions justify-center items-center mt-15 mb-5">
                        <button type="submit" className="btn btn-primary pl-10 pr-10" disabled={isPending}>
                            {isPending ? <span className='loading loading-spinner'></span> : 'Show Me Comedy Gold'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Submission success and error alerts */}
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
        </div>
    )

}