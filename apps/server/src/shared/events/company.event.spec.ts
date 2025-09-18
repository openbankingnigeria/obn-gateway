import { Company, User } from '@common/database/entities';
import { CompanyBuilder, UserBuilder } from '@test/utils/builders';
import {
  CompanyEvent,
  CompanyEvents,
  CompanyApprovedEvent,
  CompanyKybSubmittedEvent,
  CompanyDeniedEvent,
} from './company.event';
import { BaseEvent } from './base.event';

describe('Company Events', () => {
  let mockUser: User;
  let mockCompany: Company;

  beforeEach(() => {
    mockUser = new UserBuilder({
      id: 'user-id',
      email: 'test@example.com',
    }).build();

    mockCompany = new CompanyBuilder()
      .with('id', 'company-id')
      .with('name', 'Test Company')
      .build();
  });

  describe('CompanyEvents enum', () => {
    it('should define all company event types', () => {
      expect(CompanyEvents.COMPANY_KYB_APPROVED).toBe('company.kyb.approved');
      expect(CompanyEvents.COMPANY_KYB_DENIED).toBe('company.kyb.denied');
      expect(CompanyEvents.COMPANY_KYB_SUBMITTED).toBe('company.kyb.submitted');
    });
  });

  describe('BaseEvent', () => {
    it('should create base event with required properties', () => {
      const event = new BaseEvent('test.event', mockUser, { test: 'data' });

      expect(event.name).toBe('test.event');
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual({ test: 'data' });
    });

    it('should create base event without metadata', () => {
      const event = new BaseEvent('test.event', mockUser);

      expect(event.name).toBe('test.event');
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toBeUndefined();
    });

    it('should create base event with null author', () => {
      const event = new BaseEvent('test.event', null);

      expect(event.name).toBe('test.event');
      expect(event.author).toBeNull();
    });
  });

  describe('CompanyEvent', () => {
    it('should create company event with all properties', () => {
      const metadata = { source: 'admin', timestamp: Date.now() };
      const event = new CompanyEvent(
        'custom.company.event',
        mockUser,
        mockCompany,
        metadata,
      );

      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe('custom.company.event');
      expect(event.author).toBe(mockUser);
      expect(event.company).toBe(mockCompany);
      expect(event.metadata).toEqual(metadata);
    });

    it('should create company event without metadata', () => {
      const event = new CompanyEvent(
        'custom.company.event',
        mockUser,
        mockCompany,
      );

      expect(event.name).toBe('custom.company.event');
      expect(event.author).toBe(mockUser);
      expect(event.company).toBe(mockCompany);
      expect(event.metadata).toBeUndefined();
    });

    it('should inherit from BaseEvent', () => {
      const event = new CompanyEvent('test.event', mockUser, mockCompany);

      expect(event).toBeInstanceOf(BaseEvent);
      expect(event).toBeInstanceOf(CompanyEvent);
    });
  });

  describe('CompanyApprovedEvent', () => {
    it('should create approved event with required properties', () => {
      const metadata = { approvedBy: 'admin', approvalDate: Date.now() };
      const event = new CompanyApprovedEvent(mockUser, mockCompany, metadata);

      expect(event).toBeInstanceOf(CompanyEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(CompanyEvents.COMPANY_KYB_APPROVED);
      expect(event.author).toBe(mockUser);
      expect(event.company).toBe(mockCompany);
      expect(event.metadata).toEqual(metadata);
    });

    it('should create approved event with default metadata', () => {
      const event = new CompanyApprovedEvent(mockUser, mockCompany);

      expect(event.name).toBe(CompanyEvents.COMPANY_KYB_APPROVED);
      expect(event.author).toBe(mockUser);
      expect(event.company).toBe(mockCompany);
      expect(event.metadata).toEqual({});
    });

    it('should handle empty metadata object', () => {
      const event = new CompanyApprovedEvent(mockUser, mockCompany, {});

      expect(event.metadata).toEqual({});
    });
  });

  describe('CompanyKybSubmittedEvent', () => {
    it('should create KYB submitted event with required properties', () => {
      const metadata = { submissionId: 'sub-123', documentsCount: 5 };
      const event = new CompanyKybSubmittedEvent(
        mockUser,
        mockCompany,
        metadata,
      );

      expect(event).toBeInstanceOf(CompanyEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(CompanyEvents.COMPANY_KYB_SUBMITTED);
      expect(event.author).toBe(mockUser);
      expect(event.company).toBe(mockCompany);
      expect(event.metadata).toEqual(metadata);
    });

    it('should create KYB submitted event with default metadata', () => {
      const event = new CompanyKybSubmittedEvent(mockUser, mockCompany);

      expect(event.name).toBe(CompanyEvents.COMPANY_KYB_SUBMITTED);
      expect(event.author).toBe(mockUser);
      expect(event.company).toBe(mockCompany);
      expect(event.metadata).toEqual({});
    });

    it('should handle minimal metadata', () => {
      const minimalMetadata = { submissionId: 'sub-456' };
      const event = new CompanyKybSubmittedEvent(
        mockUser,
        mockCompany,
        minimalMetadata,
      );

      expect(event.metadata).toEqual(minimalMetadata);
      expect(event.metadata.submissionId).toBe('sub-456');
    });
  });

  describe('CompanyDeniedEvent', () => {
    const mockDeniedMetadata = {
      reason: 'Incomplete documentation',
      deniedBy: 'admin-user',
      timestamp: Date.now(),
    };

    it('should create denied event with required properties', () => {
      const event = new CompanyDeniedEvent(
        mockUser,
        mockCompany,
        mockDeniedMetadata,
      );

      expect(event).toBeInstanceOf(CompanyEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(CompanyEvents.COMPANY_KYB_DENIED);
      expect(event.author).toBe(mockUser);
      expect(event.company).toBe(mockCompany);
      expect(event.metadata).toEqual(mockDeniedMetadata);
    });

    it('should require reason in metadata', () => {
      const metadata = { reason: 'Invalid business registration' };
      const event = new CompanyDeniedEvent(mockUser, mockCompany, metadata);

      expect(event.metadata.reason).toBe('Invalid business registration');
    });

    it('should handle additional metadata along with reason', () => {
      const metadata = {
        reason: 'Failed verification',
        details: 'Could not verify business address',
        reviewerId: 'reviewer-123',
      };
      const event = new CompanyDeniedEvent(mockUser, mockCompany, metadata);

      expect(event.metadata.reason).toBe('Failed verification');
      expect(event.metadata.details).toBe('Could not verify business address');
      expect(event.metadata.reviewerId).toBe('reviewer-123');
    });
  });

  describe('Event inheritance and polymorphism', () => {
    it('should allow treating all events as CompanyEvent instances', () => {
      const events = [
        new CompanyApprovedEvent(mockUser, mockCompany, { approved: true }),
        new CompanyKybSubmittedEvent(mockUser, mockCompany, {
          submitted: true,
        }),
        new CompanyDeniedEvent(mockUser, mockCompany, {
          reason: 'test reason',
        }),
      ];

      events.forEach((event) => {
        expect(event).toBeInstanceOf(CompanyEvent);
        expect(event).toBeInstanceOf(BaseEvent);
        expect(event.author).toBe(mockUser);
        expect(event.company).toBe(mockCompany);
        expect(typeof event.name).toBe('string');
        expect(event.metadata).toBeDefined();
      });
    });

    it('should allow treating all events as BaseEvent instances', () => {
      const events = [
        new CompanyEvent('custom.event', mockUser, mockCompany),
        new CompanyApprovedEvent(mockUser, mockCompany),
        new CompanyKybSubmittedEvent(mockUser, mockCompany),
      ];

      events.forEach((event) => {
        expect(event).toBeInstanceOf(BaseEvent);
        expect(event.author).toBe(mockUser);
        expect(event.name).toBeDefined();
      });
    });
  });

  describe('Event metadata handling', () => {
    it('should preserve metadata structure for complex objects', () => {
      const complexMetadata = {
        company: { id: 'comp-123', type: 'LLC' },
        kyb: { status: 'approved', score: 95 },
        timestamp: Date.now(),
        flags: { isFirstApproval: true, requiresNotification: false },
      };

      const event = new CompanyApprovedEvent(
        mockUser,
        mockCompany,
        complexMetadata,
      );

      expect(event.metadata).toEqual(complexMetadata);
      expect(event.metadata.company.id).toBe('comp-123');
      expect(event.metadata.flags.isFirstApproval).toBe(true);
    });

    it('should handle null and undefined metadata gracefully', () => {
      const event1 = new CompanyApprovedEvent(
        mockUser,
        mockCompany,
        null as any,
      );
      const event2 = new CompanyApprovedEvent(mockUser, mockCompany, undefined);

      expect(event1.metadata).toBeNull();
      expect(event2.metadata).toEqual({});
    });
  });

  describe('Company and User property consistency', () => {
    it('should maintain user and company references across different event types', () => {
      const approvedEvent = new CompanyApprovedEvent(mockUser, mockCompany);
      const submittedEvent = new CompanyKybSubmittedEvent(
        mockUser,
        mockCompany,
      );
      const deniedEvent = new CompanyDeniedEvent(mockUser, mockCompany, {
        reason: 'test',
      });

      expect(approvedEvent.author).toBe(mockUser);
      expect(approvedEvent.company).toBe(mockCompany);
      expect(submittedEvent.author).toBe(mockUser);
      expect(submittedEvent.company).toBe(mockCompany);
      expect(deniedEvent.author).toBe(mockUser);
      expect(deniedEvent.company).toBe(mockCompany);
    });

    it('should handle different company instances correctly', () => {
      const company1 = new CompanyBuilder().with('id', 'company-1').build();
      const company2 = new CompanyBuilder().with('id', 'company-2').build();

      const event1 = new CompanyApprovedEvent(mockUser, company1);
      const event2 = new CompanyApprovedEvent(mockUser, company2);

      expect(event1.company).toBe(company1);
      expect(event2.company).toBe(company2);
      expect(event1.company).not.toBe(event2.company);
    });

    it('should handle different user instances correctly', () => {
      const user1 = new UserBuilder().with('id', 'user-1').build();
      const user2 = new UserBuilder().with('id', 'user-2').build();

      const event1 = new CompanyApprovedEvent(user1, mockCompany);
      const event2 = new CompanyApprovedEvent(user2, mockCompany);

      expect(event1.author).toBe(user1);
      expect(event2.author).toBe(user2);
      expect(event1.author).not.toBe(event2.author);
    });
  });
});
