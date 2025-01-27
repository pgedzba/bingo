<script>
	import { user } from '$lib/store';
	import { loginWithGoogle } from '$lib/firebase';
</script>

<div class="login-container">
	<div class="description">
		<h2>Welcome to Bingo Game</h2>
		<p>A fun and interactive bingo game for everyone!</p>
		<p>Developed by pgedzba</p>
	</div>

	{#if $user}
		<p>Welcome, {$user.displayName}!</p>
	{:else}
		<button on:click={loginWithGoogle}>Login with Google</button>
	{/if}
</div>

<style>
	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
		max-width: 500px;
		margin: 0 auto;
	}

	.description {
		text-align: center;
		margin-bottom: 2rem;
	}

	.description h2 {
		color: #00ff00;
	}
</style>
