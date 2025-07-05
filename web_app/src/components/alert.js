import { useEffect, useState } from 'react';

export function Alert({ variant, TTL, children }) {

    const [alert, setAlert] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setAlert(false);
        }, TTL * 1000);
    }, [TTL]);

    if (alert) {
        if (variant === 'success') {
            return (
                <div className="alert alert-success mt-5 w-100 fixed top-16 right-4 z-50 w-100">{ children }</div>
            );
        }
        else if (variant === 'error') {
            return (
                <div className="alert alert-error mt-5 w-100 fixed top-16 right-4 z-50 w-100">{ children }</div>
            );
        }
        else {
            return (
                <div className="alert mt-5 w-100 fixed top-16 right-4 z-50 w-100">{ children }</div>
            );
        }

    }

    else {
        return(<span></span>);
    }
};