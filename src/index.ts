import { Root, load } from "protobufjs";
import {
  Attribute,
  GetRowRequest,
  GetRowResponse,
  PrimaryKeyItem,
  Row,
} from "./types";
import {
  encodePlainBuffer,
  decodePlainBuffer,
  PlainBufferRow,
} from "plainbuffer";
import { createHash, createHmac } from "crypto";
import { request } from "undici";

interface ClientOptions {
  endpoint: string;
  accessKeyId: string;
  accessKeySecret: string;
  instanceName: string;
  securityToken?: string;
}

export class TablestoreClient {
  private endpoint: string;
  private accessKeyId: string;
  private accessKeySecret: string;
  private instanceName: string;
  private securityToken?: string;

  private protoApi?: Root;
  private protoFilter?: Root;

  constructor(options: ClientOptions) {
    this.endpoint = options.endpoint;
    this.accessKeyId = options.accessKeyId;
    this.accessKeySecret = options.accessKeySecret;
    this.instanceName = options.instanceName;
    this.securityToken = options.securityToken;
  }

  private async getProtoApi(): Promise<Root> {
    if (!this.protoApi) {
      this.protoApi = await load("protocol/ots_internal_api.proto");
    }
    return this.protoApi;
  }

  private async getProtoFilter(): Promise<Root> {
    if (!this.protoFilter) {
      this.protoFilter = await load("protocol/ots_filter.proto");
    }
    return this.protoFilter;
  }

  private async request(uri: string, body: Uint8Array): Promise<ArrayBuffer> {
    const headers: Record<string, string> = {
      "x-ots-date": new Date().toISOString(),
      "x-ots-apiversion": "2015-12-31",
      "x-ots-accesskeyid": this.accessKeyId,
      "x-ots-contentmd5": createHash("md5").update(body).digest("base64"),
      "x-ots-instancename": this.instanceName,
    };
    if (this.securityToken) {
      headers["x-ots-ststoken"] = this.securityToken;
    }

    let stringToSign = `${uri}\nPOST\n\n`;
    for (const [key, value] of Object.entries(headers).sort((a, b) =>
      a[0].localeCompare(b[0])
    )) {
      stringToSign += `${key}:${value}\n`;
    }

    headers["x-ots-signature"] = createHmac("sha1", this.accessKeySecret)
      .update(stringToSign)
      .digest("base64");

    const response = await request(this.endpoint + uri, {
      method: "POST",
      headers,
      body,
    });

    if (response.statusCode !== 200) {
      const protoApi = await this.getProtoApi();
      const errorMessage = protoApi.lookupType("ots.Error");
      const buffer = await response.body.arrayBuffer();
      const decodedResponse = errorMessage.decode(new Uint8Array(buffer));
      const error = errorMessage.toObject(decodedResponse);
      console.error(error);
      throw new Error(error.message);
    }

    const buffer = await response.body.arrayBuffer();
    return buffer;
  }

  public async getRow(req: GetRowRequest): Promise<GetRowResponse> {
    const primaryKey = encodePlainBuffer([
      { primaryKey: req.primaryKey, attributes: [] },
    ]);

    const payload = {
      ...req,
      primaryKey: Buffer.from(primaryKey),
    };

    if (!payload.maxVersions && !payload.timeRange) {
      payload.maxVersions = 1;
    }

    const protoApi = await this.getProtoApi();
    const RequestMessage = protoApi.lookupType("ots.GetRowRequest");
    const err = RequestMessage.verify(payload);
    if (err) {
      throw new Error(err);
    }
    const encodedRequest = RequestMessage.encode(payload).finish();

    const buffer = await this.request("/GetRow", encodedRequest);
    const ResponseMessage = protoApi.lookupType("ots.GetRowResponse");
    const decodedResponse = ResponseMessage.decode(new Uint8Array(buffer));

    const obj = ResponseMessage.toObject(decodedResponse);
    if (obj.row && obj.row.length > 0) {
      const b = obj.row as Buffer;
      const rows = decodePlainBuffer(
        b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
      );
      const pbRow = rows[0] as PlainBufferRow;
      const row: Row = {
        primaryKey: pbRow.primaryKey.map((cell) => {
          return {
            name: cell.name,
            type: cell.type as PrimaryKeyItem["type"],
            value: cell.value as PrimaryKeyItem["value"],
          };
        }),
        attributes: pbRow.attributes.map((cell) => {
          return {
            name: cell.name,
            type: cell.type as Attribute["type"],
            value: cell.value as Attribute["value"],
            ts: cell.ts,
          };
        }),
      };
      obj.row = row;
    } else {
      obj.row = null;
    }
    return obj as GetRowResponse;
  }
}

export * from "./types";
