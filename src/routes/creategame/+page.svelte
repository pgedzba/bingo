<script lang="ts">
	import { createGame } from '$lib/firebase';
	import { user } from '$lib/store';
	import Loader from '../../components/Loader.svelte';
	import { goto } from '$app/navigation';

	let gameName = '';
	let sentences = '';
	let error = '';
	let success = '';
	let isLoading = false;
	let currentUser;

	$: user.subscribe((u) => {
		currentUser = u;
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
			<Loader />
		{:else}
			<h1>Create Bingo Game</h1>
			<div>
				<label for="game-name">Game Name:</label>
				<input id="game-name" type="text" bind:value={gameName} placeholder="Enter game name" />
			</div>
			<div>
				<label for="sentences">Sentences (one per line):</label>
				<textarea id="sentences" bind:value={sentences} placeholder="Enter sentences"></textarea>
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
	.error {
		color: red;
	}
	.success {
		color: green;
	}
</style>
