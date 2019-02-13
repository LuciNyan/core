// lovefield nodejs polyfill
if (typeof global !== 'undefined') {
  if (!global['self']) {
    global['self'] = global
  }
  // shim for SinonJS
  if (!global['location']) {
    global['location'] = Object.create(null)
  }
}

import * as lf from 'lovefield'

// lovefield declaration merging
declare module 'lovefield' {
  namespace query {
    export interface Select extends lf.query.Builder {
      clone(): lf.query.Select
    }
    export function InsertBuilder(): lf.query.Insert
    export function SelectBuilder(): lf.query.Select
    export function UpdateBuilder(): lf.query.Update
    export function DeleteBuilder(): lf.query.Delete
  }
}
