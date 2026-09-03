import { DomainEvent } from './types';

export type EventListener = (event: DomainEvent) => void;

export class EventBus {
  private listeners: EventListener[] = [];

  public subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public emit(event: DomainEvent): void {
    for (let i = 0; i < this.listeners.length; i++) {
      const listener = this.listeners[i];
      if (listener) {
        try {
          listener(event);
        } catch (err) {
          console.error('Error in event listener:', err);
        }
      }
    }
  }

  public clear(): void {
    this.listeners = [];
  }
}
