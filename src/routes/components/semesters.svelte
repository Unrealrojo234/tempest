<script>
  import { onMount } from 'svelte';
  import { PlusCircle, Edit3, Trash2, Calendar, CheckCircle, Circle } from '@lucide/svelte';

  // Mock data
  let semesters = [
    { id: '1', name: 'Fall 2023', start_date: '2023-09-01T00:00:00', end_date: '2023-12-15T00:00:00', is_active: true, completed: false },
    { id: '2', name: 'Spring 2024', start_date: '2024-01-15T00:00:00', end_date: '2024-05-10T00:00:00', is_active: false, completed: false },
    { id: '3', name: 'Summer 2023', start_date: '2023-06-01T00:00:00', end_date: '2023-08-15T00:00:00', is_active: false, completed: true },
    { id: '4', name: 'Fall 2022', start_date: '2022-09-05T00:00:00', end_date: '2022-12-20T00:00:00', is_active: false, completed: true }
  ];

  // Form state
  let newSemester = {
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    completed: false
  };

  // UI state
  let editingId = null;
  let showForm = false;
  let filterStatus = 'all';

  // Computed values
  $: filteredSemesters = semesters.filter(semester => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return semester.is_active;
    if (filterStatus === 'completed') return semester.completed;
    if (filterStatus === 'upcoming') return !semester.completed && !semester.is_active;
    return true;
  });

  $: activeSemester = semesters.find(s => s.is_active);
  $: upcomingSemesters = semesters.filter(s => !s.completed && !s.is_active);
  $: completedSemesters = semesters.filter(s => s.completed);

  // CRUD operations
  function createSemester() {
    const newId = Math.max(...semesters.map(s => parseInt(s.id))) + 1;
    
    // If setting as active, deactivate all others
    if (newSemester.is_active) {
      semesters = semesters.map(s => ({ ...s, is_active: false }));
    }
    
    semesters = [...semesters, { ...newSemester, id: newId.toString() }];
    resetForm();
  }

  function updateSemester() {
    // If setting as active, deactivate all others
    if (newSemester.is_active) {
      semesters = semesters.map(s => ({ 
        ...s, 
        is_active: s.id === editingId 
      }));
    } else {
      semesters = semesters.map(s => 
        s.id === editingId ? { ...newSemester, id: editingId } : s
      );
    }
    
    resetForm();
  }

  function deleteSemester(id) {
    semesters = semesters.filter(s => s.id !== id);
  }

  function editSemester(semester) {
    newSemester = { ...semester };
    // Convert dates to HTML date format
    newSemester.start_date = semester.start_date.slice(0, 10);
    newSemester.end_date = semester.end_date.slice(0, 10);
    editingId = semester.id;
    showForm = true;
  }

  function setActiveSemester(id) {
    semesters = semesters.map(s => ({
      ...s,
      is_active: s.id === id
    }));
  }

  function resetForm() {
    newSemester = { 
      name: '', 
      start_date: '', 
      end_date: '', 
      is_active: false, 
      completed: false 
    };
    editingId = null;
    showForm = false;
  }

  function handleSubmit() {
    if (editingId) {
      updateSemester();
    } else {
      createSemester();
    }
  }

  // Format date for display
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Calculate progress for a semester
  function calculateProgress(semester) {
    const start = new Date(semester.start_date);
    const end = new Date(semester.end_date);
    const today = new Date();
    
    if (today < start) return 0;
    if (today > end) return 100;
    
    const total = end - start;
    const progress = today - start;
    return Math.round((progress / total) * 100);
  }

  // Check if semester is in progress
  function isInProgress(semester) {
    const start = new Date(semester.start_date);
    const end = new Date(semester.end_date);
    const today = new Date();
    return today >= start && today <= end;
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-3xl font-bold mb-2 text-purple-700 page-title">Semester Management</h1>
  <p class="text-gray-600 mb-6 sub-title">Create and manage your academic semesters</p>

  <!-- Stats Cards -->
  <div class="row mb-5">
    <div class="col-md-4 mb-3">
      <div class="card bg-teal-20 border-teal h-100 holographic-card-green">
        <div class="card-body text-center">
          <h5 class="card-title text-teal-800">Active Semester</h5>
          <p class="card-text display-5 text-teal-800">
            {activeSemester ? activeSemester.name : 'None'}
          </p>
        </div>
      </div>
    </div>
    <div class="col-md-4 mb-3">
      <div class="card bg-purple-20 border-purple h-100 holographic-card">
        <div class="card-body text-center">
          <h5 class="card-title text-purple-800">Upcoming Semesters</h5>
          <p class="card-text display-5 text-purple-800">{upcomingSemesters.length}</p>
        </div>
      </div>
    </div>
    <div class="col-md-4 mb-3">
      <div class="card bg-blue-20 border-blue h-100 holographic-card-blue">
        <div class="card-body text-center">
          <h5 class="card-title text-blue-800">Completed</h5>
          <p class="card-text display-5 text-blue-800">{completedSemesters.length}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters and Actions -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <select class="form-select w-auto d-inline-block" bind:value={filterStatus}>
        <option value="all">All Semesters</option>
        <option value="active">Active Only</option>
        <option value="upcoming">Upcoming</option>
        <option value="completed">Completed</option>
      </select>
    </div>
    <button 
      class="btn btn-purple d-flex align-items-center"
      on:click={() => { resetForm(); showForm = true; }}
    >
      <PlusCircle size={18} class="me-2" />&nbsp; Add New Semester 
    </button>
  </div>

  <!-- Semester Form (Conditional) -->
  {#if showForm}
    <div class="card mb-4 border-teal">
      <div class="card-header bg-teal-100 text-teal-800 d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{editingId ? 'Edit Semester' : 'Add New Semester'}</h5>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="button" class="btn-close" on:click={resetForm}></button>
      </div>
      <div class="card-body">
        <form on:submit|preventDefault={handleSubmit}>
          <div class="row">
            <div class="col-md-6 mb-3">
              <!-- svelte-ignore a11y_label_has_associated_control -->
              <label class="form-label">Semester Name</label>
              <input 
                type="text" 
                class="form-control" 
                bind:value={newSemester.name}
                placeholder="e.g., Fall 2023"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <!-- svelte-ignore a11y_label_has_associated_control -->
              <label class="form-label">Status</label>
              <div class="d-flex gap-4 mt-2">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="activeCheck"
                    bind:checked={newSemester.is_active}
                  />
                  <label class="form-check-label" for="activeCheck">
                    Set as Active
                  </label>
                </div>
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="completedCheck"
                    bind:checked={newSemester.completed}
                  />
                  <label class="form-check-label" for="completedCheck">
                    Completed
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <!-- svelte-ignore a11y_label_has_associated_control -->
              <label class="form-label">Start Date</label>
              <input 
                type="date" 
                class="form-control" 
                bind:value={newSemester.start_date}
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <!-- svelte-ignore a11y_label_has_associated_control -->
              <label class="form-label">End Date</label>
              <input 
                type="date" 
                class="form-control" 
                bind:value={newSemester.end_date}
                required
              />
            </div>
          </div>
          
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-teal">
              {editingId ? 'Update' : 'Create'} Semester
            </button>
            <button type="button" class="btn btn-outline-secondary" on:click={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Semesters List -->
  <div class="row row-cols-1 g-4">
    {#each filteredSemesters as semester (semester.id)}
      <div class="col" style="margin-bottom: 16px !important;">
        <div class="card h-100 shadow-sm {semester.is_active ? 'border-active' : ''}">
          <div class="card-header d-flex justify-content-between align-items-center" style="background-color: aliceblue;">
            <div>
              {#if semester.is_active}
                <span class="badge bg-success me-2">Active</span>
              {/if}
              {#if semester.completed}
                <span class="badge bg-secondary me-2">Completed</span>
              {:else if !semester.is_active}
                <span class="badge bg-primary me-2">Upcoming</span>
              {/if}
            </div>
            <div class="btn-group btn-group-sm">
              {#if !semester.is_active && !semester.completed}
                <button 
                  class="btn" 
                  on:click={() => setActiveSemester(semester.id)}
                  title="Set as active"
                >
                  <CheckCircle size={24} color="gold" />
                </button>
              {/if}
              <button 
                class="btn btn-outline-teal" 
                on:click={() => editSemester(semester)}
                title="Edit semester"
              >
                <Edit3 size={18} color="teal" />
              </button>
              <button 
                class="btn " 
                on:click={() => deleteSemester(semester.id)}
                title="Delete semester"
              >
                <Trash2 size={20}  color="red"/>
              </button>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title text-purple-800">{semester.name}</h5>
            
            <div class="d-flex align-items-center mb-3">
              <Calendar size={18} class="text-teal-700 me-2" />
              <span class="text-muted">
                {formatDate(semester.start_date)} - {formatDate(semester.end_date)}
              </span>
            </div>
            
            {#if !semester.completed}
              <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <small class="text-muted">Progress</small>
                  <small class="text-muted">{calculateProgress(semester)}%</small>
                </div>
                <div class="progress" style="height: 8px;">
                  <div 
                    class="progress-bar {semester.is_active ? 'bg-teal' : 'bg-primary'}" 
                    role="progressbar" 
                    style={`width: ${calculateProgress(semester)}%`}
                    aria-valuenow={calculateProgress(semester)} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            {/if}
            
            <div class="d-flex gap-2 mt-3">
              {#if semester.is_active}
                <button class="btn btn-sm btn-teal" disabled>Currently Active</button>
              {:else if !semester.completed}
                <button 
                  class="btn btn-sm btn-outline-teal" 
                  on:click={() => setActiveSemester(semester.id)}
                >
                  Set as Active
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="col-12">
        <div class="alert alert-info text-center">
          {filterStatus === 'all' 
            ? 'No semesters found. Add your first semester!' 
            : `No ${filterStatus} semesters found.`}
        </div>
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
  .bg-blue-20 {
    background-color: rgba(13, 110, 253, 0.2);
  }
  .border-blue {
    border-color: #0d6efd !important;
  }
  .text-blue-800 {
    color: #052c65;
  }
  .border-active {
    border: 2px solid #20c997 !important;
  }
  .btn-teal {
    background-color: #20c997;
    color: white;
    border-color: #20c997;
  }
  .btn-teal:hover {
    background-color: #199d78;
    border-color: #199d78;
    color: white;
  }
  .progress {
    background-color: #e9ecef;
    border-radius: 4px;
  }
  .progress-bar {
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  .bg-teal {
    background-color: #20c997 !important;
  }
</style>