
export interface ServiceDefinition<T = any> {
  name: string;
  factory: () => T;
  singleton: boolean;
  dependencies?: string[];
}

export interface ServiceContainer {
  register<T>(definition: ServiceDefinition<T>): void;
  resolve<T>(name: string): T;
  has(name: string): boolean;
  clear(): void;
}

class ServiceRegistryImpl implements ServiceContainer {
  private services = new Map<string, ServiceDefinition>();
  private instances = new Map<string, any>();

  register<T>(definition: ServiceDefinition<T>): void {
    if (this.services.has(definition.name)) {
      throw new Error(`Service ${definition.name} is already registered`);
    }
    this.services.set(definition.name, definition);
  }

  resolve<T>(name: string): T {
    const definition = this.services.get(name);
    if (!definition) {
      throw new Error(`Service ${name} is not registered`);
    }

    if (definition.singleton && this.instances.has(name)) {
      return this.instances.get(name);
    }

    // Resolve dependencies first
    const dependencies = definition.dependencies || [];
    const resolvedDeps = dependencies.map(dep => this.resolve(dep));

    const instance = definition.factory();
    
    if (definition.singleton) {
      this.instances.set(name, instance);
    }

    return instance;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  clear(): void {
    this.services.clear();
    this.instances.clear();
  }
}

export const ServiceRegistry = new ServiceRegistryImpl();
