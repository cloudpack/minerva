/**
 * Created by shinichi on 2016/12/21.
 */

package athena

import java.sql.DriverManager
import java.util.*
import com.amazonaws.services.lambda.runtime.Context
import com.fasterxml.jackson.databind.ObjectMapper
import java.io.InputStream
import java.io.OutputStream

class Structure {
    val config: Config

    init {
        Class.forName("com.amazonaws.athena.jdbc.AthenaDriver")
        this.config = Config.get()
    }

    fun handler(input: InputStream, output: OutputStream, context: Context?) {
        val info = this.initInfo()

        val conn = DriverManager.getConnection(config.driver, info)
        val statement = conn.createStatement()

        val meta = conn.metaData
        val schemaResult = meta.getSchemas(null, null)

        val schemas = ArrayList<Schema>()

        while (schemaResult.next()) {
            val schemaName = schemaResult.getString("TABLE_SCHEM")

            val tableResult = meta.getTables(null, schemaName, null, null)

            val tables = ArrayList<Table>()
            while (tableResult.next()) {
                val tableName = tableResult.getString("TABLE_NAME")

                val cols = ArrayList<Column>()
                val columnResult = meta.getColumns(null, schemaName, tableName, null)

                while (columnResult.next()) {
                    val column = Column(
                        name = columnResult.getString("COLUMN_NAME"),
                        type = columnResult.getString("TYPE_NAME")
                    )
                    cols.add(column)
                }

                val table = Table(
                    name = tableName,
                    column = cols
                )
                tables.add(table)

                columnResult.close()
            }
            val schema = Schema(
                name = schemaName,
                tables = tables
            )
            schemas.add(schema)
            tableResult.close()
        }
        val response = Response(schemas = schemas)

        schemaResult.close()

        statement.close()
        conn.close()

        val mapper = ObjectMapper()
        val json = mapper.writeValueAsString(response)

        println(json)

        output.write(json.toByteArray())
    }

    private fun initInfo(): Properties {
        val info = Properties()

        info.put("user", config.accessKey)
        info.put("password", config.secretKey)
        info.put("s3_staging_dir", config.bucket)

        return info
    }

    data class Response(
            val schemas: List<Schema>
    )

    data class Schema(
            val name: String,
            val tables: List<Table>
    )

    data class Table(
            val name: String,
            val column: List<Column>
    )

    data class Column(
            val name: String,
            val type: String
    )

}
