<script>
	import { Pencil, Trash2, X, Plus, ChevronUp, ChevronDown, GripVertical } from '@lucide/svelte';
	import { fade, scale } from 'svelte/transition';
	import Toast from '$lib/toast';
	import { flip } from 'svelte/animate';

	let courses = $state([]);
	let activeCourse = $state(null);
	let newCourseName = $state('');
	let newTopicName = $state('');
	let editingCourse = $state(null);
	let editingTopic = $state(null);
	let draggedTopic = $state(null);
	let isLoading = $state(false);
	let showMobileSidebar = $state(false);
	let semesters = $state([]);
	let activeSemester = $state(null);

	// Fetch all semesters from API
	async function fetchSemesters() {
		try {
			const response = await fetch('/api/semesters');
			if (!response.ok) {
				Toast('error', 'Failed to fetch semesters.');
			}
			const data = await response.json();
			semesters = data.items || data;

			// Set active semester to the first active one or first available
			const active = semesters.find((s) => s.is_active) || semesters[0];
			if (active) {
				activeSemester = active;
			}else{
                Toast('info','Create Semesters First')
            }


		} catch (error) {
			Toast('error', 'Error fetching semesters.');
		}
	}

	// Fetch all courses from API
	async function fetchCourses() {
		try {
			isLoading = true;
			let url = '/api/courses';
			if (activeSemester) {
				url += `?filter=semester='${activeSemester.id}'`;
			}

			const response = await fetch(url);
			if (!response.ok) throw new Error('Failed to fetch courses');

			const data = await response.json();
			courses = data.items || data;

			// Fetch topics for each course
			for (const course of courses) {
				await fetchTopicsForCourse(course.id);
			}

			// Set active course if not set
			if (courses.length > 0 && !activeCourse) {
				activeCourse = courses[0];
			}
		} catch (error) {
			console.error('Error fetching courses:', error);
			alert('Failed to load courses');
		} finally {
			isLoading = false;
		}
	}

	// Fetch topics for a specific course
	async function fetchTopicsForCourse(courseId) {
		try {
			const response = await fetch(`/api/topics?course=${courseId}`);
			if (!response.ok) throw new Error('Failed to fetch topics');

			const data = await response.json();
			const topics = data.items || data;

			// Update the course with its topics
			courses = courses.map((course) => (course.id === courseId ? { ...course, topics } : course));

			if (activeCourse && activeCourse.id === courseId) {
				activeCourse = { ...activeCourse, topics };
			}
		} catch (error) {
			console.error('Error fetching topics:', error);
		}
	}

	// Calculate completion percentage for a course
	function calculateCompletion(course) {
		if (!course.topics || !course.topics.length) return 0;
		const completed = course.topics.filter((t) => t.completed).length;
		return Math.round((completed / course.topics.length) * 100);
	}

	// Add a new course
	async function addCourse() {
		if (!editingCourse.name.trim()) return;

		try {
			isLoading = true;
			const response = await fetch('/api/courses', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: editingCourse.name,
					description: editingCourse.description || '',
					code: editingCourse.name.toLowerCase().replace(/\s+/g, '-'),
					semester: activeSemester.id
				})
			});

			if (!response.ok) {
				Toast('error', 'Failed to create course');
			}

			const newCourse = await response.json();
			courses = [...courses, { ...newCourse, topics: [] }];
			activeCourse = newCourse;
			editingCourse = null;

			// Refresh the course list
			await fetchCourses();
		} catch (error) {
			Toast('error', 'Failed to create  course');
		} finally {
			isLoading = false;
		}
	}

	// Delete a course
	async function deleteCourse(course) {
		Swal.fire({
			text: `Are you sure you want to delete "${course.name}"? This action cannot be undone!`,
			showDenyButton: true,
			showConfirmButton: false,
			showCancelButton: true,
			denyButtonText: `Delete`
		}).then(async (result) => {
			if (result.isDenied) {
				try {
					isLoading = true;
					const response = await fetch('/api/courses', {
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ id: course.id })
					});

					if (!response.ok) {
						Toast('error', 'Failed to delete course');
					}

					Toast('success', 'Course Deleted Successfully');

					courses = courses.filter((c) => c.id !== course.id);
					if (activeCourse?.id === course.id) {
						activeCourse = courses[0] || null;
					}
				} catch (err) {
					error = err.message;
					Toast('error', `Error deleting ${course.name}`);
				} finally {
					isLoading = false;
				}
			}
		});
	}

	// Update a course
	async function updateCourse() {
		if (!editingCourse.name.trim()) return;

		try {
			isLoading = true;
			const response = await fetch('/api/courses', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: editingCourse.id,
					name: editingCourse.name,
					description: editingCourse.description,
					code: editingCourse.code || editingCourse.name.toLowerCase().replace(/\s+/g, '-')
				})
			});

			if (!response.ok) throw new Error('Failed to update course');

			const updatedCourse = await response.json();
			courses = courses.map((c) =>
				c.id === updatedCourse.id ? { ...updatedCourse, topics: c.topics } : c
			);

			if (activeCourse?.id === updatedCourse.id) {
				activeCourse = { ...updatedCourse, topics: activeCourse.topics };
			}

			editingCourse = null;
		} catch (error) {
			console.error('Error updating course:', error);
			alert('Failed to update course');
		} finally {
			isLoading = false;
		}
	}

	// Add a new topic to the active course
	async function addTopic() {
		if (!newTopicName.trim() || !activeCourse) return;

		try {
			// Get the next order value
			const nextOrder =
				activeCourse.topics?.length > 0
					? Math.max(...activeCourse.topics.map((t) => t.order || 0)) + 1
					: 1;

			const response = await fetch('/api/topics', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: newTopicName,
					course: activeCourse.id,
					order: nextOrder,
					completed: false
				})
			});

			if (!response.ok) throw new Error('Failed to create topic');

			const newTopic = await response.json();

			// Update local state
			courses = courses.map((c) =>
				c.id === activeCourse.id
					? {
							...c,
							topics: [...(c.topics || []), newTopic]
						}
					: c
			);

			activeCourse = {
				...activeCourse,
				topics: [...(activeCourse.topics || []), newTopic]
			};

			newTopicName = '';
		} catch (error) {
			console.error('Error creating topic:', error);
			alert('Failed to create topic');
		}
	}

	// Toggle topic completion status
	async function toggleTopic(topic) {
		if (!activeCourse) return;

		try {
			const response = await fetch('/api/topics', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: topic.id,
					completed: !topic.completed
				})
			});

			if (!response.ok) throw new Error('Failed to update topic');

			const updatedTopic = await response.json();

			// Update local state
			courses = courses.map((c) =>
				c.id === activeCourse.id
					? {
							...c,
							topics: c.topics.map((t) => (t.id === updatedTopic.id ? { ...updatedTopic } : t))
						}
					: c
			);

			activeCourse = {
				...activeCourse,
				topics: activeCourse.topics.map((t) => (t.id === updatedTopic.id ? { ...updatedTopic } : t))
			};
		} catch (error) {
			console.error('Error updating topic:', error);
			alert('Failed to update topic');
		}
	}

	// Delete a topic
	async function deleteTopic(topic) {
		Swal.fire({
			text: `Are you sure you want to delete this topic? This action cannot be undone!`,
			showDenyButton: true,
			showConfirmButton: false,
			showCancelButton: true,
			denyButtonText: `Delete`
		}).then(async (result) => {
			if (result.isDenied) {
				try {
					const response = await fetch('/api/topics', {
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ id: topic.id })
					});

					if (!response.ok) {
						Toast('error', 'Failed to delete topic.');
					}

					Toast('success', 'Topic deleted successfully');

					// Update local state
					courses = courses.map((c) =>
						c.id === activeCourse.id
							? {
									...c,
									topics: c.topics.filter((t) => t.id !== topic.id)
								}
							: c
					);

					activeCourse = {
						...activeCourse,
						topics: activeCourse.topics.filter((t) => t.id !== topic.id)
					};
				} catch (err) {
					error = err.message;
					Toast('error', `Error deleting ${topic.name}`);
				} finally {
					isLoading = false;
				}
			}
		});
	}

	// Start editing a topic
	function startEditTopic(topic) {
		editingTopic = { ...topic };
	}

	// Update a topic
	async function updateTopic() {
		if (!editingTopic?.title.trim()) return;

		try {
			const response = await fetch('/api/topics', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: editingTopic.id,
					title: editingTopic.title,
					completed: editingTopic.completed
				})
			});

			if (!response.ok) throw new Error('Failed to update topic');

			const updatedTopic = await response.json();

			// Update local state
			courses = courses.map((c) =>
				c.id === activeCourse.id
					? {
							...c,
							topics: c.topics.map((t) => (t.id === updatedTopic.id ? { ...updatedTopic } : t))
						}
					: c
			);

			activeCourse = {
				...activeCourse,
				topics: activeCourse.topics.map((t) => (t.id === updatedTopic.id ? { ...updatedTopic } : t))
			};

			editingTopic = null;
		} catch (error) {
			console.error('Error updating topic:', error);
			alert('Failed to update topic');
		}
	}

	// Drag and drop handlers
	function handleDragStart(topic) {
		draggedTopic = topic;
	}

	function handleDragOver(event) {
		event.preventDefault();
	}

	async function handleDrop(index) {
		if (!draggedTopic || !activeCourse) return;

		try {
			// Reorder topics locally first for better UX
			const topics = activeCourse.topics.filter((t) => t.id !== draggedTopic.id);
			topics.splice(index, 0, draggedTopic);

			// Update order values
			const updates = topics.map((topic, idx) => ({
				id: topic.id,
				order: idx + 1
			}));

			console.log(updates);

			const response = await fetch('/api/topics', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ updates })
			});

			if (!response.ok) throw new Error('Failed to update topic order');

			// Update local state with new order
			const updatedTopics = topics.map((topic, idx) => ({
				...topic,
				order: idx + 1
			}));

			courses = courses.map((c) =>
				c.id === activeCourse.id ? { ...c, topics: updatedTopics } : c
			);

			activeCourse = { ...activeCourse, topics: updatedTopics };
		} catch (error) {
			console.error('Error updating topic order:', error);
			alert('Failed to update topic order');
		}

		draggedTopic = null;
	}

	// Toggle mobile sidebar
	function toggleMobileSidebar() {
		showMobileSidebar = !showMobileSidebar;
	}

	// Initialize data on component mount
	async function initialize() {
		await fetchSemesters();
		await fetchCourses();
	}

	initialize();
</script>

<div class="container mt-4">
	<!-- Header -->
	<div class="d-flex justify-content-between align-items-center mb-4">
		<div class="d-flex align-items-center">
			<button
				class="btn me-2 d-md-none"
				style="background-color: var(--purple); color: white;"
				onclick={toggleMobileSidebar}
				aria-label="Toggle course list"
			>
				{#if showMobileSidebar}
					<ChevronUp size={20} />
				{:else}
					<ChevronDown size={20} />
				{/if}
			</button>
			<h1 class="mb-0 page-title">Course Manager</h1>
		</div>
		<button
			class="btn text-light"
			style="background-color: var(--green);"
			onclick={() => {
				editingCourse = { id: null, name: '', description: '', topics: [] };
				newCourseName = '';
			}}
			aria-label="Add new course"
		>
			<Plus size={18} class="me-1" /> Add Course
		</button>
	</div>

	<div class="row">
		<!-- Course Tabs - Desktop -->
		<div class="col-md-3 d-none d-md-block">
			<div class="card">
				<div class="card-header">
					<h5 class="mb-0">My Courses</h5>
				</div>
				<div class="card-body p-0">
					{#if courses.length > 0}
						<div class="list-group list-group-flush">
							{#each courses as course (course.id)}
								<button
									type="button"
									class="list-group-item list-group-item-action d-flex justify-content-between align-items-center {activeCourse?.id ===
									course.id
										? 'active'
										: ''}"
									onclick={() => {
										activeCourse = course;
									}}
									aria-current={activeCourse?.id === course.id}
								>
									<span class="text-truncate">{course.name}</span>
									<span
										class="badge rounded-pill"
										style="background-color: {activeCourse?.id === course.id
											? 'white'
											: 'var(--purple)'}; color: {activeCourse?.id === course.id
											? 'var(--purple)'
											: 'white'}"
									>
										{calculateCompletion(course)}%
									</span>
								</button>
							{/each}
						</div>
					{:else}
						<div class="text-center p-4">
							<p class="text-muted">No courses yet</p>
							<button
								class="btn btn-sm"
								style="background-color: var(--green); color: white;"
								onclick={() =>
									(editingCourse = { id: null, name: '', description: '', topics: [] })}
							>
								Create your first course
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Course Content -->
		<div class="col-md-9">
			<!-- Mobile Course Tabs -->
			{#if showMobileSidebar}
				<div class="d-md-none mb-3" transition:fade>
					<div class="card">
						<div class="card-header d-flex justify-content-between align-items-center">
							<h6 class="mb-0">Select Course</h6>
							<button
								class="btn btn-sm"
								onclick={toggleMobileSidebar}
								aria-label="Close course list"
							>
								<X size={16} />
							</button>
						</div>
						<div class="card-body p-0">
							<div class="list-group list-group-flush">
								{#each courses as course (course.id)}
									<button
										type="button"
										class="list-group-item list-group-item-action d-flex justify-content-between align-items-center {activeCourse?.id ===
										course.id
											? 'active'
											: ''}"
										onclick={() => {
											activeCourse = course;
											showMobileSidebar = false;
										}}
									>
										<span class="text-truncate">{course.name}</span>
										<span
											class="badge rounded-pill"
											style="background-color: {activeCourse?.id === course.id
												? 'white'
												: 'var(--purple)'}; color: {activeCourse?.id === course.id
												? 'var(--purple)'
												: 'white'}"
										>
											{calculateCompletion(course)}%
										</span>
									</button>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Course Card -->
			{#if activeCourse}
				{#if isLoading}
					<!-- Skeleton Loader -->
					<div class="card" in:scale>
						<div class="card-header">
							<div class="placeholder-glow">
								<div class="placeholder col-6"></div>
							</div>
						</div>
						<div class="card-body">
							<div class="placeholder-glow">
								<div class="placeholder col-12 mb-3"></div>
								<div class="placeholder col-4 mb-2"></div>
								<div class="placeholder col-12 mb-4" style="height: 24px"></div>

								<div class="placeholder col-11 mb-2"></div>
								<div class="placeholder col-10 mb-2"></div>
								<div class="placeholder col-9 mb-2"></div>
							</div>
						</div>
					</div>
				{:else}
					<div class="card" in:scale>
						<div
							style="background-color: var(--purple);"
							class="card-header d-flex justify-content-between align-items-center"
						>
							<h5 class="mb-0 text-light">{activeCourse.name}</h5>
							<div>
								<button
									class="btn btn-sm"
									onclick={() => (editingCourse = { ...activeCourse })}
									aria-label="Edit course"
								>
									<Pencil size={16} color="white" />
								</button>
								<button
									class="btn btn-sm ms-1"
									onclick={() => deleteCourse(activeCourse)}
									aria-label="Delete course"
								>
									<Trash2 size={16} color="white" />
								</button>
							</div>
						</div>
						<div class="card-body">
							<p class="text-muted">{activeCourse.description || 'No description provided.'}</p>

							<!-- Progress Bar -->
							<div class="mb-4">
								<div class="d-flex justify-content-between mb-1">
									<span>Course Progress</span>
									<span>{calculateCompletion(activeCourse)}%</span>
								</div>
								<div class="progress" style="height: 10px; border-radius: 5px;">
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
							<div class="d-flex justify-content-between align-items-center mb-3">
								<h6 class="mb-0">Topics</h6>
								<span class="text-muted small"
									>{(activeCourse.topics || []).filter((t) => t.completed).length} of {(
										activeCourse.topics || []
									).length} completed</span
								>
							</div>

							{#if activeCourse.topics && activeCourse.topics.length > 0}
								<ul class="list-group mb-3 non-selectable">
									{#each activeCourse.topics as topic, index (topic.id)}
										<li
											class="list-group-item d-flex justify-content-between align-items-center {topic.completed
												? 'list-group-item-success'
												: ''}"
											style="cursor: grab;"
											draggable="false"
											ondragstart={() => handleDragStart(topic)}
											ondragover={handleDragOver}
											ondrop={() => handleDrop(index)}
											animate:flip
										>
											<div class="d-flex align-items-center">
												<GripVertical size={16} class="me-2 text-muted" />
												<input
													type="checkbox"
													class=" me-2"
													style="width: 18px; height: 18px; cursor: pointer;"
													checked={topic.completed}
													onchange={() => toggleTopic(topic)}
													id={`topic-${topic.id}`}
												/>
												&nbsp;
												<label
													for={`topic-${topic.id}`}
													class="mb-0 {topic.completed
														? 'text-decoration-line-through text-muted'
														: ''}"
												>
													{topic.title}
												</label>
											</div>
											<div>
												<button
													class="btn btn-sm"
													onclick={() => startEditTopic(topic)}
													aria-label="Edit topic"
												>
													<Pencil size={14} color="teal" />
												</button>
												<button
													class="btn btn-sm ms-1"
													onclick={() => deleteTopic(topic)}
													aria-label="Delete topic"
												>
													<Trash2 size={14} color="red" />
												</button>
											</div>
										</li>
									{/each}
								</ul>
							{:else}
								<div class="alert alert-info">
									<div class="d-flex flex-column align-items-center text-center py-2">
										<p class="mb-2">No topics yet. Add your first topic to get started.</p>
										<small class="text-muted">Topics you add will appear here</small>
									</div>
								</div>
							{/if}

							<!-- Add Topic Form -->
							<div class="input-group">
								<input
									type="text"
									class="form-control"
									placeholder="New topic name"
									bind:value={newTopicName}
									onkeypress={(e) => e.key === 'Enter' && addTopic()}
									aria-label="New topic name"
								/>
								<button
									class="btn"
									style="background-color: var(--green); color: white;"
									type="button"
									onclick={addTopic}
									disabled={!newTopicName.trim()}
								>
									<Plus size={16} /> Add Topic
								</button>
							</div>
						</div>
					</div>
				{/if}
			{:else}
				<div class="alert alert-info">
					<div class="text-center py-4">
						<h5>No course selected</h5>
						<p class="mb-3">Select a course from the sidebar or create a new one to get started.</p>
						<button
							class="btn"
							style="background-color: var(--green); color: white;"
							onclick={() => (editingCourse = { id: null, name: '', description: '', topics: [] })}
						>
							<Plus size={16} class="me-1" /> Create New Course
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Course Form Modal -->
	{#if editingCourse}
		<div class="modal show d-block" tabindex="-1" role="dialog" transition:fade>
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">{editingCourse.id ? 'Edit Course' : 'Add New Course'}</h5>
						<button
							type="button"
							class="btn"
							onclick={() => (editingCourse = null)}
							aria-label="Close"
						>
							<X size={20} />
						</button>
					</div>
					<div class="modal-body">
						<div class="mb-3">
							<label for="courseName" class="form-label">Course Name *</label>
							<input
								type="text"
								class="form-control"
								id="courseName"
								bind:value={editingCourse.name}
								placeholder="Enter course name"
								required
							/>
						</div>
						<div class="mb-3">
							<label for="courseName" class="form-label">Course Code *</label>
							<input
								type="text"
								class="form-control"
								id="courseCode"
								bind:value={editingCourse.code}
								placeholder="Enter course code"
								required
							/>
						</div>
						<div class="mb-3">
							<label for="courseDescription" class="form-label">Description</label>
							<textarea
								class="form-control"
								id="courseDescription"
								bind:value={editingCourse.description}
								rows="3"
								placeholder="Describe what this course is about"
							></textarea>
						</div>
						<!-- {#if semesters.length > 0}
							<div class="mb-3">
								<label for="courseSemester" class="form-label">Semester *</label>
								<select
									id="courseSemester"
									class="form-select"
									bind:value={editingCourse.semester}
									disabled={!!editingCourse.id}
								>
									{#each semesters as semester (semester.id)}
										<option value={semester.id}>{semester.name}</option>
									{/each}
								</select>
							</div>
						{/if} -->
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" onclick={() => (editingCourse = null)}
							>Cancel</button
						>
						<button
							type="button"
							class="btn"
							style="background-color: var(--green); color:white;"
							onclick={editingCourse.id ? updateCourse : addCourse}
							disabled={!editingCourse.name.trim()}
						>
							{editingCourse.id ? 'Update' : 'Create'} Course
						</button>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-backdrop show" transition:fade></div>
	{/if}

	<!-- Topic Form Modal -->
	{#if editingTopic}
		<div class="modal show d-block" tabindex="-1" role="dialog" transition:fade>
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Edit Topic</h5>
						<button
							type="button"
							class="btn"
							onclick={() => (editingTopic = null)}
							aria-label="Close"
						>
							<X size={20} />
						</button>
					</div>
					<div class="modal-body">
						<div class="mb-3">
							<label for="topicName" class="form-label">Topic Name *</label>
							<input
								type="text"
								class="form-control"
								id="topicName"
								bind:value={editingTopic.title}
								placeholder="Enter topic name"
								required
							/>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" onclick={() => (editingTopic = null)}
							>Cancel</button
						>
						<button
							type="button"
							class="btn"
							style="background-color: var(--green); color: white;"
							onclick={updateTopic}
							disabled={!editingTopic.title.trim()}
						>
							Update Topic
						</button>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-backdrop show" transition:fade></div>
	{/if}
</div>

<style>
	:global(:root) {
		--purple: #6f42c1;
		--green: #28a745;
	}

	.progress-bar {
		transition: width 0.5s ease;
		background-color: var(--green);
	}

	.modal-backdrop {
		opacity: 0.5;
	}

	button {
		border-radius: 16px;
	}

	input[type='checkbox'] {
		accent-color: var(--purple);
	}

	.list-group-item {
		transition: all 0.2s ease;
	}

	.list-group-item:hover {
		background-color: #f8f9fa;
	}

	.list-group-item.active {
		background-color: var(--purple);
		border-color: var(--purple);
	}

	.placeholder {
		background-color: #e9ecef;
		border-radius: 4px;
	}

	@media (max-width: 767.98px) {
		.container {
			padding-left: 10px;
			padding-right: 10px;
		}
	}
</style>
