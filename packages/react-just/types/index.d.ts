export interface AppEntryProps {
  req: Request;
}

export interface Request {
  url: URL;
  headers: Headers;
}
