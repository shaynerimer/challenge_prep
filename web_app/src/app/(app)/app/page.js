'use client'
import { useActionState } from 'react';
import { orderProduct } from '@/lib/actions'
import { Alert } from '@/components/alert';
import { JokeGeneratorCard } from '@/components/jokeGeneratorCard';




import { CheckCircleIcon, XCircleIcon} from '@heroicons/react/24/outline';

export default function AppPage() {

    const handleSubmit = async (prevState, formData) => {
        // Call orderProduct action
        const res = await orderProduct(prevState, formData)
        // Need an error message returned here if the service is unreachable
        return res
    }
    const [state, orderProductAction, isPending] = useActionState(handleSubmit, {});

    return (
        
        <div className='bg-transparent h-full w-full flex flex-col justify-center items-center'>
           
           {/* Page Title */}
           <h1 className='text-3xl font-bold mb-4'>Dad Joke Generator</h1>

           {/* Joke Generator Card */}
           <JokeGeneratorCard action={orderProductAction} />



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