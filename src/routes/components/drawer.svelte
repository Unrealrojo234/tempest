<script>
	import Resources from './resources.svelte';
	import Courses from './courses.svelte';
	import Semesters from './semesters.svelte';
	import Study from './study.svelte';
	import Dashboard from './dashboard.svelte';
	import Exams from './exams.svelte';
	import pb from '$lib';
	import Toast from '$lib/toast';

	import {
		LayoutDashboard,
		BookOpen,
		Brain,
		FolderOpen,
		CalendarDays,
		Settings,
		LogOut
	} from '@lucide/svelte';

	let activeTab = $state(0);
	let drawerOpen = $state(true);
	let isMobile = $state(false);

	const tabs = $state([
		{
			name: 'Dashboard',
			icon: LayoutDashboard,
			id: 0
		},
		{
			name: 'Courses',
			icon: BookOpen,
			id: 1
		},
		{
			name: 'Study',
			icon: Brain,
			id: 2
		},
		{
			name: 'Resources',
			icon: FolderOpen,
			id: 3
		},
		{
			name: 'Exams',
			icon: CalendarDays,
			id: 4
		},
		{
			name: 'Semesters',
			icon: Settings,
			id: 5
		}
	]);

	function handleTabClick(tabId) {
		activeTab = tabId;
		// On mobile, close drawer after selecting a tab
		if (isMobile) {
			drawerOpen = false;
		}
	}

	function handleLogout() {
		pb.authStore.clear();

		Toast('success', 'Successfully Logged Out');
	}

	function toggleDrawer() {
		drawerOpen = !drawerOpen;
	}

	// Check if mobile on component mount and set up resize listener
	$effect(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 768;
			if (isMobile) {
				drawerOpen = false;
			} else {
				drawerOpen = true;
			}
		};

		// Initial check
		checkMobile();

		// Add event listener
		window.addEventListener('resize', checkMobile);

		// Cleanup
		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});
</script>

<main class="container-fluid g-0 m-0 p-0">
	<div class="row g-0 m-0 p-0">
		<!-- Mobile toggle button -->
		{#if isMobile}
			<button class="mobile-toggle-btn" onclick={toggleDrawer}>
				{#if drawerOpen}
					✕
				{:else}
					☰
				{/if}
			</button>
		{/if}

		<!-- Drawer with fixed positioning -->
		<div class="col-auto m-0 p-0">
			<div
				id="drawer-div"
				class="card m-0"
				class:drawer-open={drawerOpen}
				class:drawer-closed={!drawerOpen}
			>
				<div id="fixed">
					<div class="logo-section">
						<h2 class="app-title">StudyApp</h2>
					</div>

					<!-- Scrollable navigation area -->
					<nav class="navigation">
						{#each tabs as tab}
							{@const Icon = tab.icon}
							<button
								class="tab {activeTab === tab.id ? 'active' : ''}"
								onclick={() => handleTabClick(tab.id)}
							>
								<Icon class="icon" />&nbsp;&nbsp;
								<span class="tab-name">{tab.name}</span>
							</button>
						{/each}
					</nav>

					<!-- Fixed logout button at bottom -->
					<div class="logout-section">
						<button class="logout-btn" onclick={handleLogout}>
							<LogOut class="logout-icon" />
							<span>Logout</span>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Main content area -->
		<div
			class="col m-0"
			class:content-shifted={drawerOpen && !isMobile}
			class:content-full={!drawerOpen || isMobile}
		>
			<div id="tabs" class="m-0 p-0">
				<div id="tab" class="p-3">
					{#if activeTab === 0}
						<Dashboard />
					{:else if activeTab === 1}
						<Courses />
					{:else if activeTab === 2}
						<Study />
					{:else if activeTab === 3}
						<Resources />
					{:else if activeTab === 4}
						<Exams />
					{:else if activeTab === 5}
						<Semesters />
					{:else}
						<Dashboard />
					{/if}
				</div>
			</div>
		</div>

		<!-- Overlay for mobile when drawer is open -->
		{#if isMobile && drawerOpen}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore event_directive_deprecated -->
			<div class="drawer-overlay" onclick={() => (drawerOpen = false)}></div>
		{/if}
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow-x: hidden;
	}

	/* Remove all default spacing */
	:global(.container-fluid),
	:global(.row),
	:global(.col),
	:global(.col-auto) {
		margin: 0 !important;
		padding: 0 !important;
	}

	/* Drawer styles */
	#drawer-div {
		height: 100vh;
		width: 280px;
		background-color: var(--bg-card, #ffffff);
		border-right: 4px solid var(--purple, #6f42c1);
		border-radius: 0% !important;
		display: flex;
		flex-direction: column;
		padding: 1.5rem 0.3rem;
		box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
		position: fixed;
		left: 0;
		top: 0;
		z-index: 1000;
		transition: transform 0.3s ease;
	}

	/* Drawer states */
	#drawer-div.drawer-open {
		transform: translateX(0);
	}

	#drawer-div.drawer-closed {
		transform: translateX(-100%);
	}

	/* Logo section */
	.logo-section {
		padding: 1rem 1.5rem 2rem;
		border-bottom: 1px solid #eee;
		margin-bottom: 1rem;
	}

	.app-title {
		color: var(--purple, #6f42c1);
		font-weight: 700;
		font-size: 1.5rem;
		margin: 0;
		text-align: center;
	}

	/* Navigation area - scrollable */
	.navigation {
		flex: 1;
		padding-right: 1.5rem;
		overflow-y: auto;
		max-height: calc(100vh - 180px); /* Account for logo and logout sections */
	}

	.tab {
		display: flex;
		align-items: center;
		padding: 0.85rem 1.25rem;
		margin-bottom: 0.8rem;
		border-radius: 12px;
		cursor: pointer;
		background-color: white;
		border: none;
		font-size: 1.8rem;

		width: 100%;
		transition: all 0.2s ease;
		color: var(--text, #333333);
	}

	.tab:hover {
		background-color: var(--purple, #6f42c1);
		color: white;
	}

	.tab.active {
		background-color: var(--purple, #6f42c1);
		color: white;
		border: none;
	}

	.tab-name {
		font-size: 1.1rem;
		font-weight: 500;
	}

	/* Logout section - fixed at bottom */
	.logout-section {
		padding: 1rem;
		position: absolute;
		bottom: -0.6%;
		width: 98%;
		border-top: 1px solid #eee;
	}

	.logout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 0.85rem;
		background-color: transparent;
		border: 1px solid var(--primary, #6f42c1);
		border-radius: 12px;
		color: var(--primary, #6f42c1);
		font-size: 1.1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.logout-btn:hover {
		background-color: var(--purple, #6f42c1);
		color: white;
	}

	/* Content area adjustments */
	.content-shifted {
		margin-left: 280px !important;
		width: calc(100% - 280px) !important;
		transition:
			margin-left 0.3s ease,
			width 0.3s ease;
	}

	.content-full {
		margin-left: 0 !important;
		width: 100% !important;
		transition:
			margin-left 0.3s ease,
			width 0.3s ease;
	}

	#tabs {
		min-height: 100vh;
		padding: 1rem;
	}

	#tab {
		margin-left: 0;
	}

	/* Mobile styles */
	.mobile-toggle-btn {
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 1001;
		background-color: var(--purple, #6f42c1);
		color: white;
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.drawer-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		#drawer-div {
			width: 250px;
		}

		.tab-name {
			font-size: 1rem;
		}

		.content-shifted {
			margin-left: 0 !important;
			width: 100% !important;
		}
	}

	/* Scrollbar styling for navigation */
	.navigation::-webkit-scrollbar {
		width: 6px;
	}

	.navigation::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 10px;
	}

	.navigation::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 10px;
	}

	.navigation::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
</style>
