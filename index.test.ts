import { VariantType } from "plainbuffer";
import { TablestoreClient } from ".";

let client: TablestoreClient;

beforeAll(async () => {
  client = new TablestoreClient({
    endpoint: process.env.ENDPOINT!,
    accessKeyId: process.env.ACCESS_KEY_ID!,
    accessKeySecret: process.env.ACCESS_KEY_SECRET!,
    instanceName: process.env.INSTANCE_NAME!,
  });
  (BigInt.prototype as any).toJSON = function () {
    return { $bigint: this.toString() };
  };
});

test("get row", async () => {
  const response = await client.getRow({
    tableName: "orgs",
    primaryKey: [
      { name: "org_id", value: "5e2c3790", type: VariantType.STRING },
    ],
    maxVersions: 10,
  });

  console.log(JSON.stringify(response, null, 2));
});
