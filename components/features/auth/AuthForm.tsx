"use client";

import { useState } from "react";

interface AuthFormProps { 
    title: string;
    submitLabel: string;
}

export default function AuthForm({title, submitLabel}: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    /*

        handleSubmit() is the call for backend logic
        e.preventDefault() prevents the browser from reloading
        This is sufficing the requirement for "Placeholder submit handler using console.log"
        Backend logic is handled here, but for now it is asked to just use a console log.

    */
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log("Placeholder submit- input values:", {email, password});
    }

    return (
        <form
            onSubmit={handleSubmit}
            
            /*
                Inside the tailwind CSS, I added a text-gray-900 because during night the global.css
                sets the color of text to white. This forces the text black so it'll be readable either way.
            */

            className="w-full max-w-sm space-y-4 rounded-lg border p-6 bg-white text-gray-900"
            >
                <h1 className="text-2xl font-semibold">{title}</h1>

                <input 
                type="email"
                placeholder="Email"
                className="w-full rounded border p-2 text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />

                <input
                type="password"
                placeholder="Password"
                className="w-full rounded border p-2 text-gray-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="submit"
                    className="w-full rounded bg-black p-2 text-white"
                >
                    {submitLabel}
                </button>
            </form>
    );
}