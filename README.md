# node-tablestore

这是一个用 Node.js 从零开始写的，用来做表格存储数据操作的 SDK。

关于表格存储，参考：https://help.aliyun.com/zh/tablestore

本项目基于官方的 API 实现，关于 API，请参考：https://help.aliyun.com/zh/tablestore/developer-reference/api-reference

官方已经有一个 Node.js SDK，想要可靠地使用表格存储全部的朋友应该考虑那个，地址：https://github.com/aliyun/aliyun-tablestore-nodejs-sdk

## 为什么要写一个新的 SDK?

因为官方的 SDK 有时候用起来不顺手，它至少存在以下问题：

1. 它太过复杂，既支持 Node.js 又支持浏览器，这样代码里就有很多判断，而且还在被引用时就执行代码做初始化，导致一些兼容问题。例如在 next.js 的 app router 页面里引用就会报错，加了 'use server' 声明也没用。

2. 参数复杂，却不支持 TypeScript，只能依靠示例和试错。现在有一个 @types/tablestore 包，但类型也不全。

本项目想实现一个简单纯粹的 SDK，减少依赖，方便部署，易于理解和测试。

## 技术栈

1. [Node.js](https://nodejs.org): 使用 crypto 实现哈希和签名计算

2. [undici](https://github.com/nodejs/undici): HTTP 客户端

3. [protobufjs](https://www.npmjs.com/package/protobufjs): Protocol Buffer 编解码

4. [plainbuffer](https://github.com/waynecraig/plainbuffer): Plain Buffer 编解码

5. [TypeScript](https://www.typescriptlang.org/): 接口类型定义

## API 接口实现进度

[ ] CreateTable
[ ] ListTable
[ ] DescribeTable
[ ] UpdateTable
[ ] DeleteTable
[ ] ComputeSplitPointsBySize

[ ] GetRow
[ ] PutRow
[ ] UpdateRow
[ ] DeleteRow
[ ] GetRange
[ ] BatchGetRow
[ ] BatchWriteRow

[ ] AddDefinedColumn
[ ] DeleteDefinedColumn

[ ] CreateIndex
[ ] DropIndex

[ ] CreateSearchIndex
[ ] ListSearchIndex
[ ] DescribeSearchIndex
[ ] DeleteSearchIndex
[ ] Search
[ ] ComputeSplits
[ ] ParallelScan

[ ] CreateTunnel
[ ] ListTunnel
[ ] DescribeTunnel
[ ] DeleteTunnel

[ ] ListStream
[ ] DescribeStream
[ ] GetShardIterator
[ ] GetStreamRecord

[ ] BulkImport
[ ] BulkExport

[ ] StartLocalTransaction
[ ] CommitTransaction
[ ] AbortTransaction

[ ] SQLQuery

[ ] CreateTimeseriesTable
[ ] ListTimeseriesTable
[ ] DescribeTimeseriesTable
[ ] UpdateTimeseriesTable
[ ] DeleteTimeseriesTable

[ ] CreateTimeseriesAnalyticalStore
[ ] UpdateTimeseriesAnalyticalStore
[ ] DescribeTimeseriesAnalyticalStore
[ ] DeleteTimeseriesAnalyticalStore

[ ] PutTimeseriesData
[ ] GetTimeseriesData
[ ] UpdateTimeseriesMeta
[ ] QueryTimeseriesMeta
[ ] DeleteTimeseriesMeta
[ ] SplitTimeseriesScanTask
[ ] ScanTimeseriesData

[ ] CreateTimeseriesLastpointIndex
[ ] DeleteTimeseriesLastpointIndex

