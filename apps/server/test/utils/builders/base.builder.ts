import { faker } from '@faker-js/faker';

export abstract class EntityBuilder<T extends { id?: string }> {
  protected instance: Partial<T>;
  protected faker = faker;

  constructor(defaults: Partial<T> = {}) {
    this.instance = {
      id: this.faker.string.uuid(), // Auto-generate ID for all entities
      ...defaults
    };
  }

  /**
   * Build the entity with configured properties
   */
  build(): T {
    if (!this.validate()) {
      throw new Error(`Invalid builder state: ${this.constructor.name}`);
    }
    return this.instance as T;
  }

  /**
   * Set property values fluently
   */
  with<K extends keyof T>(property: K, value: T[K]): this {
    this.instance[property] = value;
    return this;
  }

  /**
   * Override to add validation logic
   */
  protected validate(): boolean {
    // Default validation ensures ID exists
    return !!this.instance.id; 
  }

  /**
   * Clone builder state
   */
  clone(): this {
    const newBuilder = new (this.constructor as new () => this)();
    newBuilder.instance = { ...this.instance };
    return newBuilder;
  }
}