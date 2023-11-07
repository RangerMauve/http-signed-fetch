import { Sha256Signer } from 'activitypub-http-signatures'
import * as httpDigest from '@digitalbazaar/http-digest-header'
import { generateKeyPairSync } from 'node:crypto'

const DEFAULT_SIGNED_HEADERS = ['(request-target)', 'host', 'date', 'digest']

export const fetch = create()

export function create (fetch = globalThis.fetch) {
  return async function signedFetch (url, options) {
    const {
      method,
      headers: initialHeaders,
      body,
      keypair,
      publicKeyId,
      signedHeaders = DEFAULT_SIGNED_HEADERS
    } = options

    if (!keypair) {
      throw new TypeError('Must specify `keypair` for signed fetch')
    }
    if (!publicKeyId) {
      throw new TypeError('Must specify `publicKeyId` for signed fetch')
    }

    const digest = await httpDigest
      .createHeaderValue({
        data: body ?? '',
        algorithm: 'sha256',
        useMultihash: false
      })

    const headers = {
      ...initialHeaders,
      host: new URL(url).host,
      date: new Date().toUTCString(),
      digest
    }

    // Sign data
    const signer = makeSigner(keypair, publicKeyId, signedHeaders)
    const signature = signer.sign({
      url,
      method,
      headers
    })

    // Add signature to he

    // Add signature to headers and fetch
    return await fetch(url, {
      method,
      body,
      headers: new Headers({
        ...headers,
        signature,
        accept: 'application/ld+json'
      })
    })
  }
}

function makeSigner (keypair, publicKeyId, headerNames) {
  const {
    privateKeyPem: privateKey
  } = keypair

  const signer = new Sha256Signer({ publicKeyId, privateKey, headerNames })
  return signer
}


export function generateKeypair (){
  const {
    publicKey,
    privateKey
  } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  })

  return {
    publicKeyPem: publicKey,
    privateKeyPem: privateKey
  }
}
