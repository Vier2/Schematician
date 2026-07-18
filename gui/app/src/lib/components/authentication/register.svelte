<div id='Register_Element'>
    <header>Register for your journey to explore knowledge</header>
    <form id='Register_Form' on:submit={handleSubmit_register}>
        <label for='Username'>Username</label>
        <input type='text' id='Username' name='username'>
        <label for="Email">Email</label>
        <input type='email' id='Email' name="email">
        <label for='Password'>Password</label>
        <input type='password' name='password' id='Password'>
        <button>Submit</button>
    </form>
</div>

<script lang="ts" context='module'>
    import { goto } from "$app/navigation";
    import type { RegisterResponse, register } from "$lib/composites/Authentication";
    import { PUBLIC_SERVER_API_URL } from "$env/static/public";

    async function handleSubmit_register(event: SubmitEvent) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        await Register(formData);
    }

    function Handle_Register_Result(result: RegisterResponse) {
        if (result.data?.register?.token) {
            console.log(`Successful registration: ${result.data.register.user_uid}`)
            goto('/authentication/login')
        } else if (result.errors) {
            console.log(`Register failed: ${result.errors}`)
        }
    }

    async function Register(Form_data: FormData) {
        const register_details: register = {
            username: Form_data.get('username')?.toString() ?? '',
            email: Form_data.get('email')?.toString() ?? '',
            password: Form_data.get('password')?.toString() ?? ''
        }

        const response: Response = await fetch(PUBLIC_SERVER_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    mutation register($username: String!, $email: String!, $password: String!) {
                        register(username: $username, email: $email, password: $password) {
                            token
                            user_uid
                        }
                    }`,
                variables: {
                    username: register_details.username,
                    email: register_details.email,
                    password: register_details.password
                }
            })
        });

        const result = await response.json();
        Handle_Register_Result(result)
    }
</script>

<script lang='ts'>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    if (browser) {
        onMount(() => {})
    }
</script>