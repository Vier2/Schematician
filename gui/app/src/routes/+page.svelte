<div id='Home'>
    Welcome to Xepository
</div>
<script lang='ts'>
    import { PUBLIC_CLIENT_API_URL } from "$env/static/public";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    if (browser) {
        onMount(() => {
            const Home_Container: HTMLElement = document.getElementById('Home')!;
            const Register_Hyperlink: HTMLAnchorElement = document.createElement('a');
            Register_Hyperlink.id = 'Register_HyperLink';
            Register_Hyperlink.textContent = 'Register';
            Register_Hyperlink.href = `${PUBLIC_CLIENT_API_URL}/authentication/register`;
            Home_Container.appendChild(Register_Hyperlink);
            Home_Container.appendChild(document.createElement('br'));
            const Login_Hyperlink: HTMLAnchorElement = document.createElement('a');
            Login_Hyperlink.id = 'Login_Hyperlink';
            Login_Hyperlink.textContent = 'Login';
            Login_Hyperlink.href = `${PUBLIC_CLIENT_API_URL}/authentication/login`;
            Home_Container.appendChild(Login_Hyperlink);

        })
    }
</script>