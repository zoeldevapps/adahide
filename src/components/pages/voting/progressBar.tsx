import {Fragment} from 'react'
import styles from './voting.module.scss'

const ProgressStep = ({active, name}: {active: boolean; name: string}): JSX.Element => {
  return (
    <Fragment>
      <div className={`${styles.progressStep} ${active ? styles.active : ''}`} />
      <div className={`${styles.progressStepText} ${active ? styles.active : ''}`}>{name}</div>
    </Fragment>
  )
}

const ProgressBar = ({stepNames, activeStep}: {stepNames: string[]; activeStep: number}): JSX.Element => {
  return (
    <div className={styles.progressBar}>
      {stepNames.map((step, i) => (
        <ProgressStep name={step} active={activeStep >= i} key={i} />
      ))}
    </div>
  )
}

export default ProgressBar
