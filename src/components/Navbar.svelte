<script>
	import { onMount, onDestroy } from 'svelte';
	import { logout, user } from '$lib/store';
	import { goto } from '$app/navigation';

	let isMenuOpen = false;
	let currentUser = null;
	let isBrowser = false;
	let unsubscribe;
	let isScrolled = false;

	// Run only in the browser
	onMount(() => {
		isBrowser = true;
		unsubscribe = user.subscribe((u) => {
			currentUser = u;
		});

		// Add scroll listener for navbar appearance change
		window.addEventListener('scroll', handleScroll);
	});

	// Clean up subscription when component is destroyed
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
		if (isBrowser) window.removeEventListener('scroll', handleScroll);
	});

	function handleScroll() {
		isScrolled = window.scrollY > 10;
	}

	function handleLogout() {
		if (isBrowser) logout(); // Logout only in the browser
	}
</script>

<nav class="navbar" class:scrolled={isScrolled}>
	<div class="navbar-container">
		<!-- Logo -->
		<div class="logo">
			<a href="/" aria-label="Navigate to Home">
				<div class="logo-text">Bingo</div>
			</a>
		</div>

		<!-- Mobile Menu Toggle Button -->
		<button class="menu-toggle" aria-label="Toggle Menu" on:click={() => (isMenuOpen = !isMenuOpen)}>
			<span class="menu-icon"></span>
		</button>

		<!-- Navigation Links -->
		<div class="nav-container" class:open={isMenuOpen}>
			<ul class="nav-links">
				<li><a href="/dashboard" class="nav-link">Dashboard</a></li>
				<li><a href="/joingame" class="nav-link">Join Game</a></li>
				<li><a href="/creategame" class="nav-link">Create Game</a></li>
			</ul>

			<!-- User Actions -->
			<div class="user-actions">
				{#if isBrowser && currentUser}
					<!-- User Info -->
					<div class="user-info">
						<div class="avatar">
							{#if currentUser.photoURL}
								<img src={currentUser.photoURL} alt="Profile" />
							{:else}
								<div class="avatar-letter">{(currentUser.displayName || currentUser.email || '?')[0].toUpperCase()}</div>
							{/if}
						</div>
						<div class="user-dropdown">
							<span class="username">{currentUser.displayName || currentUser.email}</span>
							<div class="dropdown-content">
								<button class="dropdown-item" on:click={handleLogout}>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
										<polyline points="16 17 21 12 16 7"></polyline>
										<line x1="21" y1="12" x2="9" y2="12"></line>
									</svg>
									Sign Out
								</button>
							</div>
						</div>
					</div>
				{:else}
					<!-- Login/Register Button -->
					<button class="login-button" on:click={() => goto('/')}>Sign In</button>
				{/if}
			</div>
		</div>
	</div>
</nav>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 100;
		padding: 0.75rem 0;
		background-color: rgba(18, 18, 18, 0.7);
		backdrop-filter: blur(10px);
		transition: all 0.3s ease;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.navbar.scrolled {
		background-color: rgba(18, 18, 18, 0.95);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.navbar-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.logo a {
		text-decoration: none;
		display: flex;
		align-items: center;
	}

	.logo-text {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--lemon-green);
		letter-spacing: -0.02em;
		position: relative;
		padding: 0.25rem 0;
		text-shadow: 0 0 10px rgba(192, 255, 62, 0.4);
	}

	.logo-text::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background-color: var(--lemon-green);
		transform: scaleX(0);
		transform-origin: right;
		transition: transform 0.3s ease;
	}

	.logo a:hover .logo-text::after {
		transform: scaleX(1);
		transform-origin: left;
	}

	.nav-container {
		display: flex;
		align-items: center;
		flex: 1;
		justify-content: space-between;
		margin-left: 2rem;
	}

	.nav-links {
		list-style: none;
		display: flex;
		gap: 1.5rem;
	}

	.nav-link {
		text-decoration: none;
		color: var(--text-color);
		font-size: 0.95rem;
		font-weight: 500;
		position: relative;
		padding: 0.5rem 0;
		transition: color 0.3s ease;
	}

	.nav-link::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background-color: var(--lemon-green);
		transform: scaleX(0);
		transform-origin: right;
		transition: transform 0.3s ease;
	}

	.nav-link:hover {
		color: var(--lemon-green);
		text-decoration: none;
	}

	.nav-link:hover::after {
		transform: scaleX(1);
		transform-origin: left;
	}

	.user-actions {
		display: flex;
		align-items: center;
	}

	.user-info {
		display: flex;
		align-items: center;
		position: relative;
	}

	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		margin-right: 0.75rem;
		background-color: var(--lemon-green);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--dark-bg);
		font-weight: 600;
		font-size: 0.85rem;
		overflow: hidden;
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-letter {
		font-weight: 700;
	}

	.user-dropdown {
		position: relative;
		cursor: pointer;
	}

	.username {
		font-size: 0.9rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 150px;
		transition: color 0.3s ease;
	}

	.user-dropdown:hover .username {
		color: var(--lemon-green);
	}

	.dropdown-content {
		display: none;
		position: absolute;
		right: 0;
		top: 125%;
		background-color: var(--dark-card);
		min-width: 160px;
		box-shadow: var(--shadow-lg);
		border-radius: var(--border-radius);
		overflow: hidden;
		z-index: 10;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.user-dropdown:hover .dropdown-content {
		display: block;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		text-align: left;
		padding: 0.75rem 1rem;
		background-color: transparent;
		color: var(--text-color);
		border-radius: 0;
		font-size: 0.9rem;
	}

	.dropdown-item:hover {
		background-color: rgba(255, 255, 255, 0.05);
		color: var(--lemon-green);
		box-shadow: none;
		transform: none;
	}

	.login-button {
		background-color: var(--lemon-green);
		color: var(--dark-bg);
		font-weight: 600;
		padding: 0.5rem 1rem;
		border-radius: var(--button-radius);
		font-size: 0.9rem;
	}

	.menu-toggle {
		display: none;
		background: transparent;
		border: none;
		width: 32px;
		height: 32px;
		padding: 0;
		position: relative;
	}

	.menu-icon,
	.menu-icon::before,
	.menu-icon::after {
		display: block;
		width: 24px;
		height: 2px;
		background-color: var(--lemon-green);
		position: absolute;
		transition: transform 0.3s ease;
	}

	.menu-icon {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.menu-icon::before,
	.menu-icon::after {
		content: '';
		left: 0;
	}

	.menu-icon::before {
		top: -6px;
	}

	.menu-icon::after {
		bottom: -6px;
	}

	@media (max-width: 768px) {
		.menu-toggle {
			display: block;
		}

		.nav-container {
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			background-color: var(--dark-card);
			padding: 1rem;
			flex-direction: column;
			align-items: stretch;
			clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
			transition: clip-path 0.3s ease;
		}

		.nav-container.open {
			clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
			box-shadow: var(--shadow-lg);
		}

		.nav-links {
			flex-direction: column;
			gap: 0.5rem;
			width: 100%;
			margin-bottom: 1rem;
		}

		.nav-link {
			display: block;
			padding: 0.75rem 0;
		}

		.user-actions {
			width: 100%;
			justify-content: center;
		}

		.user-info {
			width: 100%;
			justify-content: center;
		}
	}
</style>