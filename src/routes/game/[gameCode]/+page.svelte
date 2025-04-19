<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { subscribeToGame, gameData, db, updateDoc, doc } from '$lib/firebase';
	import { user } from '$lib/store';
	import Loader from '../../components/Loader.svelte';

	export let data;
	const { gameCode } = data;

	let currentUser;
	let player = null;
	let board: string[] = [];
	let crossedOut: string[] = [];
	let gameState = null;
	let bingoAchieved = false;
	let spectatingPlayer = null;
	let isLoading = true;
	let unsubscribeGame; // For Firebase cleanup

	$: user.subscribe((u) => {
		currentUser = u;
	});

	onMount(() => {
		unsubscribeGame = subscribeToGame(gameCode);
	});

	onDestroy(() => {
		if (unsubscribeGame) unsubscribeGame();
	});

	// Watch for live changes to the game
	$: gameData.subscribe((data) => {
		if (!data) {
			gameState = null;
			return;
		}
		
		isLoading = false;
		gameState = data;
		if (!currentUser) return;

		const currentPlayer = data.players?.find((p) => p.id === currentUser.uid);
		if (currentPlayer) {
			player = currentPlayer;

			// If we're not spectating or are spectating our own self,
			// display our own board
			if (!spectatingPlayer || spectatingPlayer.id === currentPlayer.id) {
				board = player.board;
				crossedOut = player.crossedOut || [];
			}
		}
		checkBingo();
	});

	function toggleWord(word: string) {
		if (spectatingPlayer) return; // Don't allow toggling while spectating
		if (!currentUser) return; // Safety check

		if (!crossedOut.includes(word)) {
			crossedOut = [...crossedOut, word];
		} else {
			crossedOut = crossedOut.filter((w) => w !== word);
		}
		checkBingo();

		// Update Firestore
		updateDoc(doc(db, 'games', gameCode), {
			players: gameState.players.map((p) => (p.id === player.id ? { ...p, crossedOut } : p))
		});
	}

	function checkBingo() {
		bingoAchieved = false;
		if (board.length < 25) return;

		// Break into 5x5
		const grid = Array.from({ length: 5 }, (_, rowIndex) =>
			board.slice(rowIndex * 5, rowIndex * 5 + 5)
		);

		// Rows & columns
		for (let i = 0; i < 5; i++) {
			if (grid[i].every((w) => crossedOut.includes(w))) {
				bingoAchieved = true;
			}
			if (grid.map((row) => row[i]).every((w) => crossedOut.includes(w))) {
				bingoAchieved = true;
			}
		}

		// Diagonals
		const topLeftDiagonal = grid.map((row, i) => row[i]);
		const topRightDiagonal = grid.map((row, i) => row[4 - i]);
		if (
			topLeftDiagonal.every((w) => crossedOut.includes(w)) ||
			topRightDiagonal.every((w) => crossedOut.includes(w))
		) {
			bingoAchieved = true;
		}
	}

	function spectatePlayer(playerId: string) {
		if (!gameState?.players) return;
		const sp = gameState.players.find((p) => p.id === playerId);
		if (sp) {
			spectatingPlayer = sp;
			board = sp.board;
			crossedOut = sp.crossedOut || [];
		}
	}

	function returnToOwnBoard() {
		spectatingPlayer = null;
		if (player) {
			board = player.board;
			crossedOut = player.crossedOut || [];
		}
	}
</script>

<div class="full-page-center">
	<div class="centered-form game-container">
		<h1>Game: {gameCode}</h1>

		{#if isLoading}
			<Loader message="Loading game data..." />
		{:else if !currentUser}
			<div class="auth-error">
				<p>Please log in to join this game.</p>
				<a href="/">Go to login</a>
			</div>
		{:else if board.length}
			<h2 class={spectatingPlayer ? 'spectating' : ''}>
				{#if spectatingPlayer}
					Spectating {spectatingPlayer.name}
				{:else}
					Your Bingo Board
				{/if}
			</h2>

			<div class="bingo-board">
				{#each board as word}
					<button
						class="word {crossedOut.includes(word) ? 'crossed-out' : ''}"
						tabindex="0"
						aria-pressed={crossedOut.includes(word)}
						on:click={() => toggleWord(word)}
						on:keydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') toggleWord(word);
						}}
					>
						{word}
					</button>
				{/each}
			</div>

			{#if bingoAchieved}
				<div class="bingo">
					<p>Bingo! 🎉</p>
					<div class="confetti"></div>
				</div>
			{/if}

			{#if spectatingPlayer}
				<button on:click={returnToOwnBoard} class="spectate-button"> 
					Return to Your Board 
				</button>
			{/if}
		{:else}
			<p>No game board found. Please check the game code.</p>
		{/if}

		<div class="players-list">
			<h2>Players</h2>
			{#if gameState?.players?.length}
				{#each gameState.players as otherPlayer}
					<div class="player-item">
						<span class={otherPlayer.id === currentUser?.uid ? 'current-player' : ''}>
							{otherPlayer.name} ({otherPlayer.crossedOut?.length || 0}/{board.length})
						</span>
						{#if otherPlayer.id !== currentUser?.uid}
							<button class="spectate-button" on:click={() => spectatePlayer(otherPlayer.id)}>
								Spectate
							</button>
						{/if}
					</div>
				{/each}
			{:else}
				<p>No players have joined this game yet.</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.game-container {
		max-width: 600px;
	}
	
	h1, h2 {
		color: var(--lemon-green);
		font-family: 'Montserrat', Arial, sans-serif;
		text-align: center;
	}
	
	h1 {
		font-weight: 700;
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.5);
	}
	
	h2 {
		font-weight: 600;
		margin-top: 1.5rem;
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.3);
	}

	/* Add special glow for spectating mode */
	h2.spectating {
		text-shadow: 0 0 15px rgba(192, 255, 62, 0.6);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% { text-shadow: 0 0 10px rgba(192, 255, 62, 0.4); }
		50% { text-shadow: 0 0 15px rgba(192, 255, 62, 0.7); }
		100% { text-shadow: 0 0 10px rgba(192, 255, 62, 0.4); }
	}

	.bingo-board {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 5px;
		margin-top: 20px;
		width: 100%;
	}

	.word {
		padding: 15px 5px;
		text-align: center;
		border: 2px solid var(--lemon-green);
		background-color: var(--dark-bg);
		color: var(--text-color);
		font-size: 0.9rem;
		font-family: 'Montserrat', Arial, sans-serif;
		cursor: pointer;
		transition:
			all 0.3s;
		height: 70px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.word:hover:not(.crossed-out) {
		box-shadow: 0 0 8px rgba(192, 255, 62, 0.5);
		text-shadow: 0 0 8px rgba(192, 255, 62, 0.5);
	}

	.word.crossed-out {
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		text-decoration: line-through;
		transform: scale(1.05);
		font-weight: 600;
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
		box-shadow: 0 0 10px rgba(192, 255, 62, 0.6);
	}

	.bingo {
		color: var(--lemon-green);
		font-size: 1.5rem;
		margin-top: 20px;
		text-align: center;
		font-weight: 700;
		text-shadow: 0 0 15px rgba(192, 255, 62, 0.8);
		animation: winGlow 1.5s infinite alternate;
	}

	@keyframes winGlow {
		from { text-shadow: 0 0 10px rgba(192, 255, 62, 0.5); }
		to { text-shadow: 0 0 20px rgba(192, 255, 62, 1); }
	}

	.players-list {
		margin-top: 20px;
		width: 100%;
	}

	.player-item {
		margin-bottom: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: 'Montserrat', Arial, sans-serif;
	}

	.current-player {
		color: var(--lemon-green);
		font-weight: 600;
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.4);
	}

	.spectate-button {
		background-color: var(--lemon-green);
		border: none;
		padding: 5px 10px;
		cursor: pointer;
		color: var(--dark-bg);
		font-size: 0.9rem;
		font-weight: 600;
		border-radius: 5px;
	}

	.spectate-button:hover {
		background-color: #a0df1e;
		box-shadow: 0 0 10px rgba(192, 255, 62, 0.7);
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	}
	
	.auth-error {
		text-align: center;
		padding: 2rem;
	}
	
	.auth-error a {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		text-decoration: none;
		border-radius: 5px;
		font-weight: 600;
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
	}

	.auth-error a:hover {
		box-shadow: 0 0 10px rgba(192, 255, 62, 0.7);
	}
</style>