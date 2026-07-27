const db = require('../db');

const getTasks = async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
    SELECT t.* FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE (p.user_id = $1 OR $2 = 'admin')
  `;
    let params = [req.user.id, req.user.role];

    if (status) {
        query += ` AND t.status = $${params.length + 1}`;
        params.push(status);
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json(result.rows);
};

const createTask = async (req, res) => {
    const { title, status, due_date, project_id } = req.body;

    const projectCheck = await db.query('SELECT * FROM projects WHERE id = $1', [project_id]);
    if (projectCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && projectCheck.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied to project' });
    }

    const result = await db.query(
        'INSERT INTO tasks (title, status, due_date, project_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, status || 'pending', due_date, project_id]
    );
    res.status(201).json(result.rows[0]);
};

const getTask = async (req, res) => {
    const { id } = req.params;
    const result = await db.query(`
    SELECT t.* FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = $1 AND (p.user_id = $2 OR $3 = 'admin')
  `, [id, req.user.id, req.user.role]);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Task not found or access denied' });
    }
    res.json(result.rows[0]);
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, status, due_date } = req.body;

    const check = await db.query(`
    SELECT t.* FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = $1 AND (p.user_id = $2 OR $3 = 'admin')
  `, [id, req.user.id, req.user.role]);

    if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Task not found or access denied' });
    }

    const result = await db.query(
        'UPDATE tasks SET title = COALESCE($1, title), status = COALESCE($2, status), due_date = COALESCE($3, due_date) WHERE id = $4 RETURNING *',
        [title, status, due_date, id]
    );
    res.json(result.rows[0]);
};

const deleteTask = async (req, res) => {
    const { id } = req.params;

    const check = await db.query(`
    SELECT t.* FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = $1 AND (p.user_id = $2 OR $3 = 'admin')
  `, [id, req.user.id, req.user.role]);

    if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Task not found or access denied' });
    }

    await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.status(204).send();
};

module.exports = {
    getTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask
};
