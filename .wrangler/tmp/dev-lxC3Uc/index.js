// .wrangler/tmp/bundle-Q3edkL/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// node_modules/devalue/src/utils.js
var DevalueError = class extends Error {
  /**
   * @param {string} message
   * @param {string[]} keys
   */
  constructor(message, keys) {
    super(message);
    this.name = "DevalueError";
    this.path = keys.join("");
  }
};
function is_primitive(thing) {
  return Object(thing) !== thing;
}
var object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(
  Object.prototype
).sort().join("\0");
function is_plain_object(thing) {
  const proto = Object.getPrototypeOf(thing);
  return proto === Object.prototype || proto === null || Object.getOwnPropertyNames(proto).sort().join("\0") === object_proto_names;
}
function get_type(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function get_escaped_char(char) {
  switch (char) {
    case '"':
      return '\\"';
    case "<":
      return "\\u003C";
    case "\\":
      return "\\\\";
    case "\n":
      return "\\n";
    case "\r":
      return "\\r";
    case "	":
      return "\\t";
    case "\b":
      return "\\b";
    case "\f":
      return "\\f";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return char < " " ? `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}` : "";
  }
}
function stringify_string(str) {
  let result = "";
  let last_pos = 0;
  const len = str.length;
  for (let i = 0; i < len; i += 1) {
    const char = str[i];
    const replacement = get_escaped_char(char);
    if (replacement) {
      result += str.slice(last_pos, i) + replacement;
      last_pos = i + 1;
    }
  }
  return `"${last_pos === 0 ? str : result + str.slice(last_pos)}"`;
}

// node_modules/devalue/src/constants.js
var UNDEFINED = -1;
var HOLE = -2;
var NAN = -3;
var POSITIVE_INFINITY = -4;
var NEGATIVE_INFINITY = -5;
var NEGATIVE_ZERO = -6;

// node_modules/devalue/src/parse.js
function parse(serialized, revivers) {
  return unflatten(JSON.parse(serialized), revivers);
}
function unflatten(parsed, revivers) {
  if (typeof parsed === "number")
    return hydrate(parsed, true);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Invalid input");
  }
  const values = (
    /** @type {any[]} */
    parsed
  );
  const hydrated = Array(values.length);
  function hydrate(index, standalone = false) {
    if (index === UNDEFINED)
      return void 0;
    if (index === NAN)
      return NaN;
    if (index === POSITIVE_INFINITY)
      return Infinity;
    if (index === NEGATIVE_INFINITY)
      return -Infinity;
    if (index === NEGATIVE_ZERO)
      return -0;
    if (standalone)
      throw new Error(`Invalid input`);
    if (index in hydrated)
      return hydrated[index];
    const value = values[index];
    if (!value || typeof value !== "object") {
      hydrated[index] = value;
    } else if (Array.isArray(value)) {
      if (typeof value[0] === "string") {
        const type = value[0];
        const reviver = revivers?.[type];
        if (reviver) {
          return hydrated[index] = reviver(hydrate(value[1]));
        }
        switch (type) {
          case "Date":
            hydrated[index] = new Date(value[1]);
            break;
          case "Set":
            const set = /* @__PURE__ */ new Set();
            hydrated[index] = set;
            for (let i = 1; i < value.length; i += 1) {
              set.add(hydrate(value[i]));
            }
            break;
          case "Map":
            const map = /* @__PURE__ */ new Map();
            hydrated[index] = map;
            for (let i = 1; i < value.length; i += 2) {
              map.set(hydrate(value[i]), hydrate(value[i + 1]));
            }
            break;
          case "RegExp":
            hydrated[index] = new RegExp(value[1], value[2]);
            break;
          case "Object":
            hydrated[index] = Object(value[1]);
            break;
          case "BigInt":
            hydrated[index] = BigInt(value[1]);
            break;
          case "null":
            const obj = /* @__PURE__ */ Object.create(null);
            hydrated[index] = obj;
            for (let i = 1; i < value.length; i += 2) {
              obj[value[i]] = hydrate(value[i + 1]);
            }
            break;
          default:
            throw new Error(`Unknown type ${type}`);
        }
      } else {
        const array = new Array(value.length);
        hydrated[index] = array;
        for (let i = 0; i < value.length; i += 1) {
          const n = value[i];
          if (n === HOLE)
            continue;
          array[i] = hydrate(n);
        }
      }
    } else {
      const object = {};
      hydrated[index] = object;
      for (const key in value) {
        const n = value[key];
        object[key] = hydrate(n);
      }
    }
    return hydrated[index];
  }
  return hydrate(0);
}

// node_modules/devalue/src/stringify.js
function stringify(value, reducers) {
  const stringified = [];
  const indexes = /* @__PURE__ */ new Map();
  const custom = [];
  for (const key in reducers) {
    custom.push({ key, fn: reducers[key] });
  }
  const keys = [];
  let p = 0;
  function flatten(thing) {
    if (typeof thing === "function") {
      throw new DevalueError(`Cannot stringify a function`, keys);
    }
    if (indexes.has(thing))
      return indexes.get(thing);
    if (thing === void 0)
      return UNDEFINED;
    if (Number.isNaN(thing))
      return NAN;
    if (thing === Infinity)
      return POSITIVE_INFINITY;
    if (thing === -Infinity)
      return NEGATIVE_INFINITY;
    if (thing === 0 && 1 / thing < 0)
      return NEGATIVE_ZERO;
    const index2 = p++;
    indexes.set(thing, index2);
    for (const { key, fn } of custom) {
      const value2 = fn(thing);
      if (value2) {
        stringified[index2] = `["${key}",${flatten(value2)}]`;
        return index2;
      }
    }
    let str = "";
    if (is_primitive(thing)) {
      str = stringify_primitive(thing);
    } else {
      const type = get_type(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          str = `["Object",${stringify_primitive(thing)}]`;
          break;
        case "BigInt":
          str = `["BigInt",${thing}]`;
          break;
        case "Date":
          str = `["Date","${thing.toISOString()}"]`;
          break;
        case "RegExp":
          const { source, flags } = thing;
          str = flags ? `["RegExp",${stringify_string(source)},"${flags}"]` : `["RegExp",${stringify_string(source)}]`;
          break;
        case "Array":
          str = "[";
          for (let i = 0; i < thing.length; i += 1) {
            if (i > 0)
              str += ",";
            if (i in thing) {
              keys.push(`[${i}]`);
              str += flatten(thing[i]);
              keys.pop();
            } else {
              str += HOLE;
            }
          }
          str += "]";
          break;
        case "Set":
          str = '["Set"';
          for (const value2 of thing) {
            str += `,${flatten(value2)}`;
          }
          str += "]";
          break;
        case "Map":
          str = '["Map"';
          for (const [key, value2] of thing) {
            keys.push(
              `.get(${is_primitive(key) ? stringify_primitive(key) : "..."})`
            );
            str += `,${flatten(key)},${flatten(value2)}`;
          }
          str += "]";
          break;
        default:
          if (!is_plain_object(thing)) {
            throw new DevalueError(
              `Cannot stringify arbitrary non-POJOs`,
              keys
            );
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new DevalueError(
              `Cannot stringify POJOs with symbolic keys`,
              keys
            );
          }
          if (Object.getPrototypeOf(thing) === null) {
            str = '["null"';
            for (const key in thing) {
              keys.push(`.${key}`);
              str += `,${stringify_string(key)},${flatten(thing[key])}`;
              keys.pop();
            }
            str += "]";
          } else {
            str = "{";
            let started = false;
            for (const key in thing) {
              if (started)
                str += ",";
              started = true;
              keys.push(`.${key}`);
              str += `${stringify_string(key)}:${flatten(thing[key])}`;
              keys.pop();
            }
            str += "}";
          }
      }
    }
    stringified[index2] = str;
    return index2;
  }
  const index = flatten(value);
  if (index < 0)
    return `${index}`;
  return `[${stringified.join(",")}]`;
}
function stringify_primitive(thing) {
  const type = typeof thing;
  if (type === "string")
    return stringify_string(thing);
  if (thing instanceof String)
    return stringify_string(thing.toString());
  if (thing === void 0)
    return UNDEFINED.toString();
  if (thing === 0 && 1 / thing < 0)
    return NEGATIVE_ZERO.toString();
  if (type === "bigint")
    return `["BigInt","${thing}"]`;
  return String(thing);
}

// node_modules/cfw-bindings-wrangler-bridge/worker/kv/index.js
var decodeKey = (key) => decodeURIComponent(key);
var isKVBinding = (binding) => binding.constructor.name === "KvNamespace";
var handleKVDispatch = async (KV, req) => {
  const { operation, parameters } = parse(
    req.headers.get("X-BRIDGE-KV-Dispatch") ?? "{}"
  );
  if (operation === "KVNamespace.list") {
    const [options] = parameters;
    const result = await KV.list(options);
    return Response.json(result);
  }
  if (operation === "KVNamespace.put") {
    const [encodedKey, options] = parameters;
    const key = decodeKey(encodedKey);
    const value = req.body ?? "Only for TS, never happens";
    await KV.put(key, value, options);
    return new Response();
  }
  if (operation === "KVNamespace.getWithMetadata") {
    const [encodedKey, typeOrOptions] = parameters;
    const key = decodeKey(encodedKey);
    const { value, metadata, cacheStatus } = await KV.getWithMetadata(key, {
      ...typeof typeOrOptions !== "string" ? typeOrOptions : {},
      // Override it to respond over our bridge.
      // `stream` is fastest and type conversion is done by bridge module.
      type: "stream"
    });
    return new Response(value, {
      headers: {
        "X-BRIDGE-KV-ValueIsNull": `${value === null}`,
        "X-BRIDGE-KV-Metadata": stringify(metadata),
        "X-BRIDGE-KV-CacheStatus": stringify(cacheStatus)
      }
    });
  }
  if (operation === "KVNamespace.delete") {
    const [encodedKey] = parameters;
    const key = decodeKey(encodedKey);
    await KV.delete(key);
    return new Response();
  }
  throw new Error(`${operation}() is not supported.`);
};

// node_modules/cfw-bindings-wrangler-bridge/worker/service/index.js
var isServiceBinding = (binding) => (
  // This is true in remote but `Object` in local :(
  binding.constructor.name === "Fetcher" || typeof binding.fetch === "function"
);
var handleServiceDispatch = async (SERVICE, req) => {
  const { operation, parameters } = JSON.parse(
    req.headers.get("X-BRIDGE-SERVICE-Dispatch") ?? "{}"
  );
  if (operation === "Fetcher.fetch") {
    const [originalUrl] = parameters;
    const originalReq = new Request(originalUrl, req);
    originalReq.headers.delete("X-BRIDGE-BINDING-MODULE");
    originalReq.headers.delete("X-BRIDGE-BINDING-NAME");
    originalReq.headers.delete("X-BRIDGE-SERVICE-Dispatch");
    return SERVICE.fetch(originalReq);
  }
  throw new Error(`${operation}() is not supported.`);
};

// node_modules/cfw-bindings-wrangler-bridge/worker/r2/shared.js
var hexStringToArrayBuffer = (hexString) => {
  const view = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2)
    view[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  return view.buffer;
};
var decodeKey2 = (key) => decodeURIComponent(key);

// node_modules/cfw-bindings-wrangler-bridge/worker/r2/index.js
var isR2Binding = (binding) => binding.constructor.name === "R2Bucket";
var handleR2Dispatch = async (R2, req) => {
  const { operation, parameters } = parse(
    req.headers.get("X-BRIDGE-R2-Dispatch") ?? "{}",
    {
      // Date: Handled by default
      Headers: (v) => new Headers(v),
      ArrayBuffer: (v) => hexStringToArrayBuffer(v)
    }
  );
  if (operation === "R2Bucket.list") {
    const [options] = parameters;
    const result = await R2.list(options);
    return Response.json(result);
  }
  if (operation === "R2Bucket.put") {
    const [encodedKey, , options] = parameters;
    const key = decodeKey2(encodedKey);
    const value = req.body;
    const result = await R2.put(key, value, options);
    return Response.json(result);
  }
  if (operation === "R2Bucket.get") {
    const [encodedKey, options] = parameters;
    const key = decodeKey2(encodedKey);
    const result = await R2.get(key, options);
    if (result === null)
      return Response.json(null);
    if ("body" in result && result.constructor.name === "GetResult")
      return new Response(result.body, {
        headers: { "X-BRIDGE-R2-R2ObjectJSON": JSON.stringify(result) }
      });
    return Response.json(result);
  }
  if (operation === "R2Bucket.head") {
    const [encodedKey] = parameters;
    const key = decodeKey2(encodedKey);
    const result = await R2.head(key);
    if (result === null)
      return Response.json(null);
    return Response.json(result);
  }
  if (operation === "R2Bucket.delete") {
    const [encodedKeys] = parameters;
    const keys = typeof encodedKeys === "string" ? decodeKey2(encodedKeys) : encodedKeys.map(
      /** @param {string} key */
      (key) => decodeKey2(key)
    );
    await R2.delete(keys);
    return new Response();
  }
  if (operation === "R2Bucket.createMultipartUpload") {
    const [encodedKey, options] = parameters;
    const key = decodeKey2(encodedKey);
    const result = await R2.createMultipartUpload(key, options);
    return Response.json(result);
  }
  if (operation === "R2MultipartUpload.uploadPart") {
    const [encodedKey, uploadId, partNumber] = parameters;
    const key = decodeKey2(encodedKey);
    const value = req.body ?? "Only for TS, never happens";
    const multipartUpload = R2.resumeMultipartUpload(key, uploadId);
    const result = await multipartUpload.uploadPart(partNumber, value);
    return Response.json(result);
  }
  if (operation === "R2MultipartUpload.abort") {
    const [encodedKey, uploadId] = parameters;
    const key = decodeKey2(encodedKey);
    const multipartUpload = R2.resumeMultipartUpload(key, uploadId);
    await multipartUpload.abort();
    return new Response();
  }
  if (operation === "R2MultipartUpload.complete") {
    const [encodedKey, uploadId, uploadedParts] = parameters;
    const key = decodeKey2(encodedKey);
    const multipartUpload = R2.resumeMultipartUpload(key, uploadId);
    const result = await multipartUpload.complete(uploadedParts);
    return Response.json(result);
  }
  throw new Error(`${operation}() is not supported.`);
};

// node_modules/cfw-bindings-wrangler-bridge/worker/d1/index.js
var decodeBindValues = (values) => (
  // In module side, `ArrayBuffer` and `ArrayBufferView` are encoded as `Array`.
  // But here we do not decode them, because current D1 implementation also treats them as `Array`.
  values
);
var isD1Binding = (binding) => binding.constructor.name === "D1Database";
var handleD1Dispatch = async (D1, req) => {
  const { operation, parameters } = await req.text().then((t) => parse(t));
  if (operation === "D1Database.dump") {
    const result = await D1.dump();
    return new Response(result);
  }
  if (operation === "D1Database.exec") {
    const [query] = parameters;
    const result = await D1.exec(query);
    return Response.json(result);
  }
  if (operation === "D1Database.batch") {
    const [statementArray] = parameters;
    const result = await D1.batch(
      statementArray.map(
        /** @param {[string, unknown[]]} stmt */
        ([statement, params]) => D1.prepare(statement).bind(...decodeBindValues(params))
      )
    );
    return Response.json(result);
  }
  if (operation === "D1PreparedStatement.first") {
    const [statement, params, column] = parameters;
    const result = await D1.prepare(statement).bind(...decodeBindValues(params)).first(column);
    return Response.json(result);
  }
  if (operation === "D1PreparedStatement.all") {
    const [statement, params] = parameters;
    const result = await D1.prepare(statement).bind(...decodeBindValues(params)).all();
    return Response.json(result);
  }
  if (operation === "D1PreparedStatement.run") {
    const [statement, params] = parameters;
    const result = await D1.prepare(statement).bind(...decodeBindValues(params)).run();
    return Response.json(result);
  }
  if (operation === "D1PreparedStatement.raw") {
    const [statement, params] = parameters;
    const result = await D1.prepare(statement).bind(...decodeBindValues(params)).raw();
    return Response.json(result);
  }
  throw new Error(`${operation}() is not supported.`);
};

// node_modules/cfw-bindings-wrangler-bridge/worker/queue/index.js
var isQueueBinding = (binding) => binding.constructor.name === "WorkerQueue";
var handleQueueDispatch = async (QUEUE, req) => {
  const { operation, parameters } = await req.text().then((t) => parse(t));
  if (operation === "Queue.send") {
    const [body, options] = parameters;
    await QUEUE.send(body, options);
    return new Response();
  }
  if (operation === "Queue.sendBatch") {
    const [messages] = parameters;
    await QUEUE.sendBatch(messages);
    return new Response();
  }
  throw new Error(`${operation}() is not supported.`);
};

// node_modules/cfw-bindings-wrangler-bridge/worker/vectorize/index.js
var isVectorizeBinding = (binding) => binding.constructor.name === "VectorizeIndexImpl";
var handleVectorizeDispatch = async (VECTORIZE, req) => {
  const { operation, parameters } = await req.text().then((t) => parse(t));
  if (operation === "VectorizeIndex.describe") {
    const result = await VECTORIZE.describe();
    return Response.json(result);
  }
  if (operation === "VectorizeIndex.query") {
    const [vector, options] = parameters;
    const result = await VECTORIZE.query(vector, options);
    return Response.json(result);
  }
  if (operation === "VectorizeIndex.insert") {
    const [vectors] = parameters;
    const result = await VECTORIZE.insert(vectors);
    return Response.json(result);
  }
  if (operation === "VectorizeIndex.upsert") {
    const [vectors] = parameters;
    const result = await VECTORIZE.upsert(vectors);
    return Response.json(result);
  }
  if (operation === "VectorizeIndex.deleteByIds") {
    const [ids] = parameters;
    const result = await VECTORIZE.deleteByIds(ids);
    return Response.json(result);
  }
  if (operation === "VectorizeIndex.getByIds") {
    const [ids] = parameters;
    const result = await VECTORIZE.getByIds(ids);
    return Response.json(result);
  }
  throw new Error(`${operation}() is not supported.`);
};

// node_modules/cfw-bindings-wrangler-bridge/worker/_internals/index.js
var getBindings = (env) => {
  const bindings = {};
  for (const [name, binding] of Object.entries(env)) {
    if (isD1Binding(binding))
      bindings[name] = "d1";
    if (isKVBinding(binding))
      bindings[name] = "kv";
    if (isQueueBinding(binding))
      bindings[name] = "queue";
    if (isR2Binding(binding))
      bindings[name] = "r2";
    if (isServiceBinding(binding))
      bindings[name] = "service";
    if (isVectorizeBinding(binding))
      bindings[name] = "vectorize";
  }
  return bindings;
};

// node_modules/cfw-bindings-wrangler-bridge/worker/index.js
var handleInternalsRequest = (req, env) => {
  const INTERNALS_METHOD = req.headers.get("X-BRIDGE-INTERNALS");
  if (INTERNALS_METHOD === "getBindings")
    return Response.json(getBindings(env));
  return Response.json(`Not supported internals method: ${INTERNALS_METHOD}.`, {
    status: 404
  });
};
var handleBridgeRequest = (req, env) => {
  const BINDING_MODULE = req.headers.get("X-BRIDGE-BINDING-MODULE");
  const BINDING_NAME = req.headers.get("X-BRIDGE-BINDING-NAME");
  if (!(BINDING_MODULE && BINDING_NAME))
    return new Response(
      "Wrong usage of bridge worker. Required headers are not presented.",
      { status: 400 }
    );
  const BINDING = env[BINDING_NAME];
  if (!BINDING)
    return new Response(
      `Failed to load env.${BINDING_NAME}. Check your wrangler.toml and reload.`,
      { status: 400 }
    );
  if (BINDING_MODULE === "KV" && isKVBinding(BINDING))
    return handleKVDispatch(BINDING, req).catch(
      (err) => new Response(err.message, { status: 500 })
    );
  if (BINDING_MODULE === "SERVICE" && isServiceBinding(BINDING))
    return handleServiceDispatch(BINDING, req).catch(
      (err) => new Response(err.message, { status: 500 })
    );
  if (BINDING_MODULE === "R2" && isR2Binding(BINDING))
    return handleR2Dispatch(BINDING, req).catch(
      (err) => new Response(err.message, { status: 500 })
    );
  if (BINDING_MODULE === "D1" && isD1Binding(BINDING))
    return handleD1Dispatch(BINDING, req).catch(
      (err) => new Response(err.message, { status: 500 })
    );
  if (BINDING_MODULE === "QUEUE" && isQueueBinding(BINDING))
    return handleQueueDispatch(BINDING, req).catch(
      (err) => new Response(err.message, { status: 500 })
    );
  if (BINDING_MODULE === "VECTORIZE" && isVectorizeBinding(BINDING))
    return handleVectorizeDispatch(BINDING, req).catch(
      (err) => new Response(err.message, { status: 500 })
    );
  return new Response(
    `Not supported binding: ${BINDING_MODULE} or ${BINDING_NAME} is not compatible for ${BINDING_MODULE} binding.`,
    { status: 404 }
  );
};
var worker_default = {
  async fetch(req, env, ctx) {
    if (req.method === "OPTIONS")
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "*"
        }
      });
    let originalRes;
    if (req.headers.has("X-BRIDGE-INTERNALS")) {
      originalRes = await handleInternalsRequest(req, env, ctx);
    } else {
      originalRes = await handleBridgeRequest(req, env, ctx);
    }
    const res = new Response(originalRes.body, originalRes);
    res.headers.set("access-control-allow-origin", "*");
    return res;
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=index.js.map
