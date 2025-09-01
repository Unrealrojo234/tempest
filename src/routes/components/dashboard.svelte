<script>
	import { Loader, Timer, CalendarCheck, Sparkles } from '@lucide/svelte';

	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let barChart;
	let lineChart;
	let barChartRef;
	let lineChartRef;

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
							backgroundColor: [
								'rgba(255, 99, 132, 0.7)',
								'rgba(54, 162, 235, 0.7)',
								'rgba(255, 206, 86, 0.7)',
								'rgba(75, 192, 192, 0.7)',
								'rgba(153, 102, 255, 0.7)',
								'rgba(255, 159, 64, 0.7)'
							],
							borderColor: [
								'rgba(255, 99, 132, 1)',
								'rgba(54, 162, 235, 1)',
								'rgba(255, 206, 86, 1)',
								'rgba(75, 192, 192, 1)',
								'rgba(153, 102, 255, 1)',
								'rgba(255, 159, 64, 1)'
							],
							borderWidth: 1
						}
					]
				},
				options: {
					indexAxis: 'x', // Makes it horizontal bar chart
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						title: {
							display: true,
							text: 'Hours by Unit'
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
								text: 'Hours'
							}
						},
						y: {
							title: {
								display: true,
								text: 'Units'
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
					labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
					datasets: [
						{
							label: 'Hours',
							data: [6, 8, 7, 9, 5, 4, 3],
							fill: false,
							backgroundColor: 'rgba(54, 162, 235, 0.7)',
							borderColor: 'rgba(54, 162, 235, 1)',
							borderWidth: 3, // Slightly thicker line for better visibility
							tension: 0.4, // Increased from 0.1 to 0.4 for smoother curve
							pointBackgroundColor: 'rgba(54, 162, 235, 1)',
							pointBorderColor: '#fff',
							pointRadius: 6, // Slightly larger points
							pointHoverRadius: 8,
							pointBorderWidth: 2,
							cubicInterpolationMode: 'monotone' // Even smoother interpolation
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						title: {
							display: true,
							text: 'Weekly Hours Trend'
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
								text: 'Hours'
							},
							grid: {
								color: 'rgba(0, 0, 0, 0.1)'
							}
						},
						x: {
							title: {
								display: true,
								text: 'Days of Week'
							},
							grid: {
								color: 'rgba(0, 0, 0, 0.1)'
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

<h1 class="page-title">Study Dashboard <br> <span  class="sub-title">Detailed insights into your study patterns and progress.</span></h1>
<main style="margin-top: 4rem;">
	
	<div id="top" class="row g-4">
		<div class="col-md-3 col-sm-6 top-col card p-4 holographic-card">
			<h2>Semester Progress <Loader /></h2>
			<p>12%</p>
		</div>
		<div class="col-md-3 col-sm-6 top-col card p-4 holographic-card">
			<h2>Total Study Time <Timer /></h2>
			<p>10hrs</p>
		</div>
		<div class="col-md-3 col-sm-6 top-col card p-4 holographic-card">
			<h2>Average Study Effectiveness <Sparkles /></h2>
			<p>4.5</p>
		</div>
		<div class="col-md-3 col-sm-6 top-col card p-4 holographic-card">
			<h2>Upcoming Exams/Cats/ <CalendarCheck /></h2>
			<p>4</p>
		</div>
	</div>

	<br /><br /><br />

	<h1 style="color: teal;">Study Analytics</h1>
	<div id="top-2" class="row g-4 mt-4">
		<div class="col-md-6 top-col2 card p-4 rounded">
			<div class="chart-container" style="position: relative; height: 250px; width: 100%">
				<canvas bind:this={barChartRef}></canvas>
			</div>
		</div>
		<div class="col-md-6 top-col2 card p-4 rounded">
			<div class="chart-container" style="position: relative; height: 250px; width: 100%">
				<canvas bind:this={lineChartRef}></canvas>
			</div>
		</div>
	</div>
</main>

<style>
	.top-col {
		min-height: 8rem;
		display: flex;
		flex-direction: column;
	}
	.top-col2 {
		min-height: 20rem;
		display: flex;
		flex-direction: column;
	}

	.card {
		flex: 1; /* Makes cards fill available space equally */
		margin: 4px;
		width: 300px;
		height: 160px;
		align-items: center;
		border: 1px solid var(--purple);
	}

	p {
		font-size: 1.8rem;
		position: absolute;
		bottom: -1%;
	}

	h2 {
		font-size: larger;
	}
</style>
