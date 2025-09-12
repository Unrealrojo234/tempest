import { json, error } from '@sveltejs/kit';
import pb from '$lib';

// Helper function to get study hours by course
async function getStudyDataForBarChart() {
	try {
		const courses = await pb.collection('courses').getFullList({
			sort: 'name'
		});
		const studySessions = await pb.collection('study_sessions').getFullList({
			sort: 'start_time',
			expand: 'course'
		});

		const courseDurationMap = new Map();
		courses.forEach((course) => {
			courseDurationMap.set(course.id, {
				courseName: course.name,
				duration: 0
			});
		});

		studySessions.forEach((session) => {
			const courseId = session.course;
			if (courseDurationMap.has(courseId)) {
				courseDurationMap.get(courseId).duration += session.duration;
			}
		});

		const chartData = {
			labels: [],
			datasets: [
				{
					label: 'Study Duration (minutes)',
					data: [],
					backgroundColor: '#00a0a0', // tealLight
					borderColor: '#008080', // teal
					borderWidth: 1,
					borderRadius: 4,
					hoverBackgroundColor: '#20b2b2' // tealLighter
				}
			]
		};

		courseDurationMap.forEach((value) => {
			chartData.labels.push(value.courseName);
			chartData.datasets[0].data.push(value.duration / 60); // Convert seconds to minutes
		});

		return chartData;
	} catch (err) {
		console.error('Error fetching study data for bar chart:', err);
		throw error(500, 'Failed to fetch course study data');
	}
}

// Helper function to get weekly study hours
async function getStudyDataForLineChart() {
	try {
		const studySessions = await pb.collection('study_sessions').getFullList({
			sort: 'start_time'
		});

		const today = new Date();
		const days = Array(7)
			.fill(0)
			.map((_, i) => {
				const date = new Date(today);
				date.setDate(today.getDate() - i);
				return date.toISOString().split('T')[0];
			})
			.reverse();

		const durationByDay = new Map(days.map((day) => [day, 0]));
		studySessions.forEach((session) => {
			const sessionDate = new Date(session.start_time).toISOString().split('T')[0];
			if (durationByDay.has(sessionDate)) {
				durationByDay.set(sessionDate, durationByDay.get(sessionDate) + session.duration);
			}
		});

		const chartData = {
			labels: days.map((day) => new Date(day).toLocaleDateString('en-US', { weekday: 'short' })),
			datasets: [
				{
					label: 'Study Minutes',
					data: days.map((day) => (durationByDay.get(day) || 0) / 60),
					fill: true,
					backgroundColor: 'rgba(132, 94, 194, 0.2)', // purple with opacity
					borderColor: '#845ec2', // purple
					borderWidth: 3,
					tension: 0.4,
					pointBackgroundColor: '#845ec2',
					pointBorderColor: '#fff',
					pointRadius: 5,
					pointHoverRadius: 7,
					pointBorderWidth: 2
				}
			]
		};

		return chartData;
	} catch (err) {
		console.error('Error fetching study data for line chart:', err);
		throw error(500, 'Failed to fetch weekly study data');
	}
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const endpoint = url.pathname.split('/').pop();

	if (endpoint === 'courses') {
		const data = await getStudyDataForBarChart();
		return json(data);
	}

	if (endpoint === 'weekly') {
		const data = await getStudyDataForLineChart();
		return json(data);
	}

	throw error(404, 'Endpoint not found');
}
