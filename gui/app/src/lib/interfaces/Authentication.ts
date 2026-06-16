export interface login {
    email: string
    password: string
}

export interface register {
    username: string
    email: string
    password: string
}

export type Authentication_Method = (credentials: FormData) => Object

export interface LoginResponse {
    data: {
        login: {
            token: string
            user_uid: string
        }
    }
    errors?: Array<{
        message: string
        locations?: Array<{ line: number; column: number }>
    }>
}

export interface RegisterResponse {
    data: {
        register: {
            token: string
            user_uid: string
        }
    }
    errors?: Array<{
        message: string
        locations?: Array<{ line: number; column: number }>
    }>
}