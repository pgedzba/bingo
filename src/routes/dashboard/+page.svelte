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

	$: user.subscribe((u) => {
		currentUser = u;
	});

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
			const gamesRef = collection(db, 'games');
			const q = query(gamesRef, where('playerIDs', 'array-contains', currentUser.uid));
			const querySnapshot = await getDocs(q);

			joinedGames = querySnapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					gameName: data.gameName,
					players: data.players || []
				};
			});

			if (joinedGames.length === 0) {
				error = "You haven't joined any games yet.";
			}
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

	function openGame(gameId: string) {
		goto(`/game/${gameId}`);
	}
</script>

<div class="full-page-center">
	<div class="centered-form">
		<h1>Dashboard</h1>

		{#if isLoading}
			<Loader message="Fetching games..." />
		{:else}
			{#if error}
				<p class="error">{error}</p>
			{/if}

			{#if joinedGames.length > 0}
				<ul class="game-list">
					{#each joinedGames as game}
						<li class="game-item">
							<h3>{game.gameName} ({game.id})</h3>
							<p>Players: {game.players.length}</p>
							<p>Player Progress:</p>
							<ul>
								{#each game.players as player}
									<li class={player.id === currentUser?.uid ? 'current-player' : ''}>
										{player.name || 'Unknown'} – {player.crossedOut?.length || 0} words crossed out
									</li>
								{/each}
							</ul>
							<button class="open-game-button" on:click={() => openGame(game.id)}>
								Open Game
							</button>
						</li>
					{/each}
				</ul>
			{/if}
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

	.error {
		color: #ff5555;
		margin: 10px 0;
		text-shadow: 0 0 10px rgba(255, 85, 85, 0.3);
	}

	.game-list {
		list-style: none;
		padding: 0;
	}

	.game-item {
		margin-bottom: 15px;
		padding: 10px;
		border: 1px solid var(--lemon-green);
		border-radius: 5px;
		background-color: var(--dark-card);
		color: var(--text-color);
		box-shadow: 0 0 8px rgba(192, 255, 62, 0.2);
		transition: box-shadow 0.3s ease;
	}

	.game-item:hover {
		box-shadow: 0 0 12px rgba(192, 255, 62, 0.4);
	}

	.game-item h3 {
		margin: 0 0 5px 0;
		font-size: 1.2rem;
		color: var(--lemon-green);
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.4);
		font-family: 'Montserrat', Arial, sans-serif;
		font-weight: 600;
	}

	.game-item p {
		margin: 5px 0;
		font-size: 0.9rem;
		font-family: 'Montserrat', Arial, sans-serif;
	}

	.current-player {
		color: var(--lemon-green);
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.4);
		font-weight: 500;
	}

	.open-game-button {
		margin-top: 10px;
		background-color: var(--lemon-green);
		border: none;
		padding: 8px 12px;
		cursor: pointer;
		color: var(--dark-bg);
		font-size: 0.9rem;
		font-weight: 600;
		border-radius: 5px;
		font-family: 'Montserrat', Arial, sans-serif;
		transition: all 0.3s ease;
	}

	.open-game-button:hover {
		background-color: #a0df1e;
		box-shadow: 0 0 10px rgba(192, 255, 62, 0.7);
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
	}
</style>