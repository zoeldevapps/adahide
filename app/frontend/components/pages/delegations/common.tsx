import CopyOnClick from '../../common/copyOnClick'
import LinkIcon from '../../common/linkIcon'

import {getCardanoscanUrl} from '../../../helpers/common'

export const CopyPoolId = ({value}) => {
  return (
    <CopyOnClick value={value} elementClass="address-link copy" tooltipMessage="Pool ID copied to clipboard">
      <a className="copy-text ml-8" />
    </CopyOnClick>
  )
}

export const LinkIconToPool = ({poolHash}) => <LinkIcon url={`${getCardanoscanUrl()}/pool/${poolHash}`} />

export const LinkIconToKey = ({stakeKey}) => <LinkIcon url={`${getCardanoscanUrl()}/stakekey/${stakeKey}`} />
