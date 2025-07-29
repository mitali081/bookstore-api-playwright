export class BookDataContext {
  private id: number = 0;
  private name: string = '';
  private author: string = '';
  private publishedYear: number = 0;
  private bookSummary: string = '';

  public setId(value: number): void {
    this.id = value;
  }

  public getId(): number {
    return this.id;
  }

  public setName(value: string): void {
    this.name = value;
  }

  public getName(): string {
    return this.name;
  }

  public setAuthor(value: string): void {
    this.author = value;
  }

  public getAuthor(): string {
    return this.author;
  }

  public setPublishedYear(value: number): void {
    this.publishedYear = value;
  }

  public getPublishedYear(): number {
    return this.publishedYear;
  }

  public setBookSummary(value: string): void {
    this.bookSummary = value;
  }

  public getBookSummary(): string {
    return this.bookSummary;
  }

  public clear(): void {
    this.id = 0;
    this.name = '';
    this.author = '';
    this.publishedYear = 0;
    this.bookSummary = '';
  }

  // Helper method to get all book data as an object
  public getBookData(): {
    id: number;
    name: string;
    author: string;
    publishedYear: number;
    bookSummary: string;
  } {
    return {
      id: this.id,
      name: this.name,
      author: this.author,
      publishedYear: this.publishedYear,
      bookSummary: this.bookSummary,
    };
  }

  // Helper method to set all book data from an object
  public setBookData(data: {
    id?: number;
    name?: string;
    author?: string;
    publishedYear?: number;
    bookSummary?: string;
  }): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.name !== undefined) this.name = data.name;
    if (data.author !== undefined) this.author = data.author;
    if (data.publishedYear !== undefined) this.publishedYear = data.publishedYear;
    if (data.bookSummary !== undefined) this.bookSummary = data.bookSummary;
  }
}