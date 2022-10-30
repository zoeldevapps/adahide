import {useState, useEffect} from 'react'
import {connect} from 'unistore/react'
import actions from '../../../actions'
import FileLoader from '../../common/fileLoader'
import tooltip from '../../common/tooltip'
import {getErrorMessage} from '../../../errors'
import SignPoolCertTxModal from './signPoolCertTxModal'
import {State} from '../../../state'
import {CryptoProviderFeature, PoolRegTransactionSummary} from '../../../types'
import {saveAs} from 'file-saver'
import {CborizedCliWitness} from '../../../wallet/shelley/types'
import {transformSignatureToCliFormat} from '../../../wallet/shelley/helpers/stakepoolRegistrationUtils'
import assert from 'assert'
import {useIsWalletFeatureSupported} from '../../../selectors'

interface Props {
  loadPoolCertificateTx: any
  poolRegTransactionSummary: PoolRegTransactionSummary
  poolRegTxError: any
  downloadPoolSignature: any
  openPoolRegTransactionModal: any
  resetPoolRegTransactionSummary: any
}

const downloadPoolWitness = (witness: CborizedCliWitness, txBodyType: string) => {
  const cliFormatWitness = transformSignatureToCliFormat(witness, txBodyType)
  const signatureExport = JSON.stringify(cliFormatWitness)
  const blob = new Blob([signatureExport], {
    type: 'application/json;charset=utf-8',
  })
  saveAs(blob, 'witness.json')
}

const PoolOwnerCard = ({
  loadPoolCertificateTx,
  poolRegTransactionSummary,
  poolRegTxError,
  openPoolRegTransactionModal,
}: Props) => {
  const {plan: poolTxPlan, shouldShowPoolCertSignModal, witness, txBodyType} = poolRegTransactionSummary
  const [fileName, setFileName] = useState<string>('')
  const isPoolOwnerRegistrationSupported = useIsWalletFeatureSupported(CryptoProviderFeature.POOL_OWNER)

  const handleTxSign = () => {
    openPoolRegTransactionModal()
  }

  const handleDownloadWitness = () => {
    assert(witness != null && txBodyType != null)
    downloadPoolWitness(witness, txBodyType)
  }

  const readFile = async (targetFile) => {
    setFileName(targetFile.name)

    const reader = new FileReader()
    await reader.readAsText(targetFile)

    reader.onload = ((theFile) => {
      return async (e) => await loadPoolCertificateTx(e.target?.result)
    })(targetFile)
  }

  useEffect(() => {
    // reset file name after pool tx plan is reset
    if (poolTxPlan === null) {
      setFileName('')
    }
  }, [poolTxPlan])

  const error = poolRegTxError
  const hwWalletLimitation = 'Only Trezor and Ledger users can use this feature.'
  return (
    <div className="card" data-cy="PoolRegistrationCard">
      <h2 className="card-title small-margin">
        Pool registration certificate transaction
        <a
          {...tooltip(
            'Pool owners using hardware wallets can sign pool registration transactions by supplying the transaction file which contains a valid stake pool registration certificate in cardano-cli format.',
            true
          )}
        >
          <span className="show-info">{''}</span>
        </a>
      </h2>
      <FileLoader
        fileName={fileName}
        readFile={readFile}
        fileDescription="transaction"
        acceptedFiles="*"
        error
        isDisabled={!isPoolOwnerRegistrationSupported}
        disabledReason={hwWalletLimitation}
      />

      {error && (
        <div className="validation-error-field pool-owner">
          <div className="validation-message error pool-owner">
            {getErrorMessage(error.code, error.params)}
          </div>
        </div>
      )}
      <div className="pool-owner-content-bottom">
        <button
          disabled={!isPoolOwnerRegistrationSupported || fileName === '' || !!error || !poolTxPlan}
          onClick={handleTxSign}
          className="button primary"
          {...tooltip(
            'Please insert a valid certificate\nJSON file before proceeding.',
            isPoolOwnerRegistrationSupported && fileName === ''
          )}
          {...tooltip(hwWalletLimitation, isPoolOwnerRegistrationSupported)}
          onKeyDown={(e) => {
            e.key === 'Enter' && (e.target as HTMLButtonElement).click()
          }}
          data-cy="AdvancedSignButton"
        >
          Sign
        </button>
        <button
          className="button secondary"
          disabled={!witness}
          {...tooltip('You have to sign the certificate\nto be able to download it.', !witness)}
          onClick={handleDownloadWitness}
          data-cy="AdvancedDownloadSignatureButton"
        >
          Download signature
        </button>
      </div>
      <div className="pool-registration-instructions">
        <div className="advanced-label">To become a pool owner</div>
        <ol>
          <li>Download Staking CBOR hex in the keys tab and send it to the Operator.</li>
          <li>Request a stake pool registration transaction from the Operator and upload it here.</li>
          <li>Press the "Sign" button and review the pool registration attributes.</li>
          <li>Proceed by signing the transaction using your HW wallet.</li>
          <li>Press the "Download signature" button and send the signature the pool operator.</li>
        </ol>
        <a
          href="https://adalite.medium.com/cardano-stake-pool-owners-hw-support-6d9278dba0ba"
          target="_blank"
          rel="noopener"
        >
          Read more
        </a>
      </div>
      {shouldShowPoolCertSignModal && <SignPoolCertTxModal />}
    </div>
  )
}

export default connect(
  (state: State) => ({
    poolRegTxError: state.poolRegTxError,
    poolRegTransactionSummary: state.poolRegTransactionSummary,
  }),
  actions
)(PoolOwnerCard)
