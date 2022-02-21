declare module 'nanocomponent' {
  abstract class Nanocomponent<T extends object> {
    readonly element: HTMLElement | undefined
    protected constructor (name: string);
    render (props?: T): HTMLElement;
    rerender (): void;
    abstract createElement (props: T): HTMLElement
    abstract update (props: T): boolean
  }

  export = Nanocomponent
}

declare module 'choo/component' {
  import Nanocomponent from 'nanocomponent'

  export = Nanocomponent
}
