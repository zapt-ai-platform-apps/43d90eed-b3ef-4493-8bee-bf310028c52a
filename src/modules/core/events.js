export class EventBus {
  constructor() {
    this.subscribers = {};
  }

  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
    
    // Return unsubscribe function
    return () => this.unsubscribe(event, callback);
  }

  publish(event, data) {
    if (!this.subscribers[event]) {
      return;
    }
    
    this.subscribers[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event subscriber for ${event}:`, error);
      }
    });
  }

  unsubscribe(event, callback) {
    if (!this.subscribers[event]) {
      return;
    }
    
    this.subscribers[event] = this.subscribers[event].filter(
      cb => cb !== callback
    );
  }
}

export const eventBus = new EventBus();