import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { env } from './env'
import { transactionsRoute } from './routes/transactions'
export const app = fastify()

app.register(cookie)

app.register(transactionsRoute, {
  prefix: 'transactions',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
