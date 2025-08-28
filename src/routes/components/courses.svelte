<script>

    import {Pencil, Trash2, X } from '@lucide/svelte' 

	let courses = $state([
		{
			id: 1,
			name: 'Web Development',
			description: 'Learn modern web development techniques',
			topics: [
				{ id: 1, name: 'HTML Basics', completed: true },
				{ id: 2, name: 'CSS Styling', completed: true },
				{ id: 3, name: 'JavaScript Fundamentals', completed: false },
				{ id: 4, name: 'Responsive Design', completed: false }
			]
		},
		{
			id: 2,
			name: 'Data Science',
			description: 'Introduction to data analysis and visualization',
			topics: [
				{ id: 1, name: 'Python for Data Science', completed: true },
				{ id: 2, name: 'Pandas Library', completed: false },
				{ id: 3, name: 'Data Visualization', completed: false }
			]
		},
		{
			id: 3,
			name: 'Mobile App Development',
			description: 'Build cross-platform mobile applications',
			topics: [
				{ id: 1, name: 'Introduction to React Native', completed: false },
				{ id: 2, name: 'UI Components', completed: false },
				{ id: 3, name: 'State Management', completed: false }
			]
		}
	]);

	let activeCourse = $state(courses[0]);
	let newCourseName = $state('');
	let newTopicName = $state('');
	let editingCourse = $state(null);
	let editingTopic = $state(null);

	// Calculate completion percentage for a course
	function calculateCompletion(course) {
		if (!course.topics.length) return 0;
		const completed = course.topics.filter((t) => t.completed).length;
		return Math.round((completed / course.topics.length) * 100);
	}

	// Add a new course
	function addCourse() {
		if (!newCourseName.trim()) return;

		const newCourse = {
			id: Math.max(...courses.map((c) => c.id), 0) + 1,
			name: newCourseName,
			description: '',
			topics: []
		};

		courses = [...courses, newCourse];
		activeCourse = newCourse;
		newCourseName = '';
	}

	// Delete a course
	function deleteCourse(course) {
		courses = courses.filter((c) => c.id !== course.id);
		if (activeCourse.id === course.id) {
			activeCourse = courses[0] || null;
		}
	}

	// Update a course
	function updateCourse() {
		if (!editingCourse.name.trim()) return;

		courses = courses.map((c) => (c.id === editingCourse.id ? { ...editingCourse } : c));

		activeCourse = { ...editingCourse };
		editingCourse = null;
	}

	// Add a new topic to the active course
	function addTopic() {
		if (!newTopicName.trim()) return;

		const newTopic = {
			id: Math.max(...activeCourse.topics.map((t) => t.id), 0) + 1,
			name: newTopicName,
			completed: false
		};

		courses = courses.map((c) =>
			c.id === activeCourse.id ? { ...c, topics: [...c.topics, newTopic] } : c
		);

		activeCourse = { ...activeCourse, topics: [...activeCourse.topics, newTopic] };
		newTopicName = '';
	}

	// Toggle topic completion status
	function toggleTopic(topic) {
		courses = courses.map((c) =>
			c.id === activeCourse.id
				? {
						...c,
						topics: c.topics.map((t) => (t.id === topic.id ? { ...t, completed: !t.completed } : t))
					}
				: c
		);

		activeCourse = {
			...activeCourse,
			topics: activeCourse.topics.map((t) =>
				t.id === topic.id ? { ...t, completed: !t.completed } : t
			)
		};
	}

	// Delete a topic
	function deleteTopic(topic) {
		courses = courses.map((c) =>
			c.id === activeCourse.id ? { ...c, topics: c.topics.filter((t) => t.id !== topic.id) } : c
		);

		activeCourse = {
			...activeCourse,
			topics: activeCourse.topics.filter((t) => t.id !== topic.id)
		};
	}

	// Start editing a topic
	function startEditTopic(topic) {
		editingTopic = { ...topic };
	}

	// Update a topic
	function updateTopic() {
		if (!editingTopic.name.trim()) return;

		courses = courses.map((c) =>
			c.id === activeCourse.id
				? {
						...c,
						topics: c.topics.map((t) => (t.id === editingTopic.id ? { ...editingTopic } : t))
					}
				: c
		);

		activeCourse = {
			...activeCourse,
			topics: activeCourse.topics.map((t) => (t.id === editingTopic.id ? { ...editingTopic } : t))
		};

		editingTopic = null;
	}
</script>

<div class="container mt-4">
  <div class="d-flex justify-content-between align-items-center">
    <h1 class="mb-0">Course Manager</h1>
    <button
        class="btn text-light"
        style="background-color: var(--green);"
        id="add-btn"
        onclick={() => (editingCourse = { id: null, name: '', description: '', topics: [] })}
    >
        + Add Course
    </button>
</div>
	<!-- Course Tabs -->
	<ul class="nav nav-tabs mb-4">
		{#each courses as course}
			<li class="nav-item">
				<button
					class="nav-link tab-button {activeCourse.id === course.id ? 'active' : ''}"
					onclick={() => (activeCourse = course)}
				>
					{course.name}
				</button>
			</li>
		{/each}
		<li class="nav-item"></li>
	</ul>

	<!-- Course Form Modal -->
	{#if editingCourse}
		<div class="modal show d-block" tabindex="-1">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">{editingCourse.id ? 'Edit Course' : 'Add New Course'}</h5>
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button type="button" class="btn" onclick={() => (editingCourse = null)}><X/></button>
					</div>
					<div class="modal-body">
						<div class="mb-3">
							<label for="courseName" class="form-label">Course Name</label>
							<input
								type="text"
								class="form-control"
								id="courseName"
								bind:value={editingCourse.name}
							/>
						</div>
						<div class="mb-3">
							<label for="courseDescription" class="form-label">Description</label>
							<textarea
								class="form-control"
								id="courseDescription"
								bind:value={editingCourse.description}
								rows="3"
							></textarea>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" onclick={() => (editingCourse = null)}
							>Cancel</button
						>
						<button type="button" class="btn " style="background-color: var(--green); color:white;" onclick={updateCourse}>
							{editingCourse.id ? 'Update' : 'Create'} Course
						</button>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-backdrop show"></div>
	{/if}

	<!-- Topic Form Modal -->
	{#if editingTopic}
		<div class="modal show d-block" tabindex="-1">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Edit Topic</h5>
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button type="button" class="btn"  onclick={() => (editingTopic = null)}><X/></button>
					</div>
					<div class="modal-body">
						<div class="mb-3">
							<label for="topicName" class="form-label">Topic Name</label>
							<input
								type="text"
								class="form-control"
								id="topicName"
								bind:value={editingTopic.name}
							/>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" onclick={() => (editingTopic = null)}
							>Cancel</button
						>
						<button type="button" class="btn " style="background-color: var(--green);color:white;" onclick={updateTopic}>Update Topic</button
						>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-backdrop show"></div>
	{/if}

	<!-- Course Card -->
	{#if activeCourse}
		<div class="card">
			<div class="card-header d-flex justify-content-between align-items-center">
				<h5 class="mb-0">{activeCourse.name}</h5>
				<div>
					<button
						class="btn "
						onclick={() => (editingCourse = { ...activeCourse })}
					>
						<Pencil/>
					</button>
					<button class="btn " onclick={() => deleteCourse(activeCourse)}>
						<Trash2/>
					</button>
				</div>
			</div>
			<div class="card-body">
				<p>{activeCourse.description || 'No description provided.'}</p>

				<!-- Progress Bar -->
				<div class="mb-4">
					<div class="d-flex justify-content-between mb-1">
						<span>Course Progress</span>
						<span>{calculateCompletion(activeCourse)}%</span>
					</div>
					<div class="progress">
						<div
							class="progress-bar"
							role="progressbar"
							style={`width: ${calculateCompletion(activeCourse)}%`}
							aria-valuenow={calculateCompletion(activeCourse)}
							aria-valuemin="0"
							aria-valuemax="100"
						></div>
					</div>
				</div>

				<!-- Topics List -->
				<h6>Topics</h6>
				<ul class="list-group mb-3">
					{#each activeCourse.topics as topic}
						<li class="list-group-item d-flex justify-content-between align-items-center">
							<div>
								<input
									type="checkbox"
                                    style="width: 24px;height:24px"
									checked={topic.completed}
									onchange={() => toggleTopic(topic)}
								/>
								<span class={topic.completed ? 'text-decoration-line-through' : ''}>
									{topic.name}
								</span>
							</div>
							<div>
								<button
									class=""
                                    style="background: none;border:none;"
									onclick={() => startEditTopic(topic)}
								>
                                <Pencil />
								</button>


								<button class="btn " onclick={() => deleteTopic(topic)}>
									<Trash2/>
								</button>
							</div>
						</li>
					{/each}
				</ul>

				<!-- Add Topic Form -->
				<div class="input-group">
					<input
						type="text"
						class="form-control"
						placeholder="New topic name"
						bind:value={newTopicName}
					/>
					<button
						class="btn"
						style="background-color: var(--green);"
						type="button"
						onclick={addTopic}>+ Add Topic</button
					>
				</div>
			</div>
		</div>
	{:else}
		<div class="alert alert-info">No courses available. Add a new course to get started.</div>
	{/if}
</div>

<style>
	.nav-link {
		cursor: pointer;
	}
	.progress-bar {
		transition: width 0.3s ease;
        background-color: var(--purple);
	}
	.modal-backdrop {
		opacity: 0.5;
	}

	button {
		border-radius: 16px;
	}


	.tab-button {
		background-color: whitesmoke;
		border-radius: 18px;
		margin: 12px;
		margin-bottom: 16px;
	}

    input{
        accent-color: var(--purple);
    }
</style>
