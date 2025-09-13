import pb from '$lib';
import { json } from '@sveltejs/kit';

// Helper function to handle errors
function handleError(error, status = 500) {
	console.error('PocketBase Error:', error);
	return json({ error: error.message }, { status });
}

// Helper function to deactivate all semesters
async function deactivateAllSemesters() {
	try {
		// Get all active semesters
		const activeSemesters = await pb.collection('semesters').getFullList({
			filter: 'is_active = true'
		});

		// Deactivate each one
		for (const semester of activeSemesters) {
			await pb.collection('semesters').update(semester.id, {
				is_active: false
			});
		}
	} catch (error) {
		console.error('Error deactivating semesters:', error);
		throw error;
	}
}

// GET: Fetch all semesters or a specific semester by ID
export async function GET({ url }) {
	try {
		const id = url.searchParams.get('id');

		if (id) {
			// Fetch a single semester by ID
			const record = await pb.collection('semesters').getOne(id);
			return json(record);
		} else {
			// Fetch all semesters with optional filtering
			const page = parseInt(url.searchParams.get('page')) || 1;
			const perPage = parseInt(url.searchParams.get('perPage')) || 20;
			const filter = url.searchParams.get('filter') || '';

			const records = await pb.collection('semesters').getList(page, perPage, {
				filter,
				sort: '-created'
			});

			return json(records);
		}
	} catch (error) {
		return handleError(error, 404);
	}
}

// POST: Create a new semester
export async function POST({ request }) {
	try {
		const data = await request.json();

		// Validate required fields
		if (!data.name || !data.start_date) {
			return json({ error: 'Name and start_date are required' }, { status: 400 });
		}

		// Set default values if not provided
		const semesterData = {
			name: data.name,
			start_date: data.start_date,
			end_date: data.end_date || null,
			is_active: data.is_active !== undefined ? data.is_active : true,
			completed: data.completed !== undefined ? data.completed : false
		};

		if (semesterData.is_active) {
			await deactivateAllSemesters();
		}

		const record = await pb.collection('semesters').create(semesterData);
		return json(record, { status: 201 });
	} catch (error) {
		return handleError(error);
	}
}

// PUT: Update an existing semester
export async function PUT({ request }) {
	try {
		const data = await request.json();

		if (!data.id) {
			return json({ error: 'ID is required for update' }, { status: 400 });
		}

		if (data.is_active) {
			await deactivateAllSemesters();
		}

		const record = await pb.collection('semesters').update(data.id, data);
		return json(record);
	} catch (error) {
		return handleError(error, 404);
	}
}

// DELETE: Remove a semester
export async function DELETE({ request }) {
	try {
		const { id } = await request.json();

		if (!id) {
			return json({ error: 'ID is required for deletion' }, { status: 400 });
		}

		await pb.collection('semesters').delete(id);
		return json({ success: true, message: 'Semester deleted successfully' });
	} catch (error) {
		return handleError(error, 404);
	}
}
