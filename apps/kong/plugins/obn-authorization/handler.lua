local http = require "resty.http"
local x509 = require "resty.openssl.x509"
local cjson = require "cjson.safe"

local OBNTokenIntrospection = {
  VERSION  = "1.0.0",
  PRIORITY = 1,
}

-- issue token introspection request
local function do_introspect_access_token(access_token, config)
  kong.log.debug("endpoint: ", config.introspection_endpoint)

  local res, err = http:new():request_uri(config.introspection_endpoint, {
    -- ssl_verify = config.introspection_ssl_verify,
    method = "POST",
    body = "token_type_hint=access_token&token=" .. access_token
        .. "&client_id=" .. config.client_id
        .. "&client_secret=" .. config.client_secret,
    headers = { ["Content-Type"] = "application/x-www-form-urlencoded" }
  })

  if not res then
    kong.log.err("failed to introspect access token: ", err)
    return nil, err
  end
  if res.status ~= 200 then
    return { status = res.status }
  end
  return { status = res.status, body = res.body }
end

-- get cached token introspection result if available, or retrieve new token introspection result
local function introspect_access_token(access_token, config)
  if config.ttl > 0 then
    local res, err = kong.cache:get(access_token, { ttl = config.ttl },
        do_introspect_access_token, access_token, config)
    if err then
      kong.log.err("failed to introspect access token: ", err)
      return kong.response.error(500, "Unexpected error")
    end
    if res.status ~= 200 then
      kong.cache:invalidate(access_token)
    end
    return res
  else
    return do_introspect_access_token(access_token, config)
  end
end

-- verify that access token contains required scopes
local function verify_scope(scope, required_scope)
  local set = {}
    
  for word in string.gmatch(scope, "([^%s]+)") do
    set[word] = true
  end

  for _, word in ipairs(required_scope) do
      if not set[word] then
          return false
      end
  end
  return true
end

local function set_header(header_name, header_value)
  if type(header_value) == "string" or type(header_value) == "boolean" or type(header_value) == "number" then
    kong.service.request.set_header(header_name, header_value)
  end
end

-- TODO confirm consumer from introspection is same from the request
function OBNTokenIntrospection:access(config)
  local bearer_token = kong.request.get_header(config.token_header)
  if not bearer_token then
    return kong.response.error(401, "Please provide a valid access token on " .. config.token_header .. " header.")
  end
  -- remove Bearer prefix
  if type(bearer_token) == "table" then
    bearer_token = bearer_token[1]
  end
  local iterator, iter_err = ngx.re.gmatch(bearer_token, "\\s*[Bb]earer\\s+(.+)")
  if not iterator then
    kong.log.err(iter_err)
    return kong.response.error(500, "Unexpected error")
  end

  local values, err = iterator()
  if err then
    kong.log.err(err)
    return kong.response.error(500, "Unexpected error")
  end

  if (values == nil or values[1] == nil or values[1] == "") then
    return kong.response.error(401, "Please provide a valid access token.")
  end

  local access_token = values[1]
  -- introspect and validate token
  local introspection_response, err = introspect_access_token(access_token, config)
  if not introspection_response then
    return kong.response.error(500, "Authorization server error")
  end
  kong.log.debug("body: ", introspection_response.status, introspection_response.body)
  if introspection_response.status ~= 200 then
    return kong.response.error(401, "The resource owner or authorization server denied the request.")
  end
  -- decode into jwt token
  local jwt = cjson.decode(introspection_response.body)
  if not jwt.active then
    return kong.response.error(401, "The resource owner or authorization server denied the request.")
  end
  -- If specific scopes are required, validate that the token contains the required scopes
  if config.scope then
    if not verify_scope(jwt.scope, config.scope) then
      return kong.response.error(403, "The resource owner or authorization server denied the request.")
    end
  end

  local consumer = kong.client.get_consumer()

  if jwt.client_id == nil or jwt.client_id == "" or consumer.username == nil or consumer.username == "" or jwt.client_id ~= consumer.username then
    return kong.response.error(403, "You are not authorized to access this resource.")
  end
  -- Authorization successful, set headers based on information from access token
  set_header("X-Credential-Scope", jwt.scope)
  set_header("X-Credential-Client-ID", jwt.clientId)
  set_header("X-Credential-Token-Type", jwt.typ)
  set_header("X-Credential-Exp", jwt.exp)
  set_header("X-Credential-Iat", jwt.iat)
  set_header("X-Credential-Nbf", jwt.nbf)
  set_header("X-Credential-Sub", jwt.sub)
  set_header("X-Credential-Aud", jwt.aud)
  set_header("X-Credential-Iss", jwt.iss)
  set_header("X-Credential-Jti", jwt.jti)

  if config.hide_credentials then
    kong.service.request.clear_header(config.token_header)
  end
end

return OBNTokenIntrospection