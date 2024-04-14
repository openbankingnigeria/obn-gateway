local http = require "resty.http"
local x509 = require "resty.openssl.x509"
local cjson = require "cjson.safe"
local json  = require "kong.db.schema.json"

local OBNRequestValidator = {
  VERSION  = "1.0.0",
  PRIORITY = -3,
}

function OBNRequestValidator:access(config)
  if config.body then
    local _, err = json.validate(kong.request.get_body() or {}, config.body)
    if err then
      return kong.response.error(400, err)
    end
  end

  if config.querystring then
    local _, err = json.validate(kong.request.get_query() or {}, config.querystring)
    if err then
      return kong.response.error(400, err)
    end
  end

  if config.headers then
    local _, err = json.validate(kong.request.get_headers() or {}, config.headers)
    if err then
      return kong.response.error(400, err)
    end
  end
end

return OBNRequestValidator