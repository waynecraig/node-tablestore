import { VariantType } from "plainbuffer";

export type GetRowRequest = {
  tableName: string;
  primaryKey: PrimaryKey;
  columnsToGet?: string[];
  timeRange?: TimeRange;
  maxVersions?: number;
  // optional bytes filter = 7;
  // optional string start_column = 8;
  // optional string end_column = 9;
  // optional bytes token = 10;
  // optional string transaction_id = 11;
};

export type PrimaryKeyItem = {
  name: string;
  type:
    | VariantType.INF_MIN
    | VariantType.INF_MAX
    | VariantType.AUTO_INCREMENT
    | VariantType.INTEGER
    | VariantType.STRING
    | VariantType.BLOB;
  value?: bigint | string | Uint8Array;
};

export type PrimaryKey = PrimaryKeyItem[];

export type TimeRange = {
  startTime?: number;
  endTime?: number;
  specificTime?: number;
};

export type GetRowResponse = {
  consumed: any;
  row: Row;
  nextToken?: Buffer;
};

export type Row = {
  primaryKey: PrimaryKey;
  attributes: Attribute[];
};

export type Attribute = {
  name: string;
  type:
    | VariantType.INTEGER
    | VariantType.DOUBLE
    | VariantType.BOOLEAN
    | VariantType.STRING
    | VariantType.BLOB;
  value: bigint | number | boolean | string | Uint8Array;
  ts?: number;
};
