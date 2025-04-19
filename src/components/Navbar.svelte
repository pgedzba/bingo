<script>
	import { onMount, onDestroy } from 'svelte';
	import { logout, user } from '$lib/store';
	import { goto } from '$app/navigation';

	let isMenuOpen = false; // For mobile menu toggle
	let currentUser = null; // Local variable for user
	let isBrowser = false; // Flag to ensure client-side operations
	let unsubscribe; // Store unsubscribe function for cleanup

	// Run only in the browser
	onMount(() => {
		isBrowser = true;
		unsubscribe = user.subscribe((u) => {
			currentUser = u;
		});
	});

	// Clean up subscription when component is destroyed
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	const handleLogout = () => {
		if (isBrowser) logout(); // Logout only in the browser
	};
</script>

<nav class="navbar">
	<!-- Logo -->
	<div class="logo">
		<a href="/" aria-label="Navigate to Home">
			<h1>Bingo</h1>
		</a>
	</div>

	<!-- Mobile Menu Toggle Button -->
	<button class="menu-toggle" aria-label="Toggle Menu" on:click={() => (isMenuOpen = !isMenuOpen)}>
		☰
	</button>

	<!-- Navigation Links -->
	<ul class="nav-links" class:open={isMenuOpen}>
		<li><a href="/dashboard">Dashboard</a></li>
		<li><a href="/joingame">Join Game</a></li>
		<li><a href="/creategame">Create Game</a></li>
	</ul>

	<!-- User Actions -->
	<div class="user-buttons">
		{#if isBrowser && currentUser}
			<!-- User Info -->
			<div class="user-info">
				<span title={currentUser.displayName || currentUser.email}>
					{currentUser.displayName || currentUser.email}
				</span>
				<button class="icon-button logout" on:click={handleLogout} aria-label="Logout">
					<!-- Logout Icon -->
					<svg
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
					>
						<path
							d="M10 9V6C10 5.447 10.447 5 11 5H17C17.553 5 18 5.447 18 6V18C18 18.553 17.553 19 17 19H11C10.447 19 10 18.553 10 18V15H8V18C8 19.656 9.344 21 11 21H17C18.656 21 20 19.656 20 18V6C20 4.344 18.656 3 17 3H11C9.344 3 8 4.344 8 6V9H10ZM13 11H4.414L6.707 8.707C7.098 8.316 7.098 7.684 6.707 7.293C6.316 6.902 5.684 6.902 5.293 7.293L2.293 10.293C2.105 10.481 2 10.734 2 11C2 11.266 2.105 11.519 2.293 11.707L5.293 14.707C5.684 15.098 6.316 15.098 6.707 14.707C7.098 14.316 7.098 13.684 6.707 13.293L4.414 11H13C13.553 11 14 10.553 14 10C14 9.447 13.553 9 13 9Z"
							fill="currentColor"
						/>
					</svg>
				</button>
			</div>
		{:else}
			<!-- Login/Register Button -->
			<button class="login" on:click={() => goto('/login')}> Login/Register </button>
		{/if}
	</div>
</nav>

<style>
	/* Using the new color variables */
	.navbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--dark-card);
		padding: 1rem 2rem;
		border-bottom: 2px solid var(--lemon-green);
		position: sticky;
		top: 0;
		z-index: 10;
		font-family: 'Montserrat', Arial, sans-serif;
	}

	.logo h1 {
		margin: 0;
		font-size: 1.8rem;
		color: var(--lemon-green);
		font-weight: 700;
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.6); /* Stronger glow for logo */
	}

	.logo a {
		text-decoration: none;
		color: inherit;
	}

	.menu-toggle {
		display: none;
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--lemon-green);
		cursor: pointer;
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.4);
	}

	.nav-links {
		list-style: none;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin: 0;
		padding: 0;
		flex: 1;
		justify-content: center;
	}

	.nav-links li a {
		text-decoration: none;
		color: var(--lemon-green);
		font-size: 1rem;
		font-weight: 500;
		transition: all 0.3s ease;
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.2); /* Subtle glow for nav links */
	}

	.nav-links li a:hover {
		color: var(--text-color);
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.5); /* Enhanced glow on hover */
	}

	.user-buttons {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}

	.user-info span {
		font-size: 0.9rem;
		color: var(--text-color);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 150px;
		text-align: center;
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.3); /* Subtle glow for username */
	}

	.icon-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		transition: background-color 0.3s ease;
		color: var(--lemon-green);
	}

	.icon-button:hover {
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		box-shadow: 0 0 10px rgba(192, 255, 62, 0.6);
	}

	.login {
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.login:hover {
		background-color: #a0df1e;
		box-shadow: 0 0 10px rgba(192, 255, 62, 0.8);
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	}

	@media (max-width: 768px) {
		.menu-toggle {
			display: block;
		}

		.nav-links {
			display: none;
			flex-direction: column;
			align-items: center;
			background-color: var(--dark-card);
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			gap: 1rem;
			padding: 1rem;
			border-bottom: 2px solid var(--lemon-green);
		}

		.nav-links.open {
			display: flex;
		}

		.user-buttons {
			flex-direction: column;
		}
	}
</style>