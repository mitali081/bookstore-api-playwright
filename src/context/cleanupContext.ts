export type ObjectEntry = [string, string, number]; // [id, type, timestamp]

export class CleanupContext {
  private objectIds: ObjectEntry[] = [];
  private deletedBookId: number | null = null;

  addObject(id: string, type: string): void {
    this.objectIds.push([id, type, Date.now()]);
  }

  addDeletedBookId(id: number): void {
    this.deletedBookId = id;
  }

  getDeletedBookId(): number | null {
    return this.deletedBookId;
  }

  getObjects(): ObjectEntry[] {
    return [...this.objectIds];
  }

  clear(): void {
    this.objectIds = [];
    this.deletedBookId = null;
  }

  sortByTimestamp(): void {
    this.objectIds.sort((a, b) => a[2] - b[2]);
  }
} 