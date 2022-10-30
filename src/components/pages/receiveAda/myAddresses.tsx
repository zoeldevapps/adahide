import AddressItem from './addressItem'
import {useState} from 'react'
import {useActiveAccount} from '../../../selectors'

const MyAddresses = (): JSX.Element => {
  const {visibleAddresses: addresses} = useActiveAccount()

  const [expandedAddress, setExpandedAddress] = useState(0)

  return (
    <div className="addresses card">
      <h2 className="card-title">My Addresses</h2>
      <div className="addresses-content">
        {addresses.map((adr, index) => (
          <AddressItem
            key={adr.address}
            address={adr.address}
            bip32path={adr.bip32StringPath}
            isExpanded={index === expandedAddress}
            expand={() => setExpandedAddress(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default MyAddresses
