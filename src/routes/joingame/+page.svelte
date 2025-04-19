<script lang="ts">
	import { user } from '$lib/store';
	import { joinGame, subscribeToGame } from '$lib/firebase';
	import Loader from '../../components/Loader.svelte';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';

	let gameCode = '';
	let playerName = '';
	let error = '';
	let board: string[] = [];
	let currentUser;
	let isLoading = false;
	let unsubscribe;

	$: user.subscribe((u) => {
		currentUser = u;
		if (currentUser && !playerName) {
			playerName = currentUser.displayName || '';
		}
	});

	// Clean up on component destroy
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	async function handleJoinGame() {
		if (!gameCode) {
			error = 'Game code is required!';
			return;
		}

		if (!playerName) {
			error = 'Player name is required!';
			return;
		}

		if (!currentUser) {
			error = 'You must be logged in to join a game.';
			return;
		}

		try {
			isLoading = true;
			const { uid } = currentUser;
			const { board: playerBoard } = await joinGame(gameCode.toUpperCase(), playerName, uid);
			board = playerBoard;

			// Start listening for real-time updates
			subscribeToGame(gameCode.toUpperCase());

			error = '';
			goto(`/game/${gameCode.toUpperCase()}`);
		} catch (err) {
			console.error(err);
			error = err.message || 'An error occurred while joining the game.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="full-page-center">
	<div class="centered-form">
		{#if isLoading}
			<Loader message="Joining game..." />
		{:else}
			<h1>Join Game</h1>
			<div>
				<label for="game-code">Game Code:</label>
				<input 
					id="game-code" 
					type="text" 
					bind:value={gameCode} 
					placeholder="Enter game code"
					on:input={() => gameCode = gameCode.toUpperCase()}
					maxlength="5"
				/>
			</div>
			<div>
				<label for="player-name">Player Name:</label>
				<input id="player-name" type="text" bind:value={playerName} placeholder="Enter your name" />
			</div>
			{#if error}
				<p class="error">{error}</p>
			{/if}
			<button on:click={handleJoinGame}>Join Game</button>
			<p class="hint">Enter the 5-letter code provided by the game creator.</p>
		{/if}
	</div>
</div>

<style>
	h1 {
		color: var(--lemon-green);
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.5);
		font-family: 'Montserrat', Arial, sans-serif;
		font-weight: 700;
		text-align: center;
	}
	
	.hint {
		font-size: 0.8rem;
		color: #aaaaaa;
		text-align: center;
		margin-top: 1rem;
		font-style: italic;
	}

	.error {
		color: #ff5555;
		text-shadow: 0 0 10px rgba(255, 85, 85, 0.3);
		margin: 10px 0;
	}

	input {
		margin-bottom: 15px;
		font-family: 'Montserrat', Arial, sans-serif;
	}
	
	input#game-code {
		text-transform: uppercase;
		letter-spacing: 1px;
		font-weight: 700;
		text-align: center;
		font-size: 1.2rem;
	}

	button {
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		padding: 10px 15px;
		border: none;
		border-radius: 5px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		width: 100%;
		font-family: 'Montserrat', Arial, sans-serif;
		margin-top: 10px;
	}

	button:hover {
		background-color: #a0df1e;
		box-shadow: 0 0 10px rgba(192, 255, 62, 0.7);
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
	}

	label {
		color: var(--text-color);
		margin-bottom: 5px;
		display: block;
		font-family: 'Montserrat', Arial, sans-serif;
		font-weight: 500;
	}
</style>