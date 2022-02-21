declare module 'nanocomponent' {
  abstract class Nanocomponent<Props extends object> {
    readonly element: HTMLElement | undefined
    protected constructor (name: string);
    render (props?: Props): HTMLElement;
    rerender (): void;
    abstract createElement (props: Props): HTMLElement
    abstract update (props: Props): boolean
  }

  export = Nanocomponent
}

declare module 'choo/component' {
  import Nanocomponent from 'nanocomponent'

  export = Nanocomponent
}
