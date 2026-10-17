import { AuditLog } from '../../types';

export type DomainEventType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'STEP_READY'
  | 'STEP_STARTED'
  | 'STEP_COMPLETED'
  | 'STEP_BLOCKED'
  | 'QC_FAILED'
  | 'WORKFLOW_CHANGED';

export interface DomainEvent<T = any> {
  type: DomainEventType;
  timestamp: string;
  actorId: string;
  payload: T;
}

export interface IObserver {
  onEvent(event: DomainEvent): void;
}

/**
 * Observer Pattern: Domain Event Bus
 */
export class EventBus {
  private static instance: EventBus;
  private observers: Map<DomainEventType, IObserver[]> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe(eventType: DomainEventType, observer: IObserver): void {
    const list = this.observers.get(eventType) || [];
    list.push(observer);
    this.observers.set(eventType, list);
  }

  public publish(event: DomainEvent): void {
    const list = this.observers.get(event.type) || [];
    for (const observer of list) {
      try {
        observer.onEvent(event);
      } catch (err) {
        console.error(`Error in observer for event ${event.type}:`, err);
      }
    }
  }
}

/**
 * Concrete Observer: Audit Logger (BR-16)
 */
export class AuditLogObserver implements IObserver {
  private auditLogs: AuditLog[] = [];

  constructor(private saveCallback?: (log: AuditLog) => void) {}

  public onEvent(event: DomainEvent): void {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      entityType: this.resolveEntityType(event.type),
      entityId: event.payload.id || event.payload.orderId || event.payload.stepCode || 'unknown',
      action: event.type,
      oldValue: event.payload.oldValue ? JSON.stringify(event.payload.oldValue) : undefined,
      newValue: event.payload.newValue ? JSON.stringify(event.payload.newValue) : JSON.stringify(event.payload),
      actorId: event.actorId,
      createdAt: event.timestamp,
    };

    this.auditLogs.unshift(log);
    if (this.saveCallback) {
      this.saveCallback(log);
    }
  }

  public getLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  private resolveEntityType(type: DomainEventType): AuditLog['entityType'] {
    if (type.startsWith('ORDER')) return 'ORDER';
    if (type.startsWith('WORKFLOW')) return 'WORKFLOW';
    if (type.startsWith('QC')) return 'QC';
    return 'STEP';
  }
}
