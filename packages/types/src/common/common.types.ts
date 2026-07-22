export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type Metadata = Record<string, unknown>;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Timestamp = string;
