/**
 * Created by shinichi on 2016/12/27.
 */

package athena

class QueryBuilder {
    val builder = StringBuilder()

    fun append(str: String): QueryBuilder {
        builder.append(" $str ")
        return this
    }

    fun append(str: String, condition: Boolean): QueryBuilder {
        if (condition) append(str)
        return this
    }

    override fun toString(): String {
        return builder.toString()
    }
}
