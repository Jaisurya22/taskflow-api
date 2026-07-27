const db = require('../db');

const getProjects = async (req, res) => {
    let query = 'SELECT * FROM projects';
    let params = [];

    if (req.user.role !== 'admin') {
        query += ' WHERE user_id = $1';
        params.push(req.user.id);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
};

const createProject = async (req, res) => {
    const { title, description } = req.body;
    const result = await db.query(
        'INSERT INTO projects (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
        [title, description, req.user.id]
    );
    res.status(201).json(result.rows[0]);
};

const getProject = async (req, res) => {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM projects WHERE id = $1', [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
    }

    const project = result.rows[0];
    if (req.user.role !== 'admin' && project.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
};

const updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    const check = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && check.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
    }

    const result = await db.query(
        'UPDATE projects SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
        [title, description, id]
    );

    res.json(result.rows[0]);
};

const deleteProject = async (req, res) => {
    const { id } = req.params;

    const check = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (check.rows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && check.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
    }

    await db.query('DELETE FROM projects WHERE id = $1', [id]);
    res.status(204).send();
};

module.exports = {
    getProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject
};
