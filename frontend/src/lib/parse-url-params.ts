import { ParsedUrlQuery } from 'querystring';

/**
 * Converte uma string de consulta URL ou um objeto ParsedUrlQuery em um objeto Record<string, string | string[]>.
 * @param query - String de consulta URL (começando com '?') ou objeto ParsedUrlQuery
 * @returns Um objeto com os parâmetros da URL parseados
 */
export function parseUrlParams(query: string | ParsedUrlQuery): Record<string, string | string[]> {
  let parsedQuery: ParsedUrlQuery;

  if (typeof query === 'string') {
    // Remove o '?' inicial se presente
    const queryString = query.startsWith('?') ? query.slice(1) : query;
    parsedQuery = Object.fromEntries(new URLSearchParams(queryString));
  } else {
    parsedQuery = query;
  }

  const result: Record<string, string | string[]> = {};

  Object.entries(parsedQuery).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Se o valor já é um array, mantenha-o assim
      result[key] = value;
    } else if (value !== undefined) {
      // Se o valor não é undefined, adicione-o como uma string
      result[key] = value;
    }
  });

  return result;
}