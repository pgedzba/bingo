<style>
	.join-page {
		min-height: calc(100vh - 64px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.page-container {
		width: 100%;
		max-width: 480px;
	}

	.form-card {
		background-color: var(--dark-card);
		border-radius: var(--border-radius);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
	}

	.form-header {
		padding: 1.5rem;
		text-align: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.form-header h1 {
		color: var(--lemon-green);
		margin-bottom: 0.5rem;
		font-size: 1.75rem;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 0.95rem;
		margin: 0;
	}

	.form-content {
		padding: 1.5rem;
	}

	.loading-state {
		padding: 3rem 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-color);
	}

	.code-input-container,
	.input-container {
		position: relative;
	}

	input {
		width: 100%;
		padding: 0.75rem 1rem;
		background-color: rgba(30, 30, 30, 0.6);
		color: var(--text-color);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--input-radius);
		font-size: 0.95rem;
		outline: none;
		transition: all 0.2s ease;
	}

	input:focus {
		border-color: var(--lemon-green);
		box-shadow: 0 0 0 2px rgba(192, 255, 62, 0.1);
	}

	input.is-valid {
		border-color: var(--lemon-green);
	}

	#game-code {
		text-align: center;
		letter-spacing: 0.25rem;
		font-size: 1.2rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.valid-indicator {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--lemon-green);
		animation: fadeIn 0.2s ease forwards;
	}

	.hint {
		margin-top: 0.5rem;
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background-color: rgba(255, 85, 85, 0.1);
		border-left: 3px solid #ff5555;
		border-radius: 4px;
		color: #ff8080;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
		animation: slideIn 0.3s ease forwards;
	}

	.join-button {
		width: 100%;
		padding: 0.85rem 1rem;
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		border: none;
		border-radius: var(--button-radius);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.join-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md), var(--glow-md);
	}

	.join-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.join-button:disabled {
		background-color: rgba(192, 255, 62, 0.3);
		color: rgba(18, 18, 18, 0.6);
		cursor: not-allowed;
	}

	.button-loader {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(18, 18, 18, 0.3);
		border-left-color: var(--dark-bg);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto;
	}

	.form-footer {
		margin-top: 2rem;
		text-align: center;
	}

	.create-link {
		color: var(--lemon-green);
		text-decoration: none;
		font-size: 0.9rem;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
	}

	.create-link:hover {
		text-decoration: none;
		color: var(--lemon-green);
		transform: translateX(2px);
	}

	@keyframes fadeIn {
		0% { opacity: 0; }
		100% { opacity: 1; }
	}

	@keyframes slideIn {
		0% { transform: translateY(-10px); opacity: 0; }
		100% { transform: translateY(0); opacity: 1; }
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style><script lang="ts">
	import { user } from '$lib/store';
	import { joinGame, subscribeToGame } from '$lib/firebase';
	import Loader from '../../components/Loader.svelte';
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';

	let gameCode = '';
	let playerName = '';
	let error = '';
	let board: string[] = [];
	let currentUser;
	let isLoading = false;
	let unsubscribe;
	let isJoining = false;

	// Game code validation
	$: isValidGameCode = gameCode.length === 5;
	$: isValidPlayerName = playerName.length >= 2;
	$: canJoin = isValidGameCode && isValidPlayerName && !isLoading;

	onMount(() => {
		unsubscribe = user.subscribe((u) => {
			currentUser = u;
			if (currentUser && !playerName) {
				playerName = currentUser.displayName || '';
			}
		});
	});

	// Clean up on component destroy
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	async function handleJoinGame() {
		if (!canJoin) return;

		try {
			isLoading = true;
			isJoining = true;
			error = '';
			
			const { uid } = currentUser;
			const { board: playerBoard } = await joinGame(gameCode.toUpperCase(), playerName, uid);
			board = playerBoard;

			// Start listening for real-time updates
			subscribeToGame(gameCode.toUpperCase());

			goto(`/game/${gameCode.toUpperCase()}`);
		} catch (err) {
			console.error(err);
			error = err.message || 'An error occurred while joining the game.';
			isJoining = false;
		} finally {
			isLoading = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && canJoin) {
			handleJoinGame();
		}
	}
</script>

<div class="join-page">
	<div class="page-container">
		<div class="form-card">
			<div class="form-header">
				<h1>Join Game</h1>
				<p class="subtitle">Enter a game code to join an existing Bingo game</p>
			</div>

			{#if isLoading && isJoining}
				<div class="loading-state">
					<Loader message="Joining game..." />
				</div>
			{:else}
				<div class="form-content">
					<div class="form-group">
						<label for="game-code">Game Code</label>
						<div class="code-input-container">
							<input 
								id="game-code" 
								type="text" 
								bind:value={gameCode} 
								placeholder="XXXXX"
								on:input={() => {gameCode = gameCode.toUpperCase()}}
								on:keydown={handleKeydown}
								maxlength="5"
								class:is-valid={isValidGameCode && gameCode.length > 0}
								autocomplete="off"
							/>
							{#if isValidGameCode && gameCode.length > 0}
								<div class="valid-indicator">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="20 6 9 17 4 12"></polyline>
									</svg>
								</div>
							{/if}
						</div>
						<p class="hint">Enter the 5-letter code provided by the game creator</p>
					</div>

					<div class="form-group">
						<label for="player-name">Your Name</label>
						<div class="input-container">
							<input 
								id="player-name" 
								type="text" 
								bind:value={playerName} 
								placeholder="Enter your display name"
								on:keydown={handleKeydown}
								class:is-valid={isValidPlayerName}
							/>
							{#if isValidPlayerName}
								<div class="valid-indicator">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="20 6 9 17 4 12"></polyline>
									</svg>
								</div>
							{/if}
						</div>
						<p class="hint">This name will be displayed to other players</p>
					</div>

					{#if error}
						<div class="error-message">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="12"></line>
								<line x1="12" y1="16" x2="12.01" y2="16"></line>
							</svg>
							{error}
						</div>
					{/if}

					<button 
						class="join-button" 
						on:click={handleJoinGame} 
						disabled={!canJoin || isLoading}
					>
						{#if isLoading && !isJoining}
							<div class="button-loader"></div>
						{:else}
							Join Game
						{/if}
					</button>

					<div class="form-footer">
						<a href="/creategame" class="create-link">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="16"></line>
								<line x1="8" y1="12" x2="16" y2="12"></line>
							</svg>
							Create a new game instead
						</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>