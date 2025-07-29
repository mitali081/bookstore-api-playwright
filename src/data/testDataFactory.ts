import { BookDataContext } from '../context/bookDataContext';
import { UserDataContext } from '../context/userDataContext';

export class TestDataFactory {
  private static emailCounter = 0;

  /**
   * Generates a unique email address for testing
   */
  public static generateUniqueEmail(): string {
    this.emailCounter++;
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `test-${timestamp}-${random}@example.com`;
  }

  /**
   * Creates a standard test user with valid credentials
   */
  public static createTestUser(): {
    email: string;
    password: string;
  } {
    return {
      email: this.generateUniqueEmail(),
      password: 'StrongPassword123!',
    };
  }

  /**
   * Creates a standard test book with valid data
   */
  public static createTestBook(): {
    name: string;
    author: string;
    published_year: number;
    book_summary: string;
  } {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return {
      name: `Test Book ${timestamp}_${random}`,
      author: `Test Author ${timestamp}_${random}`,
      published_year: 2024,
      book_summary: `Test book summary ${timestamp}_${random}`,
    };
  }

  /**
   * Creates a test book with specific data
   */
  public static createTestBookWithData(data: {
    name?: string;
    author?: string;
    published_year?: number;
    book_summary?: string;
  }): {
    name: string;
    author: string;
    published_year: number;
    book_summary: string;
  } {
    const defaultBook = this.createTestBook();
    return {
      name: data.name || defaultBook.name,
      author: data.author || defaultBook.author,
      published_year: data.published_year || defaultBook.published_year,
      book_summary: data.book_summary || defaultBook.book_summary,
    };
  }

  /**
   * Populates a BookDataContext with test data
   */
  public static populateBookContext(bookContext: BookDataContext, bookData?: {
    name?: string;
    author?: string;
    published_year?: number;
    book_summary?: string;
  }): void {
    const defaultBook = this.createTestBook();
    bookContext.setBookData({
      name: bookData?.name || defaultBook.name,
      author: bookData?.author || defaultBook.author,
      publishedYear: bookData?.published_year || defaultBook.published_year,
      bookSummary: bookData?.book_summary || defaultBook.book_summary,
    });
  }

  /**
   * Populates a UserDataContext with test data
   */
  public static populateUserContext(userContext: UserDataContext, userData?: {
    email?: string;
    password?: string;
  }): void {
    const defaultUser = this.createTestUser();
    userContext.setUserData({
      email: userData?.email || defaultUser.email,
      password: userData?.password || defaultUser.password,
    });
  }

  /**
   * Creates invalid test data for negative testing
   */
  public static createInvalidBookData(): {
    name: string;
    author: string;
    published_year: number;
    book_summary: string;
  } {
    return {
      name: '',
      author: '',
      published_year: -1,
      book_summary: '',
    };
  }

  /**
   * Creates invalid user data for negative testing
   */
  public static createInvalidUserData(): {
    email: string;
    password: string;
  } {
    return {
      email: 'invalid-email',
      password: '123',
    };
  }

  /**
   * Creates a list of test books for bulk operations
   */
  public static createTestBooks(count: number = 3): Array<{
    name: string;
    author: string;
    published_year: number;
    book_summary: string;
  }> {
    const books = [];
    for (let i = 1; i <= count; i++) {
      books.push({
        name: `Test Book ${i} ${Date.now()}`,
        author: `Test Author ${i} ${Date.now()}`,
        published_year: 2020 + i,
        book_summary: `Test book summary ${i} ${Date.now()}`,
      });
    }
    return books;
  }

  /**
   * Creates a list of test users for bulk operations
   */
  public static createTestUsers(count: number = 3): Array<{
    email: string;
    password: string;
  }> {
    const users = [];
    for (let i = 1; i <= count; i++) {
      users.push({
        email: this.generateUniqueEmail(),
        password: 'StrongPassword123!',
      });
    }
    return users;
  }

  /**
   * Creates test data for edge cases
   */
  public static createEdgeCaseBookData(): {
    name: string;
    author: string;
    published_year: number;
    book_summary: string;
  } {
    return {
      name: 'A'.repeat(1000),
      author: 'B'.repeat(500),
      published_year: 9999,
      book_summary: 'C'.repeat(2000),
    };
  }

  /**
   * Creates test data for special characters
   */
  public static createSpecialCharacterBookData(): {
    name: string;
    author: string;
    published_year: number;
    book_summary: string;
  } {
    return {
      name: 'Test Book with Special Chars: !@#$%^&*()',
      author: 'Author with Unicode: José María García',
      published_year: 2024,
      book_summary: 'Summary with emojis: 📚📖✨ and symbols: ©®™',
    };
  }
} 