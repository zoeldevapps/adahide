import {devtools} from 'zustand/middleware'

const devtoolsInNonProd = (import.meta.env.PROD ? (fn: any) => fn : devtools) as unknown as typeof devtools

export const commonMiddlewares = devtoolsInNonProd
