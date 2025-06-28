
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
  getService<T>(name: string): T | null;
  getAllServices(): string[];
  initialize(): void;
}

class ServiceRegistryImpl implements ServiceContainer {
  private services = new Map<string, ServiceDefinition>();
  private instances = new Map<string, any>();

  initialize(): void {
    // Initialize the service registry - clear any existing state if needed
    console.log('ServiceRegistry initialized');
  }

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

  getService<T>(name: string): T | null {
    try {
      return this.resolve<T>(name);
    } catch {
      return null;
    }
  }

  getAllServices(): string[] {
    return Array.from(this.services.keys());
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
