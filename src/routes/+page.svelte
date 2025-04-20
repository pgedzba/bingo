<script>
	import { user } from '$lib/store';
	import { loginWithGoogle } from '$lib/firebase';
	import { goto } from '$app/navigation';

	let isLoading = false;

	async function handleLogin() {
		try {
			isLoading = true;
			await loginWithGoogle();
		} catch (error) {
			console.error('Login error:', error);
		} finally {
			isLoading = false;
		}
	}

	function shuffleArray(array) {
		const shuffled = [...array];

		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}

		return shuffled;
	}

	const bingoItems = shuffleArray([
		'Free Space',
		'Late arrival',
		'Coffee spill',
		'Technical issues',
		"Someone's pet appears",
		'Awkward silence',
		'"Can everyone see my screen?"',
		'Background noise',
		'"You\'re on mute"',
		'Email notification sound',
		'Weather small talk',
		'Internet drops',
		'Someone leaves early',
		'Double-booked room',
		'"Let\'s circle back"',
		'Unexpected guest',
		'Phone rings',
		'"Sorry, I was multitasking"',
		'Someone eating lunch',
		'Doorbell interruption',
		'"Let\'s take this offline"',
		'Surprise deadline',
		'Mandatory fun activity',
		'"Any questions?" *silence*',
		'Meeting runs over time'
	]);
</script>

<div class="home-page">
	<div class="hero-container">
		<div class="hero-content">
			<div class="logo-container">
				<div class="logo-badge">B</div>
				<h1 class="logo-text">Bingo</h1>
			</div>

			<h2 class="tagline">Create and play interactive bingo games with friends</h2>

			<div class="description">
				<p>
					A fun way to make meetings, events, and gatherings more engaging. Create custom bingo
					cards, share with participants, and track progress in real-time.
				</p>
			</div>

			<div class="actions">
				{#if $user}
					<button class="primary-button" on:click={() => goto('/dashboard')}>
						Go to Dashboard
					</button>
				{:else}
					<button
						class="primary-button"
						class:loading={isLoading}
						on:click={handleLogin}
						disabled={isLoading}
					>
						{#if isLoading}
							<div class="button-loader"></div>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"></path>
								<path d="M12 8v8"></path>
								<path d="M8 12h8"></path>
							</svg>
							Sign in with Google
						{/if}
					</button>
				{/if}
			</div>
		</div>

		<div class="hero-graphic">
			<div class="graphic-container">
				<div class="bingo-card">
					<div class="bingo-title">
						<span>B</span>
						<span>I</span>
						<span>N</span>
						<span>G</span>
						<span>O</span>
					</div>
					<div class="bingo-grid">
						{#each Array(25) as _, i}
							<div class="bingo-cell {Math.random() > 0.7 ? 'crossed' : ''}">
								<span class="cell-text">{bingoItems[i]}</span>
							</div>
						{/each}
					</div>
				</div>

				<div class="feature-cards">
					<div class="feature-card">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
							></path>
							<path d="m9 12 2 2 4-4"></path>
						</svg>
						<h3>Easy Setup</h3>
						<p>Create a new game in seconds with our intuitive interface.</p>
					</div>

					<div class="feature-card">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
							<circle cx="9" cy="7" r="4"></circle>
							<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
							<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
						</svg>
						<h3>Multiplayer</h3>
						<p>Invite friends to join your game with a simple 5-letter code.</p>
					</div>

					<div class="feature-card">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="10"></circle>
							<polyline points="12 6 12 12 16 14"></polyline>
						</svg>
						<h3>Real-time</h3>
						<p>Watch as players mark their boards in real-time.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.home-page {
		min-height: calc(100vh - 64px);
		background: linear-gradient(to bottom, var(--dark-bg), rgba(30, 30, 30, 0.9));
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.hero-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 1200px;
		margin: 0 auto;
		gap: 4rem;
	}

	.hero-content {
		flex: 1;
		max-width: 500px;
	}

	.logo-container {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.logo-badge {
		width: 60px;
		height: 60px;
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		font-size: 2rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		box-shadow: var(--glow-md);
	}

	.logo-text {
		font-size: 3rem;
		font-weight: 700;
		color: var(--lemon-green);
		margin: 0;
		letter-spacing: -0.03em;
		text-shadow: var(--glow-md);
	}

	.tagline {
		font-size: 1.75rem;
		color: var(--text-color);
		margin-bottom: 1.5rem;
		line-height: 1.3;
		font-weight: 600;
	}

	.description {
		margin-bottom: 2rem;
	}

	.description p {
		font-size: 1.1rem;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.actions {
		display: flex;
		gap: 1rem;
	}

	.primary-button {
		padding: 0.85rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		border: none;
		border-radius: var(--button-radius);
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.primary-button:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md), var(--glow-md);
	}

	.primary-button:active {
		transform: translateY(0);
	}

	.primary-button.loading {
		padding-left: 2.5rem;
		padding-right: 2.5rem;
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

	.hero-graphic {
		flex: 1;
		max-width: 600px;
		display: flex;
		justify-content: center;
	}

	.graphic-container {
		position: relative;
	}

	.bingo-card {
		background-color: var(--dark-card);
		border-radius: 16px;
		padding: 1.5rem;
		width: 100%;
		max-width: 400px;
		box-shadow: var(--shadow-lg);
		border: 1px solid rgba(255, 255, 255, 0.05);
		position: relative;
		z-index: 10;
		transform: rotate(2deg);
	}

	.bingo-title {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.bingo-title span {
		font-size: 1.8rem;
		font-weight: 700;
		color: var(--lemon-green);
		text-shadow: var(--glow-sm);
	}

	.bingo-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.35rem;
	}

	.bingo-cell {
		aspect-ratio: 1/1;
		background-color: rgba(30, 30, 30, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		position: relative;
		overflow: hidden;
	}

	.bingo-cell.crossed {
		background-color: rgba(192, 255, 62, 0.15);
		border: 1px solid var(--lemon-green);
	}

	.bingo-cell.crossed::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 12px;
		height: 12px;
		background-color: var(--lemon-green);
		border-radius: 50%;
		box-shadow: var(--glow-sm);
	}

	.cell-text {
		font-size: 0.6rem;
		color: var(--text-secondary);
		text-align: center;
	}

	.feature-cards {
		position: absolute;
		top: 40px;
		right: -40px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		z-index: 5;
	}

	.feature-card {
		background-color: var(--dark-card);
		border-radius: 12px;
		padding: 1rem;
		width: 220px;
		box-shadow: var(--shadow-md);
		border: 1px solid rgba(255, 255, 255, 0.05);
		transform: rotate(-5deg);
	}

	.feature-card:nth-child(2) {
		transform: rotate(-3deg) translateY(-10px);
	}

	.feature-card:nth-child(3) {
		transform: rotate(-8deg) translateY(-20px);
	}

	.feature-card svg {
		color: var(--lemon-green);
		margin-bottom: 0.75rem;
	}

	.feature-card h3 {
		font-size: 1rem;
		margin-bottom: 0.5rem;
		color: var(--text-color);
	}

	.feature-card p {
		font-size: 0.85rem;
		color: var(--text-secondary);
		margin: 0;
	}

	@media (max-width: 1024px) {
		.hero-container {
			flex-direction: column-reverse;
			gap: 2rem;
		}

		.hero-content {
			max-width: 100%;
			text-align: center;
		}

		.logo-container {
			justify-content: center;
		}

		.actions {
			justify-content: center;
		}

		.tagline {
			font-size: 1.5rem;
		}

		.feature-cards {
			right: -20px;
		}
	}

	@media (max-width: 640px) {
		.feature-cards {
			position: static;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			margin-top: 2rem;
		}

		.feature-card {
			transform: none !important;
			width: 100%;
			max-width: 300px;
		}

		.bingo-card {
			transform: none;
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
