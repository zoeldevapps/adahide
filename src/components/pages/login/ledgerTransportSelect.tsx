import SearchableSelect from '../../common/searchableSelect'
import {LedgerTransportChoice} from '../../../types'
import styles from './ledgerTransportSelect.module.scss'

interface Props {
  selectedItem: LedgerTransportChoice
  onSelect: (ledgerTransportType: LedgerTransportChoice) => void
}

const dropdownAssetItems = [
  LedgerTransportChoice.DEFAULT,
  LedgerTransportChoice.U2F,
  LedgerTransportChoice.WEB_USB,
  LedgerTransportChoice.WEB_HID,
  LedgerTransportChoice.HTTP,
]

const TransportName = {
  [LedgerTransportChoice.DEFAULT]: 'Default',
  [LedgerTransportChoice.U2F]: 'U2F (Legacy)',
  [LedgerTransportChoice.WEB_USB]: 'Web USB',
  [LedgerTransportChoice.WEB_HID]: 'Web HID',
  [LedgerTransportChoice.HTTP]: 'LedgerLive',
}

const displayTransportChoice = (choice: LedgerTransportChoice) => TransportName[choice]

const LedgerTransportSelect = ({selectedItem, onSelect}: Props) => {
  return (
    <SearchableSelect
      wrapperClassName={`no-margin ${styles.wrapper}`}
      selectedItem={selectedItem}
      displaySelectedItemClassName={`input dropdown ${styles.dropdown}`}
      items={dropdownAssetItems}
      displayItem={displayTransportChoice}
      displaySelectedItem={displayTransportChoice}
      onSelect={onSelect}
      showSearch={false}
      disabled={false}
    />
  )
}

export default LedgerTransportSelect
