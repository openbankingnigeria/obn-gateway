import { auditLogErrors } from './auditLogs.errors';

describe('auditLogErrors', () => {
  describe('logWithIdNotFound', () => {
    it('should return correct error message for a valid ID', () => {
      const id = 'test-audit-log-id';
      const result = auditLogErrors.logWithIdNotFound(id);
      
      expect(result).toBe('Log with ID - "test-audit-log-id" not found.');
    });

    it('should return correct error message for a UUID', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const result = auditLogErrors.logWithIdNotFound(id);
      
      expect(result).toBe('Log with ID - "123e4567-e89b-12d3-a456-426614174000" not found.');
    });

    it('should return correct error message for a numeric ID', () => {
      const id = '12345';
      const result = auditLogErrors.logWithIdNotFound(id);
      
      expect(result).toBe('Log with ID - "12345" not found.');
    });

    it('should handle empty string ID', () => {
      const id = '';
      const result = auditLogErrors.logWithIdNotFound(id);
      
      expect(result).toBe('Log with ID - "" not found.');
    });

    it('should handle ID with special characters', () => {
      const id = 'log-id-with-special@chars#$%';
      const result = auditLogErrors.logWithIdNotFound(id);
      
      expect(result).toBe('Log with ID - "log-id-with-special@chars#$%" not found.');
    });

    it('should handle ID with spaces', () => {
      const id = 'log id with spaces';
      const result = auditLogErrors.logWithIdNotFound(id);
      
      expect(result).toBe('Log with ID - "log id with spaces" not found.');
    });

    it('should handle ID with quotes', () => {
      const id = 'log"id\'with"quotes';
      const result = auditLogErrors.logWithIdNotFound(id);
      
      expect(result).toBe('Log with ID - "log"id\'with"quotes" not found.');
    });

    it('should handle very long ID', () => {
      const id = 'a'.repeat(100);
      const result = auditLogErrors.logWithIdNotFound(id);
      
      expect(result).toBe(`Log with ID - "${id}" not found.`);
      expect(result).toContain(id);
    });

    it('should handle ID with newlines and tabs', () => {
      const id = 'log\nid\twith\nspecial\tcharacters';
      const result = auditLogErrors.logWithIdNotFound(id);
      
      expect(result).toBe('Log with ID - "log\nid\twith\nspecial\tcharacters" not found.');
    });

    it('should handle ID with unicode characters', () => {
      const id = 'log-id-with-unicode-🚀-characters';
      const result = auditLogErrors.logWithIdNotFound(id);
      
      expect(result).toBe('Log with ID - "log-id-with-unicode-🚀-characters" not found.');
    });
  });

  describe('error message structure', () => {
    it('should always include the provided ID in quotes', () => {
      const testIds = ['simple', '123', 'complex-id-123', ''];
      
      testIds.forEach(id => {
        const result = auditLogErrors.logWithIdNotFound(id);
        expect(result).toContain(`"${id}"`);
      });
    });

    it('should always start with "Log with ID - "', () => {
      const testIds = ['test1', 'test2', 'test3'];
      
      testIds.forEach(id => {
        const result = auditLogErrors.logWithIdNotFound(id);
        expect(result).toMatch(/^Log with ID - "/);
      });
    });

    it('should always end with " not found."', () => {
      const testIds = ['test1', 'test2', 'test3'];
      
      testIds.forEach(id => {
        const result = auditLogErrors.logWithIdNotFound(id);
        expect(result).toMatch(/" not found\.$/);
      });
    });

    it('should have consistent message format', () => {
      const id = 'consistent-test-id';
      const result = auditLogErrors.logWithIdNotFound(id);
      
      expect(result).toMatch(/^Log with ID - ".+" not found\.$/);
    });
  });
});