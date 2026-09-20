# この下はすべて写しです

SaaS スターター キットの「Next.js にも Supabase にも Stripe にも触らない部分」を、
そのままの並びで写しています。直すときはキットの側を直してから、
`scripts/sync-saas-starter.mjs` を走らせてください。

JSON には断りの行を足せないので、この 1 枚で代わりにお伝えします。

`src/core/crypto-shim.ts` だけは写しではなく、見本の側で書いたものです
（キットが `node:crypto` で行うことを、ブラウザの中で同じ値になるように書いてあります）。
