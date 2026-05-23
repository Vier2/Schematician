export interface login {
    email: string
    password: string
}
export interface register {
    username: string
    email: string
    password: string
}
// Option 1: Type alias for function
export type Authentication_Method = (credentials: FormData) => Object

 
export interface LoginResponse {
    data: {
        login: {
            token: string;
            user: {
                username: string;
                email: string;
            }
        }
    };
    errors?: Array<{
        message: string;
        locations?: Array<{ line: number; column: number }>;
    }>;
}

export interface RegisterResponse {
    data: {
        register: {
            token: string;
            user: {
                username: string;
                email: string
            }
        }
    };
    errors?: Array<{
        message: string;
        locations?: Array<{ line: number; column: number }>;
    }>;
}
