import type { TargetMeasure } from '../types';

/**
 * A registered tour target — owns its host view ref and a measure function.
 *
 * Targets register themselves on mount via the provider context and unregister
 * on unmount. The provider looks them up by id when starting/advancing a tour.
 */
export interface RegisteredTarget {
  id: string;
  measure: () => Promise<TargetMeasure | null>;
}

export class TargetRegistry {
  private targets = new Map<string, RegisteredTarget>();

  register(target: RegisteredTarget) {
    this.targets.set(target.id, target);
  }

  unregister(id: string) {
    this.targets.delete(id);
  }

  get(id: string): RegisteredTarget | undefined {
    return this.targets.get(id);
  }

  has(id: string): boolean {
    return this.targets.has(id);
  }

  size(): number {
    return this.targets.size;
  }
}
