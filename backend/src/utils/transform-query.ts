
interface IQuery { 
  filter: { 
    [key: string]: any 
  },
  sort: { 
    [key: string]: 'asc' | 'desc' 
  } 
} 
export default function transformQuery(query: URLSearchParams) {
  const transformed: IQuery = {
    filter: {},
    sort: {}
  };

  // Itera sobre os pares chave-valor do URLSearchParams usando entries()
  for (const [key, value] of query.entries()) {
    if (key.startsWith('filter[')) {
      const filterKey = key.slice(7, -1); // remove 'filter[' e ']'

      transformed.filter[filterKey] = value
    } else if (key.startsWith('sort[')) {
      const sortKey = key.slice(5, -1); // remove 'sort[' e ']'

      transformed.sort[sortKey] = value as 'asc' | 'desc'
    }
  }

  return transformed;
}
