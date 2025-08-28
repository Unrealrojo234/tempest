<script>
    import { Pencil, Trash2, X, Plus, ChevronUp, ChevronDown, GripVertical } from '@lucide/svelte';
    import { fade, scale } from 'svelte/transition';
    import { flip } from 'svelte/animate';

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
    let draggedTopic = $state(null);
    let isLoading = $state(false);
    let showMobileSidebar = $state(false);

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
        editingCourse = null;
    }

    // Delete a course
    function deleteCourse(course) {
        if (!confirm(`Are you sure you want to delete "${course.name}"? This action cannot be undone.`)) return;
        
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
        if (!confirm(`Are you sure you want to delete "${topic.name}"?`)) return;
        
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

    // Drag and drop handlers
    function handleDragStart(topic) {
        draggedTopic = topic;
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(index) {
        if (!draggedTopic) return;
        
        const topics = activeCourse.topics.filter(t => t.id !== draggedTopic.id);
        topics.splice(index, 0, draggedTopic);
        
        courses = courses.map(c => 
            c.id === activeCourse.id ? { ...c, topics } : c
        );
        
        activeCourse = { ...activeCourse, topics };
        draggedTopic = null;
    }

    // Simulate loading state
    function simulateLoading() {
        isLoading = true;
        setTimeout(() => isLoading = false, 500);
    }

    // Toggle mobile sidebar
    function toggleMobileSidebar() {
        showMobileSidebar = !showMobileSidebar;
    }
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
            <h1 class="mb-0">Course Manager</h1>
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
                                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center {activeCourse.id === course.id ? 'active' : ''}"
                                    onclick={() => {
                                        activeCourse = course;
                                        simulateLoading();
                                    }}
                                    aria-current={activeCourse.id === course.id}
                                >
                                    <span class="text-truncate">{course.name}</span>
                                    <span class="badge rounded-pill" style="background-color: {activeCourse.id === course.id ? 'white' : 'var(--purple)'}; color: {activeCourse.id === course.id ? 'var(--purple)' : 'white'}">
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
                                onclick={() => editingCourse = { id: null, name: '', description: '', topics: [] }}
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
                                        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center {activeCourse.id === course.id ? 'active' : ''}"
                                        onclick={() => {
                                            activeCourse = course;
                                            showMobileSidebar = false;
                                            simulateLoading();
                                        }}
                                    >
                                        <span class="text-truncate">{course.name}</span>
                                        <span class="badge rounded-pill" style="background-color: {activeCourse.id === course.id ? 'white' : 'var(--purple)'}; color: {activeCourse.id === course.id ? 'var(--purple)' : 'white'}">
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
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">{activeCourse.name}</h5>
                            <div>
                                <button
                                    class="btn btn-sm"
                                    onclick={() => editingCourse = { ...activeCourse }}
                                    aria-label="Edit course"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button class="btn btn-sm ms-1" onclick={() => deleteCourse(activeCourse)} aria-label="Delete course">
                                    <Trash2 size={16} />
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
                                <span class="text-muted small">{activeCourse.topics.filter(t => t.completed).length} of {activeCourse.topics.length} completed</span>
                            </div>
                            
                            {#if activeCourse.topics.length > 0}
                                <ul class="list-group mb-3">
                                    {#each activeCourse.topics as topic, index (topic.id)}
                                        <li 
                                            class="list-group-item d-flex justify-content-between align-items-center {topic.completed ? 'list-group-item-success' : ''}"
                                            style="cursor: grab;"
                                            draggable="true"
                                            ondragstart={() => handleDragStart(topic)}
                                            ondragover={handleDragOver}
                                            ondrop={() => handleDrop(index)}
                                            animate:flip
                                        >
                                            <div class="d-flex align-items-center">
                                                <GripVertical size={16} class="me-2 text-muted" />
                                                <input
                                                    type="checkbox"
                                                    class="form-check-input me-2"
                                                    style="width: 18px; height: 18px; cursor: pointer;"
                                                    checked={topic.completed}
                                                    onchange={() => toggleTopic(topic)}
                                                    id={`topic-${topic.id}`}
                                                />
                                                <label for={`topic-${topic.id}`} class="mb-0 {topic.completed ? 'text-decoration-line-through text-muted' : ''}">
                                                    {topic.name}
                                                </label>
                                            </div>
                                            <div>
                                                <button
                                                    class="btn btn-sm"
                                                    onclick={() => startEditTopic(topic)}
                                                    aria-label="Edit topic"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button class="btn btn-sm ms-1" onclick={() => deleteTopic(topic)} aria-label="Delete topic">
                                                    <Trash2 size={14} />
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
                            onclick={() => editingCourse = { id: null, name: '', description: '', topics: [] }}
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
                        <button type="button" class="btn" onclick={() => (editingCourse = null)} aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="courseName" class="form-label">Course Name</label>
                            <input
                                type="text"
                                class="form-control"
                                id="courseName"
                                bind:value={editingCourse.name}
                                placeholder="Enter course name"
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
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick={() => (editingCourse = null)}>Cancel</button>
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
                        <button type="button" class="btn" onclick={() => (editingTopic = null)} aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="topicName" class="form-label">Topic Name</label>
                            <input
                                type="text"
                                class="form-control"
                                id="topicName"
                                bind:value={editingTopic.name}
                                placeholder="Enter topic name"
                            />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick={() => (editingTopic = null)}>Cancel</button>
                        <button 
                            type="button" 
                            class="btn" 
                            style="background-color: var(--green); color: white;" 
                            onclick={updateTopic}
                            disabled={!editingTopic.name.trim()}
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

    
    .progress-bar {
        transition: width 0.5s ease;
        background-color: var(--purple);
    }
    
    .modal-backdrop {
        opacity: 0.5;
    }

    button {
        border-radius: 16px;
    }



    input[type="checkbox"] {
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