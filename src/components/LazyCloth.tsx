import { lazy, Suspense, type ComponentProps } from 'react'

const Inner = lazy(() => import('./Cloth3D').then((m) => ({ default: m.Cloth3D })))

/** Loads three.js only when a 3D saree is actually on screen. */
export function Cloth3D(props: ComponentProps<typeof Inner>) {
  return (
    <Suspense fallback={<div className="cloth3d cloth-loading"><span /></div>}>
      <Inner {...props} />
    </Suspense>
  )
}
