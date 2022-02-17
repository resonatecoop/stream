declare module 'nanostate' {
  import Nanobus from 'nanobus';

  type Transitions = { [key: string]: { [key: string]: string } };

  // @ts-ignore
  interface Parallelstate extends Nanobus {
    readonly state: { [scope: string]: string };
    scopes: string[];
    transitions: Transitions;
    (transitions: Transitions): void;
    emit(eventName: string): any;
  }

  // @ts-ignore
  interface Nanostate extends Nanobus {
    state: string;
    transitions: Transitions;
    submachines: {};
    emit(eventName: string): void;
    event(eventName: string, machine: Nanostate): void;
  }

  type NanostateConstructor = {
    (initialState: string, transitions: Transitions): Nanostate;
    parallel: (transitions: object) => Parallelstate;
  };

  const NS: NanostateConstructor;

  export = NS;
}
