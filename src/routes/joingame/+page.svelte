<script lang="ts">
  import { user } from '$lib/store';
  import { joinGame, subscribeToGame } from '$lib/firebase';
  import Loader from '../../components/Loader.svelte';
  import { goto } from '$app/navigation';

  let gameCode = '';
  let playerName = '';
  let error = '';
  let board: string[] = [];
  let currentUser;
  let isLoading = false;

  $: user.subscribe((u) => {
    currentUser = u;
  });

  async function handleJoinGame() {
    if (!gameCode || !playerName) {
      error = 'Game code and player name are required!';
      return;
    }

    if (!currentUser) {
      error = 'You must be logged in to join a game.';
      return;
    }

    try {
      isLoading = true;
      const { uid } = currentUser;
      const { board: playerBoard } = await joinGame(gameCode, playerName, uid);
      board = playerBoard;

      // Start listening for real-time updates
      subscribeToGame(gameCode);

      error = '';
      goto(`/game/${gameCode}`);
    } catch (err) {
      console.error(err);
      error = err.message || 'An error occurred while joining the game.';
    } finally {
      isLoading = false;
    }
  }
</script>

<style>
  .error {
    color: red;
  }
</style>

<div class="full-page-center">
  <div class="centered-form">
    {#if isLoading}
      <Loader />
    {:else}
      <h1>Join Game</h1>
      <div>
        <label for="game-code">Game Code:</label>
        <input
          id="game-code"
          type="text"
          bind:value={gameCode}
          placeholder="Enter game code"
        />
      </div>
      <div>
        <label for="player-name">Player Name:</label>
        <input
          id="player-name"
          type="text"
          bind:value={playerName}
          placeholder="Enter your name"
        />
      </div>
      {#if error}
        <p class="error">{error}</p>
      {/if}
      <button on:click={handleJoinGame}>Join Game</button>
    {/if}
  </div>
</div>