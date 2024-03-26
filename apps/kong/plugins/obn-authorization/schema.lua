local typedefs = require "kong.db.schema.typedefs"

return {
  name = "obn-authorization",
  fields = {
    { consumer = typedefs.no_consumer },
    { protocols = typedefs.protocols_http },
    {
      config = {
        type = "record",
        fields = {
          { created_at = typedefs.auto_timestamp_s },
          { introspection_endpoint = typedefs.url { required = true } },
          { introspection_ssl_verify = { type = "boolean", required = true, default = true } },
          { client_id = { type = "string", required = true } },
          { client_secret = { type = "string", required = true } },
          { token_header = { type = "string", required = true, default = "Authorization" } },
          { ttl = { type = "number", required = true, default = 30 } },
          { scope = { type = "array", elements = { type = "string" }, required = false } },
        }
      }
    }
  }
}