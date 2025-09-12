<script>
	import { onMount } from 'svelte';
	import { Trash2Icon, PencilIcon, PlusCircle, Filter } from '@lucide/svelte';
	import pb from '$lib';
	import Toast from '$lib/toast';

	// State
	let resources = [];
	let courses = [];
	let newResource = {
		course: '',
		topic: '',
		title: '',
		type: 'note',
		content: '',
		file: null,
		link: ''
	};
	let editingId = null;
	let searchQuery = '';
	let filterType = 'all';
	let filterCourse = 'all';
	let showForm = false;

	// Fetch data on mount
	onMount(async () => {
		try {
			// Fetch courses
			const courseRecords = await pb.collection('courses').getFullList({
				sort: '+name'
			});
			courses = courseRecords.map((record) => ({
				id: record.id,
				name: record.name
			}));

			// Fetch resources with course relation expanded
			const resourceRecords = await pb.collection('resources').getFullList({
				expand: 'course',
				sort: '-created'
			});
			resources = resourceRecords.map((record) => ({
				id: record.id,
				courseId: record.course,
				topic: record.topic,
				title: record.title,
				type: record.type,
				content: record.content || '',
				file: record.file ? pb.getFileUrl(record, record.file) : '',
				link: record.link || '',
				course: record.expand?.course?.name || 'Unknown'
			}));
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	});

	// Computed values
	$: filteredResources = resources.filter((resource) => {
		const matchesSearch =
			resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(resource.content && resource.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
			(resource.link && resource.link.toLowerCase().includes(searchQuery.toLowerCase()));
		const matchesType = filterType === 'all' || resource.type === filterType;
		const matchesCourse = filterCourse === 'all' || resource.courseId === filterCourse;
		return matchesSearch && matchesType && matchesCourse;
	});

	$: resourceStats = {
		total: resources.length,
		notes: resources.filter((r) => r.type === 'note').length,
		pdfs: resources.filter((r) => r.type === 'pdf').length,
		links: resources.filter((r) => r.type === 'link').length
	};

	// CRUD operations
	async function createResource() {
		try {
			const formData = new FormData();
			formData.append('course', newResource.course);
			formData.append('topic', newResource.topic);
			formData.append('title', newResource.title);
			formData.append('type', newResource.type);
			if (newResource.type === 'pdf' && newResource.file) {
				formData.append('file', newResource.file);
			} else if (newResource.type === 'link') {
				formData.append('link', newResource.link);
			} else {
				formData.append('content', newResource.content);
			}

			const record = await pb.collection('resources').create(formData);

			Toast('success', 'Resource Added Successfully');

			resources = [
				{
					id: record.id,
					courseId: newResource.course,
					topic: record.topic,
					title: record.title,
					type: record.type,
					content: record.content || '',
					file: record.file ? pb.getFileUrl(record, record.file) : '',
					link: record.link || '',
					course: courses.find((c) => c.id === newResource.course)?.name || 'Unknown'
				},
				...resources
			];
			resetForm();
		} catch (error) {
			Toast('error', error.message);
		}
	}

	async function updateResource() {
		try {
			const formData = new FormData();
			formData.append('course', newResource.course);
			formData.append('topic', newResource.topic);
			formData.append('title', newResource.title);
			formData.append('type', newResource.type);
			if (newResource.type === 'pdf' && newResource.file) {
				formData.append('file', newResource.file);
			} else if (newResource.type === 'link') {
				formData.append('link', newResource.link);
			} else {
				formData.append('content', newResource.content);
			}

			const record = await pb.collection('resources').update(editingId, formData);

			Toast('success', 'Resource Updated Successfully');
			resources = resources.map((r) =>
				r.id === editingId
					? {
							id: record.id,
							courseId: newResource.course,
							topic: record.topic,
							title: record.title,
							type: record.type,
							content: record.content || '',
							file: record.file ? pb.getFileUrl(record, record.file) : '',
							link: record.link || '',
							course: courses.find((c) => c.id === newResource.course)?.name || 'Unknown'
						}
					: r
			);
			resetForm();
		} catch (error) {
			Toast('error', error.message);
		}
	}

	async function deleteResource(id) {
		try {
			Swal.fire({
				text: 'Are you sure you want to delete this resource? This action cannot be undone!',
				showDenyButton: true,
				showConfirmButton: false,
				showCancelButton: true,
				denyButtonText: `Delete`
			}).then(async (result) => {
				if (result.isDenied) {
					try {
						await pb.collection('resources').delete(id);
						Toast('success', 'Resource Deleted Successfully');
						resources = resources.filter((r) => r.id !== id);
					} catch (error) {
						Toast('error', error.message);
					}
				}
			});
		} catch (error) {
			Toast('error', error.message);
		}
	}

	function editResource(resource) {
		newResource = {
			course: resource.courseId,
			topic: resource.topic,
			title: resource.title,
			type: resource.type,
			content: resource.content || '',
			file: null,
			link: resource.link || ''
		};
		editingId = resource.id;
		showForm = true;
	}

	function resetForm() {
		newResource = {
			course: '',
			topic: '',
			title: '',
			type: 'note',
			content: '',
			file: null,
			link: ''
		};
		editingId = null;
		showForm = false;
	}

	function handleSubmit() {
		if (!newResource.course || !newResource.title || !newResource.topic) {
			alert('Please fill in all required fields');
			return;
		}
		if (newResource.type === 'pdf' && !newResource.file && !editingId) {
			alert('Please upload a PDF file');
			return;
		}
		if (newResource.type === 'link' && !newResource.link) {
			alert('Please provide a valid URL');
			return;
		}
		if (newResource.type === 'note' && !newResource.content) {
			alert('Please provide note content');
			return;
		}
		if (editingId) {
			updateResource();
		} else {
			createResource();
		}
	}

	function handleFileChange(event) {
		newResource.file = event.target.files[0];
	}

	// Icon mapping
	const typeIcons = {
		note: '📝',
		pdf: '📄',
		link: '🔗'
	};

	const typeColors = {
		note: 'bg-purple-100 text-purple-800',
		pdf: 'bg-teal-100 text-teal-800',
		link: 'bg-blue-100 text-blue-800'
	};
</script>

<div class="container mx-auto p-4 d-flex flex-column min-vh-100">
	<h1 class="page-title">Study Resources</h1>
	<p class="sub-title">Organize your study materials and references.</p>

	<!-- Search and Filter -->
	<div class="row mb-4">
		<div class="col-md-4 mb-2">
			<div class="input-group">
				<span class="input-group-text bg-teal-100 border-teal-300"> 🔍 </span>
				<input
					type="text"
					class="form-control border-teal-300"
					placeholder="Search resources..."
					bind:value={searchQuery}
				/>
			</div>
		</div>
		<div class="col-md-4 mb-2">
			<div style="display: flex;">
				<select class="form-select border-teal-300" bind:value={filterType}>
					<option value="all">All Types</option>
					<option value="note">Notes</option>
					<option value="pdf">PDFs</option>
					<option value="link">Links</option>
				</select>
			</div>
		</div>
		<div class="col-md-4 mb-2">
			<div style="display: flex;">
				<select class="form-select border-teal-300" bind:value={filterCourse}>
					<option value="all">All Courses</option>
					{#each courses as course}
						<option value={course.id}>{course.name}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Add Resource Button -->
	<div class="mb-4">
		<button
			class="btn btn-teal d-flex align-items-center"
			on:click={() => {
				resetForm();
				showForm = true;
			}}
		>
			<span class="me-2"><PlusCircle /> &nbsp;</span> Add New Resource
		</button>
	</div>

	<!-- Resource Form (Conditional) -->
	{#if showForm}
		<div class="card mb-4 border-teal">
			<div class="card-header bg-teal-100 text-teal-800">
				<h5 class="mb-0">{editingId ? 'Edit Resource' : 'Add New Resource'}</h5>
			</div>
			<div class="card-body">
				<form on:submit|preventDefault={handleSubmit}>
					<div class="mb-3">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="form-label">Course</label>
						<select class="form-select" bind:value={newResource.course} required>
							<option value="" disabled>Select a course</option>
							{#each courses as course}
								<option value={course.id}>{course.name}</option>
							{/each}
						</select>
					</div>
					<div class="mb-3">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="form-label">Topic</label>
						<input type="text" class="form-control" bind:value={newResource.topic} required />
					</div>
					<div class="mb-3">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="form-label">Title</label>
						<input type="text" class="form-control" bind:value={newResource.title} required />
					</div>
					<div class="mb-3">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="form-label">Type</label>
						<select class="form-select" bind:value={newResource.type}>
							<option value="note">Note</option>
							<option value="pdf">PDF</option>
							<option value="link">Web Link</option>
						</select>
					</div>
					<div class="mb-3">
						<!-- svelte-ignore a11y_label_has_associated_control -->
						<label class="form-label">Content</label>
						{#if newResource.type === 'pdf'}
							<input
								type="file"
								class="form-control"
								accept=".pdf"
								on:change={handleFileChange}
								required={!editingId || newResource.file}
							/>
						{:else if newResource.type === 'link'}
							<input
								type="url"
								class="form-control"
								bind:value={newResource.link}
								placeholder="https://example.com"
								required
							/>
						{:else}
							<textarea class="form-control" bind:value={newResource.content} rows="3" required
							></textarea>
						{/if}
					</div>
					<div class="d-flex gap-2">
						<button type="submit" class="btn btn-teal">
							{editingId ? 'Update' : 'Create'} Resource
						</button>
						&nbsp;&nbsp;&nbsp;
						<button type="button" class="btn btn-outline-secondary" on:click={resetForm}>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Resources Grid with improved spacing -->
	<div class="resources-grid">
		{#each filteredResources as resource (resource.id)}
			<div class="resource-card">
				<div class="card h-100">
					<div class="card-header d-flex justify-content-between align-items-center">
						<span class={`badge ${typeColors[resource.type]} rounded-pill`}>
							{typeIcons[resource.type]}
							{resource.type.toUpperCase()}
						</span>
						<div class="btn-group btn-group-sm">
							<button class="btn" on:click={() => editResource(resource)}>
								<PencilIcon color="teal" />
							</button>
							<button class="btn" on:click={() => deleteResource(resource.id)}>
								<Trash2Icon color="red" />
							</button>
						</div>
					</div>
					<div class="card-body">
						<h5 class="card-title text-teal-800">{resource.title}</h5>
						<h6 class="card-subtitle mb-2 text-muted">{resource.course} - {resource.topic}</h6>
						{#if resource.type === 'link' || resource.type === 'pdf'}
							<p class="card-text">
								<a
									href={resource.link || resource.file}
									target="_blank"
									class="text-teal-600 link-truncate">view resource</a
								>
							</p>
						{:else}
							<p class="card-text content-truncate">{resource.content}</p>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<div class="col-12">
				<div class="alert alert-info">
					No resources found. {searchQuery ? 'Try a different search.' : 'Add your first resource!'}
				</div>
			</div>
		{/each}
	</div>

	<!-- Resource Summary Card -->
	<div class="card border-purple mt-4">
		<div class="card-header text-light" style="background-color: var(--purple);">
			<h5 class="mb-0">Resource Summary</h5>
		</div>
		<div class="card-body">
			<div class="row text-center">
				<div class="col-md-3 mb-3 mb-md-0">
					<div class="h2 text-teal-800">{resourceStats.total}</div>
					<div class="text-muted">Total Resources</div>
				</div>
				<div class="col-md-3 mb-3 mb-md-0">
					<div class="h2 text-purple-800">{resourceStats.notes}</div>
					<div class="text-muted">Text Notes</div>
				</div>
				<div class="col-md-3 mb-3 mb-md-0">
					<div class="h2 text-teal-600">{resourceStats.pdfs}</div>
					<div class="text-muted">PDF Documents</div>
				</div>
				<div class="col-md-3">
					<div class="h2 text-blue-600">{resourceStats.links}</div>
					<div class="text-muted">Web Links</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		--teal: #20c997;
		--purple: #6f42c1;
		--light-bg: #f8f9fa;
	}

	.container {
		max-width: 1200px;
	}

	.page-title {
		color: var(--purple);
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.sub-title {
		color: #6c757d;
		margin-bottom: 2rem;
	}

	/* Resources Grid with even spacing */
	.resources-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.resource-card {
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.resource-card:hover {
		transform: translateY(-5px);
	}

	.resource-card .card {
		border: 1px solid rgba(111, 66, 193, 0.2);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		transition: all 0.2s ease;
	}

	.resource-card .card:hover {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.resource-card .card-header {
		background-color: rgba(32, 201, 151, 0.1);
		border-bottom: 1px solid rgba(111, 66, 193, 0.1);
		padding: 0.75rem 1rem;
	}

	.resource-card .card-body {
		padding: 1.25rem;
	}

	.resource-card .card-title {
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
	}

	.resource-card .card-subtitle {
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.resource-card .card-text {
		color: #495057;
		margin-bottom: 0;
	}

	/* Truncate long text */
	.link-truncate,
	.content-truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	/* Button styles */
	.btn-teal {
		background-color: var(--teal);
		color: white;
		border-color: var(--teal);
		padding: 0.5rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
	}

	.btn-teal:hover {
		background-color: #199d78;
		border-color: #199d78;
		color: white;
	}

	/* Badge styles */
	.bg-purple-100 {
		background-color: rgba(111, 66, 193, 0.1) !important;
		color: #6f42c1 !important;
	}

	.bg-teal-100 {
		background-color: rgba(32, 201, 151, 0.1) !important;
		color: #20c997 !important;
	}

	.bg-blue-100 {
		background-color: rgba(13, 110, 253, 0.1) !important;
		color: #0d6efd !important;
	}

	.border-teal {
		border-color: var(--teal) !important;
	}

	.border-purple {
		border-color: var(--purple) !important;
	}

	.text-teal-800 {
		color: #0a5442;
	}

	.text-purple-800 {
		color: #3d2364;
	}

	.text-teal-600 {
		color: var(--teal);
	}

	/* Form styles */
	.form-control:focus,
	.form-select:focus,
	input[type='file']:focus {
		border-color: var(--teal);
		box-shadow: 0 0 0 0.25rem rgba(32, 201, 151, 0.25);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.resources-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.resource-card .card {
			margin-bottom: 0;
		}
	}
</style>
