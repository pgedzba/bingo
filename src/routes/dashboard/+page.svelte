<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { db, collection, query, where, getDocs } from '$lib/firebase';
	import { user } from '$lib/store';
	import Loader from '../../components/Loader.svelte';
	import { goto } from '$app/navigation';

	let currentUser;
	let joinedGames = [];
	let error = '';
	let isLoading = true;
	let unsubscribe;

	onMount(async () => {
		unsubscribe = user.subscribe((u) => {
			currentUser = u;
		});

		if (!currentUser) {
			error = 'You must be logged in to view the dashboard.';
			isLoading = false;
			return;
		}

		try {
			await fetchGames();
		} catch (err) {
			console.error(err);
			error = 'An error occurred while fetching games.';
		} finally {
			isLoading = false;
		}
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	async function fetchGames() {
		if (!currentUser) return;
		
		const gamesRef = collection(db, 'games');
		const q = query(gamesRef, where('playerIDs', 'array-contains', currentUser.uid));
		const querySnapshot = await getDocs(q);

		joinedGames = querySnapshot.docs.map((doc) => {
			const data = doc.data();
			
			// Find current player's progress
			const playerData = data.players?.find(p => p.id === currentUser.uid);
			const crossedCount = playerData?.crossedOut?.length || 0;
			const totalItems = data.sentences?.length || 25;
			const progressPercent = Math.round((crossedCount / totalItems) * 100);
			
			// Sort players by progress
			const sortedPlayers = [...(data.players || [])].sort((a, b) => {
				const aProgress = a.crossedOut?.length || 0;
				const bProgress = b.crossedOut?.length || 0;
				return bProgress - aProgress;
			});
			
			return {
				id: doc.id,
				gameName: data.gameName || 'Unnamed Game',
				createdAt: data.createdAt?.toDate?.() || new Date(),
				players: sortedPlayers,
				progress: progressPercent,
				crossedCount,
				totalItems
			};
		});

		// Sort games by recent activity
		joinedGames.sort((a, b) => b.createdAt - a.createdAt);
	}

	function openGame(gameId: string) {
		goto(`/game/${gameId}`);
	}

	function formatDate(date) {
		if (!date) return '';
		
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		
		if (date >= today) {
			return 'Today';
		} else if (date >= yesterday) {
			return 'Yesterday';
		} else {
			return date.toLocaleDateString();
		}
	}
</script>

<div class="dashboard-page">
	<div class="dashboard-header">
		<h1>My Games</h1>
		<div class="header-actions">
			<a href="/joingame" class="action-button secondary">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
					<polyline points="10 17 15 12 10 7"></polyline>
					<line x1="15" y1="12" x2="3" y2="12"></line>
				</svg>
				Join Game
			</a>
			<a href="/creategame" class="action-button primary">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="16"></line>
					<line x1="8" y1="12" x2="16" y2="12"></line>
				</svg>
				Create Game
			</a>
		</div>
	</div>

	{#if isLoading}
		<div class="loading-container">
			<Loader message="Loading your games..." size="large" />
		</div>
	{:else if error}
		<div class="error-container">
			<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			<h2>Authentication Required</h2>
			<p>{error}</p>
			<a href="/" class="auth-link">Go to Sign In</a>
		</div>
	{:else if joinedGames.length === 0}
		<div class="empty-state">
			<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
				<polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
				<polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
				<polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
				<polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
				<line x1="12" y1="22.08" x2="12" y2="12"></line>
			</svg>
			<h2>No Games Found</h2>
			<p>You haven't joined any games yet. Create a new game or join an existing one.</p>
			<div class="empty-actions">
				<a href="/joingame" class="action-button secondary">Join Game</a>
				<a href="/creategame" class="action-button primary">Create Game</a>
			</div>
		</div>
	{:else}
		<div class="games-grid">
			{#each joinedGames as game}
				<div class="game-card" on:click={() => openGame(game.id)} on:keydown={(e) => e.key === 'Enter' && openGame(game.id)} tabindex="0" role="button">
					<div class="game-header">
						<h2 class="game-name">{game.gameName}</h2>
						<div class="game-code">{game.id}</div>
					</div>
					
					<div class="game-details">
						<div class="stats-row">
							<div class="stat">
								<div class="stat-label">Players</div>
								<div class="stat-value">{game.players.length}</div>
							</div>
							<div class="stat">
								<div class="stat-label">Created</div>
								<div class="stat-value">{formatDate(game.createdAt)}</div>
							</div>
							<div class="stat">
								<div class="stat-label">Your Progress</div>
								<div class="stat-value">{game.crossedCount}/{game.totalItems}</div>
							</div>
						</div>
						
						<div class="progress-container">
							<div class="progress-bar">
								<div class="progress-fill" style="width: {game.progress}%"></div>
							</div>
							<div class="progress-text">{game.progress}%</div>
						</div>
					</div>
					
					<div class="players-section">
						<h3>Players Ranking</h3>
						<ul class="players-list">
							{#each game.players.slice(0, 3) as player, index}
								<li class="player-item {player.id === currentUser?.uid ? 'current-player' : ''}">
									<div class="player-rank">{index + 1}</div>
									<div class="player-avatar">
										{player.name[0].toUpperCase()}
									</div>
									<div class="player-name">
										{player.name}
										{#if player.id === currentUser?.uid}
											<span class="player-badge">You</span>
										{/if}
									</div>
									<div class="player-score">
										{player.crossedOut?.length || 0}/{game.totalItems}
									</div>
								</li>
							{/each}
							
							{#if game.players.length > 3}
								<li class="players-more">
									+{game.players.length - 3} more players
								</li>
							{/if}
						</ul>
					</div>
					
					<div class="card-footer">
						<button class="open-button">
							Open Game
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M5 12h14"></path>
								<path d="m12 5 7 7-7 7"></path>
							</svg>
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.dashboard-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.dashboard-header h1 {
		font-size: 1.75rem;
		color: var(--lemon-green);
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: 1rem;
	}

	.action-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		border-radius: var(--button-radius);
		font-weight: 600;
		font-size: 0.9rem;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.action-button.primary {
		background-color: var(--lemon-green);
		color: var(--dark-bg);
	}

	.action-button.secondary {
		background-color: transparent;
		border: 1px solid var(--lemon-green);
		color: var(--lemon-green);
	}

	.action-button.primary:hover {
		box-shadow: var(--shadow-md), var(--glow-sm);
		transform: translateY(-2px);
		text-decoration: none;
	}

	.action-button.secondary:hover {
		background-color: rgba(192, 255, 62, 0.1);
		text-decoration: none;
	}

	.loading-container,
	.error-container,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		min-height: 50vh;
		padding: 2rem;
	}

	.error-container svg,
	.empty-state svg {
		color: var(--text-secondary);
		opacity: 0.6;
		margin-bottom: 1.5rem;
	}

	.error-container h2,
	.empty-state h2 {
		color: var(--text-color);
		margin-bottom: 1rem;
		font-size: 1.5rem;
	}

	.error-container p,
	.empty-state p {
		color: var(--text-secondary);
		max-width: 500px;
		margin-bottom: 2rem;
		font-size: 1.1rem;
		line-height: 1.6;
	}

	.auth-link {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		border-radius: var(--button-radius);
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.auth-link:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md), var(--glow-sm);
		text-decoration: none;
	}

	.empty-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	.games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.game-card {
		background-color: var(--dark-card);
		border-radius: var(--border-radius);
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.05);
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.game-card:hover {
		transform: translateY(-5px);
		box-shadow: var(--shadow-lg), var(--glow-sm);
		background-color: var(--dark-card-hover);
	}

	.game-header {
		padding: 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.game-name {
		font-size: 1.25rem;
		margin: 0 0 0.5rem 0;
		color: var(--text-color);
	}

	.game-code {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-secondary);
		letter-spacing: 0.05em;
	}

	.game-details {
		padding: 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.stats-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.stat {
		text-align: center;
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--text-secondary);
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-color);
	}

	.progress-container {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.progress-bar {
		height: 8px;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		overflow: hidden;
		flex: 1;
	}

	.progress-fill {
		height: 100%;
		background-color: var(--lemon-green);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--lemon-green);
		min-width: 3rem;
		text-align: right;
	}

	.players-section {
		padding: 1.25rem;
	}

	.players-section h3 {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0 0 1rem 0;
		font-weight: 500;
	}

	.players-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.player-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.player-item:last-child {
		border-bottom: none;
	}

	.player-rank {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--text-color);
		min-width: 1.5rem;
	}

	.player-avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-color);
	}

	.player-name {
		flex: 1;
		font-size: 0.9rem;
		color: var(--text-color);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.player-badge {
		font-size: 0.7rem;
		padding: 0.1rem 0.35rem;
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		border-radius: 4px;
		font-weight: 600;
	}

	.player-score {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.current-player .player-avatar {
		background-color: var(--lemon-green);
		color: var(--dark-bg);
	}

	.current-player .player-name {
		color: var(--lemon-green);
	}

	.players-more {
		padding: 0.5rem 0;
		font-size: 0.85rem;
		color: var(--text-secondary);
		text-align: center;
		font-style: italic;
	}

	.card-footer {
		padding: 1.25rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		text-align: right;
	}

	.open-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background-color: transparent;
		border: 1px solid var(--lemon-green);
		color: var(--lemon-green);
		border-radius: var(--button-radius);
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.open-button:hover {
		background-color: rgba(192, 255, 62, 0.1);
		box-shadow: none;
		transform: none;
	}

	@media (max-width: 768px) {
		.dashboard-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.games-grid {
			grid-template-columns: 1fr;
		}
	}
</style>