export interface CreateBookRequest {
  name: string | null;
  author: string | null;
  published_year: number | null;
  book_summary: string | null;
}
