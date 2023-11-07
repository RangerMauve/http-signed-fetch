# http-signed-fetch
Easy to use module for signing http requests for ActivityPub using the `fetch` API in Node.js

```JavaScript
import {fetch, create, generateKeypair} from "http-signed-fetch"

// Make a new keypair
const keypair = generateKeypair()

keypair.publicKeyPem // Save this in your Actor
keypair.privateKeyPem // Keep this secret for later

const actor = {
  "@context": ["https://www.w3.org/ns/activitystreams", { "@language": "en- CA" }],
  "type": "Person",
  "id": "https://example.com/actor",
  "outbox": "https://example.com/outbox.jsonld",
  "inbox": "https://example.com/inbox",
  "preferredUsername": "example",
  "name": "Example",
  "publicKey": {
    "@context": "https://w3id.org/security/v1",
    "@type": "Key",
    "id": "https://example.com/actor#main-key",
    "owner": "https://example.com/actor",
    "publicKeyPem": keypair.publicKeyPem
  }
}

// used by verifiers to fetch your Actor's info and key
const publicKeyId = "https://example.com/actor#main-key"

// Headers will automagically get signed
// The `host` and `date` headers will be automatically added
const response = await fetch(url, {
  publicKeyId,
  keypair
})

// If you specify a body, it will be hashed
// A `digest` header will be added for verifiers
const response = await fetch(url, {
  headers: {
  "Content-Type": "application/ld+json"
  },
  body: JSON.stringify({
    hello: "World!"
  }),
  publicKeyId,
  keypair
})

// You can pass in a custom fetch implementation
// By default globalThis.fetch will be used (node.js 19+)
const customFetch = create(someFetchImplementation)
```
