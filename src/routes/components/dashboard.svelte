<script>
	import { Loader, Timer, CalendarCheck, Sparkles } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import pb from '$lib';
	import Study from './study.svelte';

	let barChart;
	let lineChart;
	let barChartRef;
	let lineChartRef;

	// Define color palette
	const colors = {
		teal: '#008080',
		purple: '#845ec2',
		purpleLight: '#9a77cf',
		purpleLighter: '#b097db',
		tealLight: '#00a0a0',
		tealLighter: '#20b2b2'
	};

	let semester = $state('');

	let upcomingExams = $state('Np data');

	let studyEffectiveness = $state('No data');

	let studyMinutes = $state('No data');

	let studyData = $state({});

	async function fetchStudyData(data) {
		const request = await fetch(`/api/study_data/${data}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				accept: 'aplication/json'
			}
		});

		const response = await request.json();

		return response;
	}

	async function fetchSemester() {
		const records = await pb.collection('semesters').getFullList(
			{ requestKey: null },
			{
				sort: '-created'
			}
		);

		records.forEach((record) => {
			if (record.is_active) {
				semester = record;
			}
		});

		if (!semester) {
			semester = records[0];
		}
	}

	async function fetchExams() {
		const records = await pb.collection('exams').getFullList({
			sort: '-created'
		});

		let exmas = [];
		records.forEach((record) => {
			if (!record.is_completed) {
				exmas.push(record);
			}
		});

		upcomingExams = exmas.length;
	}

	async function fetchStudyEffectiveness() {
		const records = await pb.collection('study_sessions').getFullList(
			{ requestKey: null },
			{
				sort: '-created'
			}
		);

		const studyCount = records.length;

		let totalEffectiveness = 0;

		records.forEach((record) => {
			totalEffectiveness += record.effectiveness;
		});

		let effectiveness = totalEffectiveness / studyCount;

		studyEffectiveness = effectiveness.toFixed(1);
	}

	async function fetchStudyTime() {
		const records = await pb.collection('study_sessions').getFullList({
			sort: '-created'
		});

		let secconds = 0;

		records.forEach((record) => {
			secconds += record.duration;
		});

		const minutes = (secconds / 60).toFixed(0);

		studyMinutes = minutes;
	}
	async function getStudyDataForBarChart() {
		try {
			// Fetch all courses
			const courses = await pb.collection('courses').getFullList({
				sort: 'name'
			});

			// Fetch all study sessions
			const studySessions = await pb.collection('study_sessions').getFullList({
				sort: 'start_time',
				expand: 'course'
			});

			// Aggregate study duration by course
			const courseDurationMap = new Map();

			// Initialize map with all courses (to include courses with zero duration)
			courses.forEach((course) => {
				courseDurationMap.set(course.id, {
					courseName: course.name,
					duration: 0
				});
			});

			// Sum durations from study sessions
			studySessions.forEach((session) => {
				const courseId = session.course;
				if (courseDurationMap.has(courseId)) {
					courseDurationMap.get(courseId).duration += session.duration;
				}
			});

			// Convert to array format suitable for bar chart
			const chartData = {
				labels: [], // Course names
				datasets: [
					{
						label: 'Study Duration (hours)',
						data: [], // Durations in hours
						backgroundColor: 'rgba(75, 192, 192, 0.6)',
						borderColor: 'rgba(75, 192, 192, 1)',
						borderWidth: 1
					}
				]
			};

			// Populate chart data
			courseDurationMap.forEach((value, key) => {
				chartData.labels.push(value.courseName);
				// Convert seconds to mins for better readability in chart
				chartData.datasets[0].data.push(value.duration / 60);
			});

			return chartData;
		} catch (error) {
			console.error('Error fetching study data:', error);
			throw error;
		}
	}

	onMount(async () => {
		await fetchSemester();

		await fetchExams();

		await fetchStudyEffectiveness();

		await fetchStudyTime();

		// console.log(await fetchStudyData('weekly'));
	});

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

	onMount(async () => {
		// Bar Chart - Hours vs Units
		if (barChartRef) {
			barChart = new Chart(barChartRef, {
				type: 'bar',
				data: await fetchStudyData('courses'),
				options: {
					indexAxis: 'x',
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						title: {
							display: true,
							text: 'Hours by Course',
							color: colors.teal,
							font: {
								size: 16,
								weight: '600'
							}
						},
						legend: {
							display: false
						}
					},
					scales: {
						x: {
							beginAtZero: true,
							title: {
								display: true,
								text: 'Course',
								color: colors.teal
							},
							grid: {
								color: 'rgba(0, 0, 0, 0.05)'
							}
						},
						y: {
							title: {
								display: true,
								text: 'Hours',
								color: colors.teal
							},
							grid: {
								color: 'rgba(0, 0, 0, 0.05)'
							}
						}
					}
				}
			});
		}

		// Line Chart - Days vs Hours with smooth curve
		if (lineChartRef) {
			lineChart = new Chart(lineChartRef, {
				type: 'line',
				data: await fetchStudyData('weekly'),
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						title: {
							display: true,
							text: 'Weekly Hours Trend',
							color: colors.teal,
							font: {
								size: 16,
								weight: '600'
							}
						},
						tooltip: {
							backgroundColor: 'rgba(0, 0, 0, 0.8)',
							titleFont: {
								size: 14
							},
							bodyFont: {
								size: 13
							}
						}
					},
					scales: {
						y: {
							beginAtZero: true,
							title: {
								display: true,
								text: 'Hours',
								color: colors.teal
							},
							grid: {
								color: 'rgba(0, 0, 0, 0.05)'
							}
						},
						x: {
							title: {
								display: true,
								text: 'Days of Week',
								color: colors.teal
							},
							grid: {
								color: 'rgba(0, 0, 0, 0.05)'
							}
						}
					},
					interaction: {
						intersect: false,
						mode: 'index'
					}
				}
			});
		}

		return () => {
			if (barChart) barChart.destroy();
			if (lineChart) lineChart.destroy();
		};
	});
</script>

<div class="dashboard-container">
	<header class="page-header">
		<h1 class="page-title">Study Dashboard</h1>
		<p class="sub-title">Detailed insights into your study patterns and progress</p>
	</header>

	<main>
		<div class="stats-grid">
			<div class="stat-card" style="--accent-color: {colors.teal}">
				<div class="stat-content">
					<h2>Semester Progress</h2>
					<p class="stat-value">{calculateProgress(semester) || 0}%</p>
				</div>
				<div class="stat-icon">
					<Loader size={28} />
				</div>
			</div>

			<div class="stat-card" style="--accent-color: {colors.purple}">
				<div class="stat-content">
					<h2>Total Study Time</h2>
					<p class="stat-value">{studyMinutes} <small>Hrs</small></p>
				</div>
				<div class="stat-icon">
					<Timer size={28} />
				</div>
			</div>

			<div class="stat-card" style="--accent-color: {colors.tealLight}">
				<div class="stat-content">
					<h2>Study Effectiveness</h2>
					<p class="stat-value">{studyEffectiveness || 0}</p>
				</div>
				<div class="stat-icon">
					<Sparkles size={28} />
				</div>
			</div>

			<div class="stat-card" style="--accent-color: {colors.purpleLight}">
				<div class="stat-content">
					<h2>Upcoming Exams</h2>
					<p class="stat-value">{upcomingExams}</p>
				</div>
				<div class="stat-icon">
					<CalendarCheck size={28} />
				</div>
			</div>
		</div>

		<section class="analytics-section">
			<h2 class="section-title">Study Analytics</h2>
			<div class="charts-grid">
				<div class="chart-card">
					<div class="chart-container">
						<canvas bind:this={barChartRef}></canvas>
					</div>
				</div>
				<div class="chart-card">
					<div class="chart-container">
						<canvas bind:this={lineChartRef}></canvas>
					</div>
				</div>
			</div>
		</section>
	</main>
</div>

<style>
	:global(body) {
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		background-color: #f8fafc;
		color: #334155;
		line-height: 1.6;
	}

	.dashboard-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}

	.page-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 4rem;
	}

	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
		display: flex;
		align-items: center;
		justify-content: space-between;
		transition: all 0.3s ease;
		border-left: 4px solid var(--accent-color);
	}

	.stat-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 15px rgba(0, 0, 0, 0.08);
	}

	.stat-content h2 {
		font-size: 1rem;
		font-weight: 500;
		color: #64748b;
		margin: 0 0 0.5rem 0;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--accent-color);
		margin: 0;
	}

	.stat-icon {
		background: rgba(132, 94, 194, 0.1);
		color: var(--accent-color);
		width: 50px;
		height: 50px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.analytics-section {
		margin-top: 2rem;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: teal;
		margin-bottom: 1.5rem;
		position: relative;
		padding-bottom: 0.5rem;
	}

	.section-title::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 50px;
		height: 3px;
		background: linear-gradient(to right, teal, var(--purple));
		border-radius: 3px;
	}

	.charts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 2rem;
	}

	.chart-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
		transition: all 0.3s ease;
	}

	.chart-card:hover {
		box-shadow: 0 10px 15px rgba(0, 0, 0, 0.08);
	}

	.chart-container {
		position: relative;
		height: 300px;
		width: 100%;
	}

	/* Responsive adjustments */
	@media (max-width: 1100px) {
		.charts-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.dashboard-container {
			padding: 1.5rem 1rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.charts-grid {
			grid-template-columns: 1fr;
		}

		.chart-card {
			padding: 1rem;
		}
	}
</style>
