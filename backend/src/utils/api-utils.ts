import { BadRequestError } from '@/_errors';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';
import { Logger } from './logger';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Product, ProductSchema } from '@/modules/products/schema';
import { HttpsProxyAgent } from 'https-proxy-agent';

// logger 
const logger: Logger = new Logger(`API Shopify`)

/**
 * Faz uma requisição GET para a API do Shopify
 * @param url URL do produto no Shopify
 * @returns Dados do produto validados
 */
export async function fetchShopifyProduct(url: string): Promise<z.SafeParseReturnType<unknown, Product>> {
  try {

    let baseOptions: AxiosRequestConfig = {}
    if(process.env.STATIC_URL) {
      const agent = new HttpsProxyAgent(process.env.STATIC_URL!);
      baseOptions = {
        proxy: false,
        httpsAgent: agent,
      };
    }

    const response: AxiosResponse = await axios.get(url, baseOptions);

    const parseData = ProductSchema.safeParse(response.data.product);

    return parseData;
  } catch (error) {
    throw error
  }
}

/**
 * Lê as urls do arquivo links.txt
 * @returns string url final
 */
export async function readUrlsFromFile(): Promise<string[]> {
  try {
    const filePath = path.join(process.cwd(), 'links.txt');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const urls = JSON.parse(fileContent);

    if (!Array.isArray(urls)) {
      throw new Error('O conteúdo do arquivo não é um array válido');
    }


    const urlsChecked = await checkShopifyUrl(
      urls
        .filter(url => typeof url === 'string' && url.trim() !== '')
        .filter(url => url.includes('/products/'))
    )

    return urlsChecked
      .filter(e => e.isValid && e.shopify)
      .map(e => e.url)

  } catch (error) {
    logger.error(`'Erro ao ler ou parsear o arquivo links.txt: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Verifica se url é valida e se pertence à shopify
 * @param urls Urls recebidas
 * @returns Promise<{url: string, isValid: boolean, shopify: boolean}>[]
 */
export async function checkShopifyUrl(urls: string[]): Promise<{ url: string, isValid: boolean, shopify: boolean }[]> {
  return await Promise.all(urls.map(async (url) => {
    // 1. Adiciona .json no final da URL
    let urlJson = url.endsWith('/') ? url.slice(0, -1) : url;
    urlJson += '.json';

    try {
      // 2. Verifica se a URL é válida e acessível
      const response = await axios.get(urlJson, { timeout: 5000 });

      // 3. Verifica se a URL é da Shopify
      const eShopify = response.headers['powered-by'] === 'Shopify';

      return {
        url: urlJson,
        isValid: true,
        shopify: eShopify
      };
    } catch (error) {
      return {
        url: url,
        isValid: false,
        shopify: false
      };
    }
  }));
}

/**
 * Atrasa a execução por um tempo especificado
 * @param ms Tempo de atraso em milissegundos
 * @returns Promise que resolve após o atraso
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Implementa uma estratégia de retry com backoff exponencial
 * @param fn Função a ser executada
 * @param retries Número máximo de tentativas
 * @param backoff Tempo inicial de backoff em milissegundos
 * @returns Resultado da função ou lança um erro após todas as tentativas
 */
export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  backoff: number = 300
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(backoff);
      return retryWithExponentialBackoff(fn, retries - 1, backoff * 2);
    } else {
      throw error;
    }
  }
}