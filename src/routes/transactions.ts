import { randomUUID } from 'node:crypto'
import { request } from 'node:http'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

// Cookies -> Formas de manter contexto entre requisições

// Testes
// Unitarios: unidade da sua aplicação
// Integração: comunicação entre duas ou mais unidades
// e2e ponta a ponta: simutam um usuario operando na nossa aplicação

// front-end: abre a pagina de login, digite o texto diego@rocketseat.com.br no campo com ID email,
// back-end: chamadas HTTP, WebSockets

// Piramide de testes: E2E (näo dependem de nenhuma tecnotogia, näo dependem de arquitetura)

export async function transactionsRoute(app: FastifyInstance) {
  // Roda antes de todas as requisições desse plugin, portanto utilizar ele para fazer uma verificação global é o caminho. Se colocar esse hook antes das rotas no arquivo do server ele vai ser chamado para todas as rotas cridas
  // app.addHook('preHandler', async (request, reply) => {
  //   console.log(`[${request.method}] ${request.url}`)
  // })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async request => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return { transactions }
    }
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async request => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return {
        transaction,
      }
    }
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async request => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    }
  )

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    )

    let sessionId = request.cookies.sessionId

    console.log(sessionId)

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
