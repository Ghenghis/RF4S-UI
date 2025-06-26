
import { EventManager } from './EventManager';

export interface ComponentDefinition {
  name: string;
  version: string;
  dependencies: string[];
  lazyLoad: boolean;
  component: () => Promise<any>;
}

export interface ComponentMetadata {
  name: string;
  loaded: boolean;
  loadTime?: number;
  error?: string;
}

class ComponentLoaderImpl {
  private components = new Map<string, ComponentDefinition>();
  private loadedComponents = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  register(definition: ComponentDefinition): void {
    if (this.components.has(definition.name)) {
      throw new Error(`Component ${definition.name} is already registered`);
    }

    this.validateDependencies(definition.dependencies);
    this.components.set(definition.name, definition);
    
    EventManager.emit('component.registered', { name: definition.name }, 'ComponentLoader');
  }

  async load(name: string): Promise<any> {
    if (this.loadedComponents.has(name)) {
      return this.loadedComponents.get(name);
    }

    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const definition = this.components.get(name);
    if (!definition) {
      throw new Error(`Component ${name} is not registered`);
    }

    const loadPromise = this.loadComponentWithDependencies(definition);
    this.loadingPromises.set(name, loadPromise);

    try {
      const component = await loadPromise;
      this.loadedComponents.set(name, component);
      this.loadingPromises.delete(name);
      
      EventManager.emit('component.loaded', { name, success: true }, 'ComponentLoader');
      return component;
    } catch (error) {
      this.loadingPromises.delete(name);
      EventManager.emit('component.loaded', { name, success: false, error }, 'ComponentLoader');
      throw error;
    }
  }

  isLoaded(name: string): boolean {
    return this.loadedComponents.has(name);
  }

  getMetadata(): ComponentMetadata[] {
    return Array.from(this.components.keys()).map(name => ({
      name,
      loaded: this.loadedComponents.has(name),
      loadTime: this.loadedComponents.has(name) ? Date.now() : undefined
    }));
  }

  unload(name: string): void {
    this.loadedComponents.delete(name);
    EventManager.emit('component.unloaded', { name }, 'ComponentLoader');
  }

  private async loadComponentWithDependencies(definition: ComponentDefinition): Promise<any> {
    // Load dependencies first
    for (const dep of definition.dependencies) {
      if (!this.isLoaded(dep)) {
        await this.load(dep);
      }
    }

    // Load the component
    const startTime = Date.now();
    const component = await definition.component();
    const loadTime = Date.now() - startTime;

    console.log(`Component ${definition.name} loaded in ${loadTime}ms`);
    return component;
  }

  private validateDependencies(dependencies: string[]): void {
    for (const dep of dependencies) {
      if (!this.components.has(dep) && !this.loadedComponents.has(dep)) {
        console.warn(`Dependency ${dep} is not registered yet`);
      }
    }
  }
}

export const ComponentLoader = new ComponentLoaderImpl();
