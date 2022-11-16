import {useEffect, useState} from 'react'
import * as Toast from '@radix-ui/react-toast'
import useSWR from 'swr'

import classes from './updateToast.module.scss'

const CHECK_INTERVAL_MS = 60 * 60 * 1000 // check every our

export const UpdateToast = () => {
  const [assetManifest, setAssetManifest] = useState('')
  const [open, setOpen] = useState(false)

  const {data} = useSWR('manifest', () => fetch('/manifest.json').then((res) => res.text()), {
    refreshInterval: CHECK_INTERVAL_MS,
  })

  useEffect(() => {
    if (!assetManifest && data) {
      setAssetManifest(data)
    } else if (assetManifest && data && assetManifest !== data) {
      setOpen(true)
    }
  }, [data, assetManifest])

  const onReload = () => typeof window !== 'undefined' && window.location.reload()

  return (
    <Toast.Root className={classes.ToastRoot} open={open} onOpenChange={setOpen}>
      <Toast.Title className={classes.ToastTitle}>Update available</Toast.Title>
      <Toast.Description className={classes.ToastDescription}>
        Please reload page to use the latest version
      </Toast.Description>
      <Toast.Action className={classes.ToastAction} asChild altText="Reload">
        <button className="button primary small" onClick={onReload}>
          Reload
        </button>
      </Toast.Action>
      <Toast.Close className={classes.ToastClose}>✕</Toast.Close>
    </Toast.Root>
  )
}
