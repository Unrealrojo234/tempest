// src/routes/api/topics/+server.js
import { json } from '@sveltejs/kit';
import pb from '$lib';

// Helper function to handle errors
function handleError(error, status = 500) {
	console.error('PocketBase Error:', error);
	return json({ error: error.message }, { status });
}

// GET: Fetch all topics or a specific topic by ID
export async function GET({ url }) {
	try {
		const id = url.searchParams.get('id');
		const courseId = url.searchParams.get('course');
		const expand = url.searchParams.get('expand') || '';

		if (id) {
			// Fetch a single topic by ID
			const record = await pb.collection('topics').getOne(id, {
				expand: expand
			});
			return json(record);
		} else {
			// Fetch all topics with optional filtering
			const page = parseInt(url.searchParams.get('page')) || 1;
			const perPage = parseInt(url.searchParams.get('perPage')) || 50;
			const filter = url.searchParams.get('filter') || '';

			// Build filter string
			let filterString = filter;
			if (courseId) {
				filterString = filterString
					? `${filterString} && course='${courseId}'`
					: `course='${courseId}'`;
			}

			const records = await pb.collection('topics').getList(page, perPage, {
				filter: filterString,
				sort: 'order', // Sort by order field
				expand: expand
			});

			return json(records);
		}
	} catch (error) {
		return handleError(error, 404);
	}
}

// POST: Create a new topic
export async function POST({ request }) {
	try {
		const data = await request.json();

		// Validate required fields
		if (!data.title || !data.course) {
			return json({ error: 'Title and course are required' }, { status: 400 });
		}

		// Verify the course exists
		try {
			await pb.collection('courses').getOne(data.course);
		} catch (error) {
			return json({ error: 'Course does not exist' }, { status: 400 });
		}

		// Calculate order if not provided
		if (data.order === undefined) {
			const existingTopics = await pb.collection('topics').getFullList({
				filter: `course='${data.course}'`,
				sort: '-order'
			});

			data.order = existingTopics.length > 0 ? existingTopics[0].order + 1 : 1;
		}

		// Set default values if not provided
		const topicData = {
			title: data.title,
			course: data.course,
			order: data.order,
			completed: data.completed !== undefined ? data.completed : false
		};

		const record = await pb.collection('topics').create(topicData);
		return json(record, { status: 201 });
	} catch (error) {
		return handleError(error);
	}
}

// PUT: Update an existing topic
export async function PUT({ request }) {
	try {
		const data = await request.json();

		if (!data.id) {
			return json({ error: 'ID is required for update' }, { status: 400 });
		}

		// If course is being updated, verify it exists
		if (data.course) {
			try {
				await pb.collection('courses').getOne(data.course);
			} catch (error) {
				return json({ error: 'Course does not exist' }, { status: 400 });
			}
		}

		const record = await pb.collection('topics').update(data.id, data);
		return json(record);
	} catch (error) {
		return handleError(error, 404);
	}
}

// PATCH: Update topic completion status
export async function PATCH({ request }) {
	try {
		const { id, completed } = await request.json();

		if (!id || completed === undefined) {
			return json({ error: 'ID and completed status are required' }, { status: 400 });
		}

		const data = { completed: completed };

		// Update the topic completion status
		const record = await pb.collection('topics').update(id, data);
		return json(record);
	} catch (error) {
		return handleError(error, 404);
	}
}

// DELETE: Remove a topic
export async function DELETE({ request }) {
	try {
		const { id } = await request.json();

		if (!id) {
			return json({ error: 'ID is required for deletion' }, { status: 400 });
		}

		await pb.collection('topics').delete(id);
		return json({ success: true, message: 'Topic deleted successfully' });
	} catch (error) {
		return handleError(error, 404);
	}
}
