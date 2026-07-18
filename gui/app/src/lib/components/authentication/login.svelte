<div id='Login_Element'>
    <header>Login</header>
    <form id='Login_Form' on:submit={handleSubmit_login}>
        <label for="Email">Email</label>
        <input type='email' id='Email' name="email">
        <label for='Password'>Password</label>
        <input type='password' name='password' id='Password'>
        <button>Submit</button>
    </form>
</div>

<script lang='ts' context='module'>
    function Pause(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    export async function Make_Error_Message_Element(message: string, Parent_Container: HTMLElement) {
        const Error_Element: HTMLElement = document.createElement('p');
        Error_Element.textContent = message;
        Parent_Container.appendChild(Error_Element)
        await Pause(5000);
        Error_Element.remove()
    }
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import type { login, LoginResponse } from "$lib/composites/Authentication";
    import { PUBLIC_SERVER_API_URL } from "$env/static/public";
    import { goto } from "$app/navigation";

    async function handleSubmit_login(event: SubmitEvent) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        await Login(formData);
    }

    async function Login(Form_data: FormData) {
        const Login_Details: login = {
            email: Form_data.get('email')?.toString() ?? '',
            password: Form_data.get('password')?.toString() ?? ''
        }

        const response: Response = await fetch(PUBLIC_SERVER_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    mutation login($email: String!, $password: String!) {
                        login(email: $email, password: $password) {
                            token
                            user_uid
                        }
                    }`,
                variables: {
                    email: Login_Details.email,
                    password: Login_Details.password
                }
            })
        });

        const result = await response.json();
        Handle_Login_Result(result);
    }

    function Handle_Login_Result(result: LoginResponse) {
        if (result.data?.login?.token) {
            localStorage.setItem('token', result.data.login.token)
            localStorage.setItem('user_uid', result.data.login.user_uid)
            console.log(`Successful login: ${result.data.login.user_uid}`)
            goto('/Chronicle')
        } else if (result.errors) {
            console.log(`Login failed: ${result.errors}`)
            Make_Error_Message_Element('Login failed.... Try again', document.getElementById('Login_Element')!)
        }
    }

    if (browser) {
        onMount(() => {})
    }
</script>