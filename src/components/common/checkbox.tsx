import * as RCheckbox from '@radix-ui/react-checkbox'
import {CheckIcon} from '@radix-ui/react-icons'
import classes from './checkbox.module.scss'

type Props = RCheckbox.CheckboxProps &
  React.RefAttributes<HTMLButtonElement> & {
    label: string
    id: string
  }

export const Checkbox = ({label, ...props}: Props) => (
  <div className={classes.wrapper}>
    <RCheckbox.Root className={classes.root} {...props}>
      <RCheckbox.Indicator className={classes.indicator}>
        <CheckIcon />
      </RCheckbox.Indicator>
    </RCheckbox.Root>
    <label className={classes.label} htmlFor={props.id}>
      {label}
    </label>
  </div>
)
