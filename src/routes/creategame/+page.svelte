<script lang="ts">
	import { createGame } from '$lib/firebase';
	import { user } from '$lib/store';
	import Loader from '../../components/Loader.svelte';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';

	let gameName = '';
	let sentences = '';
	let error = '';
	let success = '';
	let isLoading = false;
	let currentUser;
	let unsubscribe;

	// Subscribe to user state
	$: user.subscribe((u) => {
		currentUser = u;
	});

	// Clean up on component destroy
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	async function handleCreateGame() {
		if (!gameName || !sentences) {
			error = 'Game name and sentences are required!';
			return;
		}

		const sentenceArray = sentences
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		if (sentenceArray.length < 25) {
			error = `You must enter at least 25 sentences. Currently, you have ${sentenceArray.length}.`;
			return;
		}

		if (!currentUser) {
			error = 'You must be logged in to create a game.';
			return;
		}

		try {
			isLoading = true;
			const playerName = currentUser.displayName || 'Anonymous';
			const playerId = currentUser.uid;

			const gameCode = await createGame(gameName, sentenceArray.join('\n'), {
				creator: playerId,
				creatorName: playerName
			});

			success = `Game created successfully! Game Code: ${gameCode}`;
			error = '';
			// Use goto from SvelteKit
			goto(`/game/${gameCode}`);
		} catch (err) {
			console.error(err);
			error = 'An error occurred while creating the game.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="full-page-center">
	<div class="centered-form">
		{#if isLoading}
			<Loader message="Creating game..." />
		{:else}
			<h1>Create Bingo Game</h1>
			<div>
				<label for="game-name">Game Name:</label>
				<input id="game-name" type="text" bind:value={gameName} placeholder="Enter game name" />
			</div>
			<div>
				<label for="sentences">Sentences (one per line):</label>
				<textarea 
					id="sentences" 
					bind:value={sentences} 
					placeholder="Enter sentences (25 minimum)" 
					rows="8">
				</textarea>
				<p class="hint">Each line will become a square on the bingo board. Enter at least 25 items.</p>
			</div>
			{#if error}
				<p class="error">{error}</p>
			{/if}
			{#if success}
				<p class="success">{success}</p>
			{/if}
			<button on:click={handleCreateGame}>Create Game</button>
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
		margin-top: 0.25rem;
		font-style: italic;
	}

	.error {
		color: #ff5555;
		text-shadow: 0 0 10px rgba(255, 85, 85, 0.3);
		margin: 10px 0;
	}
	
	.success {
		color: var(--lemon-green);
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.5);
		margin: 10px 0;
		font-weight: 600;
	}

	textarea {
		min-height: 200px;
		resize: vertical;
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