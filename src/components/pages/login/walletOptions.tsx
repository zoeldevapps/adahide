import shallow from 'zustand/shallow'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import {useAuthStore} from '../../../store/auth'
import {Checkbox} from '../../../components/common/checkbox'

import classes from './walletOptions.module.scss'

export const WalletOptions = () => {
  const [derivationType, setDerivation] = useAuthStore(
    (state) => [state.derivationType, state.setDerivationType],
    shallow
  )

  return (
    <div className={classes.wrapper}>
      <ToggleGroup.Root
        className={classes.ToggleGroup}
        type="single"
        value={derivationType}
        onValueChange={setDerivation}
      >
        <ToggleGroup.Item className={classes.ToggleGroupItem} value="single" aria-label="single address">
          Single Address
        </ToggleGroup.Item>
        <ToggleGroup.Item
          className={classes.ToggleGroupItem}
          value="hd"
          aria-label="hierarchical deterministic"
        >
          HD (Hierarchical deterministic)
        </ToggleGroup.Item>
      </ToggleGroup.Root>
      {derivationType === 'hd' && (
        <Checkbox label="Legacy addresses (Byron)" id="byronAddresses" disabled defaultChecked />
      )}
    </div>
  )
}
