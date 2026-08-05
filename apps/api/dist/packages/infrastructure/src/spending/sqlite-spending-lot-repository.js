function mapRow(row) {
    return {
        id: row.id,
        projectId: row.project_id,
        summaryEntryId: row.summary_entry_id,
        name: row.name,
        description: row.description,
        estimateAmount: row.estimate_amount,
        position: row.position,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    };
}
export class SqliteSpendingLotRepository {
    constructor(db) {
        this.db = db;
        this.insertStmt = db.prepare(`INSERT INTO project_spending_lots (project_id, summary_entry_id, name, description, estimate_amount, position, created_at, updated_at)
       VALUES (@project_id, @summary_entry_id, @name, @description, @estimate_amount, @position, @created_at, @updated_at)`);
        this.findByIdStmt = db.prepare('SELECT * FROM project_spending_lots WHERE id = ?');
        this.listByProjectStmt = db.prepare('SELECT * FROM project_spending_lots WHERE project_id = ? ORDER BY position ASC, id ASC');
        this.updateStmt = db.prepare(`UPDATE project_spending_lots SET
         summary_entry_id = COALESCE(@summary_entry_id, summary_entry_id),
         name = COALESCE(@name, name),
         description = COALESCE(@description, description),
         estimate_amount = COALESCE(@estimate_amount, estimate_amount),
         position = COALESCE(@position, position),
         updated_at = @updated_at
       WHERE id = @id`);
        this.deleteStmt = db.prepare('DELETE FROM project_spending_lots WHERE id = ?');
        this.maxPositionStmt = db.prepare('SELECT COALESCE(MAX(position), 0) as maxPos FROM project_spending_lots WHERE project_id = ?');
    }
    async listByProject(projectId) {
        const rows = this.listByProjectStmt.all(projectId);
        return rows.map(mapRow);
    }
    async findById(id) {
        const row = this.findByIdStmt.get(id);
        return row ? mapRow(row) : null;
    }
    async create(input) {
        const now = new Date().toISOString();
        const info = this.insertStmt.run({
            project_id: input.projectId,
            summary_entry_id: input.summaryEntryId ?? null,
            name: input.name,
            description: input.description,
            estimate_amount: input.estimateAmount,
            position: input.position,
            created_at: now,
            updated_at: now
        });
        const created = this.findByIdStmt.get(info.lastInsertRowid);
        if (!created)
            throw new Error('Failed to fetch created spending lot');
        return mapRow(created);
    }
    async update(input) {
        const existing = this.findByIdStmt.get(input.id);
        if (!existing)
            return null;
        this.updateStmt.run({
            id: input.id,
            summary_entry_id: input.summaryEntryId === undefined ? null : input.summaryEntryId,
            name: input.name ?? null,
            description: input.description ?? null,
            estimate_amount: input.estimateAmount ?? null,
            position: input.position ?? null,
            updated_at: new Date().toISOString()
        });
        const after = this.findByIdStmt.get(input.id);
        return after ? mapRow(after) : null;
    }
    async delete(id) {
        const result = this.deleteStmt.run(id);
        return result.changes > 0;
    }
    async getMaxPosition(projectId) {
        const row = this.maxPositionStmt.get(projectId);
        return row?.maxPos ?? 0;
    }
}
