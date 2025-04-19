<script>
	export let message = 'Loading...';
</script>

<div class="loader">
	<div class="spinner"></div>
	<span>{message}</span>
</div>

<style>
	.loader {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: var(--lemon-green);
		font-size: 1.5rem;
		font-family: 'Montserrat', Arial, sans-serif;
		font-weight: 500;
	}

	.loader span {
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.5);
		animation: pulse 1.5s infinite alternate;
	}

	@keyframes pulse {
		from { text-shadow: 0 0 5px rgba(192, 255, 62, 0.3); }
		to { text-shadow: 0 0 15px rgba(192, 255, 62, 0.7); }
	}

	.spinner {
		width: 24px;
		height: 24px;
		border: 4px solid var(--lemon-green);
		border-top: 4px solid transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: 10px;
		box-shadow: 0 0 10px rgba(192, 255, 62, 0.3);
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>