import request from '../wallet/helpers/request'
import {RegisteredTokenMetadata, Token, TokenRegistrySubject} from '../types'
import cacheResults from '../helpers/cacheResults'

const MAX_SUBJECTS_COUNT = 2000

const assetQuery = (subject: string) => `{
  asset(subject: "${subject}") {
    id,
    common {
      name,
      description
    },
    offchain {
      ticker,
      url,
      logo,
      decimals
    }
  }
}
`

type TokenResponse = {
  data: null | {
    asset: null | {
      id: string
      common: {
        name: string
        description?: string
      }
      offchain: null | {
        ticker?: string
        url?: string
        logo?: string
        decimals?: number
      }
    }
  }
}

export const createTokenRegistrySubject = (policyId: string, assetName: string): TokenRegistrySubject =>
  `${policyId}${assetName}` as TokenRegistrySubject

export class TokenRegistry {
  private readonly url: string
  private readonly fetchTokensMetadata: (subjects: string[]) => Promise<TokenResponse[]>

  constructor(url: string, enableCaching: boolean = true) {
    this.url = url
    this.fetchTokensMetadata = enableCaching
      ? // 1 hour, not really needed to refresh the cache during a single app session
        cacheResults(60 * 60 * 1000)(this._fetchTokensMetadata).fn
      : this._fetchTokensMetadata
  }

  private readonly _fetchTokensMetadata = async (subjects: string[]): Promise<TokenResponse[]> => {
    if (subjects.length > MAX_SUBJECTS_COUNT) {
      return Promise.resolve([])
    }
    if (subjects.length === 0) {
      return Promise.resolve([])
    }
    const requestBody = subjects.map((subject) => ({query: assetQuery(subject)}))
    try {
      return await request(`${this.url}/graphql`, 'POST', JSON.stringify(requestBody), {
        'Content-Type': 'application/json',
      })
    } catch (e) {
      return Promise.resolve([])
    }
  }

  public static readonly parseTokensMetadata = (
    toParse: TokenResponse[]
  ): Map<TokenRegistrySubject, RegisteredTokenMetadata> => {
    const map = new Map()

    toParse.forEach((response) => {
      const data = response.data?.asset
      if (data) {
        map.set(data.id, {
          subject: data.id,
          description: data.common.description,
          name: data.common.name,
          ticker: data.offchain?.ticker,
          url: data.offchain?.url,
          logoBase64: data.offchain?.logo,
          decimals: data.offchain?.decimals,
        })
      }
    })

    return map
  }

  public readonly getTokensMetadata = async (
    tokens: Token[]
  ): Promise<Map<TokenRegistrySubject, RegisteredTokenMetadata>> => {
    const subjects = [
      ...new Set(tokens.map(({policyId, assetName}) => createTokenRegistrySubject(policyId, assetName))),
    ]
    const tokensMetadata = await this.fetchTokensMetadata(subjects)
    return TokenRegistry.parseTokensMetadata(tokensMetadata)
  }
}
