<script lang="ts">
	import { createGame } from '$lib/firebase';
	import { user } from '$lib/store';
	import Loader from '../../components/Loader.svelte';
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';

	let gameName = '';
	let sentences = '';
	let error = '';
	let success = '';
	let isLoading = false;
	let isCreating = false;
	let currentUser;
	let unsubscribe;
	let sentenceCount = 0;

	// Subscribe to user state
	onMount(() => {
		unsubscribe = user.subscribe((u) => {
			currentUser = u;
		});
	});

	// Clean up on component destroy
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	// Reactive statement to count sentences
	$: {
		const sentencesArray = sentences
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		sentenceCount = sentencesArray.length;
	}

	// Check if form is valid
	$: isValidName = gameName.trim().length >= 3;
	$: isValidSentences = sentenceCount >= 25;
	$: canCreate = isValidName && isValidSentences && !isLoading && currentUser;

	async function handleCreateGame() {
		if (!canCreate) return;

		try {
			isLoading = true;
			isCreating = true;
			error = '';

			const sentenceArray = sentences
				.split('\n')
				.map((s) => s.trim())
				.filter((s) => s.length > 0);

			const playerName = currentUser.displayName || 'Anonymous';
			const playerId = currentUser.uid;

			const gameCode = await createGame(gameName, sentenceArray.join('\n'), {
				creator: playerId,
				creatorName: playerName
			});

			success = `Game created successfully! Game Code: ${gameCode}`;
			
			// Navigate to the game
			goto(`/game/${gameCode}`);
		} catch (err) {
			console.error(err);
			error = 'An error occurred while creating the game.';
			isCreating = false;
		} finally {
			isLoading = false;
		}
	}

	// Demo sentences for quick fill
	function fillDemoSentences() {
		sentences = `Someone is on mute
Someone's pet appears on screen
"Can everyone see my screen?"
Internet connection issues
"Can you hear me now?"
Someone apologizes for background noise
"Let's take this offline"
Someone joins late
Someone leaves early
"I'll share the link in the chat"
"Sorry, I was on mute"
"Let me share my screen"
Someone's doorbell rings
"We're running out of time"
"I think there's a lag"
Someone mentions "the current situation"
"Let's circle back on that"
"Moving forward..."
Someone's phone rings
"Just to piggyback on that"
Email notification sound
"I'll follow up after the meeting"
"Can we go back a slide?"
"I have a hard stop at..."
Someone drinks coffee/water
"Let's take this to the next level"
"Who's not here yet?"
"Sorry, go ahead"
"I didn't catch that"
Someone mentions lunch plans`;
	}
</script>

<div class="create-page">
	<div class="page-container">
		<div class="form-card">
			<div class="form-header">
				<h1>Create Bingo Game</h1>
				<p class="subtitle">Set up a custom bingo game for your event</p>
			</div>

			{#if isLoading && isCreating}
				<div class="loading-state">
					<Loader message="Creating your game..." size="large" />
				</div>
			{:else}
				<div class="form-content">
					<div class="form-group">
						<label for="game-name">Game Name</label>
						<div class="input-container">
							<input 
								id="game-name" 
								type="text" 
								bind:value={gameName} 
								placeholder="Give your game a name"
								class:is-valid={isValidName}
							/>
							{#if isValidName}
								<div class="valid-indicator">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="20 6 9 17 4 12"></polyline>
									</svg>
								</div>
							{/if}
						</div>
						<p class="hint">This name will be shown to all players</p>
					</div>

					<div class="form-group">
						<div class="textarea-header">
							<label for="sentences">Bingo Items</label>
							<div class="sentence-counter {isValidSentences ? 'valid' : ''}">
								<span class="count">{sentenceCount}</span>/<span class="required">25</span> items
							</div>
						</div>
						
						<div class="textarea-container">
							<textarea 
								id="sentences" 
								bind:value={sentences} 
								placeholder="Enter one item per line. These will appear on the bingo board." 
								rows="12"
								class:is-valid={isValidSentences}
							></textarea>
							
							{#if sentences.length === 0}
								<button class="demo-button" on:click={fillDemoSentences}>
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
										<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
										<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
									</svg>
									Use Meeting Bingo Template
								</button>
							{/if}
						</div>
						
						<p class="hint">Enter at least 25 items, one per line. Each item will become a square on the bingo board.</p>
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
						class="create-button" 
						on:click={handleCreateGame} 
						disabled={!canCreate}
					>
						{#if isLoading && !isCreating}
							<div class="button-loader"></div>
						{:else}
							Create Game
						{/if}
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.create-page {
		min-height: calc(100vh - 64px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.page-container {
		width: 100%;
		max-width: 600px;
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

	.textarea-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.sentence-counter {
		font-size: 0.85rem;
		color: var(--text-secondary);
		padding: 0.25rem 0.5rem;
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
	}

	.sentence-counter.valid {
		color: var(--lemon-green);
		background-color: rgba(192, 255, 62, 0.1);
	}

	.sentence-counter .count {
		font-weight: 600;
	}

	.sentence-counter .required {
		opacity: 0.7;
	}

	.input-container,
	.textarea-container {
		position: relative;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.75rem 1rem;
		background-color: rgba(30, 30, 30, 0.6);
		color: var(--text-color);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--input-radius);
		font-size: 0.95rem;
		outline: none;
		transition: all 0.2s ease;
		font-family: 'Inter', system-ui, sans-serif;
	}

	input:focus,
	textarea:focus {
		border-color: var(--lemon-green);
		box-shadow: 0 0 0 2px rgba(192, 255, 62, 0.1);
	}

	input.is-valid,
	textarea.is-valid {
		border-color: var(--lemon-green);
	}

	textarea {
		resize: vertical;
		min-height: 200px;
		line-height: 1.5;
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

	.demo-button {
		position: absolute;
		bottom: 12px;
		right: 12px;
		background-color: rgba(255, 255, 255, 0.1);
		border: none;
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
		font-size: 0.8rem;
		color: var(--text-color);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
	}

	.demo-button:hover {
		background-color: rgba(255, 255, 255, 0.15);
		box-shadow: none;
		transform: none;
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

	.create-button {
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

	.create-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md), var(--glow-md);
	}

	.create-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.create-button:disabled {
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
</style>