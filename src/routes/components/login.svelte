<script>
	import pb from '$lib';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Toast from '$lib/toast';

	let email = '';
	let password = '';
	let isSignup = false;
	let errorMessage = '';
	let isLoading = true;

	onMount(async () => {
		try {
			isSignup = totalItems === 1;
		} catch (error) {
		} finally {
			isLoading = false;
		}
	});

	async function handleSubmit(event) {
		event.preventDefault();
		try {
			if (isSignup) {
				// Create new user
				const userData = {
					email,
					password,
					passwordConfirm: password
				};
				await pb.collection('users').create(userData);

				Toast('success', 'Signed up Successfully');
				location.reload(true);
				// Log in after successful signup
				const authData = await pb.collection('users').authWithPassword(email, password);
				if (authData) {
				}
			} else {
				// Attempt login
				const authData = await pb.collection('users').authWithPassword(email, password);
				if (authData) {
					Toast('success', 'Successfully Logged In');
				}
			}
		} catch (error) {
			Toast('error', error.message);
		}
	}
</script>

<div id="cont">
	<h1 class="page-title text-center mt-3">Tempest Smart Study App</h1>
	<main class="container min-vh-100 d-flex align-items-center justify-content-center py-4">
		<div class="row w-100 align-items-center">
			<div class="col-12 col-md-6 d-flex justify-content-center">
				{#if isLoading}
					<p class="text-muted text-center small mb-2">Loading...</p>
				{:else}
					<form class="form" on:submit={handleSubmit}>
						{#if errorMessage}
							<p class="text-danger text-center small mb-2">{errorMessage}</p>
						{/if}
						<span class="input-span">
							<label for="email" class="label">Email</label>
							<input type="email" name="email" id="email" bind:value={email} required />
						</span>
						<span class="input-span">
							<label for="password" class="label">Password</label>
							<input type="password" name="password" id="password" bind:value={password} required />
						</span>
						<input class="submit" type="submit" value={isSignup ? 'Sign Up' : 'Log In'} />
					</form>
				{/if}
			</div>
			<div class="col-12 col-md-6 d-none d-md-block">
				<img src="/rimuru.png" alt="Login Illustration" class="img-fluid bg-image" />
			</div>
		</div>
	</main>
</div>

<style>
	/* From Uiverse.io by bociKond */

	.form {
		--bg-light: #efefef;
		--bg-dark: #707070;
		--clr: #58bc82;
		--clr-alpha: #9c9c9c60;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		width: 100%;
		max-width: 300px;
	}

	.form .input-span {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form input[type='email'],
	.form input[type='password'] {
		border-radius: 0.5rem;
		padding: 1rem 0.75rem;
		width: 100%;
		border: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: var(--clr-alpha);
		outline: 2px solid var(--bg-dark);
	}

	.form input[type='email']:focus,
	.form input[type='password']:focus {
		outline: 2px solid var(--clr);
	}

	.label {
		align-self: flex-start;
		color: var(--clr);
		font-weight: 600;
	}

	.form .submit {
		padding: 1rem 0.75rem;
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-radius: 3rem;
		background-color: var(--bg-dark);
		color: var(--bg-light);
		border: none;
		cursor: pointer;
		transition: all 300ms;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.form .submit:hover {
		background-color: var(--clr);
		color: var(--bg-dark);
	}

	.bg-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.8;
		border-radius: 0.5rem;
	}
</style>
