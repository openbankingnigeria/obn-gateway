local typedefs = require "kong.db.schema.typedefs"

return {
  name = "obn-request-validator",
  fields = {
    { consumer = typedefs.no_consumer },
    { protocols = typedefs.protocols_http },
    {
      config = {
        type = "record",
        fields = {
          { created_at = typedefs.auto_timestamp_s },
          { body = { type = "json", required = false, json_schema = { inline = { type = { "array", "boolean", "integer", "null", "number", "object", "string" }, }, }  } },
          { querystring = { type = "json", required = false, json_schema = { inline = { type = { "array", "boolean", "integer", "null", "number", "object", "string" }, }, }  } },
          { headers = { type = "json", required = false, json_schema = { inline = { type = { "array", "boolean", "integer", "null", "number", "object", "string" }, }, }  } },
        }
      }
    }
  }
}