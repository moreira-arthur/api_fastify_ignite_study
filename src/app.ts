import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { transactionsRoute } from './routes/transactions'

export const app = fastify()

app.register(cookie)

app.register(transactionsRoute, {
  prefix: 'transactions',
})
