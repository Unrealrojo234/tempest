<script>
	import { Loader, Timer, CalendarCheck, Sparkles } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

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

	onMount(() => {
		// Bar Chart - Hours vs Units
		if (barChartRef) {
			barChart = new Chart(barChartRef, {
				type: 'bar',
				data: {
					labels: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6'],
					datasets: [
						{
							label: 'Hours',
							data: [8, 6, 9, 5, 7, 4],
							backgroundColor: Array(6).fill(0).map((_, i) => 
								`hsla(${194 + i * 10}, 70%, 60%, 0.7)`
							),
							borderColor: colors.teal,
							borderWidth: 1,
							borderRadius: 4,
							hoverBackgroundColor: colors.purpleLight
						}
					]
				},
				options: {
					indexAxis: 'x',
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						title: {
							display: true,
							text: 'Hours by Unit',
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
								text: 'Hours',
								color: colors.teal
							},
							grid: {
								color: 'rgba(0, 0, 0, 0.05)'
							}
						},
						y: {
							title: {
								display: true,
								text: 'Units',
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
				data: {
					labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
					datasets: [
						{
							label: 'Hours',
							data: [6, 8, 7, 9, 5, 4, 3],
							fill: true,
							backgroundColor: 'rgba(132, 94, 194, 0.2)',
							borderColor: colors.purple,
							borderWidth: 3,
							tension: 0.4,
							pointBackgroundColor: colors.purple,
							pointBorderColor: '#fff',
							pointRadius: 5,
							pointHoverRadius: 7,
							pointBorderWidth: 2
						}
					]
				},
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
					<p class="stat-value">12%</p>
				</div>
				<div class="stat-icon">
					<Loader size={28} />
				</div>
			</div>
			
			<div class="stat-card" style="--accent-color: {colors.purple}">
				<div class="stat-content">
					<h2>Total Study Time</h2>
					<p class="stat-value">10hrs</p>
				</div>
				<div class="stat-icon">
					<Timer size={28} />
				</div>
			</div>
			
			<div class="stat-card" style="--accent-color: {colors.tealLight}">
				<div class="stat-content">
					<h2>Study Effectiveness</h2>
					<p class="stat-value">4.5</p>
				</div>
				<div class="stat-icon">
					<Sparkles size={28} />
				</div>
			</div>
			
			<div class="stat-card" style="--accent-color: {colors.purpleLight}">
				<div class="stat-content">
					<h2>Upcoming Exams</h2>
					<p class="stat-value">4</p>
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
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
		background: linear-gradient(to right, teal, var(--purple) );
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