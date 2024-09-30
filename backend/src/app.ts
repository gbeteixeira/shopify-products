import fastify from 'fastify';
import connectDB from './config/database';
import { errorHandler } from './utils/error-handler';
import { Logger } from './utils/logger';
import productsModule from './modules/products/products-module';
import cors from '@fastify/cors'

export const fastifyApp = fastify()
const logger: Logger = new Logger(`APP LOGGER`);

fastifyApp.setErrorHandler(errorHandler)

// Conectar ao banco de dados
connectDB();

// cors
fastifyApp.register(cors, {
    origin: '*',
    allowedHeaders: [
    '*',
    ],
})

// Registrar módulos
fastifyApp.register(productsModule);


// start
async function run() {
    await fastifyApp.ready()

    let port = process.env.APP_PORT ? Number(process.env.APP_PORT) : 3333
    
    fastifyApp.listen({ port: port, host: '0.0.0.0' }, function (err, address) {
        if (err) {
            logger.error(`🚀 Error on server running ${err}`)
            process.exit(1)
        }
        logger.log(`🚀 HTTP server running ${address}`)
    })
}
run()