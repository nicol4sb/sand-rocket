import { Database } from 'better-sqlite3';
import { CreateSpendingLotInput, SpendingLot, SpendingLotRepository, UpdateSpendingLotInput } from '@sandrocket/core';
export declare class SqliteSpendingLotRepository implements SpendingLotRepository {
    private readonly db;
    private readonly insertStmt;
    private readonly findByIdStmt;
    private readonly listByProjectStmt;
    private readonly updateStmt;
    private readonly deleteStmt;
    private readonly maxPositionStmt;
    constructor(db: Database);
    listByProject(projectId: number): Promise<SpendingLot[]>;
    findById(id: number): Promise<SpendingLot | null>;
    create(input: CreateSpendingLotInput): Promise<SpendingLot>;
    update(input: UpdateSpendingLotInput): Promise<SpendingLot | null>;
    delete(id: number): Promise<boolean>;
    getMaxPosition(projectId: number): Promise<number>;
}
