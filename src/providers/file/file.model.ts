export interface FileDocument {
  name?: string;
  data?: string;
  size?: number;
  type?: string;
}

export interface FileTypeOptions {
  type?: string;
  extension?: string;
}
