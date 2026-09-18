// Tests for the gateway-assertion verification wired into openapi_service.bal
// via gateway_assertion.bal (copied verbatim from the ballerina skill).
//
// GATEWAY_ASSERTION_CERTIFICATE / _ISSUER / _HEADER must be exported in the
// shell BEFORE `bal test` runs — the interceptor's pipeline is built once
// when the service attaches to its listener, at module init, so setting
// them from inside a test function is too late. See tests/README or the
// command in the issue comment / final report.
//
// The assertion is minted here with a throwaway RSA keypair generated for
// this test suite only (tests/resources/*.pem) — nothing talks to a real
// gateway or IdP.
//
// `POST /todos` with an empty `text` is used as the probe: it is rejected
// by the handler with 400 *before* any todo-db call, so the probe works
// whether or not a real Postgres is reachable in the run environment.
// A 401 means the gateway-assertion interceptor (or, for the "no
// assertion" case, `requireGatewayCaller`) rejected the request before the
// handler's own validation ran; a 400 means it was accepted and reached
// the handler. todo-api's openapi.yaml declares no `security: []`
// operation, so there is no public resource to cover here.

import ballerina/http;
import ballerina/jwt;
import ballerina/lang.array;
import ballerina/test;

const string TRUSTED_KEY_FILE = "tests/resources/trusted-key.pem";
const string UNTRUSTED_KEY_FILE = "tests/resources/untrusted-key.pem";
const string TEST_ISSUER = "aep-gateway-test";
const string ASSERTION_HEADER = "x-jwt-assertion";
const string EMPTY_TEXT_BODY = "{\"text\": \"\"}";

final http:Client gatewayTestClient = check new ("http://localhost:9090");

function mintAssertion(string keyFile, string subject) returns string|error {
    jwt:IssuerConfig issuerConfig = {
        issuer: TEST_ISSUER,
        username: subject,
        expTime: 300,
        customClaims: {"scope": "todos:manage", "username": "alice"},
        signatureConfig: {
            algorithm: jwt:RS256,
            config: {keyFile, keyPassword: ""}
        }
    };
    return jwt:issue(issuerConfig);
}

// Flips one byte's worth of meaning in the signed payload without
// re-signing, so the header and signature segments no longer agree with
// what they cover.
function tamperAssertion(string token) returns string|error {
    string[] parts = re `\.`.split(token);
    if parts.length() != 3 {
        return error("not a JWT: " + token);
    }
    byte[] payloadBytes = check base64UrlDecode(parts[1]);
    string payloadJson = check string:fromBytes(payloadBytes);
    json payload = check payloadJson.fromJsonString();
    if payload !is map<json> {
        return error("unexpected JWT payload shape");
    }
    map<json> payloadMap = payload;
    payloadMap["sub"] = "someone-else";
    string tamperedSegment = base64UrlEncode(payloadMap.toJsonString().toBytes());
    return parts[0] + "." + tamperedSegment + "." + parts[2];
}

function base64UrlDecode(string segment) returns byte[]|error {
    string standard = re `-`.replaceAll(segment, "+");
    standard = re `_`.replaceAll(standard, "/");
    int remainder = standard.length() % 4;
    if remainder == 2 {
        standard = standard + "==";
    } else if remainder == 3 {
        standard = standard + "=";
    }
    return array:fromBase64(standard);
}

function base64UrlEncode(byte[] bytes) returns string {
    string standard = array:toBase64(bytes);
    string noPadding = re `=+$`.replaceAll(standard, "");
    string urlSafe = re `\+`.replaceAll(noPadding, "-");
    urlSafe = re `/`.replaceAll(urlSafe, "_");
    return urlSafe;
}

@test:Config {}
function testValidAssertionIsAccepted() returns error? {
    string token = check mintAssertion(TRUSTED_KEY_FILE, "user-valid");
    http:Response response = check gatewayTestClient->post(
        "/todos", EMPTY_TEXT_BODY,
        headers = {[ASSERTION_HEADER]: token, "content-type": "application/json"});
    // Accepted by the interceptor and reached the handler, which rejects
    // the empty text with 400 — never the interceptor's 401.
    test:assertEquals(response.statusCode, 400,
            msg = "a validly signed, correctly issued assertion must not be rejected by the gateway interceptor");
}

@test:Config {}
function testAssertionSignedByAnotherKeyIsRejected() returns error? {
    string token = check mintAssertion(UNTRUSTED_KEY_FILE, "user-forged");
    http:Response response = check gatewayTestClient->post(
        "/todos", EMPTY_TEXT_BODY,
        headers = {[ASSERTION_HEADER]: token, "content-type": "application/json"});
    test:assertEquals(response.statusCode, 401,
            msg = "an assertion signed by a key other than the trusted certificate's must be rejected, never treated as anonymous");
}

@test:Config {}
function testTamperedAssertionIsRejected() returns error? {
    string validToken = check mintAssertion(TRUSTED_KEY_FILE, "user-valid");
    string tampered = check tamperAssertion(validToken);
    http:Response response = check gatewayTestClient->post(
        "/todos", EMPTY_TEXT_BODY,
        headers = {[ASSERTION_HEADER]: tampered, "content-type": "application/json"});
    test:assertEquals(response.statusCode, 401,
            msg = "an assertion edited after signing must be rejected, never treated as anonymous");
}

@test:Config {}
function testNoAssertionIsUnauthorized() returns error? {
    http:Response response = check gatewayTestClient->post(
        "/todos", EMPTY_TEXT_BODY,
        headers = {"content-type": "application/json"});
    // No `x-jwt-assertion` at all: the interceptor lets it through with no
    // caller on the context (todo-api has no `security: []` operation), and
    // the handler's own `requireGatewayCaller` answers 401.
    test:assertEquals(response.statusCode, 401,
            msg = "every todo-api operation requires an identity; a request with none must be 401");
}
