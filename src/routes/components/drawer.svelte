<script>
	import Resources from './resources.svelte';
	import Courses from './courses.svelte';
	import Semesters from './semesters.svelte';
	import Study from './study.svelte';
	import Dashboard from './dashboard.svelte';
	import Exams from './exams.svelte';

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
	}

	function handleLogout() {
		console.log('Logout clicked');
	}
</script>

<main class="container-fluid g-0 m-0 p-0">
	<div class="row g-0 m-0 p-0">
		<div class="col-auto m-0 p-0">
			<div id="drawer-div" class="card m-0">
				<div class="logo-section"></div>

				<nav class="navigation">
					{#each tabs as tab}
						{@const Icon = tab.icon}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<button

							class="tab {activeTab === tab.id ? 'active' : ''}"
							onclick={() => handleTabClick(tab.id)}
						>
							<Icon class="icon" />&nbsp;&nbsp;
							<span class="tab-name">{tab.name}</span>
						</button>
					{/each}
				</nav>

				<div class="logout-section">
					<button class="logout-btn" onclick={handleLogout}>
						<LogOut class="logout-icon" />
						<span>Logout</span>
					</button>
				</div>
			</div>
		</div>

		<div class="col m-0 p-0">
			<div id="tabs" class="m-0 p-0">
				<div id="tab">
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

	#drawer-div {
		height: 100vh;
		width: 280px;
		background-color: var(--bg-card);
		border-right: 2px solid var(--primary);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 1.5rem 0;
		box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
	}

	#tabs {
		height: 100vh;
	}

	#tab {
		margin-left: 1.5rem;
	}

	.navigation {
		flex: 1;
		padding-right: 1.5rem;
	}

	.tab {
		display: flex;
		align-items: center;
		padding: 0.85rem 1.25rem;
		margin-bottom: 1.2rem;
		border-radius: 12px;
		cursor: pointer;
        background-color: qhite;
        border: none;
        width: 100%;
		transition: all 0.2s ease;
		color: var(--text);
	}

	.tab:hover {
		background-color: var(--purple);
	}

	.tab.active {
		background-color: var(--purple);
		color: white;
        border: none;
	}

	.tab-name {
		font-size: 1.5rem;
		font-weight: 500;
	}

	.logout-section {
		padding: 0 1rem;
		margin-top: 2rem;
	}

	.logout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 0.85rem;
		background-color: transparent;
		border: 1px solid var(--primary);
		border-radius: 12px;
		color: var(--primary);
		font-size: 1.1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.logout-btn:hover {
		background-color: var(--purple);
		color: white;
	}
</style>
