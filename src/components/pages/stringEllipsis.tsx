import {Fragment} from 'react'
export const StringEllipsis = ({value, length}: {value: string; length: number}) => (
  <Fragment>
    <span className="ellipsis">{value.slice(0, -length)}</span>
    {value.slice(-length)}
  </Fragment>
)
