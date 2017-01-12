package athena

/**
 * Created by shinichi on 2016/12/21.
 */

import java.sql.DriverManager
import java.util.*
import java.io.InputStream
import java.io.OutputStream
import com.amazonaws.services.lambda.runtime.Context
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

class Query {
    val config: Config
    val mapper = jacksonObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

    init {
        Class.forName("com.amazonaws.athena.jdbc.AthenaDriver")
        this.config = Config.get()
    }

    fun handler(input: InputStream, output: OutputStream, context: Context?) {
        val info = this.initInfo()

        val conn = DriverManager.getConnection(config.driver, info)
        val statement = conn.createStatement()

        val params = mapper.readValue(input, Request::class.java)
        print(params)

        val rs = statement.executeQuery(params.query)
        val rows = ArrayList<Row>()
        while (rs.next()) {
            val count = rs.metaData.columnCount
            val columns = ArrayList<athena.Query.Column>()
            for (i in 1..count) {
                try {
                    val column = Column(
                            name = rs.metaData.getColumnName(i),
                            value = rs.getString(i)
                    )
                    columns.add(column)
                } catch(e: Exception) {
                    val column = Column(
                            name = rs.metaData.getColumnName(i),
                            value = ""
                    )
                    columns.add(column)
                }
            }
            val row = Row(columns)
            rows.add(row)
        }
        rs.close()
        conn.close()

        val mapper = ObjectMapper()
        val json = mapper.writeValueAsString(rows)

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

    data class Row(
            val columns: List<athena.Query.Column>
    )

    data class Column(
            val name: String,
            val value: String
    )

    data class Request(
            val query: String
    )
}
