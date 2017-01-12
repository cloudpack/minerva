package athena

/**
 * Created by shinichi on 2017/01/12.
 */
import com.google.gson.FieldNamingPolicy
import com.google.gson.GsonBuilder
import java.io.File

data class Config
(
        val driver: String,
        val bucket: String,
        val accessKey: String,
        val secretKey: String
) {
    companion object {
        var config: Config = _parseConfig("config.json")

        fun get(): Config {
            return config
        }

        fun _parseConfig(filePath: String): Config {
            val source = File(filePath).readText()
            return GsonBuilder()
                    .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
                    .create()
                    .fromJson(source, Config::class.java)!!
        }
    }
}