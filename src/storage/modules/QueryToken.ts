import { Observable } from 'rxjs/Observable'
import { Selector } from './Selector'

export class QueryToken<T> {
  selector$: Observable<Selector<T>>

  constructor(meta$: Observable<Selector<T>>) {
    this.selector$ = meta$.publishReplay(1)
      .refCount()
  }

  map<K>(fn: (val: T, index?: number) => K) {
    return new QueryToken<K>((this.selector$ as Observable<Selector<any>>).do((selector) => {
      const previousValues = selector.values
      const previousChange$ = selector.change$

      selector.change$ = previousChange$
        .map((val: T[]) => val.map(fn))

      selector.values = () => previousValues.call(selector)
        .map((val: T[]) => val.map(fn))
    }))
  }

  values() {
    return this.selector$
      .flatMap(selector => selector.values())
  }

  changes() {
    return this.selector$
      .flatMap(selector => selector.changes())
  }

  concat(...tokens: QueryToken<T>[]) {
    tokens.unshift(this)
    const newSelector$ = Observable.from(tokens)
      .map(token => token.selector$)
      .combineAll()
      .map((r: Selector<T>[]) => {
        const first = r.shift()
        return first.concat(...r)
      })
    return new QueryToken(newSelector$)
  }

  combine(...tokens: QueryToken<T>[]) {
    tokens.unshift(this)
    const newSelector$ = Observable.from(tokens)
      .map(token => token.selector$)
      .combineAll()
      .map((r: Selector<T>[]) => {
        const first = r.shift()
        return first.combine(...r)
      })
    return new QueryToken(newSelector$)
  }

  toString() {
    return this.selector$.map(r => r.toString())
  }
}