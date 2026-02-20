import { get } from "http"
import { supabase } from "./client"

//this should hopefully handle auth with supabase auth

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthResponse {
    success: boolean
    message: string
    user?: {id: string; email: string}
    error?: string
    
}

//the auth resp.. with every sucess status and user data or error is returned
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
    try {
        if (!email || !password) {
            return {
                success: false,
                message: "Email and password are required.",
                error: 'Missing credentials'
            }
        }

        //signing in with supa base (attempted) first checks are all types of incomplete
        //credentials, then if all is good and found it returens the user data
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return {
                success: false,
                message: getErrorMessage(error.message),
                error: error.message
            }
        }

        if (!data.user) {
            return {
                success: false,
                message: 'Failed to log in, try again.',
                error: 'No user found'
            }
        }

        return {
            success: true,
            message: "Successfully signed in.",
            user: { id: data.user.id, email: data.user.email || '' }
        }
    } catch (error) {
        console.error("Login error:", error)
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
            error: 'Unknown error'
        }
    }
    }


    // this handles loging out of the account
export async function logoutUser(): Promise<AuthResponse> {
    try {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
            return {
                success: false,
                message: 'Failed to log out. Please try again.',
                error: error.message
            }
        }

        return {
            success: true,
            message: "Successfully logged out."
        }
    } catch (error) {
        console.error("Logout error:", error)
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
            error: 'Unknown error'
        }
    }
    }

    //this deals with managing your session and getting the current user data
    export async function getCurrentUser (){
    try {const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
        console.error("Get current user error:", error)
        return null
    }
    
    return user
    } catch (error) {
        console.error("Unexpected error getting current user:", error)
        return null
    }

    }

    export async function getSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error("Get session error:", error)
                return null
            }

            return session
        } catch (error) {
            console.error("Unexpected error getting session:", error)
            return null
        }
    }

    export async function isAuthenticated() : Promise<boolean> {
        const session = await getSession()
        return !!session
    }


    // defining the error messages for the auth process

    function getErrorMessage(errorMessage: string): string {
        if (errorMessage.includes("Invalid login credentials")) {
            return "Invalid email or password. Please try again."
        }
        if (errorMessage.includes("User not found")) {
            return "No account found with that email. Please sign up first."
        }
        if (errorMessage.includes("Email not confirmed")) {
            return "Please confirm your email before logging in."
        }
        return 'An error occurred during login. Please try again after checking your credentials.'
    }
