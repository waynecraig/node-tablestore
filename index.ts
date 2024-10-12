import { Root, load } from "protobufjs";
import { GetRowRequest, GetRowResponse } from "./types";
import { encodePlainBuffer, decodePlainBuffer } from "plainbuffer";
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
  private protoRoot!: Root;

  constructor(options: ClientOptions) {
    this.endpoint = options.endpoint;
    this.accessKeyId = options.accessKeyId;
    this.accessKeySecret = options.accessKeySecret;
    this.instanceName = options.instanceName;
    this.securityToken = options.securityToken;
  }

  public async init() {
    if (!this.protoRoot) {
      this.protoRoot = await load("tablestore.proto");
    }
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
      const errorMessage = this.protoRoot.lookupType("tablestore.Error");
      const buffer = await response.body.arrayBuffer();
      const decodedResponse = errorMessage.decode(new Uint8Array(buffer));
      const error = errorMessage.toObject(decodedResponse);
      throw new Error(error.message);
    }

    const buffer = await response.body.arrayBuffer();
    return buffer;
  }

  public async getRow(req: GetRowRequest): Promise<GetRowResponse> {
    await this.init();

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

    const RequestMessage = this.protoRoot.lookupType(
      "tablestore.GetRowRequest"
    );
    const err = RequestMessage.verify(payload);
    if (err) {
      throw new Error(err);
    }
    const encodedRequest = RequestMessage.encode(payload).finish();

    const buffer = await this.request("/GetRow", encodedRequest);
    const ResponseMessage = this.protoRoot.lookupType(
      "tablestore.GetRowResponse"
    );
    const decodedResponse = ResponseMessage.decode(new Uint8Array(buffer));

    const obj = ResponseMessage.toObject(decodedResponse);
    if (obj.row) {
      const b = Buffer.from(obj.row as Uint8Array);
      const rows = decodePlainBuffer(
        b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
      );
      obj.row = rows[0];
    }
    return obj as GetRowResponse;
  }
}
