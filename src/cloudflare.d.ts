declare module 'virtual:react-router/server-build' {
  import type { ServerBuild } from 'react-router';
  const build: ServerBuild;
  export default build;
}

declare module 'cloudflare:workers' {
  export interface WorkflowEvent<T = unknown> {
    payload: T;
    timestamp: Date;
  }

  export interface WorkflowStep {
    run<T>(name: string, callback: () => Promise<T> | T): Promise<T>;
    sleep(name: string, duration: string | number): Promise<void>;
    waitForEvent<T = unknown>(name: string, options?: { timeout?: string | number }): Promise<T>;
  }

  export abstract class WorkflowEntrypoint<Env = unknown, Params = unknown> {
    protected env: Env;
    protected ctx: ExecutionContext;
    abstract run(event: WorkflowEvent<Params>, step: WorkflowStep): Promise<unknown>;
  }
}

declare global {
  interface Queue<T = unknown> {
    send(message: T): Promise<void>;
    sendBatch(messages: { body: T }[]): Promise<void>;
  }
}

export {};
