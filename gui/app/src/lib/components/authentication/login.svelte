<div id='Login_Element'>
    <header>Login</header>
    <form id='Login_Form' on:submit={handleSubmit_login}>
      
        <label for="Email">Email</label>
        <input type='email' id='Email' name="email">
        <label for='Password'> Password</label>
        <input type='password'name='password'id='Password'>
        <button >
            Submit
        </button>
    </form>

</div>


<script lang='ts' context='module'>
    import type { Authentication_Method } from "$lib/interfaces/Authentication";
    function Pause(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
        };
    export async function Make_Error_Message_Element(message: string, Parent_Container: HTMLElement) {
        const Error_Element: HTMLElement = document.createElement('p');
        Error_Element.textContent = message!;
        Parent_Container.appendChild(Error_Element)
        await Pause(5000);
        Error_Element.remove()
    }

</script>
<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import type { login } from "$lib/interfaces/Authentication";
    import { PUBLIC_CLIENT_API_URL, PUBLIC_SERVER_API_URL } from "$env/static/public";
    import type { LoginResponse } from "$lib/interfaces/Authentication";
    import { goto } from "$app/navigation";
    async function handleSubmit_login(event: SubmitEvent) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        await Login(formData);
    }
    async function Login(Form_data: FormData) {
        const Login_Details: login = {
        email: Form_data.get('email')?.toString() ?? '',
        password: Form_data.get('password')?.toString() ?? ''}
        console.log(Login_Details)
        const response: Response = await fetch(PUBLIC_SERVER_API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                query: `
                mutation login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                    token
                    user {username} }}`,
                variables:
                    {email: Login_Details.email,
                    password: Login_Details.password
                    }
            })
   });
        //make progress indicator
        const result = await response.json();
        //if sucessful say, success logging, going to dashboard
        //if succesful say try again
        console.log(result)
       Handle_Login_Result(result);
    }

    function Handle_Login_Result(result: LoginResponse) {
          if (result.data.login?.token) {
            console.log(`Succesful login: ${result.data.login.user}`)
            goto('/element')
        } else if (result.errors) {
            console.log(`login failed: ${result.errors}`)
            Make_Error_Message_Element('Login failed.... Try again', document.getElementById('Login_Element')!)
        }
    }

    if (browser) {
        onMount(() => {
           

        })
    }
</script>