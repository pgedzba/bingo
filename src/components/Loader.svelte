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
		color: limegreen;
		font-size: 1.5rem;
		font-family: Arial, sans-serif;
	}

	.spinner {
		width: 24px;
		height: 24px;
		border: 4px solid limegreen;
		border-top: 4px solid transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: 10px;
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
