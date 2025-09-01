<script>
	import { onMount } from 'svelte';

    import { PlusCircle, Trash2, Pencil } from '@lucide/svelte';

	// Mock data - in a real app, this would come from PocketBase
	let exams = [
		{
			id: '1',
			courses: 'Mathematics',
			name: 'Midterm Exam',
			date: '2023-10-15T10:00:00',
			is_completed: false,
			location: 'Room 101',
			priority: 'high',
			type: 'exam'
		},
		{
			id: '2',
			courses: 'Physics',
			name: 'Quantum Mechanics Quiz',
			date: '2023-10-18T14:30:00',
			is_completed: false,
			location: 'Room 204',
			priority: 'medium',
			type: 'quiz'
		},
		{
			id: '3',
			courses: 'Computer Science',
			name: 'Final Project Submission',
			date: '2023-10-20T23:59:00',
			is_completed: false,
			location: 'Online',
			priority: 'high',
			type: 'assignment'
		},
		{
			id: '4',
			courses: 'History',
			name: 'Research Paper',
			date: '2023-10-25T17:00:00',
			is_completed: true,
			location: 'Library',
			priority: 'low',
			type: 'assignment'
		},
		{
			id: '5',
			courses: 'Literature',
			name: 'Poetry Analysis',
			date: '2023-10-12T09:00:00',
			is_completed: true,
			location: 'Room 305',
			priority: 'medium',
			type: 'assignment'
		}
	];

	// Form state
	let newExam = {
		courses: '',
		name: '',
		date: '',
		is_completed: false,
		location: '',
		priority: 'medium',
		type: 'exam'
	};

	// UI state
	let editingId = null;
	let showForm = false;
	let filterCompleted = 'all';
	let filterPriority = 'all';
	let filterType = 'all';
	let sortBy = 'date';
	let sortOrder = 'asc';

	// Computed values
	$: filteredExams = exams.filter((exam) => {
		const matchesCompleted =
			filterCompleted === 'all' ||
			(filterCompleted === 'completed' && exam.is_completed) ||
			(filterCompleted === 'pending' && !exam.is_completed);
		const matchesPriority = filterPriority === 'all' || exam.priority === filterPriority;
		const matchesType = filterType === 'all' || exam.type === filterType;
		return matchesCompleted && matchesPriority && matchesType;
	});

	$: sortedExams = [...filteredExams].sort((a, b) => {
		let modifier = sortOrder === 'asc' ? 1 : -1;

		if (sortBy === 'date') {
			return (new Date(a.date) - new Date(b.date)) * modifier;
		} else if (sortBy === 'priority') {
			const priorityOrder = { high: 3, medium: 2, low: 1 };
			return (priorityOrder[a.priority] - priorityOrder[b.priority]) * modifier;
		} else if (sortBy === 'name') {
			return a.name.localeCompare(b.name) * modifier;
		}
		return 0;
	});

	$: upcomingExams = exams.filter((exam) => !exam.is_completed && new Date(exam.date) > new Date());
	$: completedExams = exams.filter((exam) => exam.is_completed);
	$: highPriorityExams = exams.filter((exam) => exam.priority === 'high' && !exam.is_completed);

	// CRUD operations
	function createExam() {
		const newId = Math.max(...exams.map((e) => parseInt(e.id))) + 1;
		exams = [...exams, { ...newExam, id: newId.toString() }];
		resetForm();
	}

	function updateExam() {
		exams = exams.map((e) => (e.id === editingId ? { ...newExam, id: editingId } : e));
		resetForm();
	}

	function deleteExam(id) {
		exams = exams.filter((e) => e.id !== id);
	}

	function editExam(exam) {
		newExam = { ...exam };
		// Convert date to HTML datetime-local format
		newExam.date = exam.date.slice(0, 16);
		editingId = exam.id;
		showForm = true;
	}

	function toggleComplete(id) {
		exams = exams.map((e) => (e.id === id ? { ...e, is_completed: !e.is_completed } : e));
	}

	function resetForm() {
		newExam = {
			courses: '',
			name: '',
			date: '',
			is_completed: false,
			location: '',
			priority: 'medium',
			type: 'exam'
		};
		editingId = null;
		showForm = false;
	}

	function handleSubmit() {
		if (editingId) {
			updateExam();
		} else {
			createExam();
		}
	}

	// Priority styling
	const priorityStyles = {
		high: 'bg-danger text-white',
		medium: 'bg-warning text-dark',
		low: 'bg-info text-dark'
	};

	// Type icons
	const typeIcons = {
		exam: '📝',
		quiz: '✏️',
		assignment: '📄'
	};

	// Format date for display
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleString();
	}

	// Check if exam is upcoming (within next 3 days)
	function isUpcoming(dateString) {
		const examDate = new Date(dateString);
		const today = new Date();
		const threeDaysFromNow = new Date();
		threeDaysFromNow.setDate(today.getDate() + 3);
		return examDate > today && examDate <= threeDaysFromNow;
	}

	// Check if exam is overdue
	function isOverdue(dateString) {
		const examDate = new Date(dateString);
		const today = new Date();
		return examDate < today;
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="page-title">Exam Scheduler</h1>
	<p class="sub-title">Track your exam schedule and preparation progress</p>

	<!-- Stats Cards -->
	<div class="row mb-4">
		<div class="col-md-4 mb-3">
			<div class="card bg-teal-20 border-teal holographic-card-green">
				<div class="card-body text-center">
					<h5 class="card-title text-teal-800">Upcoming </h5>
					<p class="card-text display-5 text-teal-800">{upcomingExams.length}</p>
				</div>
			</div>
		</div>
		<div class="col-md-4 mb-3">
			<div class="card bg-purple-20 border-purple holographic-card">
				<div class="card-body text-center">
					<h5 class="card-title text-purple-800">Completed</h5>
					<p class="card-text display-5 text-purple-800">{completedExams.length}</p>
				</div>
			</div>
		</div>
		<div class="col-md-4 mb-3">
			<div class="card bg-orange-20 border-orange holographic-card-orange">
				<div class="card-body text-center">
					<h5 class="card-title text-orange-800">High Priority</h5>
					<p class="card-text display-5 text-orange-800">{highPriorityExams.length}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Filters and Sorting -->
	<div class="card mb-4 ">
		<div class="card-header text-light" style="background-color: var(--purple)">
			<h5 class="mb-0">Filter & Sort</h5>
		</div>
		<div class="card-body">
			<div class="row">
				<div class="col-md-3 mb-2">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">Completion</label>
					<select class="form-select" bind:value={filterCompleted}>
						<option value="all">All</option>
						<option value="completed">Completed</option>
						<option value="pending">Pending</option>
					</select>
				</div>
				<div class="col-md-3 mb-2">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">Priority</label>
					<select class="form-select" bind:value={filterPriority}>
						<option value="all">All</option>
						<option value="high">High</option>
						<option value="medium">Medium</option>
						<option value="low">Low</option>
					</select>
				</div>
				<div class="col-md-3 mb-2">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">Type</label>
					<select class="form-select" bind:value={filterType}>
						<option value="all">All</option>
						<option value="exam">Exam</option>
						<option value="quiz">Quiz</option>
						<option value="assignment">Assignment</option>
					</select>
				</div>
				<div class="col-md-3 mb-2">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="form-label">Sort By</label>
					<div class="input-group">
						<select class="form-select" bind:value={sortBy}>
							<option value="date">Date</option>
							<option value="priority">Priority</option>
							<option value="name">Name</option>
						</select>
						<button
							class="btn btn-outline-secondary"
							on:click={() => (sortOrder = sortOrder === 'asc' ? 'desc' : 'asc')}
						>
							{sortOrder === 'asc' ? '↑' : '↓'}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Add Exam Button -->
	<div class="mb-4">
		<button


        style="background-color: var(--green);color:aliceblue;"
			class="btn d-flex align-items-center"
			on:click={() => {
				resetForm();
				showForm = true;
			}}
		>
			<span class="me-2"><PlusCircle/></span> &nbsp;Schedule New Exam
		</button>
	</div>

	<!-- Exam Form (Conditional) -->
	{#if showForm}
		<div class="card mb-4 border-teal">
			<div class="card-header bg-teal-100 text-teal-800">
				<h5 class="mb-0">{editingId ? 'Edit Exam' : 'Schedule New Exam'}</h5>
			</div>
			<div class="card-body">
				<form on:submit|preventDefault={handleSubmit}>
					<div class="row">
						<div class="col-md-6 mb-3">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="form-label">Course</label>
							<input type="text" class="form-control" bind:value={newExam.courses} required />
						</div>
						<div class="col-md-6 mb-3">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="form-label">Exam Name</label>
							<input type="text" class="form-control" bind:value={newExam.name} required />
						</div>
					</div>

					<div class="row">
						<div class="col-md-4 mb-3">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="form-label">Date & Time</label>
							<input
								type="datetime-local"
								class="form-control"
								bind:value={newExam.date}
								required
							/>
						</div>
						<div class="col-md-4 mb-3">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="form-label">Priority</label>
							<select class="form-select" bind:value={newExam.priority}>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
						</div>
						<div class="col-md-4 mb-3">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="form-label">Type</label>
							<select class="form-select" bind:value={newExam.type}>
								<option value="exam">Exam</option>
								<option value="quiz">Quiz</option>
								<option value="assignment">Assignment</option>
							</select>
						</div>
					</div>

					<div class="row">
						<div class="col-md-8 mb-3">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label class="form-label">Location</label>
							<input type="text" class="form-control" bind:value={newExam.location} required />
						</div>
						<div class="col-md-4 mb-3">
							<div class="form-check mt-4 pt-2">
								<input
									class="form-check-input"
									type="checkbox"
									bind:checked={newExam.is_completed}
									id="completedCheck"
								/>
								<label class="form-check-label" for="completedCheck"> Completed </label>
							</div>
						</div>
					</div>

					<div class="d-flex gap-2">
						<button type="submit" class="btn btn-teal">
							{editingId ? 'Update' : 'Create'} Exam
						</button>
						<button type="button" class="btn btn-outline-secondary" on:click={resetForm}>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Exams List -->
	<div class="row row-cols-1 g-4 mb-4">
		{#each sortedExams as exam (exam.id)}
			<div class="col" style="margin-bottom: 16px !important;">
				<div class="card h-100 shadow-sm">
					<div class="card-header d-flex justify-content-between align-items-center" style="background-color: var(--purple);">
						<div>
							<span class="badge {priorityStyles[exam.priority]} me-2"
								>{exam.priority.toUpperCase()}</span
							>
							<span class="badge bg-light text-dark">{exam.type.toUpperCase()}</span>
						</div>
						<div class="btn-group btn-group-sm">
							<button class="btn btn-outline-teal" on:click={() => editExam(exam)}> <Pencil color="white"/></button>
							<button class="btn " on:click={() => deleteExam(exam.id)}>
								<Trash2 color="white"/>
							</button>
						</div>
					</div>
					<div class="card-body">
						<div class="d-flex justify-content-between">
							<h5 class="card-title text-purple-800">{exam.name}</h5>
							<span class="text-muted">{typeIcons[exam.type]}</span>
						</div>
						<h6 class="card-subtitle mb-2 text-muted">{exam.courses}</h6>

						<div class="row mt-3">
							<div class="col-md-6">
								<p class="card-text">
									<strong>Date:</strong>
									{#if isUpcoming(exam.date) && !exam.is_completed}
										<span class="badge bg-warning text-dark ms-2">UPCOMING</span>
									{/if}
									{#if isOverdue(exam.date) && !exam.is_completed}
										<span class="badge bg-danger text-white ms-2">OVERDUE</span>
									{/if}
									<br />
									<span class="ms-2">{formatDate(exam.date)}</span>
								</p>
								<p class="card-text">
									<strong>Location:</strong>
									<br />
									<span class="ms-2">{exam.location}</span>
								</p>
							</div>
							<div class="col-md-6">
								<div class="form-check form-switch">
									<input
										class=""
										type="checkbox"
                                        style="accent-color:var(--purple) !important;"
										id="completeSwitch{exam.id}"
										checked={exam.is_completed}
										on:change={() => toggleComplete(exam.id)}
									/>
									<label class="form-check-label" for="completeSwitch{exam.id}">
										{exam.is_completed ? 'Completed' : 'Mark as completed'}
									</label>
								</div>

								{#if exam.is_completed}
									<div class="alert alert-success mt-3" role="alert">
										<i class="fas fa-check-circle me-2"></i> This exam has been completed
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="col-12">
				<div class="alert alert-info">No exams found. Schedule your first exam!</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.btn-purple {
		background-color: #6f42c1;
		color: white;
		border-color: #6f42c1;
	}
	.btn-purple:hover {
		background-color: #5a32a3;
		border-color: #5a32a3;
		color: white;
	}
	.bg-teal-20 {
		background-color: rgba(32, 201, 151, 0.2);
	}
	.border-teal {
		border-color: #20c997 !important;
	}
	.text-teal-800 {
		color: #0a5442;
	}
	.bg-purple-20 {
		background-color: rgba(111, 66, 193, 0.2);
	}
	.border-purple {
		border-color: #6f42c1 !important;
	}
	.text-purple-800 {
		color: #3d2364;
	}
	.bg-orange-20 {
		background-color: rgba(253, 126, 20, 0.2);
	}
	.border-orange {
		border-color: #fd7e14 !important;
	}
	.text-orange-800 {
		color: #984c0c;
	}

	.holographic-card-green,
	.holographic-card-orange {
		display: flex;
		position: relative;
		overflow: hidden;
		border-radius: 15px;
		transition: all 0.5s ease;
	}

	.holographic-card-green::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(0deg, transparent, transparent 30%, green);
		transform: rotate(-45deg);
		transition: all 0.5s ease;
		opacity: 0;
	}

	.holographic-card-green:hover {
		transform: scale(1.05);
		box-shadow: 0 0 20px green;
		z-index: 100;
		transition: 500ms;
	}

	.holographic-card-green:hover::before {
		opacity: 1;
		transform: rotate(-45deg) translateY(100%);
	}

	.holographic-card-orange::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(0deg, transparent, transparent 30%, orange);
		transform: rotate(-45deg);
		transition: all 0.5s ease;
		opacity: 0;
	}

	.holographic-card-orange:hover {
		transform: scale(1.05);
		box-shadow: 0 0 20px orange;
		z-index: 100;
		transition: 500ms;
	}

	.holographic-card-orange:hover::before {
		opacity: 1;
		transform: rotate(-45deg) translateY(100%);
	}
</style>
