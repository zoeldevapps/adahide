import {Fragment} from 'react'

type ViewAddressOnProps = {
  name: string
  url: string
  inline?: boolean
}

const ViewAddressOn = ({name, url, inline}: ViewAddressOnProps): JSX.Element =>
  inline ? (
    <a className="address-link" href={url} target="_blank" rel="noopener">
      {name}
    </a>
  ) : (
    <Fragment>
      View on{' '}
      <a className="address-link" href={url} target="_blank" rel="noopener">
        {name}
      </a>
    </Fragment>
  )

export default ViewAddressOn
