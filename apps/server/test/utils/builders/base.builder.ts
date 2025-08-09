import { faker } from '@faker-js/faker';

export abstract class EntityBuilder<T> {
  protected instance: Partial<T>;
  protected faker = faker;

  constructor(defaults: Partial<T> = {}) {
    this.instance = defaults;
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
    return true;
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