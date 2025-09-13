<script>
	import { onMount, onDestroy } from 'svelte';
	import { Clock, Play, Pause, Square, Star, BookOpen, Book } from '@lucide/svelte';
	import StarRatings from './starRatings.svelte';
	import pb from '$lib';
	import Toast from '$lib/toast';
	import Ratings from './Ratings.svelte';

	// Timer state
	let timerActive = false;
	let timerSeconds = 0;
	let timerInterval;
	let startTime = null;

	// Study session form
	let selectedCourse = '';
	let effectivenessRating = 0;
	let notes = '';
	let hoverRating = 0;

	// Database state
	let courses = [];
	let recentSessions = [];

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

			// Fetch recent sessions with course relation expanded
			let sessionRecords = await pb.collection('study_sessions').getFullList({
				expand: 'course',
				sort: '-created'
			});

			//Showing only the first three or last three sessions
			sessionRecords = sessionRecords.slice(0, 4);

			recentSessions = sessionRecords.map((record) => ({
				id: record.id,
				course: record.expand?.course?.name || 'Unknown',
				duration: formatTime(record.duration),
				rating: record.effectiveness,
				date: new Date(record.created).toISOString().split('T')[0],
				notes: record.notes || ''
			}));
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	});

	// Timer functions
	function startTimer() {
		timerActive = true;
		startTime = new Date();
		timerInterval = setInterval(() => {
			timerSeconds++;
		}, 1000);
	}

	function pauseTimer() {
		timerActive = false;
		clearInterval(timerInterval);
	}

	function resetTimer() {
		timerActive = false;
		clearInterval(timerInterval);
		timerSeconds = 0;
		startTime = null;
	}

	function formatTime(seconds) {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return [
			hrs.toString().padStart(2, '0'),
			mins.toString().padStart(2, '0'),
			secs.toString().padStart(2, '0')
		].join(':');
	}

	function handleStarClick(rating) {
		effectivenessRating = rating;
	}

	function handleStarHover(rating) {
		hoverRating = rating;
	}

	function handleStarLeave() {
		hoverRating = 0;
	}

	async function submitSession() {
		if (!selectedCourse) {
			alert('Please select a course');
			return;
		}

		try {
			const endTime = new Date();
			const record = await pb.collection('study_sessions').create({
				course: selectedCourse,
				start_time: startTime ? startTime.toISOString() : new Date().toISOString(),
				end_time: endTime.toISOString(),
				duration: timerSeconds,
				effectiveness: effectivenessRating,
				notes: notes
			});

			Toast('success', 'Session Successfully Recorded');

			// Update recent sessions
			const courseName = courses.find((c) => c.id === selectedCourse)?.name || 'Unknown';
			recentSessions = [
				{
					id: record.id,
					course: courseName,
					duration: formatTime(record.duration),
					rating: record.effectiveness,
					date: new Date(record.created).toISOString().split('T')[0],
					notes: record.notes || ''
				},
				...recentSessions
			];

			recentSessions = recentSessions.slice(0, 4);

			// Reset form
			resetTimer();
			selectedCourse = '';
			effectivenessRating = 0;
			notes = '';
		} catch (error) {
			console.error('Error submitting session:', error);
			alert('Failed to log session. Please try again.');
		}
	}

	onDestroy(() => {
		clearInterval(timerInterval);
	});
</script>

<main>
	<div class="container">
		<h1 class="page-title" style="color: teal;">Study Session Tracker</h1>
		<p class="sub-title">Track your study time and progress effectively</p>

		<div class="row">
			<!-- Left Column: Timer and Session Form -->
			<div class="col-left">
				<div class="card timer-card">
					<div class="timer-display">
						<Clock size={42} color="teal" />
						<span class="time">{formatTime(timerSeconds)}</span>
					</div>

					<div class="timer-controls">
						{#if !timerActive}
							<button on:click={startTimer} class="btn btn-primary">
								<Play size={18} />
								Start
							</button>
						{:else}
							<button on:click={pauseTimer} class="btn btn-secondary">
								<Pause size={18} />
								Pause
							</button>
						{/if}

						<button on:click={resetTimer} class="btn btn-outline">
							<Square size={18} />
							Reset
						</button>
					</div>
				</div>

				<div class="card session-form">
					<h2 style="color: var(--green);">
						<BookOpen size={20} />
						Session Details
					</h2>

					<form on:submit|preventDefault={submitSession}>
						<div class="form-group">
							<label for="course">Course</label>
							<select bind:value={selectedCourse} class="form-control" id="course">
								<option value="" disabled selected>Select a course</option>
								{#each courses as course}
									<option value={course.id}>{course.name}</option>
								{/each}
							</select>
						</div>

						<div class="form-group">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label>Effectiveness Rating</label>
							<div class="star-rating">
								<StarRatings bind:value={effectivenessRating} name="effectiveness" size={24} />
							</div>
						</div>

						<div class="form-group">
							<label for="notes">Notes</label>
							<textarea
								bind:value={notes}
								class="form-control"
								id="notes"
								rows="3"
								placeholder="What did you study? Any insights or difficulties?"
							></textarea>
						</div>

						<button type="submit" class="btn btn-primary submit-btn"> + Quick Log Session </button>
					</form>
				</div>
			</div>

			<!-- Right Column: Recent Sessions -->
			<div class="col-right">
				<div class="card recent-sessions">
					<h2 style="color: var(--green);">
						<Book size={20} />
						Recent Study Sessions
					</h2>

					{#if recentSessions.length > 0}
						<div class="sessions-list">
							{#each recentSessions as session}
								<div class="session-item">
									<div class="session-header">
										<h3 class="session-course">{session.course}</h3>
										<span class="session-duration">{session.duration}</span>
									</div>

									<div class="session-details">
										<div class="session-rating">
											<Ratings
												rating={session.rating}
												size="28px"
												activeColor="gold"
												inactiveColor="#cccccc"
											/>
											<!-- Different max rating -->
											<!-- <StarRating rating={8} maxRating={10} /> -->
										</div>

										<span class="session-date">{session.date}</span>
									</div>

									{#if session.notes}
										<p class="session-notes">{session.notes}</p>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<p class="no-sessions">No study sessions yet. Start tracking your study time!</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	/* Global styles */
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background-color: #f9f9f9;
		color: #333;
		line-height: 1.6;
	}

	main {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.container {
		width: 100%;
	}

	h2 {
		color: #6a11cb;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Layout */
	.row {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.col-left {
		flex: 1;
		min-width: 350px;
	}

	.col-right {
		flex: 1;
		min-width: 350px;
	}

	/* Cards */
	.card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.timer-card {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	/* Timer */
	.timer-display {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		gap: 0.8rem;
	}

	.time {
		font-size: 2.5rem;
		font-weight: bold;
		color: #6a11cb;
		font-family: 'Courier New', monospace;
	}

	.timer-controls {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.7rem 1.2rem;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-primary {
		background: var(--purple);
		color: white;
	}

	.btn-primary:hover {
		background: #9c6de7;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(106, 17, 203, 0.2);
	}

	.btn-secondary {
		background: var(--purple);
		color: white;
	}

	.btn-secondary:hover {
		background: var(--purple);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(20, 184, 166, 0.2);
	}

	.btn-outline {
		background: transparent;
		color: #6a11cb;
		border: 2px solid #6a11cb;
	}

	.btn-outline:hover {
		background: rgba(106, 17, 203, 0.1);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #444;
	}

	.form-control {
		width: 100%;
		padding: 0.8rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.form-control:focus {
		outline: none;
		border-color: #6a11cb;
		box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.1);
	}

	textarea.form-control {
		resize: vertical;
		min-height: 80px;
	}

	/* Star rating */
	.star-rating {
		display: flex;
		gap: 0.5rem;
	}

	.submit-btn {
		width: 100%;
		padding: 1rem;
		font-size: 1.1rem;
		margin-top: 0.5rem;
	}

	.session-item {
		border-bottom: 1px solid #eee;
		padding: 1rem 0;
	}

	.session-item:last-child {
		border-bottom: none;
	}

	.session-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.session-course {
		font-size: 1.1rem;
		color: black;
		font-weight: 600;
	}

	.session-duration {
		background: #eefbfa;
		color: #14b8a6;
		padding: 0.3rem 0.6rem;
		border-radius: 20px;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.session-details {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.session-rating {
		display: flex;
		gap: 0.2rem;
	}

	.session-date {
		color: #777;
		font-size: 0.9rem;
	}

	.session-notes {
		color: #555;
		font-size: 0.95rem;
		font-style: italic;
	}

	.no-sessions {
		text-align: center;
		color: #777;
		padding: 2rem 0;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		main {
			padding: 1rem;
		}

		.row {
			flex-direction: column;
		}

		.time {
			font-size: 2rem;
		}
	}
</style>
