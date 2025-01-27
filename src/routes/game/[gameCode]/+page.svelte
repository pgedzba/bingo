<script lang="ts">
	import { onMount } from 'svelte';
	import { subscribeToGame, gameData, db, updateDoc, doc } from '$lib/firebase';
	import { user } from '$lib/store';

	// SvelteKit will auto-provide "params.gameCode"
	// if we define a load function or simply use `export function load()`.
	// Easiest is to define a load and pass it in as a prop:

	export let data;
	const { gameCode } = data;
	// Alternatively, define `export function load({ params }) { return { gameCode: params.gameCode }; }`
	// Then in the <script> you can do `export let gameCode;`

	let currentUser;
	let player = null;
	let board: string[] = [];
	let crossedOut: string[] = [];
	let gameState = null;
	let bingoAchieved = false;
	let spectatingPlayer = null;

	$: user.subscribe((u) => {
		currentUser = u;
	});

	onMount(() => {
		subscribeToGame(gameCode);
	});

	// Watch for live changes to the game
	$: gameData.subscribe((data) => {
		if (!data) {
			gameState = null;
			return;
		}
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
		if (spectatingPlayer) return; // Don’t allow toggling while spectating

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
	<div class="centered-form">
		<h1>Game: {gameCode}</h1>

		{#if board.length}
			<h2>
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
				<p class="bingo">Bingo! 🎉</p>
			{/if}

			{#if spectatingPlayer}
				<button on:click={returnToOwnBoard} class="spectate-button"> Return to Your Board </button>
			{/if}
		{:else}
			<p>Loading your bingo board...</p>
		{/if}

		<div class="players-list">
			<h2 style="text-align: center;">Players</h2>
			{#if gameState}
				{#each gameState.players as otherPlayer}
					<div class="player-item">
						<span>
							{otherPlayer.name} ({otherPlayer.crossedOut?.length || 0}/{board.length})
						</span>
						{#if otherPlayer.id !== currentUser?.uid}
							<button class="spectate-button" on:click={() => spectatePlayer(otherPlayer.id)}>
								Spectate
							</button>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	.bingo-board {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 5px;
		margin-top: 20px;
	}

	.word {
		padding: 15px;
		text-align: center;
		border: 2px solid #2ecc71;
		background-color: #121212;
		color: #d4ffd4;
		font-size: 1rem;
		cursor: pointer;
		transition:
			background-color 0.3s,
			transform 0.3s;
	}

	.word.crossed-out {
		background-color: #2ecc71;
		color: #121212;
		text-decoration: line-through;
		transform: scale(1.1);
	}

	.bingo {
		color: limegreen;
		font-size: 1.5rem;
		margin-top: 20px;
	}

	.players-list {
		margin-top: 20px;
	}

	.player-item {
		margin-bottom: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.spectate-button {
		background-color: #2ecc71;
		border: none;
		padding: 5px 10px;
		cursor: pointer;
		color: #121212;
		font-size: 0.9rem;
		border-radius: 5px;
	}

	.spectate-button:hover {
		background-color: #00ff00;
	}
</style>
