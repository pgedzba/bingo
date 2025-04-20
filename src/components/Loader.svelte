<script>
	export let message = 'Loading...';
	export let size = 'medium'; // small, medium, large
</script>

<div class="loader {size}">
	<div class="spinner">
		<div class="spinner-ring"></div>
		<div class="spinner-fill"></div>
	</div>
	{#if message}
		<div class="message">{message}</div>
	{/if}
</div>

<style>
	.loader {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.spinner {
		position: relative;
		display: inline-block;
	}

	.spinner-ring {
		border-radius: 50%;
		border: 2px solid transparent;
		border-top-color: rgba(192, 255, 62, 0.3);
		border-right-color: rgba(192, 255, 62, 0.2);
		border-bottom-color: rgba(192, 255, 62, 0.1);
		animation: spin 1.2s linear infinite;
	}

	.spinner-fill {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 2px solid transparent;
		border-left: 2px solid var(--lemon-green);
		animation: spin 0.8s ease infinite;
	}

	.small .spinner-ring,
	.small .spinner-fill {
		width: 20px;
		height: 20px;
	}

	.medium .spinner-ring,
	.medium .spinner-fill {
		width: 32px;
		height: 32px;
	}

	.large .spinner-ring,
	.large .spinner-fill {
		width: 48px;
		height: 48px;
	}

	.message {
		color: var(--text-color);
		font-size: 0.95rem;
		font-weight: 500;
		animation: pulse 2s infinite alternate;
	}

	.small .message {
		font-size: 0.8rem;
	}

	.large .message {
		font-size: 1.1rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0% {
			opacity: 0.7;
			text-shadow: 0 0 5px rgba(192, 255, 62, 0.1);
		}
		100% {
			opacity: 1;
			text-shadow: 0 0 10px rgba(192, 255, 62, 0.3);
		}
	}
</style>