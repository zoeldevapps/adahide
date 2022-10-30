/*
declare module '*.scss' {
  const content: Record<string, string>
  export default content
}

declare module '*.svg' {
  const content: any
  export default content
}
*/

declare module 'bitbox02-api' {
  export function getDevicePath(options?: {forceBridge: boolean}): string

  type CardanoNetwork = 0 | 1

  export const constants = {
    Status: {
      PairingFailed: string,
    },
    Product: {
      BitBox02Multi: string,
      BitBox02BTCOnly: string,
    },
    messages: {
      CardanoNetwork: {
        CardanoMainnet: CardanoNetwork,
        CardanoTestnet: CardanoNetwork,
      },
    },
  }

  class Firmware {
    Product(): string
  }

  type Keypath = number[]
  type ScriptConfig = {
    pkhSkh: {
      keypathPayment: Keypath
      keypathStake: Keypath
    }
  }

  type CardanoInput = {
    keypath: Keypath
    prevOutHash: Uint8Array
    prevOutIndex: number
  }

  type CardanoAssetGroupToken = {
    assetName: Uint8Array
    value: string
  }

  type CardanoAssetGroup = {
    policyId: Uint8Array
    tokens: CardanoAssetGroupToken[]
  }

  type CardanoOutput = {
    encodedAddress: string
    value: string
    scriptConfig?: ScriptConfig
    assetGroups: CardanoAssetGroup[]
  }

  type CardanoCertificate =
    | {
        stakeRegistration: {
          keypath: Keypath
        }
      }
    | {
        stakeDeregistration: {
          keypath: Keypath
        }
      }
    | {
        stakeDelegation: {
          keypath: Keypath
          poolKeyhash: Uint8Array
        }
      }

  type CardanoWithdrawal = {
    keypath: Keypath
    value: string
  }

  type CardanoShelleyWitness = {
    signature: Uint8Array
    publicKey: Uint8Array
  }

  export class BitBox02API {
    constructor(devicePath: string)
    connect(
      showPairingCb: (string) => void,
      userVerify: () => Promise<void>,
      handleAttestationCb: (bool) => void,
      onCloseCb: () => void,
      setStatusCb: (string) => void
    )
    close(): boolean
    firmware(): Firmware
    version(): string
    cardanoXPubs(keypaths: Keypath[]): Promise<Uint8Array[]>
    cardanoAddress(network: CardanoNetwork, scriptConfig: ScriptConfig, display?: boolean): Promise<string>
    cardanoSignTransaction(params: {
      network: CardanoNetwork
      inputs: CardanoInput[]
      outputs: CardanoOutput[]
      fee: string
      ttl: string | null
      certificates: CardanoCertificate[]
      withdrawals: CardanoWithdrawal[]
      validityIntervalStart: string | null
    }): Promise<{
      shelleyWitnesses: CardanoShelleyWitness[]
    }>
  }
}
