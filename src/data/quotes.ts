export type Quote = { text: string; author: string };

export const QUOTES: Quote[] = [
  {
    text: "A classic is a book which with each rereading offers as much of a sense of discovery as the first reading.",
    author: "Italo Calvino",
  },
  {
    text: "A classic is a book that has never finished saying what it has to say.",
    author: "Italo Calvino",
  },
  {
    text: "A classic is something that everybody wants to have read and nobody wants to read.",
    author: "Mark Twain",
  },
  {
    text: "The classics are only primitive literature. They belong to the same class as primitive machinery and primitive music.",
    author: "Stephen Leacock",
  },
  {
    text: "A great book should leave you with many experiences, and slightly exhausted at the end.",
    author: "William Styron",
  },
  {
    text: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway",
  },
  {
    text: "Books are the carriers of civilisation. Without books, history is silent.",
    author: "Barbara Tuchman",
  },
  {
    text: "We read to know we are not alone.",
    author: "C. S. Lewis",
  },
  {
    text: "Literature is the most agreeable way of ignoring life.",
    author: "Fernando Pessoa",
  },
  {
    text: "Old books that we have known but not possessed cross our path and address us as friends.",
    author: "George Eliot",
  },
  {
    text: "A book must be the axe for the frozen sea within us.",
    author: "Franz Kafka",
  },
  {
    text: "Read the best books first, or you may not have a chance to read them at all.",
    author: "Henry David Thoreau",
  },
];

export function randomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)]!;
}
