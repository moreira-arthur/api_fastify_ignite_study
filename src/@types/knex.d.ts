import { Knex } from 'knex'

// Declarando as tabelas do knex para deixar o autocomplete mais completo
declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string
      title: string
      amount: number
      created_at: string
      session_id?: string
    }
  }
}
