// src/routes/api/courses/+server.js
import { json } from '@sveltejs/kit';
import pb from '$lib';

// Helper function to handle errors
function handleError(error, status = 500) {
  console.error('PocketBase Error:', error);
  return json({ error: error.message }, { status });
}

// GET: Fetch all courses or a specific course by ID
export async function GET({ url }) {
  try {
    const id = url.searchParams.get('id');
    const semesterId = url.searchParams.get('semester');
    const expand = url.searchParams.get('expand') || '';
    
    if (id) {
      // Fetch a single course by ID
      const record = await pb.collection('courses').getOne(id, {
        expand: expand
      });
      return json(record);
    } else {
      // Fetch all courses with optional filtering
      const page = parseInt(url.searchParams.get('page')) || 1;
      const perPage = parseInt(url.searchParams.get('perPage')) || 20;
      const filter = url.searchParams.get('filter') || '';
      
      // Build filter string
      let filterString = filter;
      if (semesterId) {
        filterString = filterString ? `${filterString} && semester='${semesterId}'` : `semester='${semesterId}'`;
      }
      
      const records = await pb.collection('courses').getList(page, perPage, {
        filter: filterString,
        sort: '-created',
        expand: expand
      });
      
      return json(records);
    }
  } catch (error) {
    return handleError(error, 404);
  }
}

// POST: Create a new course
export async function POST({ request }) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.code || !data.semester) {
      return json({ error: 'Name, code, and semester are required' }, { status: 400 });
    }
    
    // Verify the semester exists
    try {
      await pb.collection('semesters').getOne(data.semester);
    } catch (error) {
      return json({ error: 'Semester does not exist' }, { status: 400 });
    }
    
    // Set default values if not provided
    const courseData = {
      name: data.name,
      code: data.code,
      semester: data.semester,
      description: data.description || ''
    };
    
    const record = await pb.collection('courses').create(courseData);
    return json(record, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// PUT: Update an existing course
export async function PUT({ request }) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return json({ error: 'ID is required for update' }, { status: 400 });
    }
    
    // If semester is being updated, verify it exists
    if (data.semester) {
      try {
        await pb.collection('semesters').getOne(data.semester);
      } catch (error) {
        return json({ error: 'Semester does not exist' }, { status: 400 });
      }
    }
    
    const record = await pb.collection('courses').update(data.id, data);
    return json(record);
  } catch (error) {
    return handleError(error, 404);
  }
}

// DELETE: Remove a course
export async function DELETE({ request }) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return json({ error: 'ID is required for deletion' }, { status: 400 });
    }
    

    
    await pb.collection('courses').delete(id);
    return json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    return handleError(error, 404);
  }
}