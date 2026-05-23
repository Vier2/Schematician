<div id='Register_Element'>
    <header>Register for your journey to explore knowledge</header>
    <form id='Register_Form' on:submit={handleSubmit_register}>
        <label for='Username'>Username </label>
        <input type='text'id='Username' name='username'>
        <label for="Email">Email</label>
        <input type='email' id='Email' name="email">
        <label for='Password'> Password</label>
        <input type='password'name='password'id='Password'>
        <button >
            Submit
        </button>
    </form>

</div>

<script lang="ts" context='module'>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import type { LoginResponse, register } from "$lib/interfaces/Authentication";
    import { PUBLIC_SERVER_API_URL } from "$env/static/public";
  
    import type { RegisterResponse } from "$lib/interfaces/Authentication";
    import { goto } from "$app/navigation";

 async function handleSubmit_register(event: SubmitEvent) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        await Register(formData);
    }

function Handle_Register_Result(result: RegisterResponse) {
    if (result.data.register?.token) {
            console.log(`Succesful Registration ${result.data.register.user}`)
            goto('/authentication/login')
        } else if (result.errors) {
            console.log(`Register failed: ${result.errors}`)
        }
}
async function Register(Form_data: FormData) {
    const register_details: register = {
        username: Form_data.get('username')?.toString() ?? '',
        email: Form_data.get('email')?.toString() ?? '',
        password: Form_data.get('password')?.toString() ?? ''}
    console.log(register_details);
    const response: Response = await fetch(PUBLIC_SERVER_API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                query: `
                mutation register($username: String!, $email: String!, $password: String!) {
                    register(username: $username, email: $email, password: $password) {
                    token
                    user {username} }}`,
                variables:
                    {username: register_details.username,
                    email: register_details.email,
                    password: register_details.password
                    }
            })
            //save token in a browser
        });
        const result = await response.json();
        Handle_Register_Result(result)
        console.log(result);
    }

    </script>
<script lang='ts'>
    
    if (browser) {
        onMount(() => {
          

        })
    }
</script>