import DatabaseClient from '../src/dal/client.ts'; // Adjust the import path as needed

// Mock pg.Client
const mockClient = {
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn(),
};

jest.mock('pg', () => {
  return { Client: jest.fn(() => mockClient) };
});

describe('DatabaseClient', () => {
  const config = {
    host: 'localhost',
    port: 5432,
    user: 'testuser',
    password: 'testpassword',
    database: 'testdb',
    url: 'postgres://testuser:testpassword@localhost:5432/testdb',
  };

  let dbClient: DatabaseClient;

  beforeEach(() => {
    dbClient = new DatabaseClient(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect, execute query, and disconnect', async () => {
    const mockQueryResult = { rows: [{ id: 1, name: 'Test' }] };
    mockClient.query.mockResolvedValueOnce(mockQueryResult);

    const result = await dbClient.query(
      'SELECT * FROM test_table WHERE id = $1',
      [1],
    );

    expect(mockClient.connect).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      'SELECT * FROM test_table WHERE id = $1',
      [1],
    );
    expect(mockClient.end).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockQueryResult);
  });

  it('should disconnect even if query throws an error', async () => {
    const mockError = new Error('Test error');
    mockClient.query.mockRejectedValueOnce(mockError);

    await expect(
      dbClient.query('SELECT * FROM test_table WHERE id = $1', [1]),
    ).rejects.toThrow('Test error');

    expect(mockClient.connect).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(
      'SELECT * FROM test_table WHERE id = $1',
      [1],
    );
    expect(mockClient.end).toHaveBeenCalledTimes(1);
  });
});
