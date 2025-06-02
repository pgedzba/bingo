<script lang="ts">
	import { cookieConsent, acceptCookies, rejectCookies } from '$lib/cookieConsent';
	import { onDestroy } from 'svelte';
	let showBanner = false;
	const unsubscribe = cookieConsent.subscribe((value) => {
		showBanner = value === null;
	});
	onDestroy(unsubscribe);
</script>

{#if showBanner}
	<div class="cookie-banner">
		<div class="cookie-content">
			<p>
				We use cookies to enhance your experience. By clicking “Accept”, you agree to the storing of
				cookies on your device. For more information, see our <a
					href="/cookie-policy">Cookie Policy</a
				>
				and <a href="/privacy-policy">Privacy Policy</a>.
			</p>
			<div class="cookie-actions">
				<button class="accept" on:click={acceptCookies}>Accept</button>
				<button class="reject" on:click={rejectCookies}>Reject</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.cookie-banner {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100vw;
		background: #222;
		color: #fff;
		z-index: 1000;
		padding: 1rem 0;
		box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
	}
	.cookie-content {
		max-width: 700px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.cookie-actions {
		display: flex;
		gap: 1rem;
	}
	button.accept {
		background: #4caf50;
		color: #fff;
		border: none;
		padding: 0.5rem 1.2rem;
		border-radius: 4px;
		cursor: pointer;
	}
	button.reject {
		background: #f44336;
		color: #fff;
		border: none;
		padding: 0.5rem 1.2rem;
		border-radius: 4px;
		cursor: pointer;
	}
	button:hover {
		opacity: 0.9;
	}
</style>
