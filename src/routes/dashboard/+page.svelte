<script lang="ts">
	import { onMount } from 'svelte';
	import { db, collection, query, where, getDocs } from '$lib/firebase';
	import { user } from '$lib/store';
	import Loader from '../../components/Loader.svelte';
	import { goto } from '$app/navigation';

	let currentUser;
	let joinedGames = [];
	let error = '';
	let isLoading = true;

	$: user.subscribe((u) => {
		currentUser = u;
	});

	onMount(async () => {
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
									<li>
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
	.error {
		color: red;
		margin: 10px 0;
	}

	.game-list {
		list-style: none;
		padding: 0;
	}

	.game-item {
		margin-bottom: 15px;
		padding: 10px;
		border: 1px solid #2ecc71;
		border-radius: 5px;
		background-color: #1e1e1e;
		color: #d4ffd4;
	}

	.game-item h3 {
		margin: 0 0 5px 0;
		font-size: 1.2rem;
		color: limegreen;
	}

	.game-item p {
		margin: 5px 0;
		font-size: 0.9rem;
	}

	.open-game-button {
		margin-top: 10px;
		background-color: #2ecc71;
		border: none;
		padding: 5px 10px;
		cursor: pointer;
		color: white;
		font-size: 0.9rem;
		border-radius: 5px;
	}

	.open-game-button:hover {
		background-color: #27ae60;
	}
</style>
