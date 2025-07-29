import { test, expect } from '../../fixtures/baseTest';
import { TestDataFactory } from '../../../src/data/testDataFactory';
import { Endpoints } from '../../../src/constants/endpoints';

test.describe.serial('Integration Tests - End-to-End Workflows', { tag: ['@integration', '@regression'] }, () => {
    let sharedUserEmail: string;
    let sharedUserPassword: string;
    let sharedAuthToken: string;

    test.beforeAll(async ({ userContext, apiRequest, authContext }) => {
        // Create a shared user for integration tests
        TestDataFactory.populateUserContext(userContext);
        sharedUserEmail = userContext.getEmail();
        sharedUserPassword = userContext.getPassword();

        const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, {
            data: { email: sharedUserEmail, password: sharedUserPassword }
        });
        expect(signUpResponse.status()).toBe(200);

        // Login and store token
        await authContext.login(apiRequest, sharedUserEmail, sharedUserPassword);
        sharedAuthToken = authContext.getToken();
        expect(sharedAuthToken).toBeTruthy();
    });

    test('Complete user journey with multiple book operations', { tag: ['@integration', '@regression', '@tc-008'] }, async ({
        userContext,
        bookContext,
        authContext,
        apiRequest,
        cleanupContext
    }) => {
        TestDataFactory.populateUserContext(userContext);

        const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, {
            data: { email: userContext.getEmail(), password: userContext.getPassword() }
        });
        expect(signUpResponse.status()).toBe(200);

        cleanupContext.addObject(userContext.getEmail(), 'user');

        // Login and verify token
        await authContext.login(apiRequest, userContext.getEmail(), userContext.getPassword());
        const token = authContext.getToken();
        expect(token).toBeTruthy();

        // Create multiple books
        const books = [];
        for (let i = 0; i < 3; i++) {
            TestDataFactory.populateBookContext(bookContext);

            const bookData = {
                name: `${bookContext.getName()} ${i + 1}`,
                author: `${bookContext.getAuthor()} ${i + 1}`,
                published_year: bookContext.getPublishedYear() + i,
                book_summary: `${bookContext.getBookSummary()} ${i + 1}`,
            };

            const createResponse = await apiRequest.post(Endpoints.CREATE_BOOK, {
                data: bookData,
                headers: authContext.getAuthHeaders(),
            });
            expect(createResponse.status()).toBe(200);

            const createdBook = await createResponse.json();
            books.push(createdBook);

            cleanupContext.addObject(createdBook.id.toString(), 'book');
        }

        // Verify all books are in the list
        const getAllBooksResponse = await apiRequest.get(Endpoints.CREATE_BOOK, {
            headers: authContext.getAuthHeaders()
        });
        expect(getAllBooksResponse.status()).toBe(200);

        const allBooks = await getAllBooksResponse.json();
        expect(allBooks.length).toBeGreaterThanOrEqual(3);

        // Update all books
        for (let i = 0; i < books.length; i++) {
            const updatedData = {
                name: `${books[i].name} (Updated)`,
                author: `${books[i].author} (Updated)`,
                published_year: books[i].published_year + 1,
                book_summary: `${books[i].book_summary} (Updated)`,
            };

            const updateResponse = await apiRequest.put(Endpoints.UPDATE_BOOK(books[i].id), {
                data: updatedData,
                headers: authContext.getAuthHeaders(),
            });
            expect(updateResponse.status()).toBe(200);

            const updatedBook = await updateResponse.json();
            expect(updatedBook.name).toBe(updatedData.name);
        }

        // Delete all books
        for (const book of books) {
            const deleteResponse = await apiRequest.delete(Endpoints.DELETE_BOOK(book.id), {
                headers: authContext.getAuthHeaders(),
            });
            expect(deleteResponse.status()).toBe(200);

            const deleteResult = await deleteResponse.json();
            expect(deleteResult.message).toBe('Book deleted successfully');
        }

        // Verify books are deleted
        const finalBooksResponse = await apiRequest.get(Endpoints.CREATE_BOOK, {
            headers: authContext.getAuthHeaders()
        });
        expect(finalBooksResponse.status()).toBe(200);

        const finalBooks = await finalBooksResponse.json();
        for (const book of books) {
            const foundBook = finalBooks.find((b: any) => b.id === book.id);
            expect(foundBook).toBeUndefined();
        }
    });

    test('System state consistency after multiple operations', async ({
        userContext,
        bookContext,
        authContext,
        apiRequest,
        cleanupContext
    }) => {
        TestDataFactory.populateUserContext(userContext);

        const signUpResponse = await apiRequest.post(Endpoints.SIGNUP, {
            data: { email: userContext.getEmail(), password: userContext.getPassword() }
        });
        expect(signUpResponse.status()).toBe(200);
        cleanupContext.addObject(userContext.getEmail(), 'user');

        await authContext.login(apiRequest, userContext.getEmail(), userContext.getPassword());

        // Perform rapid create/update/delete operations
        const operations = [];
        for (let i = 0; i < 5; i++) {
            TestDataFactory.populateBookContext(bookContext);

            const bookData = {
                name: `Rapid Test Book ${i}`,
                author: `Author ${i}`,
                published_year: 2020 + i,
                book_summary: `Summary ${i}`,
            };

            // Create
            const createResponse = await apiRequest.post(Endpoints.CREATE_BOOK, {
                data: bookData,
                headers: authContext.getAuthHeaders(),
            });
            expect(createResponse.status()).toBe(200);

            const createdBook = await createResponse.json();
            operations.push({ type: 'create', book: createdBook });

            cleanupContext.addObject(createdBook.id.toString(), 'book');

            // Update
            const updateData = {
                name: `${bookData.name} (Updated)`,
                author: `${bookData.author} (Updated)`,
                published_year: bookData.published_year + 1,
                book_summary: `${bookData.book_summary} (Updated)`,
            };

            const updateResponse = await apiRequest.put(Endpoints.UPDATE_BOOK(createdBook.id), {
                data: updateData,
                headers: authContext.getAuthHeaders(),
            });
            expect(updateResponse.status()).toBe(200);

            operations.push({ type: 'update', book: createdBook });

            // Delete
            const deleteResponse = await apiRequest.delete(Endpoints.DELETE_BOOK(createdBook.id), {
                headers: authContext.getAuthHeaders(),
            });
            
            if (deleteResponse.status() !== 200) {
                console.log(`Delete failed for book ${createdBook.id}: ${deleteResponse.status()}`);
                const errorBody = await deleteResponse.text();
                console.log(`Error body: ${errorBody}`);
            }
            
            expect(deleteResponse.status()).toBe(200);

            operations.push({ type: 'delete', book: createdBook });
        }

        // Verify system state is consistent
        const finalBooksResponse = await apiRequest.get(Endpoints.CREATE_BOOK, {
            headers: authContext.getAuthHeaders()
        });
        expect(finalBooksResponse.status()).toBe(200);

        const finalBooks = await finalBooksResponse.json();

        // All books should be deleted
        for (const operation of operations) {
            if (operation.type === 'delete') {
                const foundBook = finalBooks.find((b: any) => b.id === operation.book.id);
                expect(foundBook).toBeUndefined();
            }
        }
    });

    test.afterEach(async ({ apiRequest, cleanupContext }) => {
        try {
            cleanupContext.sortByTimestamp();
            for (const [id, type] of cleanupContext.getObjects()) {
                if (type === 'book') {
                    await apiRequest.delete(Endpoints.DELETE_BOOK(id), {
                        headers: { Authorization: `Bearer ${sharedAuthToken}` }
                    });
                }
            }
        } catch (error) {
            console.error('Cleanup failed:', error);
            throw error;
        }
    });


}); 