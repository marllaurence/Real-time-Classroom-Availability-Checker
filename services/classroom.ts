import { runQuery, runTransaction } from '../db/database';

// ADD CLASSROOM
export const addClassroom = async (name: string, capacity: string, type: string, equipment: string) => {
  try {
    if (!name || !capacity || !type) return { success: false, message: 'All fields required' };
    const existing = runQuery('SELECT * FROM classrooms WHERE name = ?', [name]);
    if (existing.length > 0) return { success: false, message: 'Name exists' };

    runTransaction(
      'INSERT INTO classrooms (name, capacity, type, status, equipment) VALUES (?, ?, ?, "Available", ?)',
      [name, parseInt(capacity), type, equipment]
    );
    return { success: true };
  } catch (error) { return { success: false, message: '' + error }; }
};

// GET CLASSROOMS
export const getClassrooms = () => {
  try { return runQuery('SELECT * FROM classrooms ORDER BY name ASC'); } catch (error) { return []; }
};

// DELETE CLASSROOM
export const deleteClassroom = (id: number) => {
  try {
    runTransaction('DELETE FROM classrooms WHERE id = ?', [id]);
    return { success: true };
  } catch (error) { return { success: false, message: '' + error }; }
};

// UPDATE CLASSROOM
export const updateClassroom = (id: number, name: string, capacity: string, type: string, status: string, equipment: string) => {
  try {
    runTransaction(
      'UPDATE classrooms SET name = ?, capacity = ?, type = ?, status = ?, equipment = ? WHERE id = ?',
      [name, parseInt(capacity), type, status, equipment, id]
    );
    return { success: true };
  } catch (error) { return { success: false, message: '' + error }; }
};