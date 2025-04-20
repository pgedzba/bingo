<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { subscribeToGame, gameData, db, updateDoc, doc } from '$lib/firebase';
	import { user } from '$lib/store';
	import Loader from '../../../components/Loader.svelte';

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
	let unsubscribeGame;
	let showPlayersList = false;

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
		showPlayersList = false;
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

	function togglePlayersList() {
		showPlayersList = !showPlayersList;
	}
</script>

<div class="game-page">
	<div class="game-header">
		<div class="game-info">
			<h1>Game: {gameCode}</h1>
			{#if gameState?.gameName}
				<div class="game-name">{gameState.gameName}</div>
			{/if}
		</div>
		
		<div class="game-actions">
			<button class="players-toggle" on:click={togglePlayersList}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
				Players
			</button>
		</div>
	</div>

	{#if isLoading}
		<div class="loader-container">
			<Loader message="Loading game data..." />
		</div>
	{:else if !currentUser}
		<div class="auth-message">
			<div class="auth-card">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				</svg>
				<h2>Authentication Required</h2>
				<p>Please sign in to join this game and view the bingo board.</p>
				<a href="/" class="auth-link">Go to Sign In</a>
			</div>
		</div>
	{:else if board.length}
		<div class="game-container">
			<div class="board-section">
				<div class="board-header">
					{#if spectatingPlayer}
						<div class="spectating-badge">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
								<circle cx="12" cy="12" r="3"></circle>
							</svg>
							Viewing {spectatingPlayer.name}'s Board
							<button class="return-button" on:click={returnToOwnBoard}>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M19 12H5"></path>
									<polyline points="12 19 5 12 12 5"></polyline>
								</svg>
								Return to my board
							</button>
						</div>
					{:else}
						<h2>Your Bingo Board</h2>
						<div class="progress-indicator">
							<div class="progress-text">{crossedOut.length}/{board.length} crossed</div>
							<div class="progress-bar">
								<div class="progress-fill" style="width: {(crossedOut.length / board.length) * 100}%"></div>
							</div>
						</div>
					{/if}
				</div>

				<div class="bingo-board">
					{#each board as word, index}
						<button
							class="bingo-cell {crossedOut.includes(word) ? 'crossed' : ''}"
							tabindex="0"
							aria-pressed={crossedOut.includes(word)}
							on:click={() => toggleWord(word)}
							on:keydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') toggleWord(word);
							}}
						>
							<span class="cell-number">{index + 1}</span>
							<span class="cell-content">{word}</span>
							{#if crossedOut.includes(word)}
								<span class="cell-check">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="20 6 9 17 4 12"></polyline>
									</svg>
								</span>
							{/if}
						</button>
					{/each}
				</div>

				{#if bingoAchieved}
					<div class="bingo-celebration">
						<div class="bingo-alert">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M6 10c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2"></path>
								<path d="M6 19c-1.1 0-2-.9-2-2v-3c0-1.1.9-2 2-2"></path>
								<path d="M15 5c0-1.1.9-2 2-2h3c1.1 0 2.9 2 2 2v3c0 1.1-.9 2-2 2"></path>
								<path d="M18 19c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h3z"></path>
								<line x1="10" y1="9" x2="14" y2="15"></line>
								<line x1="14" y1="9" x2="10" y2="15"></line>
							</svg>
							<h3>BINGO!</h3>
							<p>Congratulations! You've completed a line!</p>
						</div>
					</div>
				{/if}
			</div>

			<div class="players-sidebar" class:open={showPlayersList}>
				<div class="sidebar-header">
					<h3>Players</h3>
					<button class="close-sidebar" on:click={togglePlayersList}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>
				
				<div class="players-list">
					{#if gameState?.players?.length}
						{#each gameState.players as otherPlayer}
							<div class="player-card {otherPlayer.id === currentUser?.uid ? 'current-player' : ''} {spectatingPlayer?.id === otherPlayer.id ? 'active-spectate' : ''}">
								<div class="player-info">
									<div class="player-avatar">
										{otherPlayer.name[0].toUpperCase()}
									</div>
									<div class="player-details">
										<div class="player-name">
											{otherPlayer.name}
											{#if otherPlayer.id === currentUser?.uid}
												<span class="player-badge">You</span>
											{/if}
										</div>
										<div class="player-progress">
											<div class="progress-bar">
												<div class="progress-fill" style="width: {((otherPlayer.crossedOut?.length || 0) / board.length) * 100}%"></div>
											</div>
											<div class="progress-text">{otherPlayer.crossedOut?.length || 0}/{board.length}</div>
										</div>
									</div>
								</div>
								
								{#if otherPlayer.id !== currentUser?.uid}
									<button 
										class="spectate-button" 
										class:active={spectatingPlayer?.id === otherPlayer.id}
										on:click={() => spectatePlayer(otherPlayer.id)}
									>
										{#if spectatingPlayer?.id === otherPlayer.id}
											Viewing
										{:else}
											View
										{/if}
									</button>
								{/if}
							</div>
						{/each}
					{:else}
						<div class="no-players">No other players have joined this game yet.</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="empty-state">
			<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
				<path d="M13 2v7h7"></path>
			</svg>
			<h3>No Game Board Found</h3>
			<p>Please check the game code or try joining the game again.</p>
			<a href="/joingame" class="link-button">Go to Join Game</a>
		</div>
	{/if}
</div>

<style>
	.game-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1.5rem;
	}

	.game-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.game-info h1 {
		margin-bottom: 0.25rem;
		font-size: 1.75rem;
		color: var(--lemon-green);
	}

	.game-name {
		font-size: 1rem;
		color: var(--text-secondary);
	}

	.players-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: transparent;
		border: 1px solid var(--lemon-green);
		color: var(--lemon-green);
		font-weight: 500;
	}

	.players-toggle:hover {
		background-color: rgba(192, 255, 62, 0.1);
	}

	.game-container {
		display: flex;
		gap: 1.5rem;
		position: relative;
	}

	.board-section {
		flex: 1;
		min-width: 0;
	}

	.board-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.board-header h2 {
		color: var(--lemon-green);
		margin: 0;
	}

	.spectating-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: rgba(192, 255, 62, 0.1);
		color: var(--lemon-green);
		padding: 0.5rem 0.75rem;
		border-radius: var(--button-radius);
		font-size: 0.9rem;
		font-weight: 500;
		margin-bottom: 1rem;
	}

	.return-button {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-left: auto;
		background: transparent;
		color: var(--lemon-green);
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
		box-shadow: none;
	}

	.return-button:hover {
		background-color: rgba(192, 255, 62, 0.2);
		box-shadow: none;
	}

	.progress-indicator {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.progress-text {
		font-size: 0.85rem;
		color: var(--text-secondary);
		text-align: right;
	}

	.progress-bar {
		height: 6px;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		overflow: hidden;
		width: 120px;
	}

	.progress-fill {
		height: 100%;
		background-color: var(--lemon-green);
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.bingo-board {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.5rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.bingo-cell {
		aspect-ratio: 1/1;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--dark-card);
		border: 1px solid rgba(192, 255, 62, 0.2);
		border-radius: var(--button-radius);
		padding: 0.5rem;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.bingo-cell:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		background-color: var(--dark-card-hover);
		border-color: rgba(192, 255, 62, 0.4);
	}

	.cell-number {
		position: absolute;
		top: 0.25rem;
		left: 0.25rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
		opacity: 0.7;
	}

	.cell-content {
		font-size: 0.85rem;
		text-align: center;
		line-height: 1.3;
		word-break: break-word;
		max-height: 100%;
		overflow: hidden;
		padding: 0.5rem;
	}

	.bingo-cell.crossed {
		background-color: rgba(192, 255, 62, 0.15);
		border-color: var(--lemon-green);
		transform: scale(1.02);
		box-shadow: var(--glow-md);
	}

	.bingo-cell.crossed .cell-content {
		opacity: 0.7;
	}

	.cell-check {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--lemon-green);
		animation: checkIn 0.3s ease forwards;
	}

	@keyframes checkIn {
		0% {
			transform: scale(0) rotate(-10deg);
			opacity: 0;
		}
		100% {
			transform: scale(1) rotate(0);
			opacity: 1;
		}
	}

	.bingo-celebration {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		z-index: 50;
		animation: fadeIn 0.5s ease forwards;
	}

	.bingo-alert {
		background-color: var(--dark-card);
		padding: 2rem;
		border-radius: var(--border-radius);
		text-align: center;
		border: 2px solid var(--lemon-green);
		max-width: 400px;
		box-shadow: var(--shadow-lg), var(--glow-lg);
		animation: popIn 0.5s ease forwards;
	}

	.bingo-alert svg {
		color: var(--lemon-green);
		margin-bottom: 1rem;
		width: 64px;
		height: 64px;
	}

	.bingo-alert h3 {
		font-size: 2rem;
		color: var(--lemon-green);
		margin-bottom: 0.5rem;
		text-shadow: var(--glow-md);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes popIn {
		0% { transform: scale(0.8); opacity: 0; }
		70% { transform: scale(1.05); }
		100% { transform: scale(1); opacity: 1; }
	}

	.players-sidebar {
		width: 300px;
		background-color: var(--dark-card);
		border-radius: var(--border-radius);
		box-shadow: var(--shadow-md);
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.05);
		transition: transform 0.3s ease;
	}

	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.sidebar-header h3 {
		margin: 0;
		color: var(--text-color);
	}

	.close-sidebar {
		background: transparent;
		padding: 0.25rem;
		color: var(--text-secondary);
		display: none;
	}

	.close-sidebar:hover {
		color: var(--text-color);
		background-color: rgba(255, 255, 255, 0.05);
		box-shadow: none;
	}

	.players-list {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-height: 70vh;
		overflow-y: auto;
	}

	.player-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background-color: rgba(255, 255, 255, 0.02);
		border-radius: var(--button-radius);
		transition: background-color 0.2s ease;
	}

	.player-card:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.player-card.current-player {
		background-color: rgba(192, 255, 62, 0.05);
		border: 1px solid rgba(192, 255, 62, 0.2);
	}

	.player-card.active-spectate {
		background-color: rgba(192, 255, 62, 0.1);
		border: 1px solid rgba(192, 255, 62, 0.3);
	}

	.player-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		overflow: hidden;
	}

	.player-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.85rem;
		flex-shrink: 0;
	}

	.player-details {
		overflow: hidden;
	}

	.player-name {
		font-size: 0.9rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.player-badge {
		font-size: 0.7rem;
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
		font-weight: 600;
	}

	.player-progress {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.player-progress .progress-bar {
		flex: 1;
		height: 4px;
	}

	.player-progress .progress-text {
		font-size: 0.7rem;
		min-width: 3rem;
	}

	.spectate-button {
		padding: 0.35rem 0.75rem;
		font-size: 0.8rem;
		background-color: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--text-secondary);
	}

	.spectate-button:hover {
		color: var(--lemon-green);
		border-color: var(--lemon-green);
		background-color: transparent;
		box-shadow: none;
	}

	.spectate-button.active {
		color: var(--lemon-green);
		border-color: var(--lemon-green);
		background-color: rgba(192, 255, 62, 0.1);
	}

	.no-players {
		color: var(--text-secondary);
		text-align: center;
		padding: 1.5rem 0;
		font-size: 0.9rem;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 1rem;
		text-align: center;
		color: var(--text-secondary);
	}

	.empty-state svg {
		color: var(--text-secondary);
		opacity: 0.5;
		margin-bottom: 1.5rem;
	}

	.empty-state h3 {
		margin-bottom: 0.5rem;
		color: var(--text-color);
	}

	.link-button {
		display: inline-block;
		margin-top: 1.5rem;
		padding: 0.75rem 1.25rem;
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		border-radius: var(--button-radius);
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.link-button:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		text-decoration: none;
	}

	.loader-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 50vh;
	}

	.auth-message {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 50vh;
	}

	.auth-card {
		text-align: center;
		background-color: var(--dark-card);
		padding: 2rem;
		border-radius: var(--border-radius);
		max-width: 400px;
		box-shadow: var(--shadow-lg);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.auth-card svg {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
	}

	.auth-card h2 {
		margin-bottom: 1rem;
		color: var(--text-color);
	}

	.auth-link {
		display: inline-block;
		margin-top: 1.5rem;
		padding: 0.75rem 1.25rem;
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		border-radius: var(--button-radius);
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.auth-link:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		text-decoration: none;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.game-container {
			flex-direction: column;
		}

		.players-sidebar {
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			width: 100%;
			max-width: 300px;
			z-index: 100;
			transform: translateX(100%);
			box-shadow: var(--shadow-lg);
		}

		.players-sidebar.open {
			transform: translateX(0);
		}

		.close-sidebar {
			display: block;
		}

		.bingo-cell {
			font-size: 0.75rem;
		}

		.bingo-board {
			gap: 0.35rem;
		}
	}
</style>